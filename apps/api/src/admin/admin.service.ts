import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { JwtPayload } from '../common/decorators/auth.decorator';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  private assertAdmin(user: JwtPayload) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
  }

  async getAnalytics(user: JwtPayload) {
    this.assertAdmin(user);

    const [
      totalUsers,
      totalShipments,
      activeShipments,
      deliveredShipments,
      totalRevenue,
      totalVehicles,
      totalDrivers,
      anomalyAlerts,
      recentAiLogs,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.shipment.count(),
      this.prisma.shipment.count({
        where: { status: { in: ['ASSIGNED', 'PICKUP_SCHEDULED', 'PICKED_UP', 'IN_TRANSIT'] } },
      }),
      this.prisma.shipment.count({ where: { status: 'DELIVERED' } }),
      this.prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      this.prisma.vehicle.count(),
      this.prisma.driver.count(),
      this.prisma.anomalyAlert.findMany({
        where: { isResolved: false },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { shipment: { select: { trackingNumber: true } } },
      }),
      this.prisma.aiLog.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    ]);

    const shipmentsByStatus = await this.prisma.shipment.groupBy({
      by: ['status'],
      _count: true,
    });

    return {
      overview: {
        totalUsers,
        totalShipments,
        activeShipments,
        deliveredShipments,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalVehicles,
        totalDrivers,
      },
      shipmentsByStatus,
      anomalyAlerts,
      recentAiLogs: recentAiLogs.map((l) => ({
        id: l.id,
        service: l.service,
        createdAt: l.createdAt,
      })),
    };
  }

  async getUsers(user: JwtPayload, page = 1, limit = 20) {
    this.assertAdmin(user);
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          company: { select: { name: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);
    return { data, total, page, limit };
  }
}

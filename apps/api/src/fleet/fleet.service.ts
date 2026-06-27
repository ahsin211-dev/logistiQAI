import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { AuditService } from '../audit/audit.service';
import { JwtPayload } from '../common/decorators/auth.decorator';
import { CreateVehicleDto } from './dto/fleet.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class FleetService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  private assertFleetAccess(user: JwtPayload) {
    if (!([UserRole.FLEET_MANAGER, UserRole.TRANSPORT_COMPANY, UserRole.ADMIN] as UserRole[]).includes(user.role)) {
      throw new ForbiddenException('Fleet access required');
    }
  }

  async getVehicles(user: JwtPayload) {
    this.assertFleetAccess(user);
    const where = user.role === UserRole.ADMIN ? {} : { companyId: user.companyId! };

    return this.prisma.vehicle.findMany({
      where,
      include: {
        maintenanceRecords: { orderBy: { scheduledAt: 'desc' }, take: 3 },
        assignments: { where: { isActive: true }, include: { driver: true } },
      },
      orderBy: { plateNumber: 'asc' },
    });
  }

  async createVehicle(user: JwtPayload, dto: CreateVehicleDto) {
    this.assertFleetAccess(user);
    if (!user.companyId && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Company required');
    }

    const vehicle = await this.prisma.vehicle.create({
      data: {
        companyId: user.companyId!,
        plateNumber: dto.plateNumber,
        make: dto.make,
        model: dto.model,
        year: dto.year,
        vehicleType: dto.vehicleType,
        capacityWeight: dto.capacityWeight,
        capacityVolume: dto.capacityVolume,
      },
    });

    await this.audit.log({
      userId: user.sub,
      action: 'VEHICLE_CREATE',
      entityType: 'vehicle',
      entityId: vehicle.id,
    });

    return vehicle;
  }

  async getDrivers(user: JwtPayload) {
    this.assertFleetAccess(user);
    const where = user.role === UserRole.ADMIN ? {} : { companyId: user.companyId! };

    return this.prisma.driver.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        assignments: { where: { isActive: true }, include: { shipment: true } },
      },
    });
  }

  async assignDriver(
    user: JwtPayload,
    shipmentId: string,
    driverId: string,
    vehicleId?: string,
  ) {
    this.assertFleetAccess(user);

    const driver = await this.prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver) throw new NotFoundException('Driver not found');

    if (user.role !== UserRole.ADMIN && driver.companyId !== user.companyId) {
      throw new ForbiddenException('Driver not in your company');
    }

    await this.prisma.driverAssignment.updateMany({
      where: { shipmentId, isActive: true },
      data: { isActive: false },
    });

    const assignment = await this.prisma.$transaction(async (tx) => {
      const result = await tx.driverAssignment.create({
        data: { shipmentId, driverId, vehicleId },
      });

      await tx.shipment.update({
        where: { id: shipmentId },
        data: { status: 'ASSIGNED' },
      });

      await tx.shipmentStatusHistory.create({
        data: { shipmentId, status: 'ASSIGNED', changedBy: user.sub },
      });

      if (vehicleId) {
        await tx.vehicle.update({ where: { id: vehicleId }, data: { status: 'IN_USE' } });
      }

      return result;
    });

    await this.audit.log({
      userId: user.sub,
      action: 'DRIVER_ASSIGN',
      entityType: 'shipment',
      entityId: shipmentId,
      newValue: { driverId, vehicleId },
    });

    return assignment;
  }

  async getMaintenance(user: JwtPayload) {
    this.assertFleetAccess(user);
    const vehicles = await this.getVehicles(user);
    const vehicleIds = vehicles.map((v) => v.id);

    return this.prisma.vehicleMaintenance.findMany({
      where: { vehicleId: { in: vehicleIds } },
      include: { vehicle: { select: { plateNumber: true, make: true, model: true } } },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async getUtilization(user: JwtPayload) {
    this.assertFleetAccess(user);
    const vehicles = await this.getVehicles(user);

    const utilization = await Promise.all(
      vehicles.map(async (vehicle) => {
        const activeAssignments = await this.prisma.driverAssignment.count({
          where: { vehicleId: vehicle.id, isActive: true },
        });
        return {
          vehicleId: vehicle.id,
          plateNumber: vehicle.plateNumber,
          status: vehicle.status,
          activeAssignments,
          utilizationPercent: activeAssignments > 0 ? 100 : 0,
        };
      }),
    );

    return { vehicles: utilization, totalVehicles: vehicles.length };
  }
}

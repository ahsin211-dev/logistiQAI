import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { JwtPayload } from '../common/decorators/auth.decorator';
import { LocationUpdateDto } from './dto/tracking.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class TrackingService {
  constructor(private prisma: PrismaService) {}

  async updateLocation(user: JwtPayload, dto: LocationUpdateDto) {
    if (user.role !== UserRole.DRIVER && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only drivers can update location');
    }

    const assignment = await this.prisma.driverAssignment.findFirst({
      where: {
        shipmentId: dto.shipmentId,
        isActive: true,
        driver: { userId: user.sub },
      },
    });

    if (!assignment && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Not assigned to this shipment');
    }

    const recordedAt = dto.timestamp ? new Date(dto.timestamp) : new Date();

    const [location] = await this.prisma.$transaction([
      this.prisma.shipmentLocation.create({
        data: {
          shipmentId: dto.shipmentId,
          latitude: dto.latitude,
          longitude: dto.longitude,
          accuracy: dto.accuracy,
          speed: dto.speed,
          heading: dto.heading,
          recordedAt,
        },
      }),
      this.prisma.driver.updateMany({
        where: { userId: user.sub },
        data: {
          currentLat: dto.latitude,
          currentLng: dto.longitude,
          lastLocationAt: recordedAt,
        },
      }),
    ]);

    return location;
  }

  async getTracking(user: JwtPayload, shipmentId: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: {
        locations: { orderBy: { recordedAt: 'desc' }, take: 100 },
        trackingEvents: { orderBy: { createdAt: 'desc' }, take: 20 },
        assignments: {
          where: { isActive: true },
          include: {
            driver: {
              select: {
                currentLat: true,
                currentLng: true,
                lastLocationAt: true,
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
      },
    });

    if (!shipment) throw new NotFoundException('Shipment not found');

    if (user.role === UserRole.SHIPPER && shipment.shipperId !== user.sub) {
      throw new ForbiddenException('Access denied');
    }

    return {
      shipmentId,
      status: shipment.status,
      estimatedDeliveryAt: shipment.estimatedDeliveryAt,
      etaConfidence: shipment.etaConfidence,
      driver: shipment.assignments[0]?.driver ?? null,
      locations: shipment.locations,
      events: shipment.trackingEvents,
    };
  }
}

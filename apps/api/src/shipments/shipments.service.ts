import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, ShipmentStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.module';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { JwtPayload } from '../common/decorators/auth.decorator';
import { CreateShipmentDto, UpdateShipmentStatusDto } from './dto/shipment.dto';
import { v4 as uuidv4 } from 'uuid';

const VALID_STATUS_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  CREATED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['PICKUP_SCHEDULED', 'CANCELLED'],
  PICKUP_SCHEDULED: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

@Injectable()
export class ShipmentsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private notifications: NotificationsService,
  ) {}

  private generateTrackingNumber(): string {
    return `SHP-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 6).toUpperCase()}`;
  }

  private async assertAccess(shipmentId: string, user: JwtPayload) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: {
        assignments: {
          where: { isActive: true },
          include: { driver: { select: { userId: true } } },
        },
      },
    });

    if (!shipment) throw new NotFoundException('Shipment not found');

    if (user.role === UserRole.ADMIN) return shipment;

    if (user.role === UserRole.SHIPPER && shipment.shipperId === user.sub) {
      return shipment;
    }

    if (user.role === UserRole.DRIVER) {
      const isAssigned = shipment.assignments.some((a) => a.driver.userId === user.sub);
      if (isAssigned) return shipment;
    }

    if (
      ([UserRole.FLEET_MANAGER, UserRole.TRANSPORT_COMPANY] as UserRole[]).includes(user.role) &&
      user.companyId
    ) {
      const companyDriverIds = await this.prisma.driver.findMany({
        where: { companyId: user.companyId },
        select: { id: true },
      });
      const ids = companyDriverIds.map((d) => d.id);
      const hasCompanyAssignment = shipment.assignments.some((a) => ids.includes(a.driverId));
      if (hasCompanyAssignment || shipment.status === ShipmentStatus.CREATED) {
        return shipment;
      }
    }

    throw new ForbiddenException('Access denied to this shipment');
  }

  async create(user: JwtPayload, dto: CreateShipmentDto) {
    if (!([UserRole.SHIPPER, UserRole.ADMIN] as UserRole[]).includes(user.role)) {
      throw new ForbiddenException('Only shippers can create shipments');
    }

    const shipment = await this.prisma.shipment.create({
      data: {
        trackingNumber: this.generateTrackingNumber(),
        shipperId: user.sub,
        shipmentType: dto.shipmentType,
        weight: dto.weight,
        volume: dto.volume,
        priority: dto.priority,
        scheduledPickupAt: dto.scheduledPickupAt ? new Date(dto.scheduledPickupAt) : undefined,
        scheduledDeliveryAt: dto.scheduledDeliveryAt
          ? new Date(dto.scheduledDeliveryAt)
          : undefined,
        notes: dto.notes,
        pickupStreet: dto.pickupAddress.street,
        pickupCity: dto.pickupAddress.city,
        pickupState: dto.pickupAddress.state,
        pickupPostalCode: dto.pickupAddress.postalCode,
        pickupCountry: dto.pickupAddress.country,
        pickupLat: dto.pickupAddress.latitude,
        pickupLng: dto.pickupAddress.longitude,
        deliveryStreet: dto.deliveryAddress.street,
        deliveryCity: dto.deliveryAddress.city,
        deliveryState: dto.deliveryAddress.state,
        deliveryPostalCode: dto.deliveryAddress.postalCode,
        deliveryCountry: dto.deliveryAddress.country,
        deliveryLat: dto.deliveryAddress.latitude,
        deliveryLng: dto.deliveryAddress.longitude,
        items: {
          create: dto.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            weight: item.weight,
            volume: item.volume,
            isFragile: item.isFragile ?? false,
            sku: item.sku,
          })),
        },
        statusHistory: {
          create: { status: ShipmentStatus.CREATED, changedBy: user.sub },
        },
      },
      include: { items: true },
    });

    await this.audit.log({
      userId: user.sub,
      action: 'SHIPMENT_CREATE',
      entityType: 'shipment',
      entityId: shipment.id,
      newValue: { trackingNumber: shipment.trackingNumber },
    });

    return shipment;
  }

  async findAll(user: JwtPayload, page = 1, limit = 20, status?: ShipmentStatus) {
    const where: Prisma.ShipmentWhereInput = {};

    if (user.role === UserRole.SHIPPER) {
      where.shipperId = user.sub;
    } else if (user.role === UserRole.DRIVER) {
      where.assignments = { some: { driver: { userId: user.sub }, isActive: true } };
    } else if (
      ([UserRole.FLEET_MANAGER, UserRole.TRANSPORT_COMPANY] as UserRole[]).includes(user.role) &&
      user.companyId
    ) {
      where.assignments = { some: { driver: { companyId: user.companyId } } };
    }

    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.shipment.findMany({
        where,
        include: {
          items: true,
          assignments: {
            where: { isActive: true },
            include: {
              driver: { include: { user: { select: { firstName: true, lastName: true } } } },
              vehicle: { select: { plateNumber: true, make: true, model: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.shipment.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(user: JwtPayload, id: string) {
    await this.assertAccess(id, user);
    return this.prisma.shipment.findUnique({
      where: { id },
      include: {
        items: true,
        documents: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
        assignments: {
          include: {
            driver: { include: { user: { select: { id: true, firstName: true, lastName: true, phone: true } } } },
            vehicle: true,
          },
        },
        locations: { orderBy: { recordedAt: 'desc' }, take: 50 },
        payments: true,
        invoices: true,
      },
    });
  }

  async updateStatus(user: JwtPayload, id: string, dto: UpdateShipmentStatusDto) {
    const shipment = await this.assertAccess(id, user);

    const allowed = VALID_STATUS_TRANSITIONS[shipment.status];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${shipment.status} to ${dto.status}`,
      );
    }

    const updateData: Prisma.ShipmentUpdateInput = { status: dto.status };
    if (dto.status === ShipmentStatus.PICKED_UP) updateData.actualPickupAt = new Date();
    if (dto.status === ShipmentStatus.DELIVERED) updateData.actualDeliveryAt = new Date();

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.shipment.update({
        where: { id },
        data: updateData,
      });

      await tx.shipmentStatusHistory.create({
        data: {
          shipmentId: id,
          status: dto.status,
          notes: dto.notes,
          changedBy: user.sub,
          latitude: dto.latitude,
          longitude: dto.longitude,
        },
      });

      await tx.shipmentTrackingEvent.create({
        data: {
          shipmentId: id,
          eventType: 'STATUS_CHANGE',
          description: `Status changed to ${dto.status}`,
          latitude: dto.latitude,
          longitude: dto.longitude,
        },
      });

      return result;
    });

    await this.audit.log({
      userId: user.sub,
      action: 'SHIPMENT_STATUS_UPDATE',
      entityType: 'shipment',
      entityId: id,
      oldValue: { status: shipment.status },
      newValue: { status: dto.status },
    });

    await this.notifications.notifyShipmentUpdate(shipment.shipperId, id, dto.status);

    return updated;
  }

  async uploadDocument(
    user: JwtPayload,
    shipmentId: string,
    file: Express.Multer.File,
    documentType: string,
  ) {
    await this.assertAccess(shipmentId, user);

    const fileUrl = `/uploads/${shipmentId}/${file.filename}`;

    return this.prisma.shipmentDocument.create({
      data: {
        shipmentId,
        fileName: file.originalname,
        fileUrl,
        mimeType: file.mimetype,
        documentType,
      },
    });
  }

  async uploadProofOfDelivery(
    user: JwtPayload,
    shipmentId: string,
    file: Express.Multer.File,
    notes?: string,
  ) {
    const shipment = await this.assertAccess(shipmentId, user);

    if (user.role !== UserRole.DRIVER && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only drivers can upload proof of delivery');
    }

    const fileUrl = `/uploads/${shipmentId}/pod/${file.filename}`;

    const updated = await this.prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        proofOfDeliveryUrl: fileUrl,
        status: ShipmentStatus.DELIVERED,
        actualDeliveryAt: new Date(),
      },
    });

    await this.prisma.shipmentStatusHistory.create({
      data: {
        shipmentId,
        status: ShipmentStatus.DELIVERED,
        notes: notes || 'Proof of delivery uploaded',
        changedBy: user.sub,
      },
    });

    await this.audit.log({
      userId: user.sub,
      action: 'PROOF_OF_DELIVERY_UPLOAD',
      entityType: 'shipment',
      entityId: shipmentId,
    });

    await this.notifications.notifyShipmentUpdate(shipment.shipperId, shipmentId, 'DELIVERED');

    return updated;
  }
}

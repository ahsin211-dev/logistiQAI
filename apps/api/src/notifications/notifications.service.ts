import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ) {
    return this.prisma.notification.create({
      data: { userId, type, title, body, data: data as object },
    });
  }

  async notifyShipmentUpdate(userId: string, shipmentId: string, status: string) {
    return this.create(
      userId,
      'SHIPMENT_UPDATE',
      'Shipment Update',
      `Your shipment status changed to ${status}`,
      { shipmentId, status },
    );
  }

  async getForUser(userId: string, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: { userId, ...(unreadOnly ? { isRead: false } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markRead(userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }
}

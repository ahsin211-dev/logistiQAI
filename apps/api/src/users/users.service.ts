import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isVerified: true,
        avatarUrl: true,
        companyId: true,
        company: { select: { id: true, name: true, isVerified: true } },
        driver: {
          select: {
            id: true,
            licenseNumber: true,
            rating: true,
            isAvailable: true,
            isVerified: true,
            totalDeliveries: true,
          },
        },
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(
    userId: string,
    data: { firstName?: string; lastName?: string; phone?: string; avatarUrl?: string },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
      },
    });
  }
}

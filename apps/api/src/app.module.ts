import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthGuard } from './common/guards/auth.guards';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { FleetModule } from './fleet/fleet.module';
import { TrackingModule } from './tracking/tracking.module';
import { RoutesModule } from './routes/routes.module';
import { DispatchModule } from './dispatch/dispatch.module';
import { DocumentsModule } from './documents/documents.module';
import { AiModule } from './ai/ai.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ShipmentsModule,
    FleetModule,
    TrackingModule,
    RoutesModule,
    DispatchModule,
    DocumentsModule,
    AiModule,
    PaymentsModule,
    NotificationsModule,
    AdminModule,
    AuditModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.module';
import { AuditService } from '../audit/audit.service';
import { JwtPayload } from '../common/decorators/auth.decorator';

@Injectable()
export class PaymentsService {
  private stripe: Stripe | null = null;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private audit: AuditService,
  ) {
    const key = this.config.get<string>('STRIPE_SECRET_KEY');
    if (key) this.stripe = new Stripe(key);
  }

  async createCheckout(user: JwtPayload, shipmentId: string, amount?: number) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: { payments: true },
    });

    if (!shipment) throw new NotFoundException('Shipment not found');
    if (shipment.shipperId !== user.sub && user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied');
    }

    const paymentAmount = amount || shipment.weight * 2.5;

    const payment = await this.prisma.payment.create({
      data: {
        shipmentId,
        amount: paymentAmount,
        status: 'PENDING',
      },
    });

    if (!this.stripe) {
      return {
        paymentId: payment.id,
        amount: paymentAmount,
        status: 'PENDING',
        message: 'Stripe not configured. Payment record created.',
        checkoutUrl: null,
      };
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Shipment ${shipment.trackingNumber}`,
              description: `${shipment.pickupCity} → ${shipment.deliveryCity}`,
            },
            unit_amount: Math.round(paymentAmount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: { paymentId: payment.id, shipmentId },
      success_url: `${this.config.get('APP_URL') || 'http://localhost:3000'}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.config.get('APP_URL') || 'http://localhost:3000'}/payments/cancel`,
    });

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { stripeSessionId: session.id, status: 'PROCESSING' },
    });

    await this.audit.log({
      userId: user.sub,
      action: 'PAYMENT_CHECKOUT_CREATE',
      entityType: 'payment',
      entityId: payment.id,
      newValue: { amount: paymentAmount, sessionId: session.id },
    });

    return { paymentId: payment.id, checkoutUrl: session.url, amount: paymentAmount };
  }

  async getPaymentHistory(user: JwtPayload) {
    const shipments = await this.prisma.shipment.findMany({
      where: user.role === 'ADMIN' ? {} : { shipperId: user.sub },
      include: { payments: true, invoices: true },
      orderBy: { createdAt: 'desc' },
    });

    return shipments.flatMap((s) =>
      s.payments.map((p) => ({
        ...p,
        trackingNumber: s.trackingNumber,
        invoices: s.invoices,
      })),
    );
  }
}

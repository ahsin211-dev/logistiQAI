import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.module';

@Injectable()
export class AiOrchestrationService {
  private readonly logger = new Logger(AiOrchestrationService.name);
  private openai: OpenAI | null = null;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  private async callAi(
    service: string,
    systemPrompt: string,
    userPrompt: string,
    metadata?: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    if (!this.openai) {
      return this.fallbackResponse(service, metadata);
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.get<string>('OPENAI_MODEL') || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      });

      const content = response.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(content) as Record<string, unknown>;

      await this.prisma.aiLog.create({
        data: {
          service,
          prompt: userPrompt.slice(0, 2000),
          response: content.slice(0, 5000),
          inputTokens: response.usage?.prompt_tokens,
          outputTokens: response.usage?.completion_tokens,
          metadata: metadata as object,
        },
      });

      return parsed;
    } catch (error) {
      this.logger.error(`AI call failed for ${service}`, error);
      return this.fallbackResponse(service, metadata);
    }
  }

  private fallbackResponse(
    service: string,
    metadata?: Record<string, unknown>,
  ): Record<string, unknown> {
    return {
      error: 'AI service unavailable',
      service,
      confidence: 0,
      dataLimitations: ['OpenAI API key not configured or service unavailable'],
      metadata,
    };
  }

  async optimizeRoute(shipmentIds: string[], options: { considerTraffic?: boolean }) {
    const shipments = await this.prisma.shipment.findMany({
      where: { id: { in: shipmentIds } },
      include: { items: true },
    });

    const context = JSON.stringify({ shipments, options }, null, 2);
    const { ROUTE_OPTIMIZATION_SYSTEM, ROUTE_OPTIMIZATION_USER } = await import('./prompts');

    const result = await this.callAi(
      'route_optimization',
      ROUTE_OPTIMIZATION_SYSTEM,
      ROUTE_OPTIMIZATION_USER(context),
      { shipmentIds },
    );

    if (!result.error && shipments.length > 0) {
      const primaryShipment = shipments[0];
      await this.prisma.route.create({
        data: {
          shipmentId: primaryShipment.id,
          totalDistance: (result.totalDistanceKm as number) || null,
          totalDuration: (result.totalDurationMinutes as number) || null,
          isOptimized: true,
          optimizationLog: result as object,
        },
      });
    }

    return result;
  }

  async predictEta(shipmentId: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: {
        locations: { orderBy: { recordedAt: 'desc' }, take: 10 },
        assignments: { include: { driver: true } },
        statusHistory: true,
      },
    });

    if (!shipment) return { error: 'Shipment not found' };

    const context = JSON.stringify(shipment, null, 2);
    const { ETA_PREDICTION_SYSTEM, ETA_PREDICTION_USER } = await import('./prompts');

    const result = await this.callAi(
      'eta_prediction',
      ETA_PREDICTION_SYSTEM,
      ETA_PREDICTION_USER(context),
      { shipmentId },
    );

    if (result.estimatedDeliveryAt) {
      await this.prisma.shipment.update({
        where: { id: shipmentId },
        data: {
          estimatedDeliveryAt: new Date(result.estimatedDeliveryAt as string),
          etaConfidence: (result.confidence as number) || 0.5,
        },
      });
    }

    return result;
  }

  async optimizeLoad(shipmentId: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: { items: true, assignments: { include: { vehicle: true } } },
    });

    if (!shipment) return { error: 'Shipment not found' };

    const context = JSON.stringify(shipment, null, 2);
    const { LOAD_OPTIMIZATION_SYSTEM, LOAD_OPTIMIZATION_USER } = await import('./prompts');

    return this.callAi('load_optimization', LOAD_OPTIMIZATION_SYSTEM, LOAD_OPTIMIZATION_USER(context), {
      shipmentId,
    });
  }

  async autoDispatch(shipmentId: string, companyId?: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: { items: true },
    });

    if (!shipment) return { error: 'Shipment not found' };

    const drivers = await this.prisma.driver.findMany({
      where: {
        isAvailable: true,
        isVerified: true,
        ...(companyId ? { companyId } : {}),
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
        assignments: { where: { isActive: true } },
      },
    });

    const vehicles = await this.prisma.vehicle.findMany({
      where: {
        status: 'AVAILABLE',
        capacityWeight: { gte: shipment.weight },
        ...(companyId ? { companyId } : {}),
      },
    });

    const context = JSON.stringify({ shipment, drivers, vehicles }, null, 2);
    const { DISPATCH_SYSTEM, DISPATCH_USER } = await import('./prompts');

    return this.callAi('auto_dispatch', DISPATCH_SYSTEM, DISPATCH_USER(context), { shipmentId });
  }

  async forecastDemand(companyId?: string, days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - 90);

    const shipments = await this.prisma.shipment.findMany({
      where: { createdAt: { gte: since } },
      select: {
        pickupCity: true,
        pickupState: true,
        createdAt: true,
        weight: true,
        priority: true,
      },
    });

    const context = JSON.stringify({ historicalShipments: shipments, forecastDays: days }, null, 2);
    const { DEMAND_FORECAST_SYSTEM, DEMAND_FORECAST_USER } = await import('./prompts');

    return this.callAi('demand_forecast', DEMAND_FORECAST_SYSTEM, DEMAND_FORECAST_USER(context), {
      companyId,
    });
  }

  async chat(userId: string, message: string, shipmentId?: string) {
    let context = '';

    if (shipmentId) {
      const shipment = await this.prisma.shipment.findUnique({
        where: { id: shipmentId },
        include: {
          items: true,
          statusHistory: { orderBy: { createdAt: 'desc' }, take: 5 },
          assignments: { include: { driver: { include: { user: true } } } },
          locations: { orderBy: { recordedAt: 'desc' }, take: 1 },
        },
      });
      context = shipment ? JSON.stringify(shipment, null, 2) : 'No shipment data found';
    } else {
      const userShipments = await this.prisma.shipment.findMany({
        where: { shipperId: userId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { id: true, trackingNumber: true, status: true, createdAt: true },
      });
      context = JSON.stringify({ userShipments }, null, 2);
    }

    const { CHAT_ASSISTANT_SYSTEM, CHAT_ASSISTANT_USER } = await import('./prompts');

    const result = await this.callAi(
      'chat_assistant',
      CHAT_ASSISTANT_SYSTEM,
      CHAT_ASSISTANT_USER(message, context),
      { userId, shipmentId },
    );

    await this.prisma.supportChat.create({
      data: { userId, shipmentId, role: 'user', message, isAi: false },
    });

    const reply =
      typeof result === 'object' && 'response' in result
        ? String(result.response)
        : JSON.stringify(result);

    await this.prisma.supportChat.create({
      data: { userId, shipmentId, role: 'assistant', message: reply, isAi: true },
    });

    return { reply, dataSource: shipmentId ? 'shipment' : 'user_shipments', confidence: result.confidence ?? 0.8 };
  }

  async processDocument(ocrText: string) {
    const { DOCUMENT_OCR_SYSTEM, DOCUMENT_OCR_USER } = await import('./prompts');
    return this.callAi('document_ocr', DOCUMENT_OCR_SYSTEM, DOCUMENT_OCR_USER(ocrText));
  }

  async detectAnomalies(shipmentId: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: {
        locations: { orderBy: { recordedAt: 'asc' } },
        statusHistory: true,
        payments: true,
        documents: true,
        trackingEvents: true,
      },
    });

    if (!shipment) return { error: 'Shipment not found' };

    const context = JSON.stringify(shipment, null, 2);
    const { ANOMALY_DETECTION_SYSTEM, ANOMALY_DETECTION_USER } = await import('./prompts');

    const result = await this.callAi(
      'anomaly_detection',
      ANOMALY_DETECTION_SYSTEM,
      ANOMALY_DETECTION_USER(context),
      { shipmentId },
    );

    const anomalies = (result.anomalies as Array<{ type: string; severity: string; description: string }>) || [];
    for (const anomaly of anomalies) {
      await this.prisma.anomalyAlert.create({
        data: {
          shipmentId,
          type: anomaly.type as 'ROUTE_DEVIATION',
          severity: anomaly.severity,
          description: anomaly.description,
          metadata: anomaly as object,
        },
      });
    }

    return result;
  }

  async predictMaintenance(vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        maintenanceRecords: { orderBy: { scheduledAt: 'desc' }, take: 10 },
        fuelLogs: { orderBy: { loggedAt: 'desc' }, take: 20 },
      },
    });

    if (!vehicle) return { error: 'Vehicle not found' };

    const context = JSON.stringify(vehicle, null, 2);
    const { PREDICTIVE_MAINTENANCE_SYSTEM, PREDICTIVE_MAINTENANCE_USER } = await import('./prompts');

    const result = await this.callAi(
      'predictive_maintenance',
      PREDICTIVE_MAINTENANCE_SYSTEM,
      PREDICTIVE_MAINTENANCE_USER(context),
      { vehicleId },
    );

    const predictions = (result.predictions as Array<{
      maintenanceType: string;
      predictedDate: string;
      confidence: number;
    }>) || [];

    for (const pred of predictions.filter((p) => p.confidence > 0.7)) {
      await this.prisma.vehicleMaintenance.create({
        data: {
          vehicleId,
          maintenanceType: pred.maintenanceType,
          scheduledAt: new Date(pred.predictedDate),
          isPredicted: true,
        },
      });
    }

    return result;
  }
}

import { Injectable } from '@nestjs/common';
import { AiOrchestrationService } from '../ai/ai-orchestration.service';
import { PrismaService } from '../prisma/prisma.module';
import { AuditService } from '../audit/audit.service';
import { JwtPayload } from '../common/decorators/auth.decorator';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private ai: AiOrchestrationService,
    private audit: AuditService,
  ) {}

  async processDocument(user: JwtPayload, ocrText: string, shipmentId?: string) {
    const extracted = await this.ai.processDocument(ocrText);

    if (shipmentId) {
      await this.prisma.shipmentDocument.create({
        data: {
          shipmentId,
          fileName: 'ocr-processed',
          fileUrl: '',
          mimeType: 'text/plain',
          documentType: 'ocr_extract',
          ocrData: extracted as object,
          isVerified: false,
        },
      });
    }

    await this.audit.log({
      userId: user.sub,
      action: 'DOCUMENT_OCR_PROCESS',
      entityType: 'document',
      entityId: shipmentId,
      newValue: extracted,
    });

    return {
      extracted,
      requiresValidation: true,
      message: 'Please validate extracted fields before saving',
    };
  }
}

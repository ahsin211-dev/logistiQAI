import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID } from 'class-validator';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../common/guards/auth.guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/decorators/auth.decorator';

class ProcessDocumentDto {
  @IsString()
  ocrText!: string;

  @IsOptional()
  @IsUUID()
  shipmentId?: string;
}

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Post('process')
  @ApiOperation({ summary: 'AI document OCR processing' })
  process(@CurrentUser() user: JwtPayload, @Body() dto: ProcessDocumentDto) {
    return this.documentsService.processDocument(user, dto.ocrText, dto.shipmentId);
  }
}

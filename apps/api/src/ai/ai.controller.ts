import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { AiOrchestrationService } from './ai-orchestration.service';
import { JwtAuthGuard } from '../common/guards/auth.guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/decorators/auth.decorator';

class AiChatDto {
  @IsString()
  @MaxLength(2000)
  message!: string;

  @IsOptional()
  @IsUUID()
  shipmentId?: string;
}

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private aiService: AiOrchestrationService) {}

  @Post('chat')
  @ApiOperation({ summary: 'AI chat assistant' })
  chat(@CurrentUser() user: JwtPayload, @Body() dto: AiChatDto) {
    return this.aiService.chat(user.sub, dto.message, dto.shipmentId);
  }

  @Post('eta')
  @ApiOperation({ summary: 'Predict ETA' })
  predictEta(@Body() body: { shipmentId: string }) {
    return this.aiService.predictEta(body.shipmentId);
  }

  @Post('load-optimize')
  @ApiOperation({ summary: 'Optimize load arrangement' })
  optimizeLoad(@Body() body: { shipmentId: string }) {
    return this.aiService.optimizeLoad(body.shipmentId);
  }

  @Post('demand-forecast')
  @ApiOperation({ summary: 'Forecast demand' })
  forecastDemand(@CurrentUser() user: JwtPayload, @Body() body: { days?: number }) {
    return this.aiService.forecastDemand(user.companyId, body.days);
  }

  @Post('anomaly-check')
  @ApiOperation({ summary: 'Check for anomalies' })
  detectAnomalies(@Body() body: { shipmentId: string }) {
    return this.aiService.detectAnomalies(body.shipmentId);
  }

  @Post('maintenance-predict')
  @ApiOperation({ summary: 'Predictive maintenance' })
  predictMaintenance(@Body() body: { vehicleId: string }) {
    return this.aiService.predictMaintenance(body.vehicleId);
  }
}

import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsArray, IsUUID, IsOptional, IsBoolean } from 'class-validator';
import { AiOrchestrationService } from '../ai/ai-orchestration.service';
import { JwtAuthGuard } from '../common/guards/auth.guards';

class RouteOptimizeDto {
  @IsArray()
  @IsUUID('4', { each: true })
  shipmentIds!: string[];

  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @IsOptional()
  @IsBoolean()
  considerTraffic?: boolean;
}

@ApiTags('routes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('routes')
export class RoutesController {
  constructor(private aiService: AiOrchestrationService) {}

  @Post('optimize')
  @ApiOperation({ summary: 'AI route optimization' })
  optimize(@Body() dto: RouteOptimizeDto) {
    return this.aiService.optimizeRoute(dto.shipmentIds, {
      considerTraffic: dto.considerTraffic ?? true,
    });
  }
}

import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsUUID, IsOptional } from 'class-validator';
import { AiOrchestrationService } from '../ai/ai-orchestration.service';
import { FleetService } from '../fleet/fleet.service';
import { JwtAuthGuard } from '../common/guards/auth.guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/decorators/auth.decorator';

class AutoDispatchDto {
  @IsUUID()
  shipmentId!: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  autoAssign?: boolean;
}

@ApiTags('dispatch')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dispatch')
export class DispatchController {
  constructor(
    private aiService: AiOrchestrationService,
    private fleetService: FleetService,
  ) {}

  @Post('auto-assign')
  @ApiOperation({ summary: 'AI auto-assign driver/vehicle' })
  async autoAssign(@CurrentUser() user: JwtPayload, @Body() dto: AutoDispatchDto) {
    const recommendation = await this.aiService.autoDispatch(
      dto.shipmentId,
      dto.companyId || user.companyId,
    );

    if (dto.autoAssign && recommendation.recommendedDriverId) {
      const assignment = await this.fleetService.assignDriver(
        user,
        dto.shipmentId,
        recommendation.recommendedDriverId as string,
        recommendation.recommendedVehicleId as string | undefined,
      );
      return { recommendation, assignment };
    }

    return { recommendation };
  }
}

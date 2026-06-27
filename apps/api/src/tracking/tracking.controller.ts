import { Controller, Get, Post, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TrackingService } from './tracking.service';
import { TrackingGateway } from './tracking.gateway';
import { JwtAuthGuard } from '../common/guards/auth.guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/decorators/auth.decorator';
import { LocationUpdateDto } from './dto/tracking.dto';

@ApiTags('tracking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tracking')
export class TrackingController {
  constructor(
    private trackingService: TrackingService,
    private trackingGateway: TrackingGateway,
  ) {}

  @Post('location')
  @ApiOperation({ summary: 'Update GPS location' })
  async updateLocation(@CurrentUser() user: JwtPayload, @Body() dto: LocationUpdateDto) {
    const location = await this.trackingService.updateLocation(user, dto);
    this.trackingGateway.broadcastLocation(dto.shipmentId, location);
    return location;
  }

  @Get(':shipmentId')
  @ApiOperation({ summary: 'Get shipment tracking data' })
  getTracking(@CurrentUser() user: JwtPayload, @Param('shipmentId', ParseUUIDPipe) shipmentId: string) {
    return this.trackingService.getTracking(user, shipmentId);
  }
}

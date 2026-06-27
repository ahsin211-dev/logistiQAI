import { Controller, Get, Post, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FleetService } from './fleet.service';
import { JwtAuthGuard, RolesGuard } from '../common/guards/auth.guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/decorators/auth.decorator';
import { CreateVehicleDto } from './dto/fleet.dto';

@ApiTags('fleet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('fleet')
export class FleetController {
  constructor(private fleetService: FleetService) {}

  @Get('vehicles')
  @ApiOperation({ summary: 'List vehicles' })
  getVehicles(@CurrentUser() user: JwtPayload) {
    return this.fleetService.getVehicles(user);
  }

  @Post('vehicles')
  @ApiOperation({ summary: 'Create vehicle' })
  createVehicle(@CurrentUser() user: JwtPayload, @Body() dto: CreateVehicleDto) {
    return this.fleetService.createVehicle(user, dto);
  }

  @Get('drivers')
  @ApiOperation({ summary: 'List drivers' })
  getDrivers(@CurrentUser() user: JwtPayload) {
    return this.fleetService.getDrivers(user);
  }

  @Post('assign')
  @ApiOperation({ summary: 'Assign driver to shipment' })
  assignDriver(
    @CurrentUser() user: JwtPayload,
    @Body() body: { shipmentId: string; driverId: string; vehicleId?: string },
  ) {
    return this.fleetService.assignDriver(user, body.shipmentId, body.driverId, body.vehicleId);
  }

  @Get('maintenance')
  @ApiOperation({ summary: 'List maintenance records' })
  getMaintenance(@CurrentUser() user: JwtPayload) {
    return this.fleetService.getMaintenance(user);
  }

  @Get('utilization')
  @ApiOperation({ summary: 'Fleet utilization dashboard' })
  getUtilization(@CurrentUser() user: JwtPayload) {
    return this.fleetService.getUtilization(user);
  }
}

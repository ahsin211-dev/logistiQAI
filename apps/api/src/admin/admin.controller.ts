import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard, RolesGuard } from '../common/guards/auth.guards';
import { Roles } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/decorators/auth.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('analytics')
  @ApiOperation({ summary: 'Admin analytics dashboard' })
  getAnalytics(@CurrentUser() user: JwtPayload) {
    return this.adminService.getAnalytics(user);
  }

  @Get('users')
  @ApiOperation({ summary: 'User management' })
  getUsers(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getUsers(user, page ? +page : 1, limit ? +limit : 20);
  }
}

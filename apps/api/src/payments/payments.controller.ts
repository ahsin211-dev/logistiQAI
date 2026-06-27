import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsNumber, Min } from 'class-validator';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/auth.guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/decorators/auth.decorator';

class CheckoutDto {
  @IsUUID()
  shipmentId!: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;
}

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Create payment checkout session' })
  checkout(@CurrentUser() user: JwtPayload, @Body() dto: CheckoutDto) {
    return this.paymentsService.createCheckout(user, dto.shipmentId, dto.amount);
  }

  @Get('history')
  @ApiOperation({ summary: 'Payment history' })
  history(@CurrentUser() user: JwtPayload) {
    return this.paymentsService.getPaymentHistory(user);
  }
}

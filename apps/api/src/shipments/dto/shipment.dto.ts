import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ShipmentPriority, ShipmentStatus } from '@prisma/client';

class AddressDto {
  @IsString()
  street!: string;

  @IsString()
  city!: string;

  @IsString()
  state!: string;

  @IsString()
  postalCode!: string;

  @IsString()
  country!: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}

class ShipmentItemDto {
  @IsString()
  description!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0.01)
  weight!: number;

  @IsOptional()
  @IsNumber()
  volume?: number;

  @IsOptional()
  @IsBoolean()
  isFragile?: boolean;

  @IsOptional()
  @IsString()
  sku?: string;
}

export class CreateShipmentDto {
  @ValidateNested()
  @Type(() => AddressDto)
  pickupAddress!: AddressDto;

  @ValidateNested()
  @Type(() => AddressDto)
  deliveryAddress!: AddressDto;

  @IsString()
  shipmentType!: string;

  @IsNumber()
  @Min(0.01)
  weight!: number;

  @IsOptional()
  @IsNumber()
  volume?: number;

  @IsOptional()
  @IsEnum(ShipmentPriority)
  priority?: ShipmentPriority;

  @IsOptional()
  @IsDateString()
  scheduledPickupAt?: string;

  @IsOptional()
  @IsDateString()
  scheduledDeliveryAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShipmentItemDto)
  items!: ShipmentItemDto[];
}

export class UpdateShipmentStatusDto {
  @IsEnum(ShipmentStatus)
  status!: ShipmentStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}

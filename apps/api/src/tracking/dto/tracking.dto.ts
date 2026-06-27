import { IsString, IsNumber, IsOptional, IsUUID, IsDateString, Min, Max } from 'class-validator';

export class LocationUpdateDto {
  @IsUUID()
  shipmentId!: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @IsOptional()
  @IsNumber()
  accuracy?: number;

  @IsOptional()
  @IsNumber()
  speed?: number;

  @IsOptional()
  @IsNumber()
  heading?: number;

  @IsOptional()
  @IsDateString()
  timestamp?: string;
}

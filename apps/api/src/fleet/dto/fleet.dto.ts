import { IsString, IsNumber, IsInt, Min, Max } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  plateNumber!: string;

  @IsString()
  make!: string;

  @IsString()
  model!: string;

  @IsInt()
  @Min(1990)
  @Max(2030)
  year!: number;

  @IsString()
  vehicleType!: string;

  @IsNumber()
  @Min(0.01)
  capacityWeight!: number;

  @IsNumber()
  @Min(0.01)
  capacityVolume!: number;
}

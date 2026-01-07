import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class ConfirmReceiptDto {
  @IsOptional() // Temporalmente opcional para debugging
  @IsString()
  inspeccionadoPorId?: string;

  @IsOptional()
  @IsDateString()
  fechaInspeccion?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

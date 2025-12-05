import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class ConfirmReceiptDto {
  @IsNotEmpty({ message: 'El ID del inspector es requerido' })
  @IsString()
  inspeccionadoPorId: string;

  @IsOptional()
  @IsDateString()
  fechaInspeccion?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

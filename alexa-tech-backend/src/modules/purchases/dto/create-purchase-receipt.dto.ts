import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QualityControlStatus } from '@prisma/client';

export class CreatePurchaseReceiptItemDto {
  @IsNotEmpty({ message: 'El ID del item de la OC es requerido' })
  @IsString()
  ordenCompraItemId: string;

  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  @IsString()
  productoId: string;

  @IsNotEmpty({ message: 'La cantidad recibida es requerida' })
  @IsNumber()
  @Min(1, { message: 'La cantidad recibida debe ser mayor a 0' })
  cantidadRecibida: number;

  @IsNotEmpty({ message: 'La cantidad aceptada es requerida' })
  @IsNumber()
  @Min(0, { message: 'La cantidad aceptada no puede ser negativa' })
  cantidadAceptada: number;

  @IsNotEmpty({ message: 'La cantidad rechazada es requerida' })
  @IsNumber()
  @Min(0, { message: 'La cantidad rechazada no puede ser negativa' })
  cantidadRechazada: number;

  @IsNotEmpty({ message: 'El estado de QC es requerido' })
  @IsEnum(QualityControlStatus, { message: 'Estado de QC inválido' })
  estadoQC: QualityControlStatus;

  @IsOptional()
  @IsString()
  numeroLote?: string;

  @IsOptional()
  @IsString()
  motivoRechazo?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class CreatePurchaseReceiptDto {
  @IsNotEmpty({ message: 'El ID de la orden de compra es requerido' })
  @IsString()
  ordenCompraId: string;

  @IsNotEmpty({ message: 'El ID del almacén es requerido' })
  @IsString()
  almacenId: string;

  @IsNotEmpty({ message: 'El ID del usuario que recibe es requerido' })
  @IsString()
  recibidoPorId: string;

  @IsOptional()
  @IsDateString()
  fechaRecepcion?: string;

  @IsOptional()
  @IsString()
  guiaRemision?: string;

  @IsOptional()
  @IsString()
  transportista?: string;

  @IsOptional()
  @IsString()
  condicionMercancia?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsNotEmpty({ message: 'Los items son requeridos' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseReceiptItemDto)
  items: CreatePurchaseReceiptItemDto[];
}

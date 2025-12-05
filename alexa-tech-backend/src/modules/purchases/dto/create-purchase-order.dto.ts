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
import { PurchaseOrderStatus } from '@prisma/client';

export class CreatePurchaseOrderItemDto {
  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  @IsString()
  productoId: string;

  @IsNotEmpty({ message: 'La cantidad ordenada es requerida' })
  @IsNumber()
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  cantidadOrdenada: number;

  @IsNotEmpty({ message: 'El precio unitario es requerido' })
  @IsNumber()
  @Min(0, { message: 'El precio debe ser mayor o igual a 0' })
  precioUnitario: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  descuento?: number;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  especificaciones?: string;
}

export class CreatePurchaseOrderDto {
  @IsNotEmpty({ message: 'El ID del proveedor es requerido' })
  @IsString()
  proveedorId: string;

  @IsNotEmpty({ message: 'El ID del almacén es requerido' })
  @IsString()
  almacenDestinoId: string;

  @IsNotEmpty({ message: 'El ID del usuario solicitante es requerido' })
  @IsString()
  solicitadoPorId: string;

  @IsOptional()
  @IsString()
  solicitudCompraId?: string;

  @IsOptional()
  @IsDateString()
  fechaEntregaEsperada?: string;

  @IsOptional()
  @IsString()
  moneda?: string; // 'PEN' | 'USD'

  @IsOptional()
  @IsString()
  condicionesPago?: string;

  @IsOptional()
  @IsString()
  formaPago?: string;

  @IsOptional()
  @IsString()
  lugarEntrega?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsNotEmpty({ message: 'Los items son requeridos' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  items: CreatePurchaseOrderItemDto[];
}

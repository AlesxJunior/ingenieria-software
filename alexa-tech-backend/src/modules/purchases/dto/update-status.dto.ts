import { IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';
import { PurchaseOrderStatus } from '@prisma/client';

export class UpdatePurchaseOrderStatusDto {
  @IsNotEmpty({ message: 'El estado es requerido' })
  @IsEnum(PurchaseOrderStatus, {
    message: 'Estado inválido',
  })
  estado: PurchaseOrderStatus;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

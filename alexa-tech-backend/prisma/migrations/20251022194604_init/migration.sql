-- CreateEnum
CREATE TYPE "public"."MovementType" AS ENUM ('ENTRADA', 'SALIDA', 'AJUSTE');

-- CreateEnum
CREATE TYPE "public"."AdjustmentDirection" AS ENUM ('INCREMENT', 'DECREMENT');

-- CreateEnum
CREATE TYPE "public"."AdjustmentReason" AS ENUM ('MermaDanio', 'MermaRotura', 'DevolucionCliente', 'ErrorConteo', 'OtroRazon');

-- DropForeignKey
ALTER TABLE "public"."inventory_movements" DROP CONSTRAINT "inventory_movements_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."inventory_movements" DROP CONSTRAINT "inventory_movements_warehouseId_fkey";

-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "minStock" INTEGER,
ADD COLUMN     "trackInventory" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."stock_by_warehouse" ALTER COLUMN "stockMinimo" DROP NOT NULL,
ALTER COLUMN "stockMinimo" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "public"."inventory_movements" ADD CONSTRAINT "inventory_movements_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_movements" ADD CONSTRAINT "inventory_movements_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

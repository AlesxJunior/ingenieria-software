/*
  Warnings:

  - The values [CERRADA] on the enum `PurchaseOrderStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."PurchaseOrderStatus_new" AS ENUM ('PENDIENTE', 'ENVIADA', 'CONFIRMADA', 'EN_RECEPCION', 'PARCIAL', 'COMPLETADA', 'CANCELADA');
ALTER TABLE "public"."purchase_orders_v2" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "public"."purchase_orders_v2" ALTER COLUMN "estado" TYPE "public"."PurchaseOrderStatus_new" USING ("estado"::text::"public"."PurchaseOrderStatus_new");
ALTER TYPE "public"."PurchaseOrderStatus" RENAME TO "PurchaseOrderStatus_old";
ALTER TYPE "public"."PurchaseOrderStatus_new" RENAME TO "PurchaseOrderStatus";
DROP TYPE "public"."PurchaseOrderStatus_old";
ALTER TABLE "public"."purchase_orders_v2" ALTER COLUMN "estado" SET DEFAULT 'PENDIENTE';
COMMIT;

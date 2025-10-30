/*
  Warnings:

  - The values [Credito_30,Credito_60] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."PaymentMethod_new" AS ENUM ('Efectivo', 'Tarjeta', 'Transferencia');
ALTER TABLE "public"."purchase_orders" ALTER COLUMN "formaPago" TYPE "public"."PaymentMethod_new" USING ("formaPago"::text::"public"."PaymentMethod_new");
ALTER TYPE "public"."PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "public"."PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "public"."PaymentMethod_old";
COMMIT;

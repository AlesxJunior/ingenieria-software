/*
  Warnings:

  - The values [Anulada,Pagada,DevueltaParcial,DevueltaTotal] on the enum `SaleStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `estadoPago` on the `sales` table. All the data in the column will be lost.

*/

-- Paso 1: Migrar datos de estados antiguos a nuevos
-- Pagada -> Completada
UPDATE "public"."sales" SET "estado" = 'Completada' WHERE "estado" = 'Pagada';

-- DevueltaParcial -> Completada (la NC ya está registrada en tabla aparte)
UPDATE "public"."sales" SET "estado" = 'Completada' WHERE "estado" = 'DevueltaParcial';

-- DevueltaTotal -> Completada (la NC ya está registrada en tabla aparte)
UPDATE "public"."sales" SET "estado" = 'Completada' WHERE "estado" = 'DevueltaTotal';

-- Anulada -> Completada (la NC ya está registrada en tabla aparte)
UPDATE "public"."sales" SET "estado" = 'Completada' WHERE "estado" = 'Anulada';

-- Paso 2: AlterEnum
BEGIN;
CREATE TYPE "public"."SaleStatus_new" AS ENUM ('Pendiente', 'Completada', 'Cancelada');
ALTER TABLE "public"."sales" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "public"."sales" ALTER COLUMN "estado" TYPE "public"."SaleStatus_new" USING ("estado"::text::"public"."SaleStatus_new");
ALTER TYPE "public"."SaleStatus" RENAME TO "SaleStatus_old";
ALTER TYPE "public"."SaleStatus_new" RENAME TO "SaleStatus";
DROP TYPE "public"."SaleStatus_old";
ALTER TABLE "public"."sales" ALTER COLUMN "estado" SET DEFAULT 'Pendiente';
COMMIT;

-- Paso 3: AlterTable (eliminar columna estadoPago)
ALTER TABLE "public"."sales" DROP COLUMN "estadoPago";

-- Paso 4: DropEnum
DROP TYPE "public"."PaymentStatus";

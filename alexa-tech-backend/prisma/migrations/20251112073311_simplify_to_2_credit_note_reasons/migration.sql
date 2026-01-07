/*
  Warnings:

  - The values [ErrorFacturacion,ErrorDocumento,Otro] on the enum `CreditNoteReason` will be removed. If these variants are still used in the database, this will fail.

*/

-- Paso 1: Migrar datos existentes a los 2 motivos válidos
-- Todos los motivos no-devolución se convierten en DevolucionTotal
UPDATE "public"."sales" 
SET "creditNoteReason" = 'DevolucionTotal' 
WHERE "creditNoteReason" IN ('ErrorFacturacion', 'ErrorDocumento', 'Otro');

-- Paso 2: Eliminar valores obsoletos del enum
-- AlterEnum
BEGIN;
CREATE TYPE "public"."CreditNoteReason_new" AS ENUM ('DevolucionTotal', 'DevolucionParcial');
ALTER TABLE "public"."sales" ALTER COLUMN "creditNoteReason" TYPE "public"."CreditNoteReason_new" USING ("creditNoteReason"::text::"public"."CreditNoteReason_new");
ALTER TYPE "public"."CreditNoteReason" RENAME TO "CreditNoteReason_old";
ALTER TYPE "public"."CreditNoteReason_new" RENAME TO "CreditNoteReason";
DROP TYPE "public"."CreditNoteReason_old";
COMMIT;

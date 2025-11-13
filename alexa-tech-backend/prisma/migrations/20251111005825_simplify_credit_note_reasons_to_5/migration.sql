/*
  Warnings:

  - The values [ProductoDefectuoso,DescuentoPostVenta,ClienteInsatisfecho,ErrorSistema,ErrorSeleccionCliente] on the enum `CreditNoteReason` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."CreditNoteReason_new" AS ENUM ('DevolucionTotal', 'DevolucionParcial', 'ErrorFacturacion', 'ErrorDocumento', 'Otro');
ALTER TABLE "public"."sales" ALTER COLUMN "creditNoteReason" TYPE "public"."CreditNoteReason_new" USING ("creditNoteReason"::text::"public"."CreditNoteReason_new");
ALTER TYPE "public"."CreditNoteReason" RENAME TO "CreditNoteReason_old";
ALTER TYPE "public"."CreditNoteReason_new" RENAME TO "CreditNoteReason";
DROP TYPE "public"."CreditNoteReason_old";
COMMIT;

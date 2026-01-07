-- CreateEnum
CREATE TYPE "public"."CreditNoteStatus" AS ENUM ('Pendiente', 'Reembolsada', 'PendientePagoBancario', 'Aplicada', 'Cancelada');

-- CreateEnum
CREATE TYPE "public"."CreditNotePaymentMethod" AS ENUM ('Efectivo', 'Transferencia', 'Vale');

-- AlterTable
ALTER TABLE "public"."sales" ADD COLUMN     "cashMovementId" TEXT,
ADD COLUMN     "creditNotePaymentMethod" "public"."CreditNotePaymentMethod",
ADD COLUMN     "creditNoteRefundDate" TIMESTAMP(3),
ADD COLUMN     "creditNoteStatus" "public"."CreditNoteStatus";

-- AddForeignKey
ALTER TABLE "public"."sales" ADD CONSTRAINT "sales_cashMovementId_fkey" FOREIGN KEY ("cashMovementId") REFERENCES "public"."cash_movements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

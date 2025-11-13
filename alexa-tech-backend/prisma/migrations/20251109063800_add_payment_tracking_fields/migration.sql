-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('Pendiente', 'Pagado', 'Parcial');

-- AlterEnum
ALTER TYPE "public"."CreditNoteReason" ADD VALUE 'ErrorSeleccionCliente';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."SaleStatus" ADD VALUE 'Pagada';
ALTER TYPE "public"."SaleStatus" ADD VALUE 'Cancelada';
ALTER TYPE "public"."SaleStatus" ADD VALUE 'DevueltaParcial';
ALTER TYPE "public"."SaleStatus" ADD VALUE 'DevueltaTotal';

-- AlterTable
ALTER TABLE "public"."sales" ADD COLUMN     "estadoPago" "public"."PaymentStatus" NOT NULL DEFAULT 'Pendiente',
ADD COLUMN     "fechaPago" TIMESTAMP(3),
ADD COLUMN     "montoCambio" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "montoRecibido" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "referenciaPago" TEXT;

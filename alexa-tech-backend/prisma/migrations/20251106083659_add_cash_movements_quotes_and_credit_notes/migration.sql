/*
  Warnings:

  - The values [Cancelada] on the enum `SaleStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."SaleType" AS ENUM ('Venta', 'NotaCredito');

-- CreateEnum
CREATE TYPE "public"."CreditNoteReason" AS ENUM ('DevolucionTotal', 'DevolucionParcial', 'ProductoDefectuoso', 'ErrorFacturacion', 'DescuentoPostVenta', 'ClienteInsatisfecho', 'ErrorSistema', 'Otro');

-- CreateEnum
CREATE TYPE "public"."CashMovementType" AS ENUM ('INGRESO', 'EGRESO');

-- CreateEnum
CREATE TYPE "public"."QuoteStatus" AS ENUM ('Pendiente', 'Aceptada', 'Convertida', 'Rechazada', 'Vencida', 'Cancelada');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."SaleStatus_new" AS ENUM ('Pendiente', 'Completada', 'Anulada');
ALTER TABLE "public"."sales" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "public"."sales" ALTER COLUMN "estado" TYPE "public"."SaleStatus_new" USING ("estado"::text::"public"."SaleStatus_new");
ALTER TYPE "public"."SaleStatus" RENAME TO "SaleStatus_old";
ALTER TYPE "public"."SaleStatus_new" RENAME TO "SaleStatus";
DROP TYPE "public"."SaleStatus_old";
ALTER TABLE "public"."sales" ALTER COLUMN "estado" SET DEFAULT 'Pendiente';
COMMIT;

-- AlterTable
ALTER TABLE "public"."sales" ADD COLUMN     "creditNoteDescription" TEXT,
ADD COLUMN     "creditNoteReason" "public"."CreditNoteReason",
ADD COLUMN     "quoteOriginId" TEXT,
ADD COLUMN     "saleOriginId" TEXT,
ADD COLUMN     "tipo" "public"."SaleType" NOT NULL DEFAULT 'Venta';

-- CreateTable
CREATE TABLE "public"."cash_movements" (
    "id" TEXT NOT NULL,
    "cashSessionId" TEXT NOT NULL,
    "tipo" "public"."CashMovementType" NOT NULL,
    "monto" DECIMAL(65,30) NOT NULL,
    "motivo" TEXT NOT NULL,
    "descripcion" TEXT,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quotes" (
    "id" TEXT NOT NULL,
    "codigoCotizacion" TEXT NOT NULL,
    "clienteId" TEXT,
    "almacenId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "diasValidez" INTEGER NOT NULL DEFAULT 15,
    "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "igv" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "estado" "public"."QuoteStatus" NOT NULL DEFAULT 'Pendiente',
    "observaciones" TEXT,
    "motivoRechazo" TEXT,
    "intentosConversion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quote_items" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "nombreProducto" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quote_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quotes_codigoCotizacion_key" ON "public"."quotes"("codigoCotizacion");

-- AddForeignKey
ALTER TABLE "public"."sales" ADD CONSTRAINT "sales_saleOriginId_fkey" FOREIGN KEY ("saleOriginId") REFERENCES "public"."sales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales" ADD CONSTRAINT "sales_quoteOriginId_fkey" FOREIGN KEY ("quoteOriginId") REFERENCES "public"."quotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cash_movements" ADD CONSTRAINT "cash_movements_cashSessionId_fkey" FOREIGN KEY ("cashSessionId") REFERENCES "public"."cash_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cash_movements" ADD CONSTRAINT "cash_movements_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quotes" ADD CONSTRAINT "quotes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quote_items" ADD CONSTRAINT "quote_items_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "public"."quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

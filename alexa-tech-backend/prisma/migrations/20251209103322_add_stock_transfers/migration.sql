-- CreateEnum
CREATE TYPE "public"."TransferStatus" AS ENUM ('PENDIENTE', 'APROBADO', 'ENVIADO', 'RECIBIDO', 'CANCELADO');

-- CreateTable
CREATE TABLE "public"."stock_transfers" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "warehouseFromId" TEXT NOT NULL,
    "warehouseToId" TEXT NOT NULL,
    "estado" "public"."TransferStatus" NOT NULL DEFAULT 'PENDIENTE',
    "observaciones" TEXT,
    "motivoTransferencia" TEXT,
    "solicitadoPor" TEXT NOT NULL,
    "aprobadoPor" TEXT,
    "fechaAprobacion" TIMESTAMP(3),
    "recibidoPor" TEXT,
    "fechaRecepcion" TIMESTAMP(3),
    "movimientoSalidaId" TEXT,
    "movimientoEntradaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stock_transfers_codigo_key" ON "public"."stock_transfers"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "stock_transfers_movimientoSalidaId_key" ON "public"."stock_transfers"("movimientoSalidaId");

-- CreateIndex
CREATE UNIQUE INDEX "stock_transfers_movimientoEntradaId_key" ON "public"."stock_transfers"("movimientoEntradaId");

-- AddForeignKey
ALTER TABLE "public"."stock_transfers" ADD CONSTRAINT "stock_transfers_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock_transfers" ADD CONSTRAINT "stock_transfers_warehouseFromId_fkey" FOREIGN KEY ("warehouseFromId") REFERENCES "public"."warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock_transfers" ADD CONSTRAINT "stock_transfers_warehouseToId_fkey" FOREIGN KEY ("warehouseToId") REFERENCES "public"."warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock_transfers" ADD CONSTRAINT "stock_transfers_solicitadoPor_fkey" FOREIGN KEY ("solicitadoPor") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock_transfers" ADD CONSTRAINT "stock_transfers_aprobadoPor_fkey" FOREIGN KEY ("aprobadoPor") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock_transfers" ADD CONSTRAINT "stock_transfers_recibidoPor_fkey" FOREIGN KEY ("recibidoPor") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock_transfers" ADD CONSTRAINT "stock_transfers_movimientoSalidaId_fkey" FOREIGN KEY ("movimientoSalidaId") REFERENCES "public"."inventory_movements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock_transfers" ADD CONSTRAINT "stock_transfers_movimientoEntradaId_fkey" FOREIGN KEY ("movimientoEntradaId") REFERENCES "public"."inventory_movements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

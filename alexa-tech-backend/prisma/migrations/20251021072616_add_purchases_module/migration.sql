-- CreateEnum
CREATE TYPE "public"."PurchaseStatus" AS ENUM ('Pendiente', 'Recibida', 'Cancelada');

-- CreateEnum
CREATE TYPE "public"."VoucherType" AS ENUM ('Factura', 'Boleta', 'GuiaRemision');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('Efectivo', 'Credito_30', 'Credito_60');

-- CreateTable
CREATE TABLE "public"."purchase_orders" (
    "id" TEXT NOT NULL,
    "codigoOrden" TEXT NOT NULL,
    "proveedorId" TEXT NOT NULL,
    "almacenId" TEXT NOT NULL,
    "fechaEmision" TIMESTAMP(3) NOT NULL,
    "fechaEntregaEstimada" TIMESTAMP(3),
    "tipoComprobante" "public"."VoucherType",
    "formaPago" "public"."PaymentMethod",
    "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "descuento" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "estado" "public"."PurchaseStatus" NOT NULL DEFAULT 'Pendiente',
    "observaciones" TEXT,
    "usuarioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."purchase_items" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "productCodigo" TEXT NOT NULL,
    "nombreProducto" TEXT,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "purchase_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_codigoOrden_key" ON "public"."purchase_orders"("codigoOrden");

-- AddForeignKey
ALTER TABLE "public"."purchase_orders" ADD CONSTRAINT "purchase_orders_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_items" ADD CONSTRAINT "purchase_items_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "public"."purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_items" ADD CONSTRAINT "purchase_items_productCodigo_fkey" FOREIGN KEY ("productCodigo") REFERENCES "public"."products"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

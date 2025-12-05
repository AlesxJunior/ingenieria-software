-- CreateEnum
CREATE TYPE "public"."PurchaseRequestStatus" AS ENUM ('BORRADOR', 'APROBADA', 'RECHAZADA', 'CONVERTIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "public"."PurchaseRequestPriority" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "public"."PurchaseOrderStatus" AS ENUM ('PENDIENTE', 'ENVIADA', 'CONFIRMADA', 'EN_RECEPCION', 'PARCIAL', 'COMPLETADA', 'CERRADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "public"."PurchaseReceiptStatus" AS ENUM ('PENDIENTE', 'INSPECCION', 'CONFIRMADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "public"."QualityControlStatus" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'PARCIAL');

-- CreateEnum
CREATE TYPE "public"."AccountPayableStatus" AS ENUM ('PENDIENTE', 'PARCIAL', 'PAGADA', 'VENCIDA', 'ANULADA');

-- AlterTable
ALTER TABLE "public"."inventory_movements" ADD COLUMN     "recepcionCompraId" TEXT;

-- CreateTable
CREATE TABLE "public"."purchase_requests" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "estado" "public"."PurchaseRequestStatus" NOT NULL DEFAULT 'BORRADOR',
    "solicitadoPorId" TEXT NOT NULL,
    "aprobadoPorId" TEXT,
    "almacenDestinoId" TEXT NOT NULL,
    "fechaSolicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaNecesaria" TIMESTAMP(3) NOT NULL,
    "prioridad" "public"."PurchaseRequestPriority" NOT NULL DEFAULT 'MEDIA',
    "motivo" TEXT NOT NULL,
    "observaciones" TEXT,
    "fechaAprobacion" TIMESTAMP(3),
    "comentariosAprobacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "purchase_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."purchase_request_items" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidadSolicitada" INTEGER NOT NULL,
    "stockActual" INTEGER NOT NULL,
    "stockMinimo" INTEGER NOT NULL,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_request_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."purchase_orders_v2" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "estado" "public"."PurchaseOrderStatus" NOT NULL DEFAULT 'PENDIENTE',
    "proveedorId" TEXT NOT NULL,
    "almacenDestinoId" TEXT NOT NULL,
    "creadoPorId" TEXT NOT NULL,
    "aprobadoPorId" TEXT,
    "solicitudCompraId" TEXT,
    "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaEnvio" TIMESTAMP(3),
    "fechaConfirmacion" TIMESTAMP(3),
    "fechaEntregaEstimada" TIMESTAMP(3) NOT NULL,
    "fechaEntregaReal" TIMESTAMP(3),
    "moneda" TEXT NOT NULL DEFAULT 'PEN',
    "tipoCambio" DECIMAL(10,4) NOT NULL DEFAULT 1.00,
    "condicionesPago" TEXT NOT NULL,
    "formaPago" TEXT NOT NULL,
    "observaciones" TEXT,
    "terminosCondiciones" TEXT,
    "numeroOCProveedor" TEXT,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "descuento" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "igv" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "purchase_orders_v2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."purchase_order_items" (
    "id" TEXT NOT NULL,
    "ordenCompraId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidadOrdenada" INTEGER NOT NULL,
    "cantidadRecibida" INTEGER NOT NULL DEFAULT 0,
    "cantidadAceptada" INTEGER NOT NULL DEFAULT 0,
    "cantidadRechazada" INTEGER NOT NULL DEFAULT 0,
    "cantidadPendiente" INTEGER NOT NULL,
    "precioUnitario" DECIMAL(10,2) NOT NULL,
    "descuento" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "igv" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "descripcion" TEXT,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."purchase_receipts" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "estado" "public"."PurchaseReceiptStatus" NOT NULL DEFAULT 'PENDIENTE',
    "ordenCompraId" TEXT NOT NULL,
    "almacenId" TEXT NOT NULL,
    "recibidoPorId" TEXT NOT NULL,
    "inspeccionadoPorId" TEXT,
    "fechaRecepcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "horaRecepcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaInspeccion" TIMESTAMP(3),
    "guiaRemision" TEXT,
    "transportista" TEXT,
    "condicionMercancia" TEXT,
    "esRecepcionCompleta" BOOLEAN NOT NULL DEFAULT false,
    "esRecepcionParcial" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,
    "incidencias" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "purchase_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."purchase_receipt_items" (
    "id" TEXT NOT NULL,
    "recepcionId" TEXT NOT NULL,
    "ordenCompraItemId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidadOrdenada" INTEGER NOT NULL,
    "cantidadRecibida" INTEGER NOT NULL,
    "cantidadAceptada" INTEGER NOT NULL,
    "cantidadRechazada" INTEGER NOT NULL,
    "estadoQC" "public"."QualityControlStatus" NOT NULL DEFAULT 'PENDIENTE',
    "motivoRechazo" TEXT,
    "numeroLote" TEXT,
    "fechaVencimiento" TIMESTAMP(3),
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_receipt_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."purchase_invoices" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "ordenCompraId" TEXT NOT NULL,
    "proveedorId" TEXT NOT NULL,
    "registradoPorId" TEXT NOT NULL,
    "tipoComprobante" TEXT NOT NULL,
    "serie" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "numeroCompleto" TEXT NOT NULL,
    "fechaEmision" TIMESTAMP(3) NOT NULL,
    "fechaVencimiento" TIMESTAMP(3),
    "fechaRecepcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moneda" TEXT NOT NULL DEFAULT 'PEN',
    "tipoCambio" DECIMAL(10,4) NOT NULL DEFAULT 1.00,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "descuento" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "igv" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "validada" BOOLEAN NOT NULL DEFAULT false,
    "diferenciaDetectada" BOOLEAN NOT NULL DEFAULT false,
    "motivoDiferencia" TEXT,
    "archivoURL" TEXT,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "purchase_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accounts_payable" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "estado" "public"."AccountPayableStatus" NOT NULL DEFAULT 'PENDIENTE',
    "facturaCompraId" TEXT NOT NULL,
    "proveedorId" TEXT NOT NULL,
    "fechaEmision" TIMESTAMP(3) NOT NULL,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "fechaPago" TIMESTAMP(3),
    "moneda" TEXT NOT NULL DEFAULT 'PEN',
    "montoPendiente" DECIMAL(10,2) NOT NULL,
    "montoPagado" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "montoTotal" DECIMAL(10,2) NOT NULL,
    "metodoPago" TEXT,
    "referenciaPago" TEXT,
    "bancoId" TEXT,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_payable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "purchase_requests_codigo_key" ON "public"."purchase_requests"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_v2_codigo_key" ON "public"."purchase_orders_v2"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_v2_solicitudCompraId_key" ON "public"."purchase_orders_v2"("solicitudCompraId");

-- CreateIndex
CREATE INDEX "purchase_orders_v2_proveedorId_idx" ON "public"."purchase_orders_v2"("proveedorId");

-- CreateIndex
CREATE INDEX "purchase_orders_v2_estado_idx" ON "public"."purchase_orders_v2"("estado");

-- CreateIndex
CREATE INDEX "purchase_orders_v2_fechaEmision_idx" ON "public"."purchase_orders_v2"("fechaEmision");

-- CreateIndex
CREATE INDEX "purchase_order_items_ordenCompraId_idx" ON "public"."purchase_order_items"("ordenCompraId");

-- CreateIndex
CREATE INDEX "purchase_order_items_productoId_idx" ON "public"."purchase_order_items"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_receipts_codigo_key" ON "public"."purchase_receipts"("codigo");

-- CreateIndex
CREATE INDEX "purchase_receipts_ordenCompraId_idx" ON "public"."purchase_receipts"("ordenCompraId");

-- CreateIndex
CREATE INDEX "purchase_receipts_fechaRecepcion_idx" ON "public"."purchase_receipts"("fechaRecepcion");

-- CreateIndex
CREATE INDEX "purchase_receipt_items_recepcionId_idx" ON "public"."purchase_receipt_items"("recepcionId");

-- CreateIndex
CREATE INDEX "purchase_receipt_items_productoId_idx" ON "public"."purchase_receipt_items"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_invoices_codigo_key" ON "public"."purchase_invoices"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_invoices_ordenCompraId_key" ON "public"."purchase_invoices"("ordenCompraId");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_invoices_numeroCompleto_key" ON "public"."purchase_invoices"("numeroCompleto");

-- CreateIndex
CREATE INDEX "purchase_invoices_proveedorId_idx" ON "public"."purchase_invoices"("proveedorId");

-- CreateIndex
CREATE INDEX "purchase_invoices_fechaEmision_idx" ON "public"."purchase_invoices"("fechaEmision");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_invoices_serie_numero_key" ON "public"."purchase_invoices"("serie", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_payable_codigo_key" ON "public"."accounts_payable"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_payable_facturaCompraId_key" ON "public"."accounts_payable"("facturaCompraId");

-- CreateIndex
CREATE INDEX "accounts_payable_proveedorId_idx" ON "public"."accounts_payable"("proveedorId");

-- CreateIndex
CREATE INDEX "accounts_payable_estado_idx" ON "public"."accounts_payable"("estado");

-- CreateIndex
CREATE INDEX "accounts_payable_fechaVencimiento_idx" ON "public"."accounts_payable"("fechaVencimiento");

-- AddForeignKey
ALTER TABLE "public"."inventory_movements" ADD CONSTRAINT "inventory_movements_recepcionCompraId_fkey" FOREIGN KEY ("recepcionCompraId") REFERENCES "public"."purchase_receipts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_requests" ADD CONSTRAINT "purchase_requests_solicitadoPorId_fkey" FOREIGN KEY ("solicitadoPorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_requests" ADD CONSTRAINT "purchase_requests_aprobadoPorId_fkey" FOREIGN KEY ("aprobadoPorId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_requests" ADD CONSTRAINT "purchase_requests_almacenDestinoId_fkey" FOREIGN KEY ("almacenDestinoId") REFERENCES "public"."warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_request_items" ADD CONSTRAINT "purchase_request_items_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "public"."purchase_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_request_items" ADD CONSTRAINT "purchase_request_items_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_orders_v2" ADD CONSTRAINT "purchase_orders_v2_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "public"."commercial_entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_orders_v2" ADD CONSTRAINT "purchase_orders_v2_almacenDestinoId_fkey" FOREIGN KEY ("almacenDestinoId") REFERENCES "public"."warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_orders_v2" ADD CONSTRAINT "purchase_orders_v2_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_orders_v2" ADD CONSTRAINT "purchase_orders_v2_aprobadoPorId_fkey" FOREIGN KEY ("aprobadoPorId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_orders_v2" ADD CONSTRAINT "purchase_orders_v2_solicitudCompraId_fkey" FOREIGN KEY ("solicitudCompraId") REFERENCES "public"."purchase_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_order_items" ADD CONSTRAINT "purchase_order_items_ordenCompraId_fkey" FOREIGN KEY ("ordenCompraId") REFERENCES "public"."purchase_orders_v2"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_order_items" ADD CONSTRAINT "purchase_order_items_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_receipts" ADD CONSTRAINT "purchase_receipts_ordenCompraId_fkey" FOREIGN KEY ("ordenCompraId") REFERENCES "public"."purchase_orders_v2"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_receipts" ADD CONSTRAINT "purchase_receipts_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "public"."warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_receipts" ADD CONSTRAINT "purchase_receipts_recibidoPorId_fkey" FOREIGN KEY ("recibidoPorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_receipts" ADD CONSTRAINT "purchase_receipts_inspeccionadoPorId_fkey" FOREIGN KEY ("inspeccionadoPorId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_receipt_items" ADD CONSTRAINT "purchase_receipt_items_recepcionId_fkey" FOREIGN KEY ("recepcionId") REFERENCES "public"."purchase_receipts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_receipt_items" ADD CONSTRAINT "purchase_receipt_items_ordenCompraItemId_fkey" FOREIGN KEY ("ordenCompraItemId") REFERENCES "public"."purchase_order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_receipt_items" ADD CONSTRAINT "purchase_receipt_items_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_invoices" ADD CONSTRAINT "purchase_invoices_ordenCompraId_fkey" FOREIGN KEY ("ordenCompraId") REFERENCES "public"."purchase_orders_v2"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_invoices" ADD CONSTRAINT "purchase_invoices_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "public"."commercial_entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_invoices" ADD CONSTRAINT "purchase_invoices_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."accounts_payable" ADD CONSTRAINT "accounts_payable_facturaCompraId_fkey" FOREIGN KEY ("facturaCompraId") REFERENCES "public"."purchase_invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."accounts_payable" ADD CONSTRAINT "accounts_payable_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "public"."commercial_entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

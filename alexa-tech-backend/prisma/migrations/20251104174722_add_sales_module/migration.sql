-- CreateEnum
CREATE TYPE "public"."SaleStatus" AS ENUM ('Pendiente', 'Completada', 'Cancelada');

-- CreateEnum
CREATE TYPE "public"."SalePaymentMethod" AS ENUM ('Efectivo', 'Tarjeta', 'Transferencia', 'Yape', 'Plin');

-- CreateEnum
CREATE TYPE "public"."SaleVoucherType" AS ENUM ('Boleta', 'Factura', 'NotaVenta');

-- CreateEnum
CREATE TYPE "public"."CashRegisterStatus" AS ENUM ('Abierta', 'Cerrada');

-- CreateTable
CREATE TABLE "public"."cash_registers" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ubicacion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_registers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cash_sessions" (
    "id" TEXT NOT NULL,
    "cashRegisterId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fechaApertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaCierre" TIMESTAMP(3),
    "montoApertura" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "montoCierre" DECIMAL(65,30),
    "totalVentas" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "diferencia" DECIMAL(65,30),
    "estado" "public"."CashRegisterStatus" NOT NULL DEFAULT 'Abierta',
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sales" (
    "id" TEXT NOT NULL,
    "codigoVenta" TEXT NOT NULL,
    "cashSessionId" TEXT,
    "clienteId" TEXT,
    "almacenId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipoComprobante" "public"."SaleVoucherType" NOT NULL DEFAULT 'Boleta',
    "formaPago" "public"."SalePaymentMethod" NOT NULL DEFAULT 'Efectivo',
    "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "igv" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "estado" "public"."SaleStatus" NOT NULL DEFAULT 'Pendiente',
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sale_items" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "nombreProducto" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sale_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cash_registers_codigo_key" ON "public"."cash_registers"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "sales_codigoVenta_key" ON "public"."sales"("codigoVenta");

-- AddForeignKey
ALTER TABLE "public"."cash_sessions" ADD CONSTRAINT "cash_sessions_cashRegisterId_fkey" FOREIGN KEY ("cashRegisterId") REFERENCES "public"."cash_registers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cash_sessions" ADD CONSTRAINT "cash_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales" ADD CONSTRAINT "sales_cashSessionId_fkey" FOREIGN KEY ("cashSessionId") REFERENCES "public"."cash_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales" ADD CONSTRAINT "sales_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sale_items" ADD CONSTRAINT "sale_items_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "public"."sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "public"."company" (
    "id" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "nombreComercial" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "logo" TEXT,
    "igvActivo" BOOLEAN NOT NULL DEFAULT true,
    "igvPorcentaje" DECIMAL(65,30) NOT NULL DEFAULT 18,
    "moneda" TEXT NOT NULL DEFAULT 'PEN',
    "pais" TEXT NOT NULL DEFAULT 'Perú',
    "departamento" TEXT NOT NULL DEFAULT '',
    "provincia" TEXT NOT NULL DEFAULT '',
    "distrito" TEXT NOT NULL DEFAULT '',
    "codigoPostal" TEXT,
    "sunatUsuario" TEXT,
    "sunatClave" TEXT,
    "sunatServidor" TEXT NOT NULL DEFAULT 'homologacion',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."comprobante_types" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" TEXT NOT NULL,
    "serie" TEXT NOT NULL,
    "numeroActual" INTEGER NOT NULL DEFAULT 1,
    "numeroInicio" INTEGER NOT NULL DEFAULT 1,
    "numeroFin" INTEGER NOT NULL DEFAULT 99999,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "predeterminado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comprobante_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_method_config" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "predeterminado" BOOLEAN NOT NULL DEFAULT false,
    "requiereReferencia" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_method_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_ruc_key" ON "public"."company"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "comprobante_types_codigo_key" ON "public"."comprobante_types"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "payment_method_config_codigo_key" ON "public"."payment_method_config"("codigo");

-- AddForeignKey
ALTER TABLE "public"."quote_items" ADD CONSTRAINT "quote_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "public"."products" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoria" TEXT NOT NULL,
    "precioVenta" DECIMAL(65,30) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "unidadMedida" TEXT NOT NULL,
    "ubicacion" TEXT,
    "usuarioCreacion" TEXT,
    "usuarioActualizacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_codigo_key" ON "public"."products"("codigo");

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_usuarioCreacion_fkey" FOREIGN KEY ("usuarioCreacion") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_usuarioActualizacion_fkey" FOREIGN KEY ("usuarioActualizacion") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

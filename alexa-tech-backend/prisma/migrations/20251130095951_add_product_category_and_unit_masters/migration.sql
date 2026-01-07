-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "categoriaId" TEXT,
ADD COLUMN     "unidadMedidaId" TEXT,
ALTER COLUMN "categoria" DROP NOT NULL,
ALTER COLUMN "unidadMedida" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."product_categories" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."units_of_measure" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "simbolo" TEXT,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "units_of_measure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_codigo_key" ON "public"."product_categories"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_nombre_key" ON "public"."product_categories"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "units_of_measure_codigo_key" ON "public"."units_of_measure"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "units_of_measure_nombre_key" ON "public"."units_of_measure"("nombre");

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "public"."product_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_unidadMedidaId_fkey" FOREIGN KEY ("unidadMedidaId") REFERENCES "public"."units_of_measure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

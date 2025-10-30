-- AlterTable
ALTER TABLE "public"."inventory_movements" ADD COLUMN     "reasonId" TEXT;

-- CreateTable
CREATE TABLE "public"."movement_reasons" (
    "id" TEXT NOT NULL,
    "type" "public"."MovementType" NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "requiresDocument" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movement_reasons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "movement_reasons_codigo_key" ON "public"."movement_reasons"("codigo");

-- AddForeignKey
ALTER TABLE "public"."inventory_movements" ADD CONSTRAINT "inventory_movements_reasonId_fkey" FOREIGN KEY ("reasonId") REFERENCES "public"."movement_reasons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

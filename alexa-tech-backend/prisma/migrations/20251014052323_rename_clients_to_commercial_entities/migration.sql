-- CreateEnum
CREATE TYPE "public"."TipoEntidad" AS ENUM ('Cliente', 'Proveedor', 'Ambos');

/*
  Warnings:

  - You are about to drop the `clients` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."clients" DROP CONSTRAINT IF EXISTS "clients_usuarioActualizacion_fkey";

-- DropForeignKey
ALTER TABLE "public"."clients" DROP CONSTRAINT IF EXISTS "clients_usuarioCreacion_fkey";

-- DropTable
DROP TABLE "public"."clients";

-- CreateTable
CREATE TABLE "public"."commercial_entities" (
    "id" TEXT NOT NULL,
    "tipoEntidad" "public"."TipoEntidad" NOT NULL DEFAULT 'Cliente',
    "tipoDocumento" TEXT NOT NULL,
    "numeroDocumento" TEXT NOT NULL,
    "nombres" TEXT,
    "apellidos" TEXT,
    "razonSocial" TEXT,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "usuarioCreacion" TEXT,
    "usuarioActualizacion" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commercial_entities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "commercial_entities_numeroDocumento_key" ON "public"."commercial_entities"("numeroDocumento");

-- CreateIndex
CREATE UNIQUE INDEX "commercial_entities_email_key" ON "public"."commercial_entities"("email");

-- AddForeignKey
ALTER TABLE "public"."commercial_entities" ADD CONSTRAINT "commercial_entities_usuarioCreacion_fkey" FOREIGN KEY ("usuarioCreacion") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."commercial_entities" ADD CONSTRAINT "commercial_entities_usuarioActualizacion_fkey" FOREIGN KEY ("usuarioActualizacion") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateEnum for TipoEntidad
CREATE TYPE "public"."TipoEntidad" AS ENUM ('Cliente', 'Proveedor', 'Ambos');

-- AlterTable: add tipoEntidad and audit fields to clients
ALTER TABLE "public"."clients"
  ADD COLUMN "tipoEntidad" "public"."TipoEntidad" NOT NULL DEFAULT 'Cliente',
  ADD COLUMN "usuarioCreacion" TEXT,
  ADD COLUMN "usuarioActualizacion" TEXT;

-- Ensure existing rows have default value (defensive; default should apply)
UPDATE "public"."clients" SET "tipoEntidad" = 'Cliente' WHERE "tipoEntidad" IS NULL;

-- Add foreign keys to users for audit fields
ALTER TABLE "public"."clients"
  ADD CONSTRAINT "clients_usuarioCreacion_fkey" FOREIGN KEY ("usuarioCreacion") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "clients_usuarioActualizacion_fkey" FOREIGN KEY ("usuarioActualizacion") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
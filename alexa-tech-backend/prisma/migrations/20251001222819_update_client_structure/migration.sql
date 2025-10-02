/*
  Warnings:

  - You are about to drop the column `apellido` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `clients` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."clients" DROP COLUMN "apellido",
DROP COLUMN "nombre",
ADD COLUMN     "apellidos" TEXT,
ADD COLUMN     "nombres" TEXT,
ADD COLUMN     "razonSocial" TEXT;

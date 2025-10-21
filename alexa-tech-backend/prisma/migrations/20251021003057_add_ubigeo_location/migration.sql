/*
  Warnings:

  - You are about to drop the column `ciudad` on the `commercial_entities` table. All the data in the column will be lost.
  - Added the required column `departamentoId` to the `commercial_entities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `distritoId` to the `commercial_entities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provinciaId` to the `commercial_entities` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."commercial_entities" DROP COLUMN "ciudad",
ADD COLUMN     "departamentoId" TEXT NOT NULL,
ADD COLUMN     "distritoId" TEXT NOT NULL,
ADD COLUMN     "provinciaId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."departments" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."provinces" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "departamentoId" TEXT NOT NULL,

    CONSTRAINT "provinces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."districts" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "provinciaId" TEXT NOT NULL,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."provinces" ADD CONSTRAINT "provinces_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "public"."departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."districts" ADD CONSTRAINT "districts_provinciaId_fkey" FOREIGN KEY ("provinciaId") REFERENCES "public"."provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."commercial_entities" ADD CONSTRAINT "commercial_entities_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "public"."departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."commercial_entities" ADD CONSTRAINT "commercial_entities_provinciaId_fkey" FOREIGN KEY ("provinciaId") REFERENCES "public"."provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."commercial_entities" ADD CONSTRAINT "commercial_entities_distritoId_fkey" FOREIGN KEY ("distritoId") REFERENCES "public"."districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

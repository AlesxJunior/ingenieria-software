-- DropForeignKey
ALTER TABLE "public"."user_permissions" DROP CONSTRAINT "user_permissions_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_permissions" DROP CONSTRAINT "user_permissions_userId_fkey";

-- DropTable
DROP TABLE "public"."user_permissions";

-- DropTable
DROP TABLE "public"."permissions";

-- AlterEnum
-- Remove unused enum values
-- Note: This will fail if any rows still use these values
-- First, update any existing rows that might use these values
UPDATE "public"."users" SET "role" = 'VENDEDOR' WHERE "role" = 'USER';
UPDATE "public"."users" SET "role" = 'SUPERVISOR' WHERE "role" = 'MODERATOR';

-- Remove the default value first
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;

-- Now remove the enum values (PostgreSQL 10+ required)
ALTER TYPE "public"."UserRole" RENAME TO "UserRole_old";
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'SUPERVISOR', 'VENDEDOR', 'CAJERO');
ALTER TABLE "public"."users" ALTER COLUMN "role" TYPE "public"."UserRole" USING "role"::text::"public"."UserRole";
ALTER TABLE "public"."users" ALTER COLUMN "role" SET DEFAULT 'VENDEDOR';
DROP TYPE "public"."UserRole_old";
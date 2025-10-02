-- DropForeignKey
-- No foreign keys to drop for role column

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role";

-- DropEnum
DROP TYPE "UserRole";
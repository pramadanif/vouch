-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EscrowStatus" ADD VALUE 'DELIVERED';
ALTER TYPE "EscrowStatus" ADD VALUE 'DISPUTED';
ALTER TYPE "EscrowStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "escrows" ADD COLUMN     "auto_release_at" TIMESTAMP(3),
ADD COLUMN     "delivered_at" TIMESTAMP(3),
ADD COLUMN     "dispute_reason" TEXT,
ADD COLUMN     "dispute_resolution" TEXT,
ADD COLUMN     "disputed_at" TIMESTAMP(3),
ADD COLUMN     "funded_at" TIMESTAMP(3),
ADD COLUMN     "released_at" TIMESTAMP(3),
ADD COLUMN     "shipped_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "escrows_auto_release_at_idx" ON "escrows"("auto_release_at");

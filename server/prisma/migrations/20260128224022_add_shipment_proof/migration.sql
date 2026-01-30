-- AlterEnum
ALTER TYPE "EscrowStatus" ADD VALUE 'SHIPPED';

-- AlterTable
ALTER TABLE "escrows" ADD COLUMN     "shipment_proof" TEXT;

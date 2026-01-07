-- CreateEnum
CREATE TYPE "EscrowStatus" AS ENUM ('CREATED', 'WAITING_PAYMENT', 'FUNDED', 'RELEASED', 'REFUNDED', 'CANCELLED');

-- CreateTable
CREATE TABLE "escrows" (
    "id" TEXT NOT NULL,
    "escrow_id" INTEGER,
    "seller_address" TEXT NOT NULL,
    "buyer_address" TEXT,
    "item_name" TEXT NOT NULL,
    "item_description" TEXT,
    "item_image" TEXT,
    "amount_usdc" TEXT NOT NULL,
    "amount_idr" TEXT NOT NULL,
    "release_duration" INTEGER NOT NULL,
    "release_time" INTEGER,
    "status" "EscrowStatus" NOT NULL DEFAULT 'CREATED',
    "xendit_invoice_id" TEXT,
    "xendit_invoice_url" TEXT,
    "tx_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "escrows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "escrows_seller_address_idx" ON "escrows"("seller_address");

-- CreateIndex
CREATE INDEX "escrows_status_idx" ON "escrows"("status");

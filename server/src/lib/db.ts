import { PrismaClient, Escrow, EscrowStatus } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

// Re-export types for compatibility
export type EscrowRecord = Escrow;
export { EscrowStatus };

// ============ TIMEOUT CONFIGURATION ============
// These define the escrow security timeouts
export const ESCROW_TIMEOUTS = {
  CREATION_EXPIRY_DAYS: 7,        // Cancel unfunded escrows after 7 days
  SHIPPING_DEADLINE_DAYS: 30,     // Refund if seller doesn't ship within 30 days of funding
  AUTO_RELEASE_DAYS: 14,          // Auto-release to seller 14 days after shipping
  DISPUTE_WINDOW_DAYS: 3,         // Buyer can dispute within 3 days of auto-release prompt
};

// Create new escrow record
export async function createEscrowRecord(data: {
  sellerAddress: string;
  itemName: string;
  itemDescription?: string;
  itemImage?: string;
  amountUsdc: string;
  amountIdr: string;
  releaseDuration: number;
  releaseTime?: number;
  fiatCurrency?: string;
}): Promise<Escrow> {
  return prisma.escrow.create({
    data: {
      sellerAddress: data.sellerAddress,
      itemName: data.itemName,
      itemDescription: data.itemDescription || null,
      itemImage: data.itemImage || null,
      amountUsdc: data.amountUsdc,
      amountIdr: data.amountIdr,
      fiatCurrency: data.fiatCurrency || 'IDR',
      releaseDuration: data.releaseDuration,
      releaseTime: data.releaseTime || null,
      status: 'CREATED',
    },
  });
}

// Get escrow by ID
export async function getEscrowById(id: string): Promise<Escrow | null> {
  return prisma.escrow.findUnique({
    where: { id },
  });
}

// Get escrows by seller address
export async function getEscrowsBySeller(sellerAddress: string): Promise<Escrow[]> {
  return prisma.escrow.findMany({
    where: { sellerAddress },
    orderBy: { createdAt: 'desc' },
  });
}

// Update escrow with on-chain data (partial update supported)
export async function updateEscrowOnChain(id: string, data: {
  escrowId?: number;
  releaseTime?: number;
  txHash?: string;
}): Promise<void> {
  const updateData: any = {};
  if (data.escrowId !== undefined) updateData.escrowId = data.escrowId;
  if (data.releaseTime !== undefined) updateData.releaseTime = data.releaseTime;
  if (data.txHash !== undefined) updateData.txHash = data.txHash;
  if (data.escrowId !== undefined) updateData.status = 'WAITING_PAYMENT';

  await prisma.escrow.update({
    where: { id },
    data: updateData,
  });
}

// Update just the escrow status
export async function updateEscrowStatus(id: string, status: string): Promise<void> {
  await prisma.escrow.update({
    where: { id },
    data: { status: status as any },
  });
}

// Update escrow with Xendit invoice
export async function updateEscrowXendit(id: string, data: {
  invoiceId: string;
  invoiceUrl: string;
}): Promise<void> {
  await prisma.escrow.update({
    where: { id },
    data: {
      xenditInvoiceId: data.invoiceId,
      xenditInvoiceUrl: data.invoiceUrl,
    },
  });
}

// Mark escrow as funded (with timestamp)
export async function markEscrowFunded(id: string, buyerAddress?: string, buyerToken?: string): Promise<void> {
  await prisma.escrow.update({
    where: { id },
    data: {
      status: 'FUNDED',
      buyerAddress: buyerAddress || null,
      buyerToken: buyerToken || null,
      fundedAt: new Date(), // Track when funded
    },
  });
}

// Mark escrow as released (with timestamp)
export async function markEscrowReleased(id: string): Promise<void> {
  const now = new Date();
  await prisma.escrow.update({
    where: { id },
    data: { 
      status: 'RELEASED',
      releasedAt: now,
      // If not already delivered, mark as delivered too (auto-release case)
      deliveredAt: now,
    },
  });
}

// Mark escrow as shipped (NEW: with timestamp and auto-release calculation)
export async function markEscrowShipped(id: string, proof: string): Promise<void> {
  const now = new Date();
  const autoReleaseAt = new Date(now.getTime() + ESCROW_TIMEOUTS.AUTO_RELEASE_DAYS * 24 * 60 * 60 * 1000);
  
  await prisma.escrow.update({
    where: { id },
    data: {
      status: 'SHIPPED',
      shipmentProof: proof,
      shippedAt: now,
      autoReleaseAt: autoReleaseAt, // 14 days from now
    },
  });
}

// Mark escrow as delivered (buyer confirmed - NEW)
export async function markEscrowDelivered(id: string): Promise<void> {
  await prisma.escrow.update({
    where: { id },
    data: {
      status: 'DELIVERED',
      deliveredAt: new Date(),
    },
  });
}

// Mark escrow as cancelled
export async function markEscrowCancelled(id: string): Promise<void> {
  await prisma.escrow.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });
}

// Mark escrow as refunded
export async function markEscrowRefunded(id: string): Promise<void> {
  await prisma.escrow.update({
    where: { id },
    data: { status: 'REFUNDED' },
  });
}

// Mark escrow as disputed (NEW)
export async function markEscrowDisputed(id: string, reason: string): Promise<void> {
  await prisma.escrow.update({
    where: { id },
    data: {
      status: 'DISPUTED',
      disputedAt: new Date(),
      disputeReason: reason,
    },
  });
}

// Resolve dispute (NEW)
export async function resolveDispute(id: string, resolution: 'REFUNDED' | 'RELEASED', notes: string): Promise<void> {
  const now = new Date();
  await prisma.escrow.update({
    where: { id },
    data: {
      status: resolution,
      disputeResolution: notes,
      releasedAt: resolution === 'RELEASED' ? now : null,
    },
  });
}

// ============ CRON JOB QUERIES ============

// Get escrows ready for auto-release (14 days after shipping, buyer didn't confirm)
export async function getEscrowsForAutoRelease(): Promise<Escrow[]> {
  const now = new Date();
  return prisma.escrow.findMany({
    where: {
      status: 'SHIPPED',
      autoReleaseAt: { lte: now },
    },
  });
}

// Get escrows for auto-refund (30 days funded, seller didn't ship)
export async function getEscrowsForAutoRefund(): Promise<Escrow[]> {
  const deadline = new Date(Date.now() - ESCROW_TIMEOUTS.SHIPPING_DEADLINE_DAYS * 24 * 60 * 60 * 1000);
  return prisma.escrow.findMany({
    where: {
      status: 'FUNDED',
      fundedAt: { lte: deadline },
    },
  });
}

// Get expired unfunded escrows (7 days old, never funded)
export async function getExpiredUnfundedEscrows(): Promise<Escrow[]> {
  const deadline = new Date(Date.now() - ESCROW_TIMEOUTS.CREATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  return prisma.escrow.findMany({
    where: {
      status: { in: ['CREATED', 'WAITING_PAYMENT'] },
      createdAt: { lte: deadline },
    },
  });
}

// Mark escrow as expired (NEW)
export async function markEscrowExpired(id: string): Promise<void> {
  await prisma.escrow.update({
    where: { id },
    data: { status: 'EXPIRED' },
  });
}

// Disconnect on cleanup
export async function disconnectDb(): Promise<void> {
  await prisma.$disconnect();
}

export default prisma;

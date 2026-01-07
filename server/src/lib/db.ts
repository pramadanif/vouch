import { PrismaClient, Escrow, EscrowStatus } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

// Re-export types for compatibility
export type EscrowRecord = Escrow;
export { EscrowStatus };

// Create new escrow record
export async function createEscrowRecord(data: {
  sellerAddress: string;
  itemName: string;
  itemDescription?: string;
  itemImage?: string;
  amountUsdc: string;
  amountIdr: string;
  releaseDuration: number;
}): Promise<Escrow> {
  return prisma.escrow.create({
    data: {
      sellerAddress: data.sellerAddress,
      itemName: data.itemName,
      itemDescription: data.itemDescription || null,
      itemImage: data.itemImage || null,
      amountUsdc: data.amountUsdc,
      amountIdr: data.amountIdr,
      releaseDuration: data.releaseDuration,
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

// Update escrow with on-chain data
export async function updateEscrowOnChain(id: string, data: {
  escrowId: number;
  releaseTime: number;
  txHash: string;
}): Promise<void> {
  await prisma.escrow.update({
    where: { id },
    data: {
      escrowId: data.escrowId,
      releaseTime: data.releaseTime,
      txHash: data.txHash,
      status: 'WAITING_PAYMENT',
    },
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

// Mark escrow as funded
export async function markEscrowFunded(id: string, buyerAddress?: string): Promise<void> {
  await prisma.escrow.update({
    where: { id },
    data: {
      status: 'FUNDED',
      buyerAddress: buyerAddress || null,
    },
  });
}

// Mark escrow as released
export async function markEscrowReleased(id: string): Promise<void> {
  await prisma.escrow.update({
    where: { id },
    data: { status: 'RELEASED' },
  });
}

// Mark escrow as cancelled
export async function markEscrowCancelled(id: string): Promise<void> {
  await prisma.escrow.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });
}

// Mark escrow as refunded (NEW for Medium Priority)
export async function markEscrowRefunded(id: string): Promise<void> {
  await prisma.escrow.update({
    where: { id },
    data: { status: 'REFUNDED' },
  });
}

// Disconnect on cleanup
export async function disconnectDb(): Promise<void> {
  await prisma.$disconnect();
}

export default prisma;

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

// Mark escrow as funded
export async function markEscrowFunded(id: string, buyerAddress?: string, buyerToken?: string): Promise<void> {
  await prisma.escrow.update({
    where: { id },
    data: {
      status: 'FUNDED',
      buyerAddress: buyerAddress || null,
      buyerToken: buyerToken || null,
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

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const escrows = await prisma.escrow.findMany({
    select: {
      id: true,
      escrowId: true,
      status: true,
      itemName: true,
      sellerAddress: true,
      buyerAddress: true,
      shippedAt: true,
      releasedAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  console.log('Recent Escrows:');
  console.table(escrows);
  
  await prisma.$disconnect();
}

main().catch(console.error);

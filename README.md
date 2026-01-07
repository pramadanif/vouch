# Vouch - Secure Social Commerce Payments

> Hybrid decentralized escrow payment platform for social commerce in Southeast Asia, built on Lisk.

**"Vouch uses a protocol-managed escrow wallet on Lisk to securely hold USDC and release funds based on predefined conditions, while allowing buyers to pay using familiar local payment methods."**

## 🎯 What is Vouch?

Vouch bridges the trust gap in social commerce by providing:
- **Sellers**: Connect your Lisk wallet → Create payment links → Get paid securely
- **Buyers**: Pay via QRIS/E-wallet/Bank Transfer → Funds held in escrow → Confirm delivery

No signup, no passwords, no crypto knowledge needed for buyers.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                      (Next.js + wagmi)                       │
├─────────────────────────────────────────────────────────────┤
│   /create           │   /pay/[id]        │   /dashboard     │
│   Seller wallet     │   Buyer payment    │   Seller view    │
│   connection        │   via Xendit       │   all escrows    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API                            │
│                   (Express + SQLite)                        │
├─────────────────────────────────────────────────────────────┤
│   POST /api/escrow/create    │   POST /api/payment/xendit   │
│   GET  /api/escrow/:id       │   POST /api/escrow/release   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Lisk Sepolia                             │
├─────────────────────────────────────────────────────────────┤
│   VouchEscrow.sol    │   MockUSDC.sol                       │
│   - createEscrow()   │   - ERC20 token                      │
│   - markFunded()     │   - For testnet                      │
│   - releaseFunds()   │                                      │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm/npm
- Foundry (for contracts)
- MetaMask (for testing)

### 1. Clone and Install

```bash
cd vouch

# Frontend
npm install

# Backend
cd server && npm install && cd ..

# Contracts (optional - for deployment)
cd contracts && forge install && cd ..
```

### 2. Configure Environment

```bash
# Frontend
cp .env.local.example .env.local

# Backend
cp server/.env.example server/.env
# Edit server/.env with your keys
```

### 3. Start Development

```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
npm run dev
```

Open http://localhost:3000

## 📱 User Flows

### Seller Flow
1. Go to `/create`
2. Click "Connect Wallet" (MetaMask)
3. Fill product name, price (IDR), protection period
4. Click "Create Payment Link"
5. Copy and share link with buyer

### Buyer Flow
1. Open payment link
2. Review product and amount
3. Click "Pay Now" or "Simulate Payment" (demo)
4. Payment is secured in escrow
5. Seller ships, funds released after confirmation

### Dashboard
- Sellers can view all escrows at `/dashboard`
- See status: Waiting → Secured → Completed
- Release funds manually or wait for auto-release

## 🔧 Project Structure

```
vouch/
├── app/                    # Next.js pages
│   ├── create/            # Seller creates link
│   ├── pay/[id]/          # Buyer payment
│   └── dashboard/         # Seller dashboard
├── components/            # React components
├── lib/
│   ├── wagmi.ts          # Wallet config (Lisk Sepolia)
│   └── api.ts            # Backend API client
├── contracts/             # Foundry project
│   ├── src/
│   │   ├── VouchEscrow.sol
│   │   └── MockUSDC.sol
│   └── script/Deploy.s.sol
└── server/                # Express backend
    └── src/
        ├── index.ts       # Server entry
        ├── lib/
        │   ├── db.ts      # SQLite
        │   ├── wallet.ts  # Hot wallet
        │   └── xendit.ts  # Payment gateway
        └── routes/
            ├── escrow.ts
            └── payment.ts
```

## 🔐 Smart Contracts

### VouchEscrow.sol
- `createEscrow(seller, amount, releaseTime)` - Create new escrow
- `markFunded(escrowId, buyer)` - Mark as funded after payment
- `releaseFunds(escrowId)` - Release to seller
- `getEscrow(escrowId)` - View escrow details

### Deploy to Lisk Sepolia

```bash
cd contracts
cp .env.example .env
# Add PRIVATE_KEY to .env

# Fund wallet at https://sepolia-faucet.lisk.com

forge script script/Deploy.s.sol:DeployVouch \
  --rpc-url https://rpc.sepolia-api.lisk.com \
  --broadcast -vvv
```

## 🎨 UX Design Principles

- ✅ Web2 fintech look
- ✅ Light mode only
- ✅ No crypto jargon
- ✅ "Secure payout account" instead of "wallet"
- ✅ "Pay securely" instead of "crypto payment"
- ❌ No tx hash, gas, block numbers visible

## 🛡️ Security Notes

**For Hackathon Demo:**
- Protocol hot wallet holds and manages escrows
- This is intentional for smooth demo experience
- In production, consider multi-sig or MPC solutions

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TailwindCSS |
| Wallet | wagmi, viem |
| Backend | Express.js, TypeScript |
| Database | SQLite (better-sqlite3) |
| Blockchain | Lisk Sepolia, Solidity 0.8.20 |
| Contracts | Foundry |
| Payments | Xendit (mock mode available) |

## 🏆 Hackathon Info

**Track**: Lisk Decentralized

**Key Differentiators**:
1. Real blockchain escrow (not mocked)
2. Seamless fiat on-ramp via Xendit
3. Zero friction for buyers (no wallet needed)
4. Judge-friendly UX (understand in <30 seconds)

---

Built with ❤️ for the Lisk Hackathon

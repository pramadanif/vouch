<p align="center">
  <img src="public/logo.png" alt="Vouch Logo" width="120" />
</p>

<h1 align="center">Vouch</h1>

<p align="center">
  <strong>Decentralized Escrow for Social Commerce</strong><br/>
  Marketplace-level trust — without the marketplace.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Built%20on-Lisk-blue" alt="Lisk" />
  <img src="https://img.shields.io/badge/Framework-Next.js%2015-black" alt="Next.js" />
  <img src="https://img.shields.io/badge/Smart%20Contract-Solidity-purple" alt="Solidity" />
  <img src="https://img.shields.io/badge/Payment-Xendit-green" alt="Xendit" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="MIT" />
</p>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#%EF%B8%8F-architecture)
- [Smart Contracts](#-smart-contracts)
- [Payment Flow](#-payment-flow)
- [API Reference](#-api-reference)
- [Frontend Components](#-frontend-components)
- [Backend Services](#-backend-services)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Development](#-development)
- [Deployment](#%EF%B8%8F-deployment)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [Tech Stack](#-tech-stack)
- [Security](#-security)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🎯 Overview

**Vouch** is a hybrid decentralized escrow platform that brings marketplace-level trust to social commerce transactions happening on Instagram, WhatsApp, and TikTok — without the marketplace fees or lock-in.

### The Problem

Social commerce in Southeast Asia is booming, but trust remains the biggest obstacle:

- **Buyers are afraid to pay first** → Scammers take money and disappear
- **Sellers are afraid to ship first** → Risk of non-payment
- **Marketplaces charge 10-20% fees** → Erodes profit margins
- **Platform lock-in** → Sellers can't own their customer relationships
- **Manual "trust me bro"** → Screenshots, reviews don't prevent fraud

**Result:** Billions in potential transactions lost due to lack of trust infrastructure in social commerce.

### The Solution

Vouch creates a **shareable payment link** that holds funds in a **smart contract escrow** on Lisk:

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌──────────────┐
│   Seller    │      │    Buyer    │      │    Escrow    │      │   Seller    │      │    Buyer     │
│ creates link│ ───▶ │ pays (QRIS) │ ───▶ │ funds locked │ ───▶ │ ships item  │ ───▶ │   confirms   │
└─────────────┘      └─────────────┘      └──────────────┘      └─────────────┘      └──────────────┘
                                                                                              │
                                                                                              ▼
                                                                                     ┌──────────────────┐
                                                                                     │ Funds released   │
                                                                                     │ to seller wallet │
                                                                                     └──────────────────┘
```

**Key Innovation:**
- Buyers pay with familiar local payment methods (QRIS, bank transfer)
- Sellers receive funds in their own Lisk wallet
- Smart contract ensures neither party can cheat
- No registration, no account creation, no marketplace fees

---

## ✨ Features

### Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Decentralized Escrow** | Smart contract on Lisk holds funds trustlessly | ✅ Live |
| **Fiat Payments** | QRIS, Bank Transfer, E-wallets via Xendit | ✅ Live |
| **Crypto Payments** | Direct USDC/IDRX funding on-chain | ✅ Live |
| **Seller Wallet** | Seller signs with their own Lisk wallet | ✅ Live |
| **Buyer Anonymity** | No wallet needed for buyers (fiat flow) | ✅ Live |
| **Auto-Release** | Timeout protection for sellers | ✅ Live |
| **Dashboard** | Sellers can track all escrows | ✅ Live |
| **Mobile-First** | Optimized for DM sharing | ✅ Live |
| **Token Faucet** | Get testnet tokens for demo | ✅ Live |
| **Demo Pages** | Interactive chat simulations | ✅ Live |

### Advanced Features

- **Multi-Currency Support:** PHP, IDR, THB, SGD, MYR, VND, USD via currency API
- **Buyer Token:** Unique token for secure release authorization
- **Webhook Integration:** Real-time payment notifications from Xendit
- **On-Chain Verification:** All escrows verifiable on block explorer
- **Responsive Design:** Works seamlessly on mobile and desktop
- **Dark Mode Ready:** Design system supports theme switching (future)

---

## 🏗️ Architecture

### System Overview

```mermaid
graph TB
    subgraph Users["👥 Users"]
        Seller["Seller<br/>(Has Wallet)"]
        Buyer["Buyer<br/>(No Wallet Needed)"]
    end

    subgraph Frontend["🖥️ Frontend (Next.js 15)"]
        Landing["/ Landing Page"]
        Create["/create - Seller"]
        Pay["/pay/[id] - Buyer"]
        Dashboard["/dashboard - Seller"]
        Demo["/demo/* - Demo Pages"]
        Deck["/deck - Pitch Deck"]
        Faucet["/faucet - Token Faucet"]
    end

    subgraph Backend["⚙️ Backend API (Express.js)"]
        EscrowRoutes["/api/escrow/*<br/>Metadata Storage"]
        PaymentRoutes["/api/payment/*<br/>Xendit Integration"]
        FaucetRoutes["/api/faucet/*<br/>Token Distribution"]
        Prisma[(PostgreSQL<br/>Metadata Storage)]
        HotWallet["🔐 Protocol Wallet<br/>Funds Fiat Escrows"]
    end

    subgraph Blockchain["⛓️ Lisk Sepolia Testnet"]
        VouchEscrow["VouchEscrow.sol<br/>Main Logic"]
        MockUSDC["MockUSDC.sol<br/>Test Stablecoin"]
        MockIDRX["MockIDRX.sol<br/>IDR Stablecoin"]
    end

    subgraph External["🌐 External Services"]
        Xendit["Xendit API<br/>Payment Gateway"]
        Currency["Currency API<br/>Exchange Rates"]
    end

    Seller --> Create
    Buyer --> Pay
    
    %% Seller creates escrow directly on-chain
    Create -->|"createEscrow()<br/>(Seller signs)"| VouchEscrow
    Create -->|"Save metadata"| EscrowRoutes
    EscrowRoutes --> Prisma
    
    %% Fiat payment flow
    Pay --> PaymentRoutes
    PaymentRoutes --> Xendit
    Xendit -."Webhook<br/>(Payment confirmed)".-> PaymentRoutes
    PaymentRoutes -->|"Fund escrow<br/>+ markFunded()"| HotWallet
    HotWallet -->|"Transfer USDC/IDRX<br/>+ markFunded()"| VouchEscrow
    
    %% Crypto payment flow (direct)
    Pay -."Crypto payment<br/>(Buyer signs)".-> VouchEscrow
    
    Dashboard --> EscrowRoutes
    Faucet --> FaucetRoutes
    FaucetRoutes --> MockUSDC
    FaucetRoutes --> MockIDRX
    
    EscrowRoutes -."Read state".-> VouchEscrow
```

### Technology Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                         │
│  Next.js 15 | React 19 | TailwindCSS | Framer Motion       │
└─────────────────────────────────────────────────────────────┘
                            ▲ │
                            │ ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                          │
│  wagmi v2 | React Query | Zustand (State) | API Client      │
└─────────────────────────────────────────────────────────────┘
                            ▲ │
                            │ ▼
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                       │
│  Express.js | Prisma ORM | Ethers.js | Xendit SDK           │
└─────────────────────────────────────────────────────────────┘
                            ▲ │
                            │ ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA PERSISTENCE LAYER                     │
│  PostgreSQL (Metadata) | Lisk Blockchain (Escrow State)     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📜 Smart Contracts

### Deployed Addresses (Lisk Sepolia)

| Contract | Address | Explorer |
|----------|---------|----------|
| **VouchEscrow** | `0xb015d8Eb15B5E82E10aCF1606c60cFD64C4c7cB2` | [View on Explorer](https://sepolia-blockscout.lisk.com/address/0xb015d8Eb15B5E82E10aCF1606c60cFD64C4c7cB2) |
| **MockUSDC** | `0xB7c78ceCB25a1c40b3fa3382bAf3F34c9b5bdD66` | [View on Explorer](https://sepolia-blockscout.lisk.com/address/0xB7c78ceCB25a1c40b3fa3382bAf3F34c9b5bdD66) |
| **MockIDRX** | `0xDfef62cf7516508B865440E5819e5435e69adceb` | [View on Explorer](https://sepolia-blockscout.lisk.com/address/0xDfef62cf7516508B865440E5819e5435e69adceb) |

### Network Configuration

| Property | Value |
|----------|-------|
| **Network Name** | Lisk Sepolia Testnet |
| **Chain ID** | `4202` |
| **RPC URL** | `https://rpc.sepolia-api.lisk.com` |
| **Currency Symbol** | ETH |
| **Block Explorer** | `https://sepolia-blockscout.lisk.com` |
| **Faucet** | `https://sepolia-faucet.lisk.com` |

### VouchEscrow.sol - State Machine

```mermaid
stateDiagram-v2
    [*] --> CREATED: createEscrow()<br/>(Seller signs)
    
    CREATED --> FUNDED: markFunded()<br/>(Fiat payment)
    CREATED --> FUNDED: fundEscrow()<br/>(Crypto payment)
    
    FUNDED --> RELEASED: releaseFunds()<br/>(Buyer confirms)
    FUNDED --> RELEASED: Auto-release<br/>(After timeout)
    
    CREATED --> CANCELLED: cancelEscrow()<br/>(Before funding)
    FUNDED --> REFUNDED: refundEscrow()<br/>(Dispute resolution)
    
    RELEASED --> [*]
    CANCELLED --> [*]
    REFUNDED --> [*]
```

### Contract Functions Reference

| Function | Signature | Access Control | Description |
|----------|-----------|----------------|-------------|
| `createEscrow` | `(address token, uint256 amount, uint256 releaseTime) returns (uint256)` | Public | Create new escrow (seller = msg.sender) |
| `fundEscrow` | `(uint256 escrowId)` | Public | Fund escrow directly with crypto (buyer must approve token first) |
| `markFunded` | `(uint256 escrowId, address buyer)` | Protocol Only | Mark escrow as funded after fiat payment verification. Protocol wallet transfers IDRX to contract before calling this. |
| `releaseFunds` | `(uint256 escrowId)` | Buyer/Protocol | Release funds to seller (immediate if buyer, after timeout if protocol) |
| `cancelEscrow` | `(uint256 escrowId)` | Protocol Only | Cancel unfunded escrow |
| `refundEscrow` | `(uint256 escrowId)` | Protocol Only | Refund funded escrow to buyer (dispute resolution) |
| `getEscrow` | `(uint256 escrowId)` | View | Get full escrow details |
| `getEscrowStatus` | `(uint256 escrowId)` | View | Get human-readable status string |
| `getSellerEscrows` | `(address seller)` | View | Get all escrow IDs for a seller address |
| `updateProtocolWallet` | `(address newWallet)` | Protocol Only | Update protocol wallet address |

### Escrow Data Structure

```solidity
struct Escrow {
    address seller;        // Receives funds on release
    address buyer;         // Confirms delivery (can be zero for anonymous)
    address token;         // ERC20 token (USDC/IDRX)
    uint256 amount;        // Escrow amount in token's smallest unit
    uint256 releaseTime;   // Unix timestamp for auto-release eligibility
    bool funded;           // Payment received
    bool released;         // Funds sent to seller
    bool cancelled;        // Escrow cancelled/refunded
}
```

### Events

```solidity
event EscrowCreated(uint256 indexed escrowId, address indexed seller, uint256 amount, uint256 releaseTime);
event EscrowFunded(uint256 indexed escrowId, address indexed buyer, address token, uint256 amount);
event EscrowReleased(uint256 indexed escrowId, address indexed seller, uint256 amount);
event EscrowCancelled(uint256 indexed escrowId);
event EscrowRefunded(uint256 indexed escrowId, address indexed buyer, uint256 amount);
event ProtocolWalletUpdated(address indexed oldWallet, address indexed newWallet);
```

---

## 💳 Payment Flow

### Flow 1: Fiat Payment (Xendit)

```mermaid
sequenceDiagram
    participant Seller
    participant Frontend
    participant Backend
    participant Xendit
    participant ProtocolWallet as Protocol Wallet
    participant Lisk
    participant Buyer

    Note over Seller: Seller creates escrow
    Seller->>Frontend: Open /create page
    Seller->>Lisk: createEscrow(token, amount, releaseTime)<br/>(Seller signs with wallet)
    Lisk-->>Seller: escrowId created
    Seller->>Backend: POST /api/escrow/create<br/>(Save metadata + txHash)
    Backend->>Backend: Store in PostgreSQL
    Backend-->>Seller: {id: "abc123", paymentUrl}
    
    Note over Buyer: Buyer pays with fiat
    Buyer->>Frontend: Open payment link (/pay/abc123)
    Frontend->>Backend: GET /api/escrow/abc123
    Backend-->>Frontend: Escrow details

    Buyer->>Frontend: Click "Pay Now"
    Frontend->>Backend: POST /api/escrow/abc123/create-invoice
    Backend->>Xendit: createInvoice(amount, currency)
    Xendit-->>Backend: {invoice_url, invoice_id}
    Backend->>Backend: Save invoice URL to DB
    Backend-->>Frontend: {invoice_url}
    
    Frontend->>Buyer: Redirect to Xendit checkout
    Buyer->>Xendit: Pay via QRIS/Bank Transfer
    Xendit->>Backend: POST /api/payment/xendit/callback<br/>{status: "PAID", external_id: "abc123"}
    
    Backend->>Backend: Verify signature
    Backend->>Backend: Generate buyerToken
    Backend->>Backend: Update DB: status=FUNDED
    
    Note over ProtocolWallet,Lisk: Protocol Wallet funds escrow
    Backend->>ProtocolWallet: Trigger funding
    ProtocolWallet->>Lisk: approve(VouchEscrow, amount)<br/>(ERC20 approval)
    ProtocolWallet->>Lisk: Transfer USDC/IDRX to escrow<br/>+ markFunded(escrowId, buyerAddress)
    Lisk-->>Backend: Transaction confirmed
    
    loop Status Polling
        Frontend->>Backend: POST /api/payment/check-status
        Backend-->>Frontend: {status: "FUNDED", buyerToken: "xxx"}
    end
    
    Frontend->>Buyer: Show "Payment Secured" + buyerToken
    
    Note over Seller: Ships item to buyer
    
    Buyer->>Frontend: Click "Release Funds"
    Frontend->>Backend: POST /api/escrow/abc123/release<br/>{buyerToken: "xxx"}
    Backend->>Backend: Verify buyerToken
    Backend->>ProtocolWallet: Trigger release
    ProtocolWallet->>Lisk: releaseFunds(escrowId)
    Lisk->>Seller: Transfer tokens to seller wallet
    Lisk-->>Backend: Transaction confirmed
    Backend-->>Frontend: {status: "RELEASED"}
    Frontend->>Buyer: Show "Payment Complete"
```

### Flow 2: Crypto Payment

```mermaid
sequenceDiagram
    participant Buyer
    participant Frontend
    participant Lisk
    participant Seller

    Buyer->>Frontend: Open payment link
    Frontend->>Lisk: getEscrow(escrowId)
    Lisk-->>Frontend: Escrow details

    Buyer->>Frontend: Click "Pay with Crypto"
    Frontend->>Frontend: Connect wallet
    Buyer->>Lisk: approve(escrowContract, amount)<br/>(ERC20 approval)
    Lisk-->>Frontend: Approval confirmed
    
    Buyer->>Lisk: fundEscrow(escrowId)
    Lisk->>Lisk: transferFrom(buyer, escrow, amount)
    Lisk->>Lisk: Set escrow.funded = true
    Lisk-->>Frontend: Escrow FUNDED
    
    Frontend->>Buyer: Show "Payment Secured"
    
    Note over Seller: Ships item to buyer
    
    Buyer->>Lisk: releaseFunds(escrowId)
    Lisk->>Seller: Transfer tokens to seller wallet
    Lisk-->>Frontend: Transaction confirmed
    Frontend->>Buyer: Show "Payment Complete"
```

---

## 📡 API Reference

### Base URL

- **Development:** `http://localhost:3002`
- **Production:** `https://vouch.pramadani.site`

### Authentication

No authentication required for read operations. Write operations (release funds) require a `buyerToken` obtained after payment.

### Escrow Endpoints

#### Create Escrow

> **Note:** This endpoint is called **after** the seller has already created the escrow on-chain by calling `createEscrow()` directly with their wallet. This endpoint only stores metadata and the transaction hash in the database.

```http
POST /api/escrow/create
Content-Type: application/json

{
  "itemName": "Nike Air Jordan 1 Retro",
  "itemDescription": "Size 42, brand new with box",
  "itemImage": "https://...",
  "amount": "250",
  "fiatCurrency": "USD",
  "releaseDuration": 604800,
  "sellerAddress": "0x...",
  "txHash": "0x..."
}
```

**Response:**
```json
{
  "id": "abc123",
  "escrowId": 0,
  "status": "CREATED",
  "paymentUrl": "https://vouch.vercel.app/pay/abc123"
}
```

#### Get Escrow

```http
GET /api/escrow/:id
```

**Response:**
```json
{
  "id": "abc123",
  "escrowId": 0,
  "itemName": "Nike Air Jordan 1 Retro",
  "amountUsdc": "250000000",
  "amountIdr": "250000",
  "fiatCurrency": "USD",
  "status": "FUNDED",
  "sellerAddress": "0x123...",
  "buyerAddress": "0x456...",
  "xenditInvoiceUrl": "https://checkout.xendit.co/...",
  "createdAt": "2026-01-10T12:00:00Z"
}
```

#### Get Seller Escrows

```http
GET /api/escrow/seller/:address
```

**Response:**
```json
[
  {
    "id": "abc123",
    "itemName": "Nike Air Jordan",
    "status": "FUNDED",
    "amountIdr": "250000",
    "createdAt": "2026-01-10T12:00:00Z"
  },
  ...
]
```

#### Create Payment Invoice

```http
POST /api/escrow/:id/create-invoice
Content-Type: application/json

{
  "payerEmail": "buyer@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "invoiceUrl": "https://checkout.xendit.co/web/...",
  "invoiceId": "inv_123..."
}
```

#### Release Funds

```http
POST /api/escrow/:id/release
Content-Type: application/json

{
  "buyerToken": "a1b2c3d4e5f6..."
}
```

**Response:**
```json
{
  "success": true,
  "txHash": "0x...",
  "status": "RELEASED"
}
```

#### Get On-Chain Status

```http
GET /api/escrow/:id/on-chain-status
```

**Response:**
```json
{
  "escrowId": 0,
  "seller": "0x123...",
  "buyer": "0x456...",
  "amount": "250000000",
  "funded": true,
  "released": false,
  "status": "FUNDED"
}
```

### Payment Endpoints

#### Xendit Webhook

```http
POST /api/payment/xendit/callback
X-Callback-Token: <signature>
Content-Type: application/json

{
  "id": "inv_123...",
  "external_id": "abc123",
  "status": "PAID",
  "amount": 250000,
  "paid_at": "2026-01-10T12:05:00Z"
}
```

#### Check Payment Status

```http
POST /api/payment/check-status
Content-Type: application/json

{
  "escrowId": "abc123"
}
```

**Response:**
```json
{
  "success": true,
  "status": "FUNDED",
  "buyerToken": "a1b2c3d4e5f6..."
}
```

#### Simulate Payment (Dev Only)

```http
POST /api/payment/simulate/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Payment simulated successfully",
  "buyerToken": "a1b2c3d4e5f6..."
}
```

### Faucet Endpoints

#### Request Tokens

```http
POST /api/faucet
Content-Type: application/json

{
  "address": "0x...",
  "type": "usdc"
}
```

**Types:** `eth`, `usdc`, `idrx`

**Response:**
```json
{
  "success": true,
  "type": "usdc",
  "amount": "1000",
  "txHash": "0x..."
}
```

---

## 🧩 Frontend Components

### Page Components

| Component | Path | Description |
|-----------|------|-------------|
| `Landing` | `/` | Hero, benefits, how it works, FAQ |
| `CreateEscrow` | `/create` | Seller creates payment link (wallet required) |
| `PaymentPage` | `/pay/[id]` | Buyer payment interface |
| `Dashboard` | `/dashboard` | Seller views all escrows |
| `Faucet` | `/faucet` | Testnet token faucet |
| `PitchDeck` | `/deck` | 15-slide presentation |
| `DemoSeller` | `/demo/seller` | Seller POV chat simulation |
| `DemoBuyer` | `/demo/buyer` | Buyer POV chat simulation |
| `Thumbnail` | `/demo/thumbnail` | YouTube thumbnail generator |

### UI Components

| Component | Purpose |
|-----------|---------|
| `Hero` | Landing page hero with animated chat simulation |
| `Header` | Site navigation with wallet connect |
| `Footer` | Links, social media, copyright |
| `Benefits` | 3-column benefits grid |
| `HowItWorks` | 4-step process visualization |
| `ProblemSolution` | Problem/solution comparison cards |
| `SocialProof` | Trust badges and logos |
| `Testimonials` | User testimonial slider |
| `FAQ` | Collapsible Q&A accordion |
| `CTASection` | Call-to-action with button |
| `Button` | Reusable button with variants |
| `Reveal` | Scroll animation wrapper (Intersection Observer) |
| `DemoChatPhone` | Instagram-style phone mockup with chat animation |

---

## ⚙️ Backend Services

### Database Service (`lib/db.ts`)

Prisma-based database operations:

```typescript
// Create escrow
async function createEscrow(data: CreateEscrowInput): Promise<Escrow>

// Get escrow by ID
async function getEscrowById(id: string): Promise<Escrow | null>

// Get seller's escrows
async function getEscrowsBySeller(address: string): Promise<Escrow[]>

// Mark escrow as funded
async function markEscrowFunded(id: string, invoiceId: string, buyerToken: string): Promise<void>

// Update escrow status
async function updateEscrowStatus(id: string, status: EscrowStatus): Promise<void>
```

### Wallet Service (`lib/wallet.ts`)

Protocol hot wallet management:

```typescript
class WalletManager {
  // Get escrow details from blockchain
  async getEscrowDetails(escrowId: number): Promise<EscrowDetails>
  
  // Mark escrow as funded on-chain
  async markFunded(escrowId: number, token: string, amount: string): Promise<string>
  
  // Release funds to seller
  async releaseFunds(escrowId: number): Promise<string>
  
  // Check on-chain status
  async getOnChainStatus(escrowId: number): Promise<OnChainStatus>
}
```

### Xendit Service (`lib/xendit.ts`)

Payment gateway integration:

```typescript
class XenditClient {
  // Create payment invoice
  async createInvoice(params: CreateInvoiceParams): Promise<XenditInvoice>
  
  // Get invoice status
  async getInvoice(invoiceId: string): Promise<XenditInvoice>
  
  // Verify webhook signature
  verifyCallback(payload: any, signature: string): boolean
  
  // Simulate payment (mock mode)
  simulatePaymentSuccess(invoiceId: string): XenditInvoice | null
}
```

---

## 🔧 Environment Variables

### Frontend (`.env.local`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://vouch.pramadani.site` |
| `NEXT_PUBLIC_LISK_CHAIN_ID` | Lisk chain ID | `4202` |

### Backend (`server/.env`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/vouch` |
| `PORT` | ❌ | Server port | `3002` |
| `NODE_ENV` | ❌ | Environment | `production` |
| `PRIVATE_KEY` | ✅ | Protocol wallet private key | `0x...` |
| `LISK_RPC_URL` | ❌ | Lisk RPC endpoint | `https://rpc.sepolia-api.lisk.com` |
| `MOCK_USDC_ADDRESS` | ✅ | MockUSDC contract address | `0xB7c...` |
| `MOCK_IDRX_ADDRESS` | ✅ | MockIDRX contract address | `0xDfe...` |
| `VOUCH_ESCROW_ADDRESS` | ✅ | VouchEscrow contract address | `0xb01...` |
| `XENDIT_SECRET_KEY` | ❌ | Xendit API key (for real payments) | `xnd_...` |
| `XENDIT_CALLBACK_TOKEN` | ❌ | Xendit webhook verification token | `...` |
| `FRONTEND_URL` | ✅ | CORS allowed origin | `https://vouch.vercel.app` |

---

## 📁 Project Structure

```
vouch/
├── 📱 Frontend
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Landing page
│   │   ├── layout.tsx                # Root layout + providers
│   │   ├── globals.css               # Global styles
│   │   ├── create/
│   │   │   └── page.tsx              # Seller: Create escrow
│   │   ├── pay/[id]/
│   │   │   └── page.tsx              # Buyer: Payment page
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Seller: Dashboard
│   │   ├── faucet/
│   │   │   └── page.tsx              # Testnet faucet
│   │   ├── deck/
│   │   │   └── page.tsx              # Pitch deck (15 slides)
│   │   └── demo/
│   │       ├── seller/page.tsx       # Seller chat demo
│   │       ├── buyer/page.tsx        # Buyer chat demo
│   │       └── thumbnail/page.tsx    # Thumbnail generator
│   │
│   ├── components/
│   │   ├── Hero.tsx                  # Landing hero section
│   │   ├── Header.tsx                # Navigation bar
│   │   ├── Footer.tsx                # Site footer
│   │   ├── Benefits.tsx              # Benefits grid
│   │   ├── HowItWorks.tsx            # Process steps
│   │   ├── ProblemSolution.tsx       # Problem/solution cards
│   │   ├── SocialProof.tsx           # Trust badges
│   │   ├── Testimonials.tsx          # User testimonials
│   │   ├── FAQ.tsx                   # FAQ accordion
│   │   ├── CTASection.tsx            # Call-to-action
│   │   ├── Button.tsx                # Reusable button
│   │   ├── Reveal.tsx                # Scroll animation
│   │   ├── Providers.tsx             # wagmi providers
│   │   ├── demo/
│   │   │   └── DemoChatPhone.tsx     # Phone mockup
│   │   └── ui/
│   │       └── FadeIn.tsx            # Fade animation
│   │
│   ├── lib/
│   │   ├── wagmi.ts                  # Wallet config
│   │   ├── contracts.ts              # Contract ABIs
│   │   ├── api.ts                    # API client
│   │   └── utils.ts                  # Utilities
│   │
│   ├── public/
│   │   ├── logo.png                  # Vouch logo
│   │   ├── lisk.png                  # Lisk logo
│   │   └── grid.svg                  # Background
│   │
│   ├── .env.local.example            # Frontend env template
│   ├── next.config.ts                # Next.js config
│   ├── tailwind.config.js            # Tailwind config
│   ├── tsconfig.json                 # TypeScript config
│   └── package.json                  # Dependencies
│
├── ⛓️ Smart Contracts
│   └── contracts/
│       ├── src/
│       │   ├── VouchEscrow.sol       # Main escrow logic
│       │   ├── MockUSDC.sol          # Test USDC
│       │   └── MockIDRX.sol          # Test IDRX
│       ├── script/
│       │   ├── Deploy.s.sol          # Deployment script
│       │   ├── DeployAll.s.sol       # Deploy all
│       │   └── DeployIDRX.s.sol      # Deploy IDRX
│       ├── foundry.toml              # Foundry config
│       └── .gitignore                # Ignore build artifacts
│
└── 🖥️ Backend
    └── server/
        ├── src/
        │   ├── index.ts              # Express app
        │   ├── lib/
        │   │   ├── db.ts             # Prisma operations
        │   │   ├── wallet.ts         # Hot wallet manager
        │   │   └── xendit.ts         # Xendit client
        │   └── routes/
        │       ├── escrow.ts         # Escrow CRUD
        │       ├── payment.ts        # Payment/webhooks
        │       └── faucet.ts         # Token faucet
        │
        ├── prisma/
        │   ├── schema.prisma         # Database schema
        │   └── migrations/           # Migration history
        │
        ├── ecosystem.config.js       # PM2 config
        ├── nginx.conf                # Nginx template
        ├── DEPLOYMENT.md             # VPS deployment guide
        ├── .env.example              # Backend env template
        └── package.json              # Dependencies
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ (for backend)
- **MetaMask** browser extension
- **Git**

### 1. Clone Repository

```bash
git clone https://github.com/pramadanif/vouch.git
cd vouch
```

### 2. Setup Frontend

```bash
# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Edit with your backend URL
nano .env.local
```

**.env.local:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_LISK_CHAIN_ID=4202
```

```bash
# Start development server
npm run dev
```

### 3. Setup Backend

```bash
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit with your credentials
nano .env
```

**server/.env:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vouch"
PORT=3002
PRIVATE_KEY=0x_your_wallet_private_key
FRONTEND_URL=http://localhost:3000
```

```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Start development server
npm run dev
```

### 4. Access Application

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3002/health
- **Prisma Studio:** http://localhost:5555 (run `npx prisma studio`)

---

## 💻 Development

### Running Tests

```bash
# Frontend tests (if implemented)
npm run test

# Backend tests (if implemented)
cd server && npm run test
```

### Building for Production

```bash
# Frontend
npm run build
npm run start

# Backend
cd server
npm run build
npm run start
```

### Code Quality

```bash
# TypeScript type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

---

## ☁️ Deployment

### Frontend Deployment (Vercel)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "feat: ready for deployment"
   git push origin main
   ```

2. **Import to Vercel:**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Framework: Next.js
   - Root directory: `./`

3. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://vouch.pramadani.site
   NEXT_PUBLIC_LISK_CHAIN_ID=4202
   ```

4. **Deploy:**
   Click "Deploy" → Your site is live!

### Backend Deployment (VPS)

See [server/DEPLOYMENT.md](server/DEPLOYMENT.md) for the complete guide.

**Quick Deploy:**

```bash
# On VPS
cd ~/apps/vouch/server

# Install & build
npm install
npm run build

# Setup database
npx prisma generate
npx prisma db push

# Start with PM2
pm2 start ecosystem.config.js
pm2 save

# Setup Nginx
sudo cp nginx.conf /etc/nginx/sites-available/vouch-api
sudo ln -s /etc/nginx/sites-available/vouch-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL Certificate
sudo certbot --nginx -d vouch.pramadani.site
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Seller can connect wallet
- [ ] Seller can create escrow
- [ ] Payment link is shareable
- [ ] Buyer can pay via Xendit (mock mode)
- [ ] Funds show as "secured" after payment
- [ ] Buyer can release funds
- [ ] Seller receives funds in wallet
- [ ] Dashboard shows all escrows
- [ ] Faucet distributes tokens

### Smart Contract Testing

```bash
cd contracts

# Run tests
forge test

# Run with gas report
forge test --gas-report

# Run with coverage
forge coverage
```

---

## 🔍 Troubleshooting

### Common Issues

#### "Cannot connect to MetaMask"

**Solution:** Ensure MetaMask is installed and Lisk Sepolia network is added:
```javascript
Network Name: Lisk Sepolia
RPC URL: https://rpc.sepolia-api.lisk.com
Chain ID: 4202
Currency Symbol: ETH
```

#### "Transaction failed: insufficient funds"

**Solution:** Get testnet ETH from [Lisk Sepolia Faucet](https://sepolia-faucet.lisk.com) or use `/faucet` page.

#### "Xendit callback not received"

**Causes:**
- Webhook URL not configured in Xendit dashboard
- Callback token mismatch
- Firewall blocking Xendit IPs

**Solution:**
1. Add webhook URL in Xendit: `https://vouch.pramadani.site/api/payment/xendit/callback`
2. Verify `XENDIT_CALLBACK_TOKEN` matches dashboard
3. Check server logs: `pm2 logs vouch-server`

#### "Database connection failed"

**Solution:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U postgres -d vouch

# Fix pg_hba.conf if needed
sudo nano /etc/postgresql/*/main/pg_hba.conf
# Change "peer" to "md5"
sudo systemctl restart postgresql
```

#### "Contract call reverted"

**Common Causes:**
- Insufficient token approval
- Escrow already funded/released
- Incorrect escrow ID
- Timeout not reached (for auto-release)

**Debug:**
Check transaction on [Lisk Sepolia Explorer](https://sepolia-blockscout.lisk.com)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new payment method
fix: resolve wallet connection issue
docs: update README with deployment guide
chore: update dependencies
```

---

## 📦 Tech Stack

### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.x | React framework with App Router |
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |
| TailwindCSS | 3.x | Utility-first CSS |
| Framer Motion | 11.x | Animations |
| wagmi | 2.x | Wallet connection |
| viem | 2.x | Ethereum interactions |
| React Query | 5.x | Data fetching |

### Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Express.js | 4.x | Web framework |
| TypeScript | 5.x | Type safety |
| Prisma | 5.x | ORM |
| PostgreSQL | 14+ | Database |
| Ethers.js | 6.x | Blockchain interactions |
| Xendit SDK | - | Payment gateway |

### Smart Contract Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Solidity | 0.8.20 | Contract language |
| Foundry | Latest | Development framework |
| OpenZeppelin | 5.x | Security libraries |
| Lisk | Sepolia | EVM-compatible L2 |

### DevOps Stack

| Technology | Purpose |
|------------|---------|
| Vercel | Frontend hosting |
| PM2 | Process management |
| Nginx | Reverse proxy |
| Certbot | SSL certificates |
| PostgreSQL | Production database |

---

## 🛡️ Security

### Smart Contract Security

- **Audited Patterns:** Uses OpenZeppelin's battle-tested libraries
- **Reentrancy Protection:** `ReentrancyGuard` on all state-changing functions
- **Access Control:** `onlyProtocol` modifier for sensitive operations
- **Seller Verification:** `msg.sender = seller` proves ownership
- **SafeERC20:** Prevents token transfer failures

### Backend Security

- **Buyer Token:** 64-character random token for release authorization
- **Webhook Verification:** Xendit signature validation
- **CORS:** Strict origin whitelist
- **Environment Variables:** Secrets never committed to Git
- **SQL Injection:** Prisma ORM prevents SQL injection
- **Input Validation:** All user inputs sanitized

### Trust Model

```
┌─────────────────────────────────────────────────────────┐
│              ON-CHAIN (Immutable & Trustless)            │
├─────────────────────────────────────────────────────────┤
│  ✓ Escrow creation (seller = msg.sender)                │
│  ✓ Fund locking (smart contract holds tokens)           │
│  ✓ Release logic (buyer confirms OR timeout)            │
│  ✓ Refund logic (dispute resolution)                    │
│  ✓ Timeout protection (auto-release after deadline)     │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │ Verifiable on blockchain
                          │
┌─────────────────────────────────────────────────────────┐
│            OFF-CHAIN (Replaceable & Convenient)          │
├─────────────────────────────────────────────────────────┤
│  • Fiat payment confirmation (Xendit webhook)           │
│  • Metadata storage (PostgreSQL)                        │
│  • UI/UX (Next.js frontend)                             │
│  • Email notifications (future)                         │
└─────────────────────────────────────────────────────────┘
```

> **Critical Security Property:** If the backend disappears tomorrow, funds remain safe in the smart contract. Seller and buyer can still interact directly with the contract on Lisk.

---

## 🗺️ Roadmap

### Phase 1: MVP ✅ (Current)

- [x] Smart contract deployment on Lisk Sepolia
- [x] Fiat payment via Xendit (QRIS, Bank Transfer)
- [x] Crypto payment (USDC/IDRX)
- [x] Seller dashboard
- [x] Buyer payment page
- [x] Landing page with docs

### Phase 2: Mainnet Launch 🚀

- [ ] Audit smart contracts
- [ ] Deploy to Lisk mainnet
- [ ] Real Xendit integration (production keys)
- [ ] Multi-currency support (PHP, THB, VND)
- [ ] Email notifications
- [ ] WhatsApp integration

### Phase 3: Scale 📈

- [ ] Seller analytics dashboard
- [ ] Dispute resolution system
- [ ] Escrow templates
- [ ] API for third-party integrations
- [ ] Mobile app (React Native)
- [ ] Multi-chain support (Polygon, Base)

### Phase 4: Ecosystem 🌐

- [ ] Vouch SDK for e-commerce platforms
- [ ] Shopify plugin
- [ ] Browser extension
- [ ] Reputation system
- [ ] Vouch DAO governance

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Built with ❤️ for the Lisk Hackathon</strong><br/>
  <em>Vouch doesn't replace marketplaces.<br/>It replaces the missing trust layer in social commerce.</em>
</p>

<p align="center">
  <a href="https://vouch.vercel.app">Website</a> •
  <a href="https://github.com/pramadanif/vouch">GitHub</a> •
  <a href="https://vouch.pramadani.site/health">API Status</a>
</p>

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

import escrowRoutes from './routes/escrow';
import paymentRoutes from './routes/payment';

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/escrow', escrowRoutes);
app.use('/api/payment', paymentRoutes);

// Mock payment page (for demo when Xendit not configured)
app.get('/mock-payment/:invoiceId', (req, res) => {
    const { invoiceId } = req.params;
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Mock Payment - Vouch Demo</title>
      <style>
        body { font-family: system-ui; max-width: 400px; margin: 60px auto; padding: 20px; text-align: center; }
        .card { background: #f8f9fa; border-radius: 16px; padding: 32px; }
        h1 { color: #1a1a2e; margin-bottom: 8px; }
        p { color: #666; margin-bottom: 24px; }
        button { 
          background: #0066ff; color: white; border: none; 
          padding: 16px 32px; border-radius: 12px; font-size: 16px;
          cursor: pointer; width: 100%;
        }
        button:hover { background: #0052cc; }
        .note { font-size: 12px; color: #999; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>🔒 Vouch Payment</h1>
        <p>Invoice: ${invoiceId}</p>
        <button onclick="simulatePayment()">Simulate Successful Payment</button>
        <p class="note">This is a demo payment page. In production, this would be the Xendit checkout.</p>
      </div>
      <script>
        async function simulatePayment() {
          const escrowId = '${invoiceId}'.replace('mock_inv_', '');
          // For mock, the external_id is stored with the invoice
          try {
            const res = await fetch('/api/payment/xendit/callback', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                external_id: escrowId,
                status: 'PAID',
                id: '${invoiceId}'
              })
            });
            if (res.ok) {
              alert('Payment successful! Redirecting...');
              window.location.href = '${process.env.FRONTEND_URL || 'http://localhost:3000'}/pay/' + escrowId + '?status=success';
            }
          } catch (err) {
            alert('Payment simulation failed');
          }
        }
      </script>
    </body>
    </html>
  `);
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║     🛡️  Vouch Backend API Started          ║
╠════════════════════════════════════════════╣
║  Port: ${PORT}                               ║
║  Mode: ${process.env.NODE_ENV || 'development'}                       ║
╚════════════════════════════════════════════╝

Endpoints:
  POST /api/escrow/create        - Create escrow
  GET  /api/escrow/:id           - Get escrow
  GET  /api/escrow/seller/:addr  - List seller escrows
  POST /api/escrow/:id/create-invoice - Create payment invoice
  POST /api/escrow/:id/release   - Release funds
  POST /api/payment/xendit/callback - Xendit webhook
  POST /api/payment/simulate/:id - Simulate payment (demo)
  `);
});

export default app;

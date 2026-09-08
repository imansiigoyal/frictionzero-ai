const express = require('express');
const cors = require('cors');
const path = require('path');
const { router: transactionsRouter } = require('./routes/transactions');
const analyticsRouter = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 8085;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api/v1/transactions', transactionsRouter);
app.use('/api/v1/analytics', analyticsRouter);

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'FrictionZero AI Engine',
    version: '1.0.0',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Fallback to index.html for SPA-style routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Start Server (dual-stack IPv4 & IPv6)
const server = app.listen(PORT, () => {
  console.log(`
  ======================================================================
  ⚡ FrictionZero AI Engine Active (Problem Statement #16: FinTech)
  ----------------------------------------------------------------------
  🌐 Access URL : http://localhost:${PORT}/
  🚀 API Health : http://localhost:${PORT}/api/v1/health
  🛡️  Zero-Friction Adaptive Authentication: LIVE
  ======================================================================
  `);
});

module.exports = { app, server };

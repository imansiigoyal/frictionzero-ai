const express = require('express');
const router = express.Router();
const riskEngine = require('../engine/riskEngine');
const simulator = require('../engine/simulator');

// In-memory log of recent evaluated transactions
const transactionHistory = [];

// Evaluate an incoming digital transaction
router.post('/evaluate', (req, res) => {
  try {
    const payload = req.body || {};
    const result = riskEngine.evaluate(payload);
    transactionHistory.unshift(result);
    if (transactionHistory.length > 100) transactionHistory.pop();

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Run an interactive scenario preset
router.post('/simulate', (req, res) => {
  try {
    const { scenarioKey } = req.body;
    const result = simulator.runScenario(scenarioKey);
    transactionHistory.unshift(result.evaluation);
    if (transactionHistory.length > 100) transactionHistory.pop();

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Get recent transactions
router.get('/history', (req, res) => {
  res.status(200).json({
    success: true,
    count: transactionHistory.length,
    data: transactionHistory.slice(0, 50)
  });
});

// Get scenario list
router.get('/scenarios', (req, res) => {
  res.status(200).json({
    success: true,
    data: simulator.getScenarios()
  });
});

module.exports = { router, transactionHistory };

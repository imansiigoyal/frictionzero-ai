const express = require('express');
const router = express.Router();
const riskEngine = require('../engine/riskEngine');
const graphEngine = require('../engine/graphAnalysis');
const rules = require('../engine/rules');

// Telemetry & KPI metrics
router.get('/metrics', (req, res) => {
  res.status(200).json({
    success: true,
    data: riskEngine.getMetrics()
  });
});

// Fraud syndicate graph topology
router.get('/graph', (req, res) => {
  res.status(200).json({
    success: true,
    data: graphEngine.getGraphData()
  });
});

// Rules & thresholds
router.get('/rules', (req, res) => {
  res.status(200).json({
    success: true,
    data: rules.getConfig()
  });
});

// Indian UPI Fraud Benchmark Dataset Explorer
router.get('/dataset', (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const datasetPath = path.join(__dirname, '..', '..', 'data', 'indian_upi_fraud_dataset.json');
    if (fs.existsSync(datasetPath)) {
      const data = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
      res.status(200).json({
        success: true,
        total: data.length,
        datasetName: 'Indian Digital Payments & UPI Fraud Benchmark 2026',
        description: '500 labeled transactions featuring real NPCI UPI schemas, Indian VPAs, Jamtara mule networks, and OLX collect scams.',
        data: data.slice(0, 100) // Return first 100 for fast browsing
      });
    } else {
      res.status(404).json({ success: false, message: 'Dataset not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/rules', (req, res) => {
  try {
    const updated = rules.updateConfig(req.body);
    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/rules/reset', (req, res) => {
  res.status(200).json({
    success: true,
    data: rules.resetConfig()
  });
});

module.exports = router;

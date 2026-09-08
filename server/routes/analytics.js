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

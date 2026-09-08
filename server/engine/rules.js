/**
 * FrictionZero AI - Fraud & Risk Rules Configuration
 * Fine-tuned for sub-20ms real-time digital transaction evaluation.
 */

const DEFAULT_RULES = {
  thresholds: {
    zeroFrictionMax: 29,       // 0 - 29: Tier 1 Invisible Zero Friction
    stepUpFrictionMax: 74,     // 30 - 74: Tier 2 Step-Up Friction (Biometric / 1-Tap)
    blockMin: 75               // 75 - 100: Tier 3 Immediate Block & Intercept
  },
  velocity: {
    windowSeconds: 60,
    burstTransactionLimit: 3,  // >3 txns in 60s is suspicious
    cardSharingLimit: 2        // card used across >2 distinct devices in 10 mins
  },
  geo: {
    maxHumanSpeedKmH: 900      // Commercial flight speed cap (approx 900 km/h)
  },
  amounts: {
    unusualMultiplier: 3.5,    // >3.5x normal average transaction value triggers alert
    microTestingAmount: 1.00   // Card testing small amount detection
  },
  highRiskCategories: [
    'Cryptocurrency Exchange',
    'Offshore Gambling',
    'Prepaid Gift Cards',
    'High-Velocity Remittance',
    'Dark Web P2P Gateway'
  ]
};

let currentConfig = JSON.parse(JSON.stringify(DEFAULT_RULES));

module.exports = {
  getConfig: () => currentConfig,
  updateConfig: (newConfig) => {
    currentConfig = { ...currentConfig, ...newConfig };
    return currentConfig;
  },
  resetConfig: () => {
    currentConfig = JSON.parse(JSON.stringify(DEFAULT_RULES));
    return currentConfig;
  }
};

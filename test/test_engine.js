const assert = require('assert');
const riskEngine = require('../server/engine/riskEngine');
const graphEngine = require('../server/engine/graphAnalysis');

console.log('🧪 Starting FrictionZero AI Engine Automated Verification...\n');

// Test 1: Low Risk (Zero Friction)
console.log('Test 1: Normal Everyday Payment (Zero Friction)');
const res1 = riskEngine.evaluate({
  userId: 'USR-TEST-1',
  amount: 250,
  merchant: 'Local Cafe',
  merchantCategory: 'Dining',
  paymentChannel: 'UPI',
  deviceId: 'DEV-TRUSTED-1',
  deviceTrust: 'TRUSTED',
  ipAddress: '103.1.2.3',
  geoCity: 'Jaipur',
  geoCountry: 'IN',
  latitude: 26.9124,
  longitude: 75.7873,
  checkoutDurationSeconds: 15
});

assert.strictEqual(res1.decision, 'ALLOW_SILENT', 'Decision should be ALLOW_SILENT');
assert.strictEqual(res1.frictionTier, 'TIER_1_ZERO_FRICTION', 'Tier should be TIER_1_ZERO_FRICTION');
assert.ok(res1.riskScore < 30, `Risk score should be < 30 (was ${res1.riskScore})`);
console.log(`✅ Passed: Score=${res1.riskScore}, Tier=${res1.frictionTier}, Latency=${res1.latencyMs}ms\n`);

// Test 2: Moderate Risk (Adaptive Step-Up Biometric Challenge)
console.log('Test 2: High-Value E-Commerce on New Device (Adaptive Challenge)');
const res2 = riskEngine.evaluate({
  userId: 'USR-TEST-2',
  amount: 65000,
  merchant: 'Luxury Electronics',
  merchantCategory: 'Consumer Electronics',
  paymentChannel: 'CARD',
  deviceId: 'DEV-NEW-TAB',
  deviceTrust: 'NEW',
  ipAddress: '122.1.2.3',
  geoCity: 'Mumbai',
  geoCountry: 'IN',
  latitude: 19.0760,
  longitude: 72.8777,
  checkoutDurationSeconds: 20
});

assert.strictEqual(res2.decision, 'CHALLENGE_STEP_UP', 'Decision should be CHALLENGE_STEP_UP');
assert.strictEqual(res2.frictionTier, 'TIER_2_ADAPTIVE_STEP_UP', 'Tier should be TIER_2_ADAPTIVE_STEP_UP');
assert.ok(res2.riskScore >= 30 && res2.riskScore < 75, `Risk score should be 30-74 (was ${res2.riskScore})`);
console.log(`✅ Passed: Score=${res2.riskScore}, Tier=${res2.frictionTier}, Action=${res2.frictionAction}\n`);

// Test 3: High Risk (Automated Headless Bot & VPN Attack)
console.log('Test 3: Headless Bot & Anonymous VPN Attack (Hard Block)');
const res3 = riskEngine.evaluate({
  userId: 'USR-TEST-3',
  amount: 25000,
  merchant: 'Instant Crypto Exchange',
  merchantCategory: 'Cryptocurrency Exchange',
  paymentChannel: 'CARD',
  deviceId: 'DEV-HEADLESS-EMU',
  deviceTrust: 'EMULATOR',
  ipAddress: '185.220.101.5',
  geoCity: 'Frankfurt',
  geoCountry: 'DE',
  latitude: 50.1109,
  longitude: 8.6821,
  vpnDetected: true,
  botDetected: true,
  checkoutDurationSeconds: 0.5
});

assert.strictEqual(res3.decision, 'BLOCK_FRAUD', 'Decision should be BLOCK_FRAUD');
assert.strictEqual(res3.frictionTier, 'TIER_3_HARD_BLOCK', 'Tier should be TIER_3_HARD_BLOCK');
assert.ok(res3.riskScore >= 75, `Risk score should be >= 75 (was ${res3.riskScore})`);
console.log(`✅ Passed: Score=${res3.riskScore}, Tier=${res3.frictionTier}, Flags=${res3.triggeredRules.join(', ')}\n`);

// Test 4: Graph Syndicate Topology Export
console.log('Test 4: Syndicate Graph Topology Validation');
const graphData = graphEngine.getGraphData();
assert.ok(Array.isArray(graphData.nodes), 'Nodes should be an array');
assert.ok(Array.isArray(graphData.edges), 'Edges should be an array');
assert.ok(graphData.nodes.length >= 5, 'Graph should have nodes populated');
console.log(`✅ Passed: Graph active with ${graphData.nodes.length} nodes & ${graphData.edges.length} edges.\n`);

console.log('🎉 ALL AUTOMATED ENGINE TESTS PASSED SUCCESSFULLY!');

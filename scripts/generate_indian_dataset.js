/**
 * Indian Digital Transactions & UPI Fraud Benchmark Dataset Generator
 * Modeled on NPCI UPI specifications, RBI cyber-fraud reports, and Indian FinTech patterns.
 */

const fs = require('fs');
const path = require('path');

const CITIES = [
  { city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873 },
  { city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777 },
  { city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946 },
  { city: 'Delhi NCR', state: 'Delhi', lat: 28.6139, lon: 77.2090 },
  { city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867 },
  { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567 },
  { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639 },
  { city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714 },
  { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707 },
  { city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462 },
  { city: 'Jamtara', state: 'Jharkhand', lat: 23.9629, lon: 86.8016 } // Mule hub
];

const INDIAN_NAMES = [
  'Aarav Sharma', 'Priya Patel', 'Rohan Verma', 'Ananya Iyer', 'Vikram Singh',
  'Sneha Kulkarni', 'Aditya Joshi', 'Kavya Nair', 'Rahul Gupta', 'Pooja Reddy',
  'Manish Chawla', 'Neha Deshmukh', 'Arjun Kapoor', 'Divya Sundaram', 'Siddharth Rao'
];

const LEGIT_MERCHANTS = [
  { name: 'Swiggy Food', vpa: 'swiggy@axisbank', cat: 'Dining & Quick Food', avg: 380 },
  { name: 'Zomato', vpa: 'zomato@icici', cat: 'Dining & Quick Food', avg: 450 },
  { name: 'Blinkit Instant', vpa: 'blinkit@kotak', cat: 'Quick Commerce Grocery', avg: 620 },
  { name: 'Zepto', vpa: 'zepto@ybl', cat: 'Quick Commerce Grocery', avg: 510 },
  { name: 'Sharmaji Chai & Sweets (Jaipur)', vpa: 'sharmachai@upi', cat: 'Local Kirana & Dining', avg: 45 },
  { name: 'Uber India', vpa: 'uber.india@hdfcbank', cat: 'Rideshare & Transport', avg: 260 },
  { name: 'BookMyShow', vpa: 'bookmyshow@icici', cat: 'Entertainment & Tickets', avg: 720 },
  { name: 'D-Mart Ready', vpa: 'dmart@sbi', cat: 'Supermarket', avg: 1850 },
  { name: 'Flipkart Online', vpa: 'flipkart@okaxis', cat: 'E-Commerce', avg: 2400 },
  { name: 'Amazon Pay India', vpa: 'amazonpay@apl', cat: 'E-Commerce', avg: 1650 },
  { name: 'IRCTC Train Tickets', vpa: 'irctc@sbi', cat: 'Government Transit', avg: 1120 }
];

const FRAUD_PATTERNS = [
  {
    type: 'UPI_COLLECT_REQUEST_SCAM',
    name: 'OLX Buyer Fake Payment (Collect Request)',
    desc: 'Fraudster sends a debit collect request with remark "REFUND/CREDIT" to trick the user into entering UPI PIN.',
    category: 'P2P Collect Request Scam',
    amountRange: [4500, 25000],
    channel: 'UPI_COLLECT',
    riskScore: 88,
    isFraud: 1
  },
  {
    type: 'SIM_SWAP_NEW_DEVICE',
    name: 'SIM-Swap & Device Fingerprint Hijack',
    desc: 'UPI device registration initiated on a rooted Xiaomi phone in Jamtara 2 hours after a SIM replacement alert.',
    category: 'Account Takeover / SIM Swap',
    amountRange: [20000, 95000],
    channel: 'UPI_P2M',
    riskScore: 94,
    isFraud: 1
  },
  {
    type: 'SCREEN_SHARE_APK_MALWARE',
    name: 'Remote Screen-Sharing APK Exploit',
    desc: 'Active AnyDesk/TeamViewer session detected while attempting high-value IMPS fund transfer.',
    category: 'Malware / Screen Mirroring',
    amountRange: [35000, 150000],
    channel: 'IMPS',
    riskScore: 96,
    isFraud: 1
  },
  {
    type: 'MULE_NETWORK_P2P',
    name: 'Jamtara P2P Mule Laundering Cluster',
    desc: 'Rapid layering of funds across 5 newly activated Jan Dhan accounts within 90 seconds.',
    category: 'Mule Ring Layering',
    amountRange: [9900, 48000],
    channel: 'UPI_P2P',
    riskScore: 92,
    isFraud: 1
  },
  {
    type: 'IMPOSSIBLE_TRAVEL_FRANKFURT',
    name: 'Overseas IP Impossible Travel (VPN/Frankfurt)',
    desc: 'Card payment routed via Frankfurt datacenter IP 12 minutes after QR scan at Jaipur metro.',
    category: 'Cross-Border Datacenter Anomaly',
    amountRange: [65000, 180000],
    channel: 'CARD',
    riskScore: 91,
    isFraud: 1
  }
];

function generateIndianDataset(totalRows = 500) {
  const dataset = [];
  const now = Date.now();

  for (let i = 0; i < totalRows; i++) {
    const isFraudulent = Math.random() < 0.08; // ~8% fraud rate (standard benchmark ratio)
    const txTime = new Date(now - (totalRows - i) * 60000).toISOString();
    const cityObj = CITIES[Math.floor(Math.random() * (CITIES.length - 1))]; // mostly normal cities
    const userName = INDIAN_NAMES[i % INDIAN_NAMES.length];
    const userVpa = `${userName.toLowerCase().replace(/\s+/g, '.')}${Math.floor(10 + Math.random() * 89)}@okhdfcbank`;

    if (isFraudulent) {
      const pattern = FRAUD_PATTERNS[Math.floor(Math.random() * FRAUD_PATTERNS.length)];
      const amt = Math.floor(pattern.amountRange[0] + Math.random() * (pattern.amountRange[1] - pattern.amountRange[0]));
      
      dataset.push({
        txnId: `UPI-IND-2026-${String(i + 1).padStart(5, '0')}`,
        timestamp: txTime,
        userName,
        userVpa,
        channel: pattern.channel,
        amount: amt,
        currency: 'INR',
        merchantName: pattern.name,
        merchantVpa: `mule_${Math.floor(100 + Math.random() * 900)}@upi`,
        merchantCategory: pattern.category,
        city: pattern.type === 'MULE_NETWORK_P2P' ? 'Jamtara' : cityObj.city,
        state: cityObj.state,
        latitude: cityObj.lat,
        longitude: cityObj.lon,
        deviceId: `DEV-${pattern.type === 'SIM_SWAP_NEW_DEVICE' ? 'EMU-XIAOMI' : 'UNVERIFIED'}-${i}`,
        deviceTrust: pattern.type === 'SIM_SWAP_NEW_DEVICE' ? 'EMULATOR' : 'UNVERIFIED',
        ipAddress: pattern.type === 'IMPOSSIBLE_TRAVEL_FRANKFURT' ? '185.220.101.5' : `103.44.${i % 255}.12`,
        vpnDetected: pattern.type === 'IMPOSSIBLE_TRAVEL_FRANKFURT',
        botDetected: pattern.type === 'SCREEN_SHARE_APK_MALWARE',
        checkoutDurationSeconds: pattern.type === 'SCREEN_SHARE_APK_MALWARE' ? 0.6 : 8,
        fraudScore: pattern.riskScore,
        decisionTier: 'TIER_3_SURGICAL_BLOCK',
        actionTaken: 'Auto-Quarantine & FrictionZero Intercept',
        isFraud: 1,
        fraudPatternType: pattern.type,
        fraudPatternDescription: pattern.desc
      });
    } else {
      const mer = LEGIT_MERCHANTS[Math.floor(Math.random() * LEGIT_MERCHANTS.length)];
      const amt = Math.round(mer.avg * (0.6 + Math.random() * 0.8));
      const isStepUp = amt > 15000 || Math.random() < 0.05; // 5% step-up

      dataset.push({
        txnId: `UPI-IND-2026-${String(i + 1).padStart(5, '0')}`,
        timestamp: txTime,
        userName,
        userVpa,
        channel: 'UPI_QR_P2M',
        amount: amt,
        currency: 'INR',
        merchantName: mer.name,
        merchantVpa: mer.vpa,
        merchantCategory: mer.cat,
        city: cityObj.city,
        state: cityObj.state,
        latitude: cityObj.lat,
        longitude: cityObj.lon,
        deviceId: `DEV-PHONE-${userName.slice(0, 3).toUpperCase()}-${i % 20}`,
        deviceTrust: isStepUp ? 'NEW' : 'TRUSTED',
        ipAddress: `103.21.${(i * 3) % 250}.44`,
        vpnDetected: false,
        botDetected: false,
        checkoutDurationSeconds: 12 + Math.floor(Math.random() * 8),
        fraudScore: isStepUp ? Math.floor(35 + Math.random() * 25) : Math.floor(2 + Math.random() * 12),
        decisionTier: isStepUp ? 'TIER_2_ADAPTIVE_STEP_UP' : 'TIER_1_ZERO_FRICTION',
        actionTaken: isStepUp ? '1-Tap Biometric Challenge' : 'Silent Seamless Approval (<15ms)',
        isFraud: 0,
        fraudPatternType: 'BENIGN_AUTHENTIC_UPI',
        fraudPatternDescription: 'Verified NPCI UPI transaction on trusted hardware'
      });
    }
  }

  return dataset;
}

// Generate & write files
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dataset = generateIndianDataset(500);

// 1. Write JSON
fs.writeFileSync(
  path.join(dataDir, 'indian_upi_fraud_dataset.json'),
  JSON.stringify(dataset, null, 2),
  'utf-8'
);

// 2. Write CSV
const headers = Object.keys(dataset[0]).join(',');
const csvLines = dataset.map(row => 
  Object.values(row).map(val => typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val).join(',')
);
fs.writeFileSync(
  path.join(dataDir, 'indian_upi_fraud_dataset.csv'),
  [headers, ...csvLines].join('\n'),
  'utf-8'
);

console.log(`✅ Successfully generated Indian UPI Fraud Dataset: 500 records`);
console.log(`📁 JSON: ${path.join(dataDir, 'indian_upi_fraud_dataset.json')}`);
console.log(`📁 CSV:  ${path.join(dataDir, 'indian_upi_fraud_dataset.csv')}`);

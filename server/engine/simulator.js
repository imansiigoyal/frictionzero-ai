/**
 * FrictionZero AI - Scenario Generator & Live Traffic Simulator
 * Provides realistic payment vectors and live background traffic for demo and stress-testing.
 */

const riskEngine = require('./riskEngine');

const SCENARIOS = {
  legitimate_coffee: {
    name: 'Legitimate Morning Coffee (UPI)',
    description: 'Frequent local coffee shop, everyday smartphone, trusted biometric hardware.',
    payload: {
      userId: 'USR-1002',
      userName: 'Priya Sharma',
      amount: 240,
      currency: 'INR',
      merchant: 'Blue Tokai Coffee Roasters',
      merchantCategory: 'Dining & Cafes',
      paymentChannel: 'UPI',
      deviceId: 'DEV-IPHONE-15',
      deviceTrust: 'TRUSTED',
      deviceOs: 'iOS 17.5',
      ipAddress: '103.24.11.45',
      geoCity: 'Bengaluru',
      geoCountry: 'IN',
      latitude: 12.9716,
      longitude: 77.5946,
      vpnDetected: false,
      botDetected: false,
      checkoutDurationSeconds: 12
    }
  },

  high_value_new_device: {
    name: 'High-Value Gadget on New Device',
    description: 'Legitimate user buying electronics on a newly purchased tablet. Deserves step-up verification, not a blunt decline.',
    payload: {
      userId: 'USR-2041',
      userName: 'Rohan Verma',
      amount: 28500,
      currency: 'INR',
      merchant: 'Croma Electronics',
      merchantCategory: 'Consumer Electronics',
      paymentChannel: 'CARD',
      deviceId: 'DEV-IPAD-AIR-M2',
      deviceTrust: 'NEW',
      deviceOs: 'iPadOS 17.4',
      ipAddress: '122.161.45.12',
      geoCity: 'Delhi',
      geoCountry: 'IN',
      latitude: 28.6139,
      longitude: 77.2090,
      vpnDetected: false,
      botDetected: false,
      checkoutDurationSeconds: 24
    }
  },

  impossible_travel_takeover: {
    name: 'Account Takeover (Impossible Travel)',
    description: 'Transaction initiated from Frankfurt datacenter minutes after payment in Mumbai.',
    payload: {
      userId: 'USR-1002', // Same Priya Sharma as above!
      userName: 'Priya Sharma (Compromised)',
      amount: 72000,
      currency: 'INR',
      merchant: 'Global Crypto Voucher Gateway',
      merchantCategory: 'Cryptocurrency Exchange',
      paymentChannel: 'NETBANKING',
      deviceId: 'DEV-LINUX-SERVER',
      deviceTrust: 'UNVERIFIED',
      deviceOs: 'Ubuntu 22.04',
      ipAddress: '194.26.29.112',
      geoCity: 'Frankfurt',
      geoCountry: 'DE',
      latitude: 50.1109,
      longitude: 8.6821,
      vpnDetected: true,
      botDetected: false,
      checkoutDurationSeconds: 3
    }
  },

  credential_stuffer_bot: {
    name: 'Automated Bot Carding Attack',
    description: 'Headless Chromium emulator executing rapid card testing with automated script.',
    payload: {
      userId: 'USR-BOT-MULE-8',
      userName: 'Automated Agent Cluster',
      amount: 15400,
      currency: 'INR',
      merchant: 'Digital Gift Cards Instant',
      merchantCategory: 'Prepaid Gift Cards',
      paymentChannel: 'CARD',
      deviceId: 'DEV-HEADLESS-CHROME',
      deviceTrust: 'EMULATOR',
      deviceOs: 'Puppeteer / Headless Linux',
      ipAddress: '185.220.101.5',
      geoCity: 'Bucharest',
      geoCountry: 'RO',
      latitude: 44.4268,
      longitude: 26.1025,
      vpnDetected: true,
      botDetected: true,
      checkoutDurationSeconds: 0.8
    }
  }
};

// Seed 15 initial transactions to populate historical charts immediately
function seedInitialTransactions() {
  const sampleUsers = ['Aarav Patel', 'Neha Gupta', 'Vikram Singh', 'Ananya Iyer', 'Karan Mehta'];
  const sampleMerchants = [
    { name: 'Amazon India', cat: 'E-Commerce', amt: 1299 },
    { name: 'Swiggy', cat: 'Food Delivery', amt: 350 },
    { name: 'Zomato', cat: 'Food Delivery', amt: 480 },
    { name: 'Uber Trips', cat: 'Rideshare', amt: 210 },
    { name: 'BookMyShow', cat: 'Entertainment', amt: 850 },
    { name: 'Blinkit', cat: 'Quick Commerce', amt: 640 }
  ];

  sampleMerchants.forEach((m, idx) => {
    riskEngine.evaluate({
      userId: `USR-${100 + idx}`,
      userName: sampleUsers[idx % sampleUsers.length],
      amount: m.amt,
      currency: 'INR',
      merchant: m.name,
      merchantCategory: m.cat,
      paymentChannel: 'UPI',
      deviceId: `DEV-PHONE-${idx}`,
      deviceTrust: 'TRUSTED',
      deviceOs: 'Android 14',
      ipAddress: `103.44.${idx + 10}.12`,
      geoCity: 'Jaipur',
      geoCountry: 'IN',
      latitude: 26.9124,
      longitude: 75.7873,
      vpnDetected: false,
      botDetected: false,
      checkoutDurationSeconds: 15
    });
  });
}

seedInitialTransactions();

module.exports = {
  getScenarios: () => SCENARIOS,
  runScenario: (scenarioKey) => {
    const scenario = SCENARIOS[scenarioKey];
    if (!scenario) throw new Error(`Scenario ${scenarioKey} not found`);
    const evaluated = riskEngine.evaluate(scenario.payload);
    return {
      scenarioName: scenario.name,
      description: scenario.description,
      evaluation: evaluated
    };
  }
};

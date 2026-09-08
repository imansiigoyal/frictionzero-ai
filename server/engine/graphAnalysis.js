/**
 * FrictionZero AI - Fraud Syndicate & Graph Mule Detection Engine
 * Discovers interconnected fraud rings across accounts, devices, and IPs.
 */

class GraphAnalysisEngine {
  constructor() {
    this.nodes = new Map(); // id -> { id, label, type, riskScore, metadata }
    this.edges = [];        // [{ source, target, type, weight, timestamp }]
    this.cardToDevices = new Map();
    this.deviceToCards = new Map();
    this.ipToDevices = new Map();
    this.accountToMules = new Map();

    this.initializeDemoGraph();
  }

  initializeDemoGraph() {
    // Seed initial nodes for demonstration
    this.addNode('acc_legit_402', 'User (Aarav S.)', 'user', 12, { location: 'Mumbai, IN', trust: 'Verified' });
    this.addNode('dev_mob_891', 'iPhone 15 Pro', 'device', 8, { os: 'iOS 17.4', browser: 'Safari' });
    this.addNode('ip_103_44_12', '103.44.12.89', 'ip', 5, { isp: 'Jio Fiber', vpn: false });
    this.addNode('mer_swiggy', 'Swiggy Food', 'merchant', 2, { mcc: 'Dining' });

    this.addEdge('acc_legit_402', 'dev_mob_891', 'USED_DEVICE');
    this.addEdge('dev_mob_891', 'ip_103_44_12', 'CONNECTED_FROM');
    this.addEdge('acc_legit_402', 'mer_swiggy', 'PAID_TO');

    // Seed a known fraud syndicate ring
    this.addNode('syn_nexus_99', 'Nexus Mule Node #99', 'mule', 94, { cluster: 'GhostRing Alpha' });
    this.addNode('bot_cluster_4', 'Headless Cloud Farm', 'device', 98, { emulator: true, vpn: true });
    this.addNode('card_leak_5501', 'Card **** 5501 (Compromised)', 'card', 88, { issuer: 'Axis Bank' });
    this.addNode('card_leak_8829', 'Card **** 8829 (Compromised)', 'card', 91, { issuer: 'HDFC Bank' });
    this.addNode('ip_tor_exit_7', '185.220.101.5 (Tor Exit)', 'ip', 99, { country: 'RO', proxy: true });

    this.addEdge('bot_cluster_4', 'ip_tor_exit_7', 'ROUTED_THROUGH');
    this.addEdge('bot_cluster_4', 'card_leak_5501', 'SPOOF_AUTH');
    this.addEdge('bot_cluster_4', 'card_leak_8829', 'SPOOF_AUTH');
    this.addEdge('card_leak_5501', 'syn_nexus_99', 'LAUNDER_P2P');
    this.addEdge('card_leak_8829', 'syn_nexus_99', 'LAUNDER_P2P');
  }

  addNode(id, label, type, riskScore = 10, metadata = {}) {
    if (!this.nodes.has(id)) {
      this.nodes.set(id, { id, label, type, riskScore, metadata, createdAt: Date.now() });
    } else {
      const existing = this.nodes.get(id);
      existing.riskScore = Math.max(existing.riskScore, riskScore);
      existing.metadata = { ...existing.metadata, ...metadata };
    }
  }

  addEdge(source, target, type, weight = 1) {
    const exists = this.edges.some(e => e.source === source && e.target === target && e.type === type);
    if (!exists) {
      this.edges.push({ source, target, type, weight, timestamp: Date.now() });
    }
  }

  ingestTransaction(tx) {
    const { userId, cardId, deviceId, ipAddress, merchant, riskScore, flags = [] } = tx;

    const userNodeId = `usr_${userId || 'anon'}`;
    const cardNodeId = `crd_${cardId ? cardId.slice(-4) : 'xxxx'}`;
    const devNodeId = `dev_${deviceId ? deviceId.slice(0, 8) : 'unknown'}`;
    const ipNodeId = `ip_${ipAddress || '0.0.0.0'}`;
    const merNodeId = `mer_${merchant ? merchant.replace(/\s+/g, '_').toLowerCase() : 'unknown'}`;

    this.addNode(userNodeId, `User (${userId})`, 'user', riskScore, { channel: tx.channel });
    this.addNode(cardNodeId, `Card ****${cardId ? cardId.slice(-4) : 'xxxx'}`, 'card', riskScore);
    this.addNode(devNodeId, `Device ${deviceId ? deviceId.slice(0, 8) : 'Unknown'}`, 'device', riskScore, { os: tx.deviceOs });
    this.addNode(ipNodeId, `${ipAddress}`, 'ip', tx.vpnDetected ? 85 : 10, { country: tx.geoCountry, vpn: tx.vpnDetected });
    this.addNode(merNodeId, `${merchant}`, 'merchant', 5, { category: tx.merchantCategory });

    this.addEdge(userNodeId, devNodeId, 'AUTHENTICATED_ON');
    this.addEdge(devNodeId, ipNodeId, 'CONNECTED_VIA');
    this.addEdge(userNodeId, cardNodeId, 'USED_INSTRUMENT');
    this.addEdge(cardNodeId, merNodeId, 'TRANSFERRED_TO');

    // Cross-referencing syndicate patterns
    if (!this.cardToDevices.has(cardNodeId)) this.cardToDevices.set(cardNodeId, new Set());
    this.cardToDevices.get(cardNodeId).add(devNodeId);

    if (!this.deviceToCards.has(devNodeId)) this.deviceToCards.set(devNodeId, new Set());
    this.deviceToCards.get(devNodeId).add(cardNodeId);

    // Syndicate anomaly: 1 device cycling multiple cards
    const cardCount = this.deviceToCards.get(devNodeId).size;
    if (cardCount >= 3) {
      flags.push(`Syndicate Alert: Device linked to ${cardCount} unique payment cards`);
      this.nodes.get(devNodeId).riskScore = Math.max(85, this.nodes.get(devNodeId).riskScore);
    }
  }

  getGraphData() {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: this.edges.slice(-60) // Keep the graph responsive and clean
    };
  }
}

const graphEngine = new GraphAnalysisEngine();
module.exports = graphEngine;

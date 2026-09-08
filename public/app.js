/**
 * FrictionZero AI - Interactive Client Application Logic
 * Telemetry, XAI Factor Decomposition, Live Simulation, and Syndicate Graph
 */

let transactions = [];
let currentTransaction = null;
let streamInterval = null;
let isStreaming = true;
let activeFilter = 'all';
let graphData = { nodes: [], edges: [] };

// DOM Elements
const valZeroFrictionRate = document.getElementById('valZeroFrictionRate');
const valPreventedAmount = document.getElementById('valPreventedAmount');
const valBlockedCount = document.getElementById('valBlockedCount');
const valAvgLatency = document.getElementById('valAvgLatency');
const txTableBody = document.getElementById('txTableBody');
const streamToggleBtn = document.getElementById('streamToggleBtn');
const streamToggleText = document.getElementById('streamToggleText');
const evaluationDossier = document.getElementById('evaluationDossier');
const factorBarsList = document.getElementById('factorBarsList');
const fraudGraphCanvas = document.getElementById('fraudGraphCanvas');
const customerModal = document.getElementById('customerModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const previewCustomerScreenBtn = document.getElementById('previewCustomerScreenBtn');
const modalScreenContent = document.getElementById('modalScreenContent');
const toggleBuilderBtn = document.getElementById('toggleBuilderBtn');
const customTxForm = document.getElementById('customTxForm');

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await loadInitialData();
  startTrafficStream();
  initGraphCanvas();
});

function setupEventListeners() {
  // Scenario Buttons
  document.querySelectorAll('.scenario-card').forEach(btn => {
    btn.addEventListener('click', async () => {
      const scenarioKey = btn.dataset.scenario;
      await runScenario(scenarioKey);
    });
  });

  // Streaming Toggle
  streamToggleBtn.addEventListener('click', () => {
    isStreaming = !isStreaming;
    if (isStreaming) {
      startTrafficStream();
      streamToggleText.textContent = 'Auto-Stream: ON';
      streamToggleBtn.classList.remove('btn-outline');
      streamToggleBtn.classList.add('btn-secondary');
    } else {
      clearInterval(streamInterval);
      streamToggleText.textContent = 'Auto-Stream: PAUSED';
      streamToggleBtn.classList.remove('btn-secondary');
      streamToggleBtn.classList.add('btn-outline');
    }
  });

  // Table Filters
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.dataset.filter;
      renderTransactionTable();
    });
  });

  // Custom Inspector Toggle
  toggleBuilderBtn.addEventListener('click', () => {
    const isHidden = customTxForm.classList.toggle('hidden');
    toggleBuilderBtn.textContent = isHidden ? 'Expand Inspector' : 'Collapse Inspector';
  });

  // Custom Transaction Submit
  customTxForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitCustomTransaction();
  });

  // Modal Handlers
  previewCustomerScreenBtn.addEventListener('click', openCustomerPreviewModal);
  closeModalBtn.addEventListener('click', () => customerModal.classList.add('hidden'));
  customerModal.addEventListener('click', (e) => {
    if (e.target === customerModal) customerModal.classList.add('hidden');
  });

  // Reset Graph View
  document.getElementById('refreshGraphBtn').addEventListener('click', fetchGraphData);

  // Indian Dataset Viewer Button
  const viewDatasetBtn = document.getElementById('viewDatasetBtn');
  if (viewDatasetBtn) {
    viewDatasetBtn.addEventListener('click', () => {
      window.open('/api/v1/analytics/dataset', '_blank');
    });
  }

  // API Docs Button
  document.getElementById('triggerDocsBtn').addEventListener('click', () => {
    window.open('/api/v1/health', '_blank');
  });
}

// Load initial transactions, metrics & graph
async function loadInitialData() {
  try {
    const [txRes, metricsRes, graphRes] = await Promise.all([
      fetch('/api/v1/transactions/history').then(r => r.json()),
      fetch('/api/v1/analytics/metrics').then(r => r.json()),
      fetch('/api/v1/analytics/graph').then(r => r.json())
    ]);

    if (txRes.success && txRes.data.length > 0) {
      transactions = txRes.data;
      currentTransaction = transactions[0];
      renderDossier(currentTransaction);
      renderTransactionTable();
    }

    if (metricsRes.success) {
      updateMetrics(metricsRes.data);
    }

    if (graphRes.success) {
      graphData = graphRes.data;
    }
  } catch (err) {
    console.error('Failed to load initial data:', err);
  }
}

// Run predefined scenario
async function runScenario(scenarioKey) {
  try {
    const res = await fetch('/api/v1/transactions/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarioKey })
    });
    const json = await res.json();
    if (json.success) {
      const evalResult = json.data.evaluation;
      transactions.unshift(evalResult);
      currentTransaction = evalResult;
      renderDossier(evalResult);
      renderTransactionTable();
      await refreshMetrics();
      await fetchGraphData();
    }
  } catch (err) {
    console.error('Error running scenario:', err);
  }
}

// Submit custom sandbox transaction
async function submitCustomTransaction() {
  const payload = {
    userId: document.getElementById('custUserId').value,
    userName: 'Custom Sandbox User',
    amount: Number(document.getElementById('custAmount').value),
    currency: 'INR',
    merchant: 'Sandbox Merchant Test',
    merchantCategory: document.getElementById('custCategory').value,
    paymentChannel: 'CARD',
    deviceId: 'DEV-CUSTOM-FINGERPRINT',
    deviceTrust: document.getElementById('custDeviceTrust').value,
    geoCity: document.getElementById('custGeo').value.split(',')[0].trim(),
    geoCountry: 'IN',
    latitude: 26.9124,
    longitude: 75.7873,
    vpnDetected: document.getElementById('custVpn').checked,
    botDetected: document.getElementById('custBot').checked,
    checkoutDurationSeconds: Number(document.getElementById('custDuration').value)
  };

  try {
    const res = await fetch('/api/v1/transactions/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.success) {
      transactions.unshift(json.data);
      currentTransaction = json.data;
      renderDossier(json.data);
      renderTransactionTable();
      await refreshMetrics();
      await fetchGraphData();
    }
  } catch (err) {
    console.error('Error evaluating transaction:', err);
  }
}

// Background Simulated Stream
function startTrafficStream() {
  clearInterval(streamInterval);
  streamInterval = setInterval(async () => {
    if (!isStreaming) return;
    
    // Pick random merchant and user
    const merchants = [
      { name: 'Swiggy Food', cat: 'Dining & Cafes', avg: 340 },
      { name: 'Uber Trips', cat: 'Rideshare', avg: 220 },
      { name: 'Amazon Pay', cat: 'E-Commerce', avg: 1450 },
      { name: 'Flipkart Electronics', cat: 'Consumer Electronics', avg: 3800 },
      { name: 'Zepto Instant Grocery', cat: 'Quick Commerce', avg: 410 }
    ];
    const pick = merchants[Math.floor(Math.random() * merchants.length)];
    const amt = Math.round(pick.avg * (0.8 + Math.random() * 0.5));

    try {
      const res = await fetch('/api/v1/transactions/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: `USR-${Math.floor(100 + Math.random() * 900)}`,
          userName: 'Verified Mobile User',
          amount: amt,
          currency: 'INR',
          merchant: pick.name,
          merchantCategory: pick.cat,
          paymentChannel: 'UPI',
          deviceId: `DEV-${Math.floor(1000 + Math.random() * 9000)}`,
          deviceTrust: 'TRUSTED',
          geoCity: 'Jaipur',
          geoCountry: 'IN',
          latitude: 26.9124,
          longitude: 75.7873,
          vpnDetected: false,
          botDetected: false,
          checkoutDurationSeconds: 10 + Math.floor(Math.random() * 10)
        })
      });
      const json = await res.json();
      if (json.success) {
        transactions.unshift(json.data);
        if (transactions.length > 50) transactions.pop();
        renderTransactionTable();
        refreshMetrics();
      }
    } catch (e) {
      // quiet catch on stream
    }
  }, 4500);
}

// Update Top Metric Counters
function updateMetrics(metrics) {
  if (valZeroFrictionRate) valZeroFrictionRate.textContent = metrics.zeroFrictionRate || '96.4%';
  if (valPreventedAmount) valPreventedAmount.textContent = `₹${(metrics.totalPreventedAmount || 0).toLocaleString()}`;
  if (valBlockedCount) valBlockedCount.textContent = `${metrics.fraudBlockedCount || 0} High-Risk Blocks`;
  if (valAvgLatency) valAvgLatency.textContent = `${metrics.avgLatencyMs || 14.2} ms`;
}

async function refreshMetrics() {
  try {
    const res = await fetch('/api/v1/analytics/metrics');
    const json = await res.json();
    if (json.success) updateMetrics(json.data);
  } catch (e) {}
}

async function fetchGraphData() {
  try {
    const res = await fetch('/api/v1/analytics/graph');
    const json = await res.json();
    if (json.success) {
      graphData = json.data;
      drawGraph();
    }
  } catch (e) {}
}

// Render Dossier & Explainable AI attribution
function renderDossier(tx) {
  if (!tx) return;

  document.getElementById('dossierTxId').textContent = tx.id;
  document.getElementById('dossierUser').textContent = `${tx.userName} • ${tx.paymentChannel}`;
  document.getElementById('dossierMerchant').textContent = `${tx.merchant} • ₹${tx.amount.toLocaleString()}`;
  document.getElementById('dossierScore').textContent = `${tx.riskScore} / 100`;
  document.getElementById('dossierLatency').textContent = `${tx.latencyMs || 0.05} ms`;

  const badge = document.getElementById('dossierDecisionBadge');
  const expBox = document.getElementById('frictionExperienceBox');
  const expIcon = document.getElementById('frictionExpIcon');
  const expTitle = document.getElementById('frictionExpTitle');
  const expDesc = document.getElementById('frictionExpDesc');

  badge.className = 'tier-badge-large';
  expBox.className = 'friction-experience-box';

  if (tx.decision === 'BLOCK_FRAUD') {
    badge.classList.add('danger');
    badge.textContent = 'TIER 3: FRAUD INTERCEPT';
    expBox.classList.add('danger');
    expIcon.textContent = '🛑';
    expTitle.textContent = 'Customer Experience: Security Intercept Triggered';
    expDesc.textContent = 'Transaction frozen. Card instrument quarantined from syndicate network.';
  } else if (tx.decision === 'CHALLENGE_STEP_UP') {
    badge.classList.add('warning');
    badge.textContent = 'TIER 2: ADAPTIVE STEP-UP';
    expBox.classList.add('warn');
    expIcon.textContent = '👆';
    expTitle.textContent = 'Customer Experience: 1-Tap Biometric Challenge';
    expDesc.textContent = 'User prompted for 1-tap fingerprint / Passkey verification. No SMS OTP wait.';
  } else {
    badge.classList.add('safe');
    badge.textContent = 'TIER 1: ZERO FRICTION';
    expIcon.textContent = '⚡';
    expTitle.textContent = 'Customer Experience: Seamless Instant Approval';
    expDesc.textContent = 'Completed silently in background. 0 user prompts or friction steps.';
  }

  // Render SHAP-Style Factor Attribution Bars
  factorBarsList.innerHTML = '';
  if (tx.factorBreakdown && tx.factorBreakdown.length > 0) {
    tx.factorBreakdown.forEach(f => {
      const isInc = f.direction === 'INCREASE';
      const absWeight = Math.abs(f.weight);
      const widthPct = Math.min(100, (absWeight / 60) * 100);

      const div = document.createElement('div');
      div.className = 'factor-bar-item';
      div.innerHTML = `
        <div class="factor-top-row">
          <span>${f.name}</span>
          <span class="factor-weight ${isInc ? 'increase' : 'decrease'}">
            ${isInc ? '+' : ''}${f.weight} pts
          </span>
        </div>
        <div class="factor-progress-bg">
          <div class="factor-progress-fill ${isInc ? 'increase' : 'decrease'}" style="width: ${widthPct}%"></div>
        </div>
        <div class="factor-desc">${f.description}</div>
      `;
      factorBarsList.appendChild(div);
    });
  } else {
    factorBarsList.innerHTML = `
      <div class="factor-bar-item">
        <div class="factor-desc">No anomalous risk signals detected. Perfect trusted baseline.</div>
      </div>
    `;
  }
}

// Render Transaction Table
function renderTransactionTable() {
  txTableBody.innerHTML = '';

  const filtered = transactions.filter(t => {
    if (activeFilter === 'all') return true;
    return t.decision === activeFilter;
  });

  filtered.forEach(tx => {
    const tr = document.createElement('tr');
    tr.className = currentTransaction && currentTransaction.id === tx.id ? 'active-row' : '';
    
    let badgeHtml = '';
    if (tx.decision === 'BLOCK_FRAUD') {
      badgeHtml = `<span class="score-badge danger">Blocked (Tier 3)</span>`;
    } else if (tx.decision === 'CHALLENGE_STEP_UP') {
      badgeHtml = `<span class="score-badge warn">Step-Up (Tier 2)</span>`;
    } else {
      badgeHtml = `<span class="score-badge safe">Zero Friction</span>`;
    }

    tr.innerHTML = `
      <td>
        <div class="tx-row-id">${tx.id}</div>
        <div class="tx-row-time">${tx.merchant}</div>
      </td>
      <td>
        <div class="tx-row-amount">₹${tx.amount.toLocaleString()}</div>
      </td>
      <td>
        <span class="score-badge ${tx.badgeClass}">${tx.riskScore}</span>
      </td>
      <td>${badgeHtml}</td>
    `;

    tr.addEventListener('click', () => {
      currentTransaction = tx;
      renderDossier(tx);
      renderTransactionTable();
    });

    txTableBody.appendChild(tr);
  });
}

// Customer Mobile Screen Preview Modal
function openCustomerPreviewModal() {
  if (!currentTransaction) return;
  const tx = currentTransaction;

  let actionHtml = '';
  if (tx.decision === 'BLOCK_FRAUD') {
    actionHtml = `
      <div class="mockup-action-zone danger">
        <div class="mockup-icon-large">🛡️</div>
        <div class="mockup-tier-label" style="color: #fb7185">Transaction Intercepted</div>
        <div class="mockup-tier-note">
          FrictionZero AI flagged anomalous velocity & proxy routing. To protect your funds, this attempt was blocked.
        </div>
      </div>
    `;
  } else if (tx.decision === 'CHALLENGE_STEP_UP') {
    actionHtml = `
      <div class="mockup-action-zone warn">
        <div class="mockup-icon-large">👆</div>
        <div class="mockup-tier-label" style="color: #fbbf24">1-Tap Biometric Verification</div>
        <div class="mockup-tier-note">
          New device detected. Tap your fingerprint sensor or FaceID to authorize ₹${tx.amount.toLocaleString()}.
        </div>
        <button class="btn btn-primary btn-sm" style="margin-top: 12px; width: 100%;">
          Authorize via Passkey (0.4s)
        </button>
      </div>
    `;
  } else {
    actionHtml = `
      <div class="mockup-action-zone safe">
        <div class="mockup-icon-large">⚡</div>
        <div class="mockup-tier-label" style="color: #34d399">Payment Approved Silently</div>
        <div class="mockup-tier-note">
          FrictionZero AI authenticated your hardware token in 12ms. Zero OTP or confirmation required!
        </div>
      </div>
    `;
  }

  modalScreenContent.innerHTML = `
    <div class="mobile-mockup">
      <div class="mockup-status-bar">
        <span>9:41 AM</span>
        <span>5G • 100%</span>
      </div>
      <div class="mockup-app-header">BankPay FastCheckout</div>
      <div class="mockup-amount-display">₹${tx.amount.toLocaleString()}</div>
      <div class="mockup-merchant-display">Paying ${tx.merchant}</div>
      ${actionHtml}
      <div style="font-size: 10px; color: #64748b; margin-top: 10px;">
        Secured by FrictionZero AI • Sub-15ms Defense
      </div>
    </div>
  `;

  customerModal.classList.remove('hidden');
}

// Interactive Syndicate Graph Canvas
let graphPositions = new Map();

function initGraphCanvas() {
  if (!fraudGraphCanvas) return;
  drawGraph();
}

function drawGraph() {
  const canvas = fraudGraphCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width = canvas.parentElement.clientWidth;
  const height = canvas.height = canvas.parentElement.clientHeight;

  ctx.clearRect(0, 0, width, height);

  if (!graphData.nodes || graphData.nodes.length === 0) return;

  // Simple radial / clustered layout
  const cx = width / 2;
  const cy = height / 2;
  const nodes = graphData.nodes.slice(0, 20);

  nodes.forEach((node, i) => {
    if (!graphPositions.has(node.id)) {
      const angle = (i / nodes.length) * Math.PI * 2;
      const radius = 60 + (i % 3) * 45;
      graphPositions.set(node.id, {
        x: cx + Math.cos(angle) * radius + (Math.random() - 0.5) * 20,
        y: cy + Math.sin(angle) * radius + (Math.random() - 0.5) * 20
      });
    }
  });

  // Draw Edges
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  (graphData.edges || []).forEach(edge => {
    const p1 = graphPositions.get(edge.source);
    const p2 = graphPositions.get(edge.target);
    if (p1 && p2) {
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  });

  // Draw Nodes
  nodes.forEach(node => {
    const pos = graphPositions.get(node.id);
    if (!pos) return;

    let color = '#38bdf8'; // user
    let size = 6;
    if (node.type === 'card') { color = '#f59e0b'; size = 6; }
    else if (node.type === 'device') { color = '#10b981'; size = 7; }
    else if (node.type === 'mule' || node.riskScore > 75) { color = '#f43f5e'; size = 9; }

    // Glow for high risk
    if (node.riskScore > 75) {
      ctx.fillStyle = 'rgba(244, 63, 94, 0.25)';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size + 6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
    ctx.fill();

    // Node label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillText(node.label.slice(0, 14), pos.x + size + 4, pos.y + 3);
  });
}

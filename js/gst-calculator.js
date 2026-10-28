/**
 * XESTUS GST Calculator Engine (India)
 * Inclusive / Exclusive, CGST/SGST/IGST, Multi-Slab Support
 * 100% Client-Side - Zero Data Leak
 */

(function () {
  'use strict';

  let currentMode = 'exclusive'; // 'exclusive' | 'inclusive'
  let currentSupply = 'intra';    // 'intra' (CGST+SGST) | 'inter' (IGST)
  let currentRate = 18;          // 5, 12, 18, 28 or custom

  // Elements
  const baseAmountInput = document.getElementById('gst-amount');
  const amountSlider = document.getElementById('gst-slider');
  const customRateInput = document.getElementById('gst-custom-rate');
  const slabButtons = document.querySelectorAll('.gst-slab-btn');
  const modeButtons = document.querySelectorAll('[data-gst-mode]');
  const supplyButtons = document.querySelectorAll('[data-gst-supply]');

  // Results
  const resNet = document.getElementById('res-net-amount');
  const resGst = document.getElementById('res-total-gst');
  const resGross = document.getElementById('res-gross-amount');
  const resCgstRow = document.getElementById('res-cgst-row');
  const resSgstRow = document.getElementById('res-sgst-row');
  const resIgstRow = document.getElementById('res-igst-row');
  const resCgst = document.getElementById('res-cgst');
  const resSgst = document.getElementById('res-sgst');
  const resIgst = document.getElementById('res-igst');
  const resRateBadge = document.getElementById('res-rate-badge');

  function calculateGST() {
    let inputAmount = parseFloat(baseAmountInput.value) || 0;
    if (inputAmount < 0) inputAmount = 0;

    let rate = currentRate;
    if (customRateInput && customRateInput.value !== '' && !isNaN(parseFloat(customRateInput.value))) {
      rate = parseFloat(customRateInput.value);
    }

    let netAmount = 0;
    let gstAmount = 0;
    let grossAmount = 0;

    if (currentMode === 'exclusive') {
      // GST Exclusive (Add GST to base price)
      // GST Amount = (Base Amount * GST%) / 100
      // Total Amount = Base Amount + GST Amount
      netAmount = inputAmount;
      gstAmount = (inputAmount * rate) / 100;
      grossAmount = netAmount + gstAmount;
    } else {
      // GST Inclusive (Extract GST from gross price)
      // GST Amount = Gross Amount - [Gross Amount * {100 / (100 + GST%)}]
      // Net Amount = Gross Amount - GST Amount
      grossAmount = inputAmount;
      gstAmount = grossAmount - (grossAmount * (100 / (100 + rate)));
      netAmount = grossAmount - gstAmount;
    }

    // Taxes Breakdown
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (currentSupply === 'intra') {
      cgst = gstAmount / 2;
      sgst = gstAmount / 2;
      if (resCgstRow) resCgstRow.style.display = 'flex';
      if (resSgstRow) resSgstRow.style.display = 'flex';
      if (resIgstRow) resIgstRow.style.display = 'none';
      if (resCgst) resCgst.textContent = window.Xestus.formatINR(cgst);
      if (resSgst) resSgst.textContent = window.Xestus.formatINR(sgst);
    } else {
      igst = gstAmount;
      if (resCgstRow) resCgstRow.style.display = 'none';
      if (resSgstRow) resSgstRow.style.display = 'none';
      if (resIgstRow) resIgstRow.style.display = 'flex';
      if (resIgst) resIgst.textContent = window.Xestus.formatINR(igst);
    }

    // Update DOM texts
    if (resNet) resNet.textContent = window.Xestus.formatINR(netAmount);
    if (resGst) resGst.textContent = window.Xestus.formatINR(gstAmount);
    if (resGross) resGross.textContent = window.Xestus.formatINR(grossAmount);
    if (resRateBadge) resRateBadge.textContent = `${rate}% GST`;

    // Render Donut Chart
    if (window.XestusChart && document.getElementById('gst-chart-container')) {
      const chartData = [
        { label: 'Net Amount', value: Math.round(netAmount), color: '#10B981' },
        { label: 'Total GST', value: Math.round(gstAmount), color: '#3B82F6' }
      ];
      window.XestusChart.renderDonut(
        'gst-chart-container',
        chartData,
        'Gross Amount',
        `₹${Math.round(grossAmount).toLocaleString('en-IN')}`
      );
    }
  }

  // Bind Events
  if (baseAmountInput) {
    baseAmountInput.addEventListener('input', () => {
      if (amountSlider) amountSlider.value = baseAmountInput.value;
      calculateGST();
    });
  }

  if (amountSlider) {
    amountSlider.addEventListener('input', () => {
      if (baseAmountInput) baseAmountInput.value = amountSlider.value;
      calculateGST();
    });
  }

  // Slab selection
  slabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      slabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = parseFloat(btn.getAttribute('data-rate'));
      currentRate = val;
      if (customRateInput) customRateInput.value = '';
      calculateGST();
    });
  });

  if (customRateInput) {
    customRateInput.addEventListener('input', () => {
      slabButtons.forEach(b => b.classList.remove('active'));
      const val = parseFloat(customRateInput.value);
      if (!isNaN(val) && val >= 0) {
        currentRate = val;
      }
      calculateGST();
    });
  }

  // Mode Selection (Inclusive vs Exclusive)
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.getAttribute('data-gst-mode');
      calculateGST();
    });
  });

  // Supply Selection (Intrastate vs Interstate)
  supplyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      supplyButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSupply = btn.getAttribute('data-gst-supply');
      calculateGST();
    });
  });

  // Amount preset chips
  document.querySelectorAll('[data-amount-chip]').forEach(chip => {
    chip.addEventListener('click', () => {
      const amt = chip.getAttribute('data-amount-chip');
      if (baseAmountInput) baseAmountInput.value = amt;
      if (amountSlider) amountSlider.value = amt;
      calculateGST();
    });
  });

  // Copy Calculation Breakdown Button
  const copyBtn = document.getElementById('btn-copy-gst');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const net = resNet ? resNet.textContent : '';
      const tax = resGst ? resGst.textContent : '';
      const gross = resGross ? resGross.textContent : '';
      const rate = currentRate + '%';
      const type = currentMode.toUpperCase();
      const supply = currentSupply === 'intra' ? 'Intrastate (CGST+SGST)' : 'Interstate (IGST)';

      const text = `--- GST Breakdown (XESTUS Suite) ---\n` +
        `Mode: ${type} GST\n` +
        `Rate: ${rate}\n` +
        `Supply Type: ${supply}\n` +
        `Net Amount: ${net}\n` +
        `Total GST: ${tax}\n` +
        `Gross Total: ${gross}\n` +
        `Calculated via: https://gst.xestus.in`;

      navigator.clipboard.writeText(text).then(() => {
        window.Xestus.toast('GST breakdown copied to clipboard!');
      });
    });
  }

  // Multi-item quick calculator
  let multiItems = [
    { name: 'Item 1', rate: 18, amount: 1000 }
  ];

  function renderMultiItems() {
    const listEl = document.getElementById('multi-item-list');
    if (!listEl) return;

    listEl.innerHTML = '';
    let totalNet = 0;
    let totalTax = 0;

    multiItems.forEach((item, index) => {
      const tax = (item.amount * item.rate) / 100;
      totalNet += item.amount;
      totalTax += tax;

      const row = document.createElement('div');
      row.className = 'grid-4';
      row.style.gap = '0.75rem';
      row.style.marginBottom = '0.75rem';
      row.style.alignItems = 'center';

      row.innerHTML = `
        <input type="text" value="${window.Xestus.escapeHTML(item.name)}" placeholder="Item Name" data-item-idx="${index}" class="multi-item-name">
        <div class="input-currency-wrapper">
          <span class="input-currency-symbol">₹</span>
          <input type="number" value="${item.amount}" placeholder="Amount" data-item-idx="${index}" class="multi-item-amt input-currency" style="font-size:1rem;padding-left:2rem;">
        </div>
        <select data-item-idx="${index}" class="multi-item-rate">
          <option value="0" ${item.rate === 0 ? 'selected' : ''}>0% (Exempt)</option>
          <option value="5" ${item.rate === 5 ? 'selected' : ''}>5%</option>
          <option value="12" ${item.rate === 12 ? 'selected' : ''}>12%</option>
          <option value="18" ${item.rate === 18 ? 'selected' : ''}>18%</option>
          <option value="28" ${item.rate === 28 ? 'selected' : ''}>28%</option>
        </select>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span class="font-mono" style="font-weight:700;">₹${(item.amount + tax).toFixed(2)}</span>
          <button type="button" data-remove-idx="${index}" style="color:var(--accent-danger);padding:0.3rem;" title="Remove Item">&times;</button>
        </div>
      `;
      listEl.appendChild(row);
    });

    const multiTotalEl = document.getElementById('multi-total-summary');
    if (multiTotalEl) {
      multiTotalEl.innerHTML = `
        <div class="breakdown-row">
          <span>Total Taxable:</span> <span class="font-mono">₹${totalNet.toLocaleString('en-IN', {minimumFractionDigits:2})}</span>
        </div>
        <div class="breakdown-row">
          <span>Total Tax:</span> <span class="font-mono" style="color:var(--accent-primary);">₹${totalTax.toLocaleString('en-IN', {minimumFractionDigits:2})}</span>
        </div>
        <div class="breakdown-row" style="font-size:1.15rem;font-weight:800;border-top:1px solid var(--border-color);padding-top:0.75rem;">
          <span>Grand Total:</span> <span class="font-mono" style="color:var(--accent-primary);">₹${(totalNet + totalTax).toLocaleString('en-IN', {minimumFractionDigits:2})}</span>
        </div>
      `;
    }

    // Attach listeners
    listEl.querySelectorAll('.multi-item-name').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = e.target.getAttribute('data-item-idx');
        multiItems[idx].name = e.target.value;
      });
    });
    listEl.querySelectorAll('.multi-item-amt').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = e.target.getAttribute('data-item-idx');
        multiItems[idx].amount = parseFloat(e.target.value) || 0;
        renderMultiItems();
      });
    });
    listEl.querySelectorAll('.multi-item-rate').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const idx = e.target.getAttribute('data-item-idx');
        multiItems[idx].rate = parseFloat(e.target.value) || 0;
        renderMultiItems();
      });
    });
    listEl.querySelectorAll('[data-remove-idx]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-remove-idx'), 10);
        if (multiItems.length > 1) {
          multiItems.splice(idx, 1);
          renderMultiItems();
        } else {
          window.Xestus.toast('At least one item is required');
        }
      });
    });
  }

  const addItemBtn = document.getElementById('btn-add-multi-item');
  if (addItemBtn) {
    addItemBtn.addEventListener('click', () => {
      multiItems.push({ name: `Item ${multiItems.length + 1}`, rate: 18, amount: 1000 });
      renderMultiItems();
    });
  }

  // Initial Calculation on Load
  document.addEventListener('DOMContentLoaded', () => {
    calculateGST();
    renderMultiItems();
  });

})();

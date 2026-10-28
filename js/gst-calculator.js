/**
 * GST Calculator Engine (India) - Powered by XESTUS
 * Inclusive & Exclusive, CGST/SGST/IGST, Multi-Item Cart & Live HSN Lookup
 * 100% Client-Side - Zero Data Leak
 */

(function () {
  'use strict';

  let currentMode = 'exclusive'; // 'exclusive' | 'inclusive'
  let currentSupply = 'intra';    // 'intra' (CGST+SGST) | 'inter' (IGST)
  let currentRate = 18;          // 0, 5, 12, 18, 28 or custom

  // World Country Tax Presets (GST, VAT, Sales Tax)
  const COUNTRY_TAX_PRESETS = {
    IN: { name: 'India (GST)', currency: 'INR', defaultRate: 18, rates: [0, 5, 12, 18, 28], taxName: 'GST' },
    US: { name: 'USA (Sales Tax)', currency: 'USD', defaultRate: 7, rates: [0, 4, 6, 7, 8.5, 10], taxName: 'Sales Tax' },
    GB: { name: 'UK (VAT)', currency: 'GBP', defaultRate: 20, rates: [0, 5, 20], taxName: 'VAT' },
    EU: { name: 'Europe (VAT)', currency: 'EUR', defaultRate: 21, rates: [0, 10, 19, 20, 21], taxName: 'VAT' },
    AE: { name: 'UAE / Gulf (VAT)', currency: 'AED', defaultRate: 5, rates: [0, 5, 15], taxName: 'VAT' },
    CA: { name: 'Canada (GST/HST)', currency: 'CAD', defaultRate: 13, rates: [0, 5, 13, 15], taxName: 'GST/HST' },
    AU: { name: 'Australia (GST)', currency: 'AUD', defaultRate: 10, rates: [0, 10], taxName: 'GST' },
    SG: { name: 'Singapore (GST)', currency: 'SGD', defaultRate: 9, rates: [0, 9], taxName: 'GST' },
    BD: { name: 'Bangladesh (VAT)', currency: 'BDT', defaultRate: 15, rates: [0, 5, 7.5, 10, 15], taxName: 'VAT' }
  };

  // Elements
  const baseAmountInput = document.getElementById('gst-amount');
  const amountSlider = document.getElementById('gst-slider');
  const customRateInput = document.getElementById('gst-custom-rate');
  const slabButtons = document.querySelectorAll('.gst-slab-btn');
  const modeButtons = document.querySelectorAll('[data-gst-mode]');
  const supplyButtons = document.querySelectorAll('[data-gst-supply]');

  // Results
  const resHeroLabel = document.getElementById('res-hero-label');
  const resHeroAmount = document.getElementById('res-hero-amount');
  const resNetLabel = document.getElementById('res-net-label');
  const resNet = document.getElementById('res-net-amount');
  const resGst = document.getElementById('res-total-gst');
  const resGrossLabel = document.getElementById('res-gross-label');
  const resGross = document.getElementById('res-gross-amount');
  const resCgstRow = document.getElementById('res-cgst-row');
  const resSgstRow = document.getElementById('res-sgst-row');
  const resIgstRow = document.getElementById('res-igst-row');
  const resCgst = document.getElementById('res-cgst');
  const resSgst = document.getElementById('res-sgst');
  const resIgst = document.getElementById('res-igst');
  const resRateBadge = document.getElementById('res-rate-badge');

  // HSN Lookup Database (Top Common Goods & Services)
  const HSN_DATABASE = [
    { code: '998314', desc: 'IT Software Development, Web Design & Cloud Hosting', rate: 18, type: 'Service' },
    { code: '998311', desc: 'Management & Financial Consulting Services', rate: 18, type: 'Service' },
    { code: '8471', desc: 'Laptops, Desktop Computers & Microprocessors', rate: 18, type: 'Goods' },
    { code: '8517', desc: 'Smartphones & Cellular Network Devices', rate: 18, type: 'Goods' },
    { code: '996331', desc: 'Restaurant Services (Air-Conditioned / Non-Star)', rate: 5, type: 'Service' },
    { code: '996311', desc: 'Hotel Accommodation Room Rent (< ₹7,500/night)', rate: 12, type: 'Service' },
    { code: '996312', desc: 'Luxury 5-Star Hotel Room Rent (>= ₹7,500/night)', rate: 18, type: 'Service' },
    { code: '0401', desc: 'Fresh Milk & Pasteurized Natural Dairy', rate: 0, type: 'Goods' },
    { code: '0402', desc: 'Packaged Condensed Milk & Skimmed Milk Powder', rate: 5, type: 'Goods' },
    { code: '0405', desc: 'Butter, Dairy Ghee & Dairy Spreads', rate: 12, type: 'Goods' },
    { code: '0901', desc: 'Roasted Coffee Beans, Tea Leaves & Ground Spices', rate: 5, type: 'Goods' },
    { code: '3004', desc: 'Medicines & Essential Life-Saving Drugs', rate: 12, type: 'Goods' },
    { code: '7113', desc: 'Articles of Jewellery of Gold, Silver & Platinum', rate: 3, type: 'Goods' },
    { code: '6109', desc: 'Cotton T-Shirts & Ready-Made Garments (MRP <= ₹1,000)', rate: 5, type: 'Goods' },
    { code: '6203', desc: 'Suits, Jackets & Premium Branded Apparel (MRP > ₹1,000)', rate: 12, type: 'Goods' },
    { code: '8703', desc: 'Passenger Motor Cars & Luxury Sedans', rate: 28, type: 'Goods' },
    { code: '2202', desc: 'Aerated Waters, Soft Drinks & Energy Beverages', rate: 28, type: 'Goods' },
    { code: '9992', desc: 'Educational Services (Schools, Colleges, Universities)', rate: 0, type: 'Service' },
    { code: '9993', desc: 'Human Healthcare & Clinical Diagnostics', rate: 0, type: 'Service' }
  ];

  function calculateGST() {
    let inputAmount = parseFloat(baseAmountInput.value);
    if (isNaN(inputAmount) || inputAmount < 0) inputAmount = 0;

    let rate = currentRate;
    if (customRateInput && customRateInput.value !== '') {
      const parsedCustom = parseFloat(customRateInput.value);
      if (!isNaN(parsedCustom) && parsedCustom >= 0) {
        rate = parsedCustom;
      }
    }

    // Dynamic slider range adjustment
    if (amountSlider) {
      if (inputAmount > parseFloat(amountSlider.max)) {
        amountSlider.max = Math.max(inputAmount * 1.5, 2000000);
      }
      amountSlider.value = inputAmount;
    }

    let netAmount = 0;
    let gstAmount = 0;
    let grossAmount = 0;

    if (currentMode === 'exclusive') {
      // GST Exclusive (Add GST to base price)
      netAmount = inputAmount;
      gstAmount = (inputAmount * rate) / 100;
      grossAmount = netAmount + gstAmount;

      if (resHeroLabel) resHeroLabel.textContent = 'Total Payable (Gross Amount)';
      if (resHeroAmount) resHeroAmount.textContent = window.Xestus.formatINR(grossAmount);
      if (resNetLabel) resNetLabel.textContent = 'Net Taxable Price:';
      if (resGrossLabel) resGrossLabel.textContent = 'Gross Total Amount:';
    } else {
      // GST Inclusive (Extract GST from retail MRP)
      grossAmount = inputAmount;
      gstAmount = grossAmount - (grossAmount * (100 / (100 + rate)));
      netAmount = grossAmount - gstAmount;

      if (resHeroLabel) resHeroLabel.textContent = 'Net Base Price (Without GST)';
      if (resHeroAmount) resHeroAmount.textContent = window.Xestus.formatINR(netAmount);
      if (resNetLabel) resNetLabel.textContent = 'Actual Base Cost:';
      if (resGrossLabel) resGrossLabel.textContent = 'Gross Retail Price (Entered):';
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
    if (resRateBadge) resRateBadge.textContent = `${rate}% GST Applied`;

    // Render Donut Chart
    if (window.XestusChart && document.getElementById('gst-chart-container')) {
      const curr = (window.Xestus && window.Xestus.getCurrency) ? window.Xestus.getCurrency() : { symbol: '₹', system: 'indian' };
      const currSymbol = curr.symbol;
      const localeStr = curr.system === 'indian' ? 'en-IN' : 'en-US';

      const chartData = [
        { label: 'Net Taxable Amount', value: Math.round(netAmount), color: '#10B981' },
        { label: 'Total GST / Tax', value: Math.round(gstAmount), color: '#3B82F6' }
      ];
      window.XestusChart.renderDonut(
        'gst-chart-container',
        chartData,
        currentMode === 'exclusive' ? 'Gross Price' : 'Net Price',
        `${currSymbol}${Math.round(currentMode === 'exclusive' ? grossAmount : netAmount).toLocaleString(localeStr)}`
      );
    }
  }

  // Bind Events
  if (baseAmountInput) {
    baseAmountInput.addEventListener('input', () => {
      calculateGST();
      syncChipActive(parseFloat(baseAmountInput.value));
    });
  }

  if (amountSlider) {
    amountSlider.addEventListener('input', () => {
      if (baseAmountInput) baseAmountInput.value = amountSlider.value;
      calculateGST();
      syncChipActive(parseFloat(amountSlider.value));
    });
  }

  function syncChipActive(amt) {
    document.querySelectorAll('[data-amount-chip]').forEach(chip => {
      const chipVal = parseFloat(chip.getAttribute('data-amount-chip'));
      if (chipVal === amt) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
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
      const val = parseFloat(customRateInput.value);
      if (!isNaN(val) && val >= 0) {
        slabButtons.forEach(b => b.classList.remove('active'));
        currentRate = val;
      } else if (customRateInput.value === '') {
        // Revert to 18% slab
        currentRate = 18;
        slabButtons.forEach(b => {
          if (b.getAttribute('data-rate') === '18') b.classList.add('active');
          else b.classList.remove('active');
        });
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
      syncChipActive(parseFloat(amt));
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

      const text = `--- GST Breakdown (GST Calculator by XESTUS) ---\n` +
        `Calculation Mode: ${type} GST\n` +
        `Applicable Rate: ${rate}\n` +
        `Supply Jurisdiction: ${supply}\n` +
        `Net Taxable Amount: ${net}\n` +
        `Total GST: ${tax}\n` +
        `Final Gross Total: ${gross}\n` +
        `Calculated online via: https://gst.xestus.in/`;

      navigator.clipboard.writeText(text).then(() => {
        window.Xestus.toast('GST breakdown copied to clipboard!');
      });
    });
  }

  // Multi-Item Bill Workspace
  let multiItems = [
    { name: 'Consulting & Software Services', qty: 1, rate: 18, amount: 25000 },
    { name: 'Hardware Hardware Equipment', qty: 2, rate: 18, amount: 4500 }
  ];

  function renderMultiItems() {
    const listEl = document.getElementById('multi-item-list');
    if (!listEl) return;

    const curr = (window.Xestus && window.Xestus.getCurrency) ? window.Xestus.getCurrency() : { symbol: '₹', system: 'indian' };
    const currSymbol = curr.symbol;
    const localeStr = curr.system === 'indian' ? 'en-IN' : 'en-US';

    listEl.innerHTML = '';
    let totalTaxable = 0;
    let totalTax = 0;

    multiItems.forEach((item, index) => {
      const itemTaxable = (item.amount * (item.qty || 1));
      const tax = (itemTaxable * item.rate) / 100;
      totalTaxable += itemTaxable;
      totalTax += tax;

      const row = document.createElement('div');
      row.style.display = 'grid';
      row.style.gridTemplateColumns = '2fr 0.8fr 1.2fr 1fr 1.2fr 0.3fr';
      row.style.gap = '0.75rem';
      row.style.marginBottom = '0.75rem';
      row.style.alignItems = 'center';

      row.innerHTML = `
        <input type="text" value="${window.Xestus.escapeHTML(item.name)}" placeholder="Item or Service" data-item-idx="${index}" class="multi-item-name" style="font-size:0.9rem;">
        <input type="number" value="${item.qty || 1}" min="1" step="1" placeholder="Qty" data-item-idx="${index}" class="multi-item-qty" style="font-size:0.9rem;text-align:right;">
        <div class="input-currency-wrapper">
          <span class="input-currency-symbol">${currSymbol}</span>
          <input type="number" value="${item.amount}" placeholder="Rate" data-item-idx="${index}" class="multi-item-amt input-currency" style="font-size:0.9rem;padding-left:1.8rem;text-align:right;">
        </div>
        <select data-item-idx="${index}" class="multi-item-rate" style="font-size:0.9rem;">
          <option value="0" ${item.rate === 0 ? 'selected' : ''}>0%</option>
          <option value="5" ${item.rate === 5 ? 'selected' : ''}>5%</option>
          <option value="12" ${item.rate === 12 ? 'selected' : ''}>12%</option>
          <option value="18" ${item.rate === 18 ? 'selected' : ''}>18%</option>
          <option value="28" ${item.rate === 28 ? 'selected' : ''}>28%</option>
        </select>
        <div class="font-mono" data-row-total-idx="${index}" style="text-align:right;font-weight:700;">
          ${currSymbol}${(itemTaxable + tax).toLocaleString(localeStr, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <button type="button" data-remove-idx="${index}" style="color:var(--accent-danger);font-size:1.3rem;cursor:pointer;text-align:center;" title="Remove Item">&times;</button>
      `;
      listEl.appendChild(row);
    });

    const multiTotalEl = document.getElementById('multi-total-summary');
    if (multiTotalEl) {
      multiTotalEl.innerHTML = `
        <div class="breakdown-row">
          <span>Total Taxable Base:</span> <span class="font-mono">${currSymbol}${totalTaxable.toLocaleString(localeStr, { minimumFractionDigits: 2 })}</span>
        </div>
        <div class="breakdown-row">
          <span>Total Tax / GST:</span> <span class="font-mono" style="color:var(--accent-primary);">${currSymbol}${totalTax.toLocaleString(localeStr, { minimumFractionDigits: 2 })}</span>
        </div>
        <div class="breakdown-row" style="font-size:1.15rem;font-weight:800;border-top:1px solid var(--border-color);padding-top:0.75rem;">
          <span>Grand Bill Total:</span> <span class="font-mono" style="color:var(--accent-primary);">${currSymbol}${(totalTaxable + totalTax).toLocaleString(localeStr, { minimumFractionDigits: 2 })}</span>
        </div>
      `;
    }

    // Attach row events
    listEl.querySelectorAll('.multi-item-name').forEach(inp => {
      inp.addEventListener('input', e => {
        multiItems[e.target.dataset.itemIdx].name = e.target.value;
      });
    });
    listEl.querySelectorAll('.multi-item-qty').forEach(inp => {
      inp.addEventListener('input', e => {
        multiItems[e.target.dataset.itemIdx].qty = parseFloat(e.target.value) || 1;
        updateMultiItemTotals();
      });
    });
    listEl.querySelectorAll('.multi-item-amt').forEach(inp => {
      inp.addEventListener('input', e => {
        multiItems[e.target.dataset.itemIdx].amount = parseFloat(e.target.value) || 0;
        updateMultiItemTotals();
      });
    });
    listEl.querySelectorAll('.multi-item-rate').forEach(sel => {
      sel.addEventListener('change', e => {
        multiItems[e.target.dataset.itemIdx].rate = parseFloat(e.target.value) || 0;
        updateMultiItemTotals();
      });
    });
    listEl.querySelectorAll('[data-remove-idx]').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = parseInt(btn.dataset.removeIdx, 10);
        if (multiItems.length > 1) {
          multiItems.splice(idx, 1);
          renderMultiItems();
        } else {
          window.Xestus.toast('At least one item is required in the bill.');
        }
      });
    });
  }

  function updateMultiItemTotals() {
    let totalTaxable = 0;
    let totalTax = 0;

    const curr = (window.Xestus && window.Xestus.getCurrency) ? window.Xestus.getCurrency() : { symbol: '₹', system: 'indian' };
    const currSymbol = curr.symbol;
    const localeStr = curr.system === 'indian' ? 'en-IN' : 'en-US';

    multiItems.forEach((item, index) => {
      const itemTaxable = (item.amount * (item.qty || 1));
      const tax = (itemTaxable * item.rate) / 100;
      totalTaxable += itemTaxable;
      totalTax += tax;

      const rowTotalEl = document.querySelector(`[data-row-total-idx="${index}"]`);
      if (rowTotalEl) {
        rowTotalEl.textContent = `${currSymbol}${(itemTaxable + tax).toLocaleString(localeStr, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    });

    const multiTotalEl = document.getElementById('multi-total-summary');
    if (multiTotalEl) {
      multiTotalEl.innerHTML = `
        <div class="breakdown-row">
          <span>Total Taxable Base:</span> <span class="font-mono">${currSymbol}${totalTaxable.toLocaleString(localeStr, { minimumFractionDigits: 2 })}</span>
        </div>
        <div class="breakdown-row">
          <span>Total Tax / GST:</span> <span class="font-mono" style="color:var(--accent-primary);">${currSymbol}${totalTax.toLocaleString(localeStr, { minimumFractionDigits: 2 })}</span>
        </div>
        <div class="breakdown-row" style="font-size:1.15rem;font-weight:800;border-top:1px solid var(--border-color);padding-top:0.75rem;">
          <span>Grand Bill Total:</span> <span class="font-mono" style="color:var(--accent-primary);">${currSymbol}${(totalTaxable + totalTax).toLocaleString(localeStr, { minimumFractionDigits: 2 })}</span>
        </div>
      `;
    }
  }

  const addItemBtn = document.getElementById('btn-add-multi-item');
  if (addItemBtn) {
    addItemBtn.addEventListener('click', () => {
      multiItems.push({ name: `Item ${multiItems.length + 1}`, qty: 1, rate: 18, amount: 1000 });
      renderMultiItems();
    });
  }

  // Interactive Live HSN Finder
  function initHsnFinder() {
    const searchInp = document.getElementById('hsn-search-input');
    const tableBody = document.getElementById('hsn-results-body');
    if (!searchInp || !tableBody) return;

    function renderHsnRows(query = '') {
      tableBody.innerHTML = '';
      const q = query.toLowerCase().trim();

      const filtered = HSN_DATABASE.filter(item => {
        if (!q) return true;
        return item.code.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q);
      });

      if (!filtered.length) {
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:1.5rem;">No matching HSN/SAC codes found. Try searching another keyword like "Software", "Hotel", or "Gold".</td></tr>`;
        return;
      }

      filtered.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="font-mono" style="font-weight:700;color:var(--accent-primary);">${item.code}</td>
          <td>${item.desc}</td>
          <td style="text-align:center;"><span class="card-badge">${item.type}</span></td>
          <td style="font-weight:700;text-align:right;">
            <button type="button" class="btn btn-secondary" style="padding:0.25rem 0.6rem;font-size:0.8rem;" data-apply-hsn-rate="${item.rate}">
              Apply ${item.rate}%
            </button>
          </td>
        `;
        tableBody.appendChild(tr);
      });

      // Quick apply button
      tableBody.querySelectorAll('[data-apply-hsn-rate]').forEach(btn => {
        btn.addEventListener('click', () => {
          const rateVal = parseFloat(btn.getAttribute('data-apply-hsn-rate'));
          let matched = false;
          slabButtons.forEach(b => {
            if (parseFloat(b.getAttribute('data-rate')) === rateVal) {
              b.classList.add('active');
              matched = true;
            } else {
              b.classList.remove('active');
            }
          });

          if (!matched && customRateInput) {
            customRateInput.value = rateVal;
          } else if (customRateInput) {
            customRateInput.value = '';
          }

          currentRate = rateVal;
          calculateGST();
          window.scrollTo({ top: document.querySelector('.calc-workspace').offsetTop - 80, behavior: 'smooth' });
          window.Xestus.toast(`Applied ${rateVal}% GST rate to calculator!`);
        });
      });
    }

    searchInp.addEventListener('input', e => renderHsnRows(e.target.value));
    renderHsnRows();
  }

  // Country & Global Tax Preset Switcher
  function initCountryPresets() {
    document.querySelectorAll('[data-tax-country]').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('[data-tax-country]').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const countryKey = pill.getAttribute('data-tax-country');
        const preset = COUNTRY_TAX_PRESETS[countryKey];
        if (!preset) return;

        // Auto-sync currency
        if (window.Xestus && window.Xestus.setCurrency) {
          window.Xestus.setCurrency(preset.currency);
        }

        // Render dynamic slabs for country
        const slabsContainer = document.getElementById('gst-slab-container');
        if (slabsContainer) {
          slabsContainer.innerHTML = preset.rates.map(r => `
            <button type="button" class="chip-btn gst-slab-btn ${r === preset.defaultRate ? 'active' : ''}" data-rate="${r}">${r}%</button>
          `).join('');

          // Re-bind click events on new slab buttons
          slabsContainer.querySelectorAll('.gst-slab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              slabsContainer.querySelectorAll('.gst-slab-btn').forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
              currentRate = parseFloat(btn.getAttribute('data-rate'));
              if (customRateInput) customRateInput.value = '';
              calculateGST();
            });
          });
        }

        currentRate = preset.defaultRate;
        if (customRateInput) customRateInput.value = '';

        calculateGST();
        window.Xestus.toast(`Loaded ${preset.name} rates & ${preset.currency} currency`);
      });
    });
  }

  // Initial Calculation on Load
  document.addEventListener('DOMContentLoaded', () => {
    calculateGST();
    renderMultiItems();
    initHsnFinder();
    initCountryPresets();
  });

  // Listen for global currency switcher events
  window.addEventListener('xestus:currency-change', () => {
    calculateGST();
    updateMultiItemTotals();
  });

})();

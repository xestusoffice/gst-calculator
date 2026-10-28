/**
 * XESTUS SIP & Step-Up SIP Wealth Calculator Engine
 * Compounding Algorithm, Inflation Adjustment & Year-on-Year Growth Tracker
 * 100% Client-Side - Zero Data Leak
 */

(function () {
  'use strict';

  function initSipCalculator() {
    const sipInputs = [
      'sip-monthly', 'sip-slider-monthly',
      'sip-rate', 'sip-slider-rate',
      'sip-years', 'sip-slider-years',
      'sip-step-up', 'sip-inflation-toggle', 'sip-inflation-rate'
    ];

    sipInputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', syncAndCalculate);
        el.addEventListener('change', syncAndCalculate);
      }
    });

    // Preset return chips
    document.querySelectorAll('[data-return-chip]').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('[data-return-chip]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const ret = chip.getAttribute('data-return-chip');
        const rateInp = document.getElementById('sip-rate');
        const rateSlider = document.getElementById('sip-slider-rate');
        if (rateInp) rateInp.value = ret;
        if (rateSlider) rateSlider.value = ret;
        calculateSIP();
      });
    });

    syncAndCalculate();
  }

  function syncAndCalculate(e) {
    const monthly = document.getElementById('sip-monthly');
    const monthlySlider = document.getElementById('sip-slider-monthly');
    const rate = document.getElementById('sip-rate');
    const rateSlider = document.getElementById('sip-slider-rate');
    const years = document.getElementById('sip-years');
    const yearsSlider = document.getElementById('sip-slider-years');

    if (e && e.target) {
      if (e.target === monthly && monthlySlider) monthlySlider.value = monthly.value;
      if (e.target === monthlySlider && monthly) monthly.value = monthlySlider.value;
      if (e.target === rate && rateSlider) rateSlider.value = rate.value;
      if (e.target === rateSlider && rate) rate.value = rateSlider.value;
      if (e.target === years && yearsSlider) yearsSlider.value = years.value;
      if (e.target === yearsSlider && years) years.value = yearsSlider.value;
    }

    calculateSIP();
  }

  function calculateSIP() {
    let monthlyInvest = parseFloat(document.getElementById('sip-monthly')?.value) || 0;
    const annualRate = parseFloat(document.getElementById('sip-rate')?.value) || 0;
    const tenureYears = parseFloat(document.getElementById('sip-years')?.value) || 0;
    const stepUpPercent = parseFloat(document.getElementById('sip-step-up')?.value) || 0;
    const adjustInflation = document.getElementById('sip-inflation-toggle')?.checked || false;
    const inflationRate = parseFloat(document.getElementById('sip-inflation-rate')?.value) || 6;

    const monthlyRate = (annualRate / 12) / 100;
    const totalMonths = Math.round(tenureYears * 12);

    if (monthlyInvest <= 0 || annualRate <= 0 || totalMonths <= 0) return;

    let currentMonthly = monthlyInvest;
    let totalInvested = 0;
    let accumulatedCorpus = 0;
    const yearlyBreakdown = [];

    let currentYearInvested = 0;

    for (let m = 1; m <= totalMonths; m++) {
      // Step-up applied at the beginning of each new year (month 13, 25, 37, ...)
      if (m > 1 && (m - 1) % 12 === 0 && stepUpPercent > 0) {
        currentMonthly = currentMonthly * (1 + (stepUpPercent / 100));
      }

      totalInvested += currentMonthly;
      currentYearInvested += currentMonthly;

      // Add monthly investment at start of period and compound
      accumulatedCorpus = (accumulatedCorpus + currentMonthly) * (1 + monthlyRate);

      if (m % 12 === 0 || m === totalMonths) {
        const yearNum = Math.ceil(m / 12);
        yearlyBreakdown.push({
          year: yearNum,
          bar1: Math.round(totalInvested),
          bar2: Math.round(Math.max(0, accumulatedCorpus - totalInvested)),
          invested: totalInvested,
          corpus: accumulatedCorpus
        });
      }
    }

    const estimatedGains = Math.max(0, accumulatedCorpus - totalInvested);

    // Inflation adjustment: Future Value / (1 + inflation)^years
    let inflationAdjustedCorpus = accumulatedCorpus;
    if (adjustInflation) {
      const inflationFactor = Math.pow(1 + (inflationRate / 100), tenureYears);
      inflationAdjustedCorpus = accumulatedCorpus / inflationFactor;
    }

    // Update Display
    const elCorpus = document.getElementById('res-sip-corpus');
    const elInvested = document.getElementById('res-sip-invested');
    const elGains = document.getElementById('res-sip-gains');
    const elInflationLabel = document.getElementById('res-sip-inflation-label');

    if (elCorpus) {
      elCorpus.textContent = `₹${Math.round(adjustInflation ? inflationAdjustedCorpus : accumulatedCorpus).toLocaleString('en-IN')}`;
    }
    if (elInvested) elInvested.textContent = `₹${Math.round(totalInvested).toLocaleString('en-IN')}`;
    if (elGains) elGains.textContent = `₹${Math.round(estimatedGains).toLocaleString('en-IN')}`;

    if (elInflationLabel) {
      elInflationLabel.style.display = adjustInflation ? 'block' : 'none';
      elInflationLabel.textContent = `*Purchasing power in today's money (adjusted for ${inflationRate}% inflation): ₹${Math.round(inflationAdjustedCorpus).toLocaleString('en-IN')}`;
    }

    // Render Donut Chart
    if (window.XestusChart && document.getElementById('sip-donut-container')) {
      window.XestusChart.renderDonut(
        'sip-donut-container',
        [
          { label: 'Amount Invested', value: Math.round(totalInvested), color: '#3B82F6' },
          { label: 'Est. Wealth Gains', value: Math.round(estimatedGains), color: '#10B981' }
        ],
        'Total Wealth',
        `₹${Math.round(accumulatedCorpus).toLocaleString('en-IN')}`
      );
    }

    // Render Stacked Bar Growth Chart
    if (window.XestusChart && document.getElementById('sip-bar-container')) {
      window.XestusChart.renderGrowthBars(
        'sip-bar-container',
        yearlyBreakdown,
        'Invested',
        '#3B82F6',
        'Gains',
        '#10B981'
      );
    }

    // Populate Yearly Breakdown Table
    const tbody = document.getElementById('sip-table-body');
    if (tbody) {
      tbody.innerHTML = '';
      yearlyBreakdown.forEach(y => {
        const gain = y.corpus - y.invested;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="font-weight:700;text-align:center;">Year ${y.year}</td>
          <td class="font-mono">₹${Math.round(y.invested).toLocaleString('en-IN')}</td>
          <td class="font-mono" style="color:#10B981;font-weight:700;">₹${Math.round(gain).toLocaleString('en-IN')}</td>
          <td class="font-mono" style="font-weight:800;color:var(--text-primary);">₹${Math.round(y.corpus).toLocaleString('en-IN')}</td>
        `;
        tbody.appendChild(tr);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', initSipCalculator);

})();


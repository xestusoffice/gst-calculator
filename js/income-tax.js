/**
 * XESTUS Income Tax Calculator Engine (FY 2026-27 / AY 2027-28 & FY 2025-26)
 * Compares New Tax Regime vs Old Tax Regime with 87A Rebate & Marginal Relief
 * 100% Client-Side - Zero Data Leak
 */

(function () {
  'use strict';

  function initTaxCalculator() {
    const calcInputs = [
      'tax-gross-salary', 'tax-other-income', 'tax-is-salaried',
      'tax-80c', 'tax-80d', 'tax-nps', 'tax-home-loan', 'tax-hra', 'tax-other-deductions'
    ];

    calcInputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', computeTaxComparison);
        el.addEventListener('change', computeTaxComparison);
      }
    });

    // Preset chips
    document.querySelectorAll('[data-salary-chip]').forEach(chip => {
      chip.addEventListener('click', () => {
        const amt = chip.getAttribute('data-salary-chip');
        const salaryInp = document.getElementById('tax-gross-salary');
        if (salaryInp) {
          salaryInp.value = amt;
          computeTaxComparison();
        }
      });
    });

    computeTaxComparison();
  }

  function computeTaxComparison() {
    const grossSalary = parseFloat(document.getElementById('tax-gross-salary')?.value) || 0;
    const otherIncome = parseFloat(document.getElementById('tax-other-income')?.value) || 0;
    const isSalaried = document.getElementById('tax-is-salaried')?.value === 'yes';

    const sec80C = Math.min(parseFloat(document.getElementById('tax-80c')?.value) || 0, 150000);
    const sec80D = Math.min(parseFloat(document.getElementById('tax-80d')?.value) || 0, 100000);
    const nps80CCD = Math.min(parseFloat(document.getElementById('tax-nps')?.value) || 0, 50000);
    const homeLoanSec24 = Math.min(parseFloat(document.getElementById('tax-home-loan')?.value) || 0, 200000);
    const hraExempt = parseFloat(document.getElementById('tax-hra')?.value) || 0;
    const otherDeductions = parseFloat(document.getElementById('tax-other-deductions')?.value) || 0;

    const totalIncome = grossSalary + otherIncome;

    // --- 1. NEW REGIME COMPUTATION ---
    const stdDeductionNew = isSalaried ? 75000 : 0;
    const taxableIncomeNew = Math.max(0, totalIncome - stdDeductionNew);

    let taxNew = 0;
    // New Slabs FY 2025-26 & FY 2026-27:
    // 0 - 3L: 0%
    // 3L - 7L: 5% (₹20,000 max)
    // 7L - 10L: 10% (₹30,000 max)
    // 10L - 12L: 15% (₹30,000 max)
    // 12L - 15L: 20% (₹60,000 max)
    // Above 15L: 30%

    if (taxableIncomeNew > 1500000) {
      taxNew += (taxableIncomeNew - 1500000) * 0.30;
      taxNew += 300000 * 0.20; // 12L - 15L = 60,000
      taxNew += 200000 * 0.15; // 10L - 12L = 30,000
      taxNew += 300000 * 0.10; // 7L - 10L = 30,000
      taxNew += 400000 * 0.05; // 3L - 7L = 20,000
    } else if (taxableIncomeNew > 1200000) {
      taxNew += (taxableIncomeNew - 1200000) * 0.20;
      taxNew += 200000 * 0.15;
      taxNew += 300000 * 0.10;
      taxNew += 400000 * 0.05;
    } else if (taxableIncomeNew > 1000000) {
      taxNew += (taxableIncomeNew - 1000000) * 0.15;
      taxNew += 300000 * 0.10;
      taxNew += 400000 * 0.05;
    } else if (taxableIncomeNew > 700000) {
      taxNew += (taxableIncomeNew - 700000) * 0.10;
      taxNew += 400000 * 0.05;
    } else if (taxableIncomeNew > 300000) {
      taxNew += (taxableIncomeNew - 300000) * 0.05;
    }

    // Section 87A Rebate in New Regime
    let rebate87aNew = 0;
    if (taxableIncomeNew <= 700000) {
      rebate87aNew = taxNew;
      taxNew = 0;
    } else if (taxableIncomeNew > 700000 && taxableIncomeNew <= 727777) {
      // Marginal Relief: Tax payable cannot exceed excess income over 7,00,000
      const excessIncome = taxableIncomeNew - 700000;
      if (taxNew > excessIncome) {
        rebate87aNew = taxNew - excessIncome;
        taxNew = excessIncome;
      }
    }

    // 4% Cess
    const cessNew = taxNew * 0.04;
    const totalTaxNew = Math.round(taxNew + cessNew);

    // --- 2. OLD REGIME COMPUTATION ---
    const stdDeductionOld = isSalaried ? 50000 : 0;
    const totalOldDeductions = stdDeductionOld + sec80C + sec80D + nps80CCD + homeLoanSec24 + hraExempt + otherDeductions;
    const taxableIncomeOld = Math.max(0, totalIncome - totalOldDeductions);

    let taxOld = 0;
    // Old Slabs:
    // 0 - 2.5L: Nil
    // 2.5L - 5L: 5% (₹12,500 max)
    // 5L - 10L: 20% (₹1,00,000 max)
    // Above 10L: 30%

    if (taxableIncomeOld > 1000000) {
      taxOld += (taxableIncomeOld - 1000000) * 0.30;
      taxOld += 500000 * 0.20; // 1,00,000
      taxOld += 250000 * 0.05; // 12,500
    } else if (taxableIncomeOld > 500000) {
      taxOld += (taxableIncomeOld - 500000) * 0.20;
      taxOld += 250000 * 0.05;
    } else if (taxableIncomeOld > 250000) {
      taxOld += (taxableIncomeOld - 250000) * 0.05;
    }

    // Section 87A Rebate in Old Regime (Threshold: ₹5,00,000)
    let rebate87aOld = 0;
    if (taxableIncomeOld <= 500000) {
      rebate87aOld = taxOld;
      taxOld = 0;
    }

    const cessOld = taxOld * 0.04;
    const totalTaxOld = Math.round(taxOld + cessOld);

    // --- 3. COMPARISON & WINNER DISPLAY ---
    const diff = Math.abs(totalTaxNew - totalTaxOld);
    const recommendationCard = document.getElementById('tax-recommendation-card');
    const recommendationText = document.getElementById('tax-recommendation-text');
    const recommendationSavings = document.getElementById('tax-recommendation-savings');

    if (recommendationCard && recommendationText && recommendationSavings) {
      if (totalTaxNew < totalTaxOld) {
        recommendationCard.style.borderColor = '#10B981';
        recommendationCard.style.backgroundColor = 'rgba(16, 185, 129, 0.08)';
        recommendationText.innerHTML = `<strong>New Tax Regime is highly beneficial for you!</strong>`;
        recommendationSavings.textContent = `You save ₹${diff.toLocaleString('en-IN')} in tax under New Regime`;
      } else if (totalTaxOld < totalTaxNew) {
        recommendationCard.style.borderColor = '#3B82F6';
        recommendationCard.style.backgroundColor = 'rgba(59, 130, 246, 0.08)';
        recommendationText.innerHTML = `<strong>Old Tax Regime is better due to your high deductions!</strong>`;
        recommendationSavings.textContent = `You save ₹${diff.toLocaleString('en-IN')} in tax under Old Regime`;
      } else {
        recommendationCard.style.borderColor = 'var(--border-color)';
        recommendationCard.style.backgroundColor = 'var(--bg-tertiary)';
        recommendationText.innerHTML = `<strong>Both Regimes result in the exact same tax liability!</strong>`;
        recommendationSavings.textContent = `Tax payable is ₹0 under both regimes`;
      }
    }

    // Update Result Panel Elements
    const elTaxNew = document.getElementById('res-tax-new');
    const elTaxOld = document.getElementById('res-tax-old');
    const elTaxableNew = document.getElementById('res-taxable-new');
    const elTaxableOld = document.getElementById('res-taxable-old');
    const elDeductionsOld = document.getElementById('res-deductions-old');
    const elCessNew = document.getElementById('res-cess-new');
    const elCessOld = document.getElementById('res-cess-old');

    if (elTaxNew) elTaxNew.textContent = `₹${totalTaxNew.toLocaleString('en-IN')}`;
    if (elTaxOld) elTaxOld.textContent = `₹${totalTaxOld.toLocaleString('en-IN')}`;
    if (elTaxableNew) elTaxableNew.textContent = `₹${taxableIncomeNew.toLocaleString('en-IN')}`;
    if (elTaxableOld) elTaxableOld.textContent = `₹${taxableIncomeOld.toLocaleString('en-IN')}`;
    if (elDeductionsOld) elDeductionsOld.textContent = `₹${totalOldDeductions.toLocaleString('en-IN')}`;
    if (elCessNew) elCessNew.textContent = `₹${Math.round(cessNew).toLocaleString('en-IN')}`;
    if (elCessOld) elCessOld.textContent = `₹${Math.round(cessOld).toLocaleString('en-IN')}`;

    // Render Donut Chart for Take Home Salary under Recommended Regime
    const bestTax = Math.min(totalTaxNew, totalTaxOld);
    const takeHome = Math.max(0, totalIncome - bestTax);
    if (window.XestusChart && document.getElementById('tax-chart-container')) {
      window.XestusChart.renderDonut(
        'tax-chart-container',
        [
          { label: 'Take Home Net Income', value: Math.round(takeHome), color: '#10B981' },
          { label: 'Total Tax + Cess', value: Math.round(bestTax), color: '#EF4444' }
        ],
        'Take Home',
        `₹${Math.round(takeHome).toLocaleString('en-IN')}`
      );
    }
  }

  document.addEventListener('DOMContentLoaded', initTaxCalculator);

})();

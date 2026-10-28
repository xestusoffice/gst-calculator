/**
 * Income Tax Calculator Engine (FY 2026-27 / AY 2027-28 & FY 2025-26)
 * Built with Precision by XESTUS
 * Complete Slabs, Section 87A Full Rebate, Marginal Relief & Monthly Take-Home Pay
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
        document.querySelectorAll('[data-salary-chip]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
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

    // --- 1. NEW REGIME COMPUTATION (Default) ---
    const stdDeductionNew = isSalaried ? 75000 : 0;
    const taxableIncomeNew = Math.max(0, totalIncome - stdDeductionNew);

    let baseTaxNew = 0;
    // New Slabs FY 2026-27 & FY 2025-26:
    // 0 - 3L: Nil
    // 3L - 7L: 5% (₹20,000 max)
    // 7L - 10L: 10% (₹30,000 max)
    // 10L - 12L: 15% (₹30,000 max)
    // 12L - 15L: 20% (₹60,000 max)
    // Above 15L: 30%

    if (taxableIncomeNew > 1500000) {
      baseTaxNew += (taxableIncomeNew - 1500000) * 0.30;
      baseTaxNew += 300000 * 0.20; // 60,000
      baseTaxNew += 200000 * 0.15; // 30,000
      baseTaxNew += 300000 * 0.10; // 30,000
      baseTaxNew += 400000 * 0.05; // 20,000
    } else if (taxableIncomeNew > 1200000) {
      baseTaxNew += (taxableIncomeNew - 1200000) * 0.20;
      baseTaxNew += 200000 * 0.15;
      baseTaxNew += 300000 * 0.10;
      baseTaxNew += 400000 * 0.05;
    } else if (taxableIncomeNew > 1000000) {
      baseTaxNew += (taxableIncomeNew - 1000000) * 0.15;
      baseTaxNew += 300000 * 0.10;
      baseTaxNew += 400000 * 0.05;
    } else if (taxableIncomeNew > 700000) {
      baseTaxNew += (taxableIncomeNew - 700000) * 0.10;
      baseTaxNew += 400000 * 0.05;
    } else if (taxableIncomeNew > 300000) {
      baseTaxNew += (taxableIncomeNew - 300000) * 0.05;
    }

    // Section 87A Rebate in New Regime (Up to ₹7,00,000 taxable income)
    let rebate87aNew = 0;
    if (taxableIncomeNew <= 700000) {
      rebate87aNew = baseTaxNew;
      baseTaxNew = 0;
    } else if (taxableIncomeNew > 700000 && taxableIncomeNew <= 727777) {
      // Marginal Relief under Sec 87A
      const excessIncome = taxableIncomeNew - 700000;
      if (baseTaxNew > excessIncome) {
        rebate87aNew = baseTaxNew - excessIncome;
        baseTaxNew = excessIncome;
      }
    }

    // Surcharge for High Earners (New Regime capped at 25%)
    let surchargeNew = 0;
    if (taxableIncomeNew > 20000000) {
      surchargeNew = baseTaxNew * 0.25;
    } else if (taxableIncomeNew > 10000000) {
      surchargeNew = baseTaxNew * 0.15;
    } else if (taxableIncomeNew > 5000000) {
      surchargeNew = baseTaxNew * 0.10;
    }

    // 4% Health & Education Cess
    const cessNew = (baseTaxNew + surchargeNew) * 0.04;
    const totalTaxNew = Math.round(baseTaxNew + surchargeNew + cessNew);

    // --- 2. OLD REGIME COMPUTATION ---
    const stdDeductionOld = isSalaried ? 50000 : 0;
    const totalOldDeductions = stdDeductionOld + sec80C + sec80D + nps80CCD + homeLoanSec24 + hraExempt + otherDeductions;
    const taxableIncomeOld = Math.max(0, totalIncome - totalOldDeductions);

    let baseTaxOld = 0;
    // Old Slabs:
    // 0 - 2.5L: Nil
    // 2.5L - 5L: 5% (12,500)
    // 5L - 10L: 20% (1,00,000)
    // Above 10L: 30%

    if (taxableIncomeOld > 1000000) {
      baseTaxOld += (taxableIncomeOld - 1000000) * 0.30;
      baseTaxOld += 500000 * 0.20;
      baseTaxOld += 250000 * 0.05;
    } else if (taxableIncomeOld > 500000) {
      baseTaxOld += (taxableIncomeOld - 500000) * 0.20;
      baseTaxOld += 250000 * 0.05;
    } else if (taxableIncomeOld > 250000) {
      baseTaxOld += (taxableIncomeOld - 250000) * 0.05;
    }

    // Section 87A Rebate in Old Regime (Threshold: ₹5,00,000)
    let rebate87aOld = 0;
    if (taxableIncomeOld <= 500000) {
      rebate87aOld = baseTaxOld;
      baseTaxOld = 0;
    }

    // Surcharge Old Regime (Can go up to 37%)
    let surchargeOld = 0;
    if (taxableIncomeOld > 50000000) {
      surchargeOld = baseTaxOld * 0.37;
    } else if (taxableIncomeOld > 20000000) {
      surchargeOld = baseTaxOld * 0.25;
    } else if (taxableIncomeOld > 10000000) {
      surchargeOld = baseTaxOld * 0.15;
    } else if (taxableIncomeOld > 5000000) {
      surchargeOld = baseTaxOld * 0.10;
    }

    const cessOld = (baseTaxOld + surchargeOld) * 0.04;
    const totalTaxOld = Math.round(baseTaxOld + surchargeOld + cessOld);

    // --- 3. COMPARISON & RECOMMENDATION ---
    const diff = Math.abs(totalTaxNew - totalTaxOld);
    const recommendationCard = document.getElementById('tax-recommendation-card');
    const recommendationText = document.getElementById('tax-recommendation-text');
    const recommendationSavings = document.getElementById('tax-recommendation-savings');

    const recommendedRegime = totalTaxNew <= totalTaxOld ? 'new' : 'old';
    const bestTax = Math.min(totalTaxNew, totalTaxOld);

    if (recommendationCard && recommendationText && recommendationSavings) {
      if (totalTaxNew < totalTaxOld) {
        recommendationCard.style.borderColor = '#10B981';
        recommendationCard.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
        recommendationText.innerHTML = `<strong>New Tax Regime is the clear winner for you!</strong>`;
        recommendationSavings.textContent = `You save ₹${diff.toLocaleString('en-IN')} in tax under New Regime`;
      } else if (totalTaxOld < totalTaxNew) {
        recommendationCard.style.borderColor = '#3B82F6';
        recommendationCard.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
        recommendationText.innerHTML = `<strong>Old Tax Regime is better due to your high deductions!</strong>`;
        recommendationSavings.textContent = `You save ₹${diff.toLocaleString('en-IN')} in tax under Old Regime`;
      } else {
        recommendationCard.style.borderColor = 'var(--border-color)';
        recommendationCard.style.backgroundColor = 'var(--bg-tertiary)';
        recommendationText.innerHTML = `<strong>Both Regimes result in the exact same tax liability!</strong>`;
        recommendationSavings.textContent = `Tax payable is ₹0 under both regimes`;
      }
    }

    // Monthly In-Hand Salary Calculation
    const annualTakeHome = Math.max(0, totalIncome - bestTax);
    const monthlyInHand = Math.round(annualTakeHome / 12);
    const effectiveTaxRate = totalIncome > 0 ? ((bestTax / totalIncome) * 100).toFixed(1) : '0';

    const elMonthlyInHand = document.getElementById('res-monthly-inhand');
    const elEffectiveRate = document.getElementById('res-effective-rate');
    if (elMonthlyInHand) elMonthlyInHand.textContent = `₹${monthlyInHand.toLocaleString('en-IN')}`;
    if (elEffectiveRate) elEffectiveRate.textContent = `${effectiveTaxRate}%`;

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

    // Render Donut Chart for Take Home vs Tax
    if (window.XestusChart && document.getElementById('tax-chart-container')) {
      window.XestusChart.renderDonut(
        'tax-chart-container',
        [
          { label: 'Annual Take Home Pay', value: Math.round(annualTakeHome), color: '#10B981' },
          { label: 'Total Tax & Cess', value: Math.round(bestTax), color: '#EF4444' }
        ],
        'Monthly In-Hand',
        `₹${monthlyInHand.toLocaleString('en-IN')}`
      );
    }
  }

  document.addEventListener('DOMContentLoaded', initTaxCalculator);

})();

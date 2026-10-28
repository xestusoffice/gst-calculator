/**
 * XESTUS Loan EMI & Prepayment Calculator Engine
 * Amortization Schedule, Prepayment Interest Savings Tracker & CSV Exporter
 * 100% Client-Side - Zero Data Leak
 */

(function () {
  'use strict';

  let amortizationData = [];

  function initLoanCalculator() {
    const loanInputs = ['loan-amount', 'loan-slider-amount', 'loan-rate', 'loan-slider-rate', 'loan-tenure', 'loan-slider-tenure'];

    loanInputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', syncInputsAndCalculate);
      }
    });

    // Loan Type Presets
    document.querySelectorAll('[data-loan-type]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-loan-type]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const type = btn.getAttribute('data-loan-type');
        const amtInput = document.getElementById('loan-amount');
        const rateInput = document.getElementById('loan-rate');
        const tenureInput = document.getElementById('loan-tenure');

        if (type === 'home') {
          if (amtInput) amtInput.value = 5000000;
          if (rateInput) rateInput.value = 8.5;
          if (tenureInput) tenureInput.value = 20;
        } else if (type === 'car') {
          if (amtInput) amtInput.value = 1000000;
          if (rateInput) rateInput.value = 9.25;
          if (tenureInput) tenureInput.value = 5;
        } else if (type === 'personal') {
          if (amtInput) amtInput.value = 500000;
          if (rateInput) rateInput.value = 13.5;
          if (tenureInput) tenureInput.value = 3;
        }
        syncInputsAndCalculate();
      });
    });

    // Prepayment inputs
    const prepayInputs = ['prepay-lump-sum', 'prepay-lump-year', 'prepay-extra-monthly'];
    prepayInputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', calculateEMI);
      }
    });

    // CSV Download
    const csvBtn = document.getElementById('btn-export-amortization-csv');
    if (csvBtn) {
      csvBtn.addEventListener('click', exportAmortizationCSV);
    }

    syncInputsAndCalculate();
  }

  function syncInputsAndCalculate(e) {
    const amt = document.getElementById('loan-amount');
    const amtSlider = document.getElementById('loan-slider-amount');
    const rate = document.getElementById('loan-rate');
    const rateSlider = document.getElementById('loan-slider-rate');
    const tenure = document.getElementById('loan-tenure');
    const tenureSlider = document.getElementById('loan-slider-tenure');

    if (e && e.target) {
      if (e.target === amt && amtSlider) amtSlider.value = amt.value;
      if (e.target === amtSlider && amt) amt.value = amtSlider.value;
      if (e.target === rate && rateSlider) rateSlider.value = rate.value;
      if (e.target === rateSlider && rate) rate.value = rateSlider.value;
      if (e.target === tenure && tenureSlider) tenureSlider.value = tenure.value;
      if (e.target === tenureSlider && tenure) tenure.value = tenureSlider.value;
    }

    calculateEMI();
  }

  function calculateEMI() {
    const principal = parseFloat(document.getElementById('loan-amount')?.value) || 0;
    const annualRate = parseFloat(document.getElementById('loan-rate')?.value) || 0;
    const tenureYears = parseFloat(document.getElementById('loan-tenure')?.value) || 0;

    const monthlyRate = (annualRate / 12) / 100;
    const totalMonths = Math.round(tenureYears * 12);

    if (principal <= 0 || monthlyRate <= 0 || totalMonths <= 0) {
      return;
    }

    // Standard EMI formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
    const factor = Math.pow(1 + monthlyRate, totalMonths);
    const emi = (principal * monthlyRate * factor) / (factor - 1);

    const totalPayment = emi * totalMonths;
    const totalInterest = totalPayment - principal;

    // Output Base EMI
    const elEmi = document.getElementById('res-loan-emi');
    const elInterest = document.getElementById('res-loan-interest');
    const elTotal = document.getElementById('res-loan-total');
    const elPrincipal = document.getElementById('res-loan-principal');

    if (elEmi) elEmi.textContent = `₹${Math.round(emi).toLocaleString('en-IN')}`;
    if (elInterest) elInterest.textContent = `₹${Math.round(totalInterest).toLocaleString('en-IN')}`;
    if (elTotal) elTotal.textContent = `₹${Math.round(totalPayment).toLocaleString('en-IN')}`;
    if (elPrincipal) elPrincipal.textContent = `₹${Math.round(principal).toLocaleString('en-IN')}`;

    // Render Donut Chart
    if (window.XestusChart && document.getElementById('loan-chart-container')) {
      window.XestusChart.renderDonut(
        'loan-chart-container',
        [
          { label: 'Principal Amount', value: Math.round(principal), color: '#10B981' },
          { label: 'Total Interest', value: Math.round(totalInterest), color: '#3B82F6' }
        ],
        'Monthly EMI',
        `₹${Math.round(emi).toLocaleString('en-IN')}`
      );
    }

    // Prepayment & Amortization Simulation
    const lumpSum = parseFloat(document.getElementById('prepay-lump-sum')?.value) || 0;
    const lumpYear = parseInt(document.getElementById('prepay-lump-year')?.value, 10) || 1;
    const extraMonthly = parseFloat(document.getElementById('prepay-extra-monthly')?.value) || 0;

    generateAmortizationSchedule(principal, monthlyRate, emi, totalMonths, lumpSum, lumpYear, extraMonthly, totalInterest);
  }

  function generateAmortizationSchedule(principal, monthlyRate, emi, totalMonths, lumpSum, lumpYear, extraMonthly, origTotalInterest) {
    let balance = principal;
    let actualTotalInterest = 0;
    let actualMonthsTaken = 0;
    const yearlyMap = {};
    amortizationData = [];

    const lumpMonth = lumpYear * 12;

    for (let m = 1; m <= totalMonths; m++) {
      if (balance <= 0) break;

      actualMonthsTaken = m;
      const monthInterest = balance * monthlyRate;
      let monthPrincipal = emi - monthInterest;

      // Add extra monthly prepayment
      if (extraMonthly > 0) {
        monthPrincipal += extraMonthly;
      }

      // Add lump sum prepayment on specific month
      if (m === lumpMonth && lumpSum > 0) {
        monthPrincipal += lumpSum;
      }

      if (monthPrincipal > balance) {
        monthPrincipal = balance;
      }

      actualTotalInterest += monthInterest;
      const openingBal = balance;
      balance = Math.max(0, balance - monthPrincipal);

      const yearIndex = Math.ceil(m / 12);
      if (!yearlyMap[yearIndex]) {
        yearlyMap[yearIndex] = {
          year: yearIndex,
          opening: openingBal,
          principalPaid: 0,
          interestPaid: 0,
          closing: balance
        };
      }
      yearlyMap[yearIndex].principalPaid += monthPrincipal;
      yearlyMap[yearIndex].interestPaid += monthInterest;
      yearlyMap[yearIndex].closing = balance;

      amortizationData.push({
        month: m,
        year: yearIndex,
        opening: openingBal,
        emi: monthPrincipal + monthInterest,
        principal: monthPrincipal,
        interest: monthInterest,
        closing: balance
      });
    }

    // Prepayment savings calculation
    const interestSaved = Math.max(0, origTotalInterest - actualTotalInterest);
    const monthsSaved = Math.max(0, totalMonths - actualMonthsTaken);
    const yearsSaved = (monthsSaved / 12).toFixed(1);

    const elInterestSaved = document.getElementById('res-prepay-saved-interest');
    const elTenureSaved = document.getElementById('res-prepay-saved-tenure');
    const prepayNotice = document.getElementById('prepay-savings-card');

    if (elInterestSaved && elTenureSaved) {
      elInterestSaved.textContent = `₹${Math.round(interestSaved).toLocaleString('en-IN')}`;
      elTenureSaved.textContent = `${monthsSaved} Months (~${yearsSaved} Years)`;
      if (prepayNotice) {
        prepayNotice.style.display = (lumpSum > 0 || extraMonthly > 0) ? 'block' : 'none';
      }
    }

    // Populate Amortization HTML Table
    const tbody = document.getElementById('amortization-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    Object.keys(yearlyMap).forEach(yr => {
      const y = yearlyMap[yr];
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:700;text-align:center;">Year ${y.year}</td>
        <td class="font-mono">₹${Math.round(y.opening).toLocaleString('en-IN')}</td>
        <td class="font-mono" style="color:#10B981;font-weight:700;">₹${Math.round(y.principalPaid).toLocaleString('en-IN')}</td>
        <td class="font-mono" style="color:#3B82F6;">₹${Math.round(y.interestPaid).toLocaleString('en-IN')}</td>
        <td class="font-mono">₹${Math.round(y.principalPaid + y.interestPaid).toLocaleString('en-IN')}</td>
        <td class="font-mono" style="font-weight:700;">₹${Math.round(y.closing).toLocaleString('en-IN')}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function exportAmortizationCSV() {
    if (!amortizationData.length) {
      window.Xestus.toast('No amortization data to export.');
      return;
    }

    let csv = 'Month,Year,Opening Balance,Total Payment,Principal,Interest,Closing Balance\n';
    amortizationData.forEach(row => {
      csv += `${row.month},${row.year},${row.opening.toFixed(2)},${row.emi.toFixed(2)},${row.principal.toFixed(2)},${row.interest.toFixed(2)},${row.closing.toFixed(2)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Loan_Amortization_Schedule_XESTUS.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.Xestus.toast('Amortization schedule CSV downloaded!');
  }

  document.addEventListener('DOMContentLoaded', initLoanCalculator);

})();


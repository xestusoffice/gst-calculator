/**
 * Indian GST Tax Invoice Generator Engine - Powered by XESTUS Company
 * 100% Indian GST Rule 46 Compliant - Pure In-Browser Execution
 * Instant PDF Printing & Local Drafts - Physical Leak Proof
 */

(function () {
  'use strict';

  // Indian States & State Codes for GST
  const GST_STATES = [
    { code: '01', name: 'Jammu and Kashmir' },
    { code: '02', name: 'Himachal Pradesh' },
    { code: '03', name: 'Punjab' },
    { code: '04', name: 'Chandigarh' },
    { code: '05', name: 'Uttarakhand' },
    { code: '06', name: 'Haryana' },
    { code: '07', name: 'Delhi' },
    { code: '08', name: 'Rajasthan' },
    { code: '09', name: 'Uttar Pradesh' },
    { code: '10', name: 'Bihar' },
    { code: '11', name: 'Sikkim' },
    { code: '12', name: 'Arunachal Pradesh' },
    { code: '13', name: 'Nagaland' },
    { code: '14', name: 'Manipur' },
    { code: '15', name: 'Mizoram' },
    { code: '16', name: 'Tripura' },
    { code: '17', name: 'Meghalaya' },
    { code: '18', name: 'Assam' },
    { code: '19', name: 'West Bengal' },
    { code: '20', name: 'Jharkhand' },
    { code: '21', name: 'Odisha' },
    { code: '22', name: 'Chhattisgarh' },
    { code: '23', name: 'Madhya Pradesh' },
    { code: '24', name: 'Gujarat' },
    { code: '27', name: 'Maharashtra' },
    { code: '29', name: 'Karnataka' },
    { code: '30', name: 'Goa' },
    { code: '32', name: 'Kerala' },
    { code: '33', name: 'Tamil Nadu' },
    { code: '36', name: 'Telangana' },
    { code: '37', name: 'Andhra Pradesh' },
    { code: '38', name: 'Ladakh' }
  ];

  let invoiceItems = [
    { desc: 'Web & UI Architecture Consulting Services', hsn: '998314', qty: 1, unit: 'Project', rate: 75000, discount: 0, taxRate: 18 }
  ];

  let customLogoData = '';

  function initInvoiceForm() {
    populateStateDropdowns();
    initDates();
    renderInvoiceRows();
    attachInvoiceEvents();
    calculateInvoice();
  }

  function initDates() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const invDateEl = document.getElementById('inv-date');
    const invDueDateEl = document.getElementById('inv-due-date');

    if (invDateEl && !invDateEl.value) invDateEl.value = todayStr;
    if (invDueDateEl && !invDueDateEl.value) invDueDateEl.value = dueDateStr;
  }

  function populateStateDropdowns() {
    const sellerSelect = document.getElementById('inv-seller-state');
    const buyerSelect = document.getElementById('inv-buyer-state');
    const posSelect = document.getElementById('inv-pos-state');

    const options = GST_STATES.map(s => `<option value="${s.code}">${s.code} - ${s.name}</option>`).join('');

    if (sellerSelect) {
      sellerSelect.innerHTML = options;
      sellerSelect.value = '27'; // Default Maharashtra
    }
    if (buyerSelect) {
      buyerSelect.innerHTML = options;
      buyerSelect.value = '27';
    }
    if (posSelect) {
      posSelect.innerHTML = options;
      posSelect.value = '27';
    }
  }

  function renderInvoiceRows() {
    const tbody = document.getElementById('inv-items-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    invoiceItems.forEach((item, idx) => {
      const taxable = item.qty * item.rate * (1 - (item.discount / 100));
      const taxAmount = (taxable * item.taxRate) / 100;
      const total = taxable + taxAmount;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="width:30px;text-align:center;">${idx + 1}</td>
        <td>
          <input type="text" class="inv-item-desc" data-idx="${idx}" value="${window.Xestus.escapeHTML(item.desc)}" placeholder="Item description" style="padding:0.4rem;font-size:0.875rem;">
        </td>
        <td style="width:90px;">
          <input type="text" class="inv-item-hsn" data-idx="${idx}" value="${window.Xestus.escapeHTML(item.hsn)}" placeholder="HSN/SAC" style="padding:0.4rem;font-size:0.875rem;">
        </td>
        <td style="width:70px;">
          <input type="number" step="any" min="0" class="inv-item-qty" data-idx="${idx}" value="${item.qty}" style="padding:0.4rem;font-size:0.875rem;text-align:right;">
        </td>
        <td style="width:75px;">
          <input type="text" class="inv-item-unit" data-idx="${idx}" value="${window.Xestus.escapeHTML(item.unit)}" placeholder="Nos" style="padding:0.4rem;font-size:0.875rem;">
        </td>
        <td style="width:110px;">
          <input type="number" step="any" min="0" class="inv-item-rate" data-idx="${idx}" value="${item.rate}" style="padding:0.4rem;font-size:0.875rem;text-align:right;">
        </td>
        <td style="width:70px;">
          <input type="number" step="any" min="0" max="100" class="inv-item-disc" data-idx="${idx}" value="${item.discount}" style="padding:0.4rem;font-size:0.875rem;text-align:right;">
        </td>
        <td style="width:85px;">
          <select class="inv-item-tax" data-idx="${idx}" style="padding:0.4rem;font-size:0.875rem;">
            <option value="0" ${item.taxRate === 0 ? 'selected' : ''}>0%</option>
            <option value="5" ${item.taxRate === 5 ? 'selected' : ''}>5%</option>
            <option value="12" ${item.taxRate === 12 ? 'selected' : ''}>12%</option>
            <option value="18" ${item.taxRate === 18 ? 'selected' : ''}>18%</option>
            <option value="28" ${item.taxRate === 28 ? 'selected' : ''}>28%</option>
          </select>
        </td>
        <td class="font-mono" style="text-align:right;font-weight:700;width:110px;">
          ₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
        <td style="width:35px;text-align:center;">
          <button type="button" class="inv-item-remove" data-idx="${idx}" style="color:var(--accent-danger);font-size:1.2rem;cursor:pointer;" title="Remove Item">&times;</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Row input bindings
    tbody.querySelectorAll('.inv-item-desc').forEach(el => el.addEventListener('input', e => {
      invoiceItems[e.target.dataset.idx].desc = e.target.value;
      calculateInvoice();
    }));
    tbody.querySelectorAll('.inv-item-hsn').forEach(el => el.addEventListener('input', e => {
      invoiceItems[e.target.dataset.idx].hsn = e.target.value;
      calculateInvoice();
    }));
    tbody.querySelectorAll('.inv-item-qty').forEach(el => el.addEventListener('input', e => {
      invoiceItems[e.target.dataset.idx].qty = parseFloat(e.target.value) || 0;
      calculateInvoice();
    }));
    tbody.querySelectorAll('.inv-item-unit').forEach(el => el.addEventListener('input', e => {
      invoiceItems[e.target.dataset.idx].unit = e.target.value;
      calculateInvoice();
    }));
    tbody.querySelectorAll('.inv-item-rate').forEach(el => el.addEventListener('input', e => {
      invoiceItems[e.target.dataset.idx].rate = parseFloat(e.target.value) || 0;
      calculateInvoice();
    }));
    tbody.querySelectorAll('.inv-item-disc').forEach(el => el.addEventListener('input', e => {
      invoiceItems[e.target.dataset.idx].discount = parseFloat(e.target.value) || 0;
      calculateInvoice();
    }));
    tbody.querySelectorAll('.inv-item-tax').forEach(el => el.addEventListener('change', e => {
      invoiceItems[e.target.dataset.idx].taxRate = parseFloat(e.target.value) || 0;
      calculateInvoice();
    }));
    tbody.querySelectorAll('.inv-item-remove').forEach(el => el.addEventListener('click', e => {
      const idx = parseInt(e.target.dataset.idx, 10);
      if (invoiceItems.length > 1) {
        invoiceItems.splice(idx, 1);
        renderInvoiceRows();
        calculateInvoice();
      } else {
        window.Xestus.toast('At least one line item is required.');
      }
    }));
  }

  function calculateInvoice() {
    const sellerState = document.getElementById('inv-seller-state') ? document.getElementById('inv-seller-state').value : '27';
    const posState = document.getElementById('inv-pos-state') ? document.getElementById('inv-pos-state').value : '27';
    const isIntraState = (sellerState === posState);

    let subtotalTaxable = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    const hsnSummary = {};

    invoiceItems.forEach(item => {
      const taxable = item.qty * item.rate * (1 - (item.discount / 100));
      subtotalTaxable += taxable;

      const taxAmount = (taxable * item.taxRate) / 100;
      let cgst = 0;
      let sgst = 0;
      let igst = 0;

      if (isIntraState) {
        cgst = taxAmount / 2;
        sgst = taxAmount / 2;
        totalCgst += cgst;
        totalSgst += sgst;
      } else {
        igst = taxAmount;
        totalIgst += igst;
      }

      // HSN Grouping
      const hsnKey = item.hsn || '99';
      if (!hsnSummary[hsnKey]) {
        hsnSummary[hsnKey] = { taxable: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0 };
      }
      hsnSummary[hsnKey].taxable += taxable;
      hsnSummary[hsnKey].cgst += cgst;
      hsnSummary[hsnKey].sgst += sgst;
      hsnSummary[hsnKey].igst += igst;
      hsnSummary[hsnKey].totalTax += taxAmount;
    });

    const totalTax = totalCgst + totalSgst + totalIgst;
    const grandTotal = Math.round(subtotalTaxable + totalTax);
    const roundOff = grandTotal - (subtotalTaxable + totalTax);

    // Update Live Form Totals
    const formSubtotal = document.getElementById('inv-subtotal');
    const formCgst = document.getElementById('inv-cgst');
    const formSgst = document.getElementById('inv-sgst');
    const formIgst = document.getElementById('inv-igst');
    const formRoundoff = document.getElementById('inv-roundoff');
    const formGrandTotal = document.getElementById('inv-grand-total');

    if (formSubtotal) formSubtotal.textContent = `₹${subtotalTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    if (formCgst) formCgst.textContent = `₹${totalCgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    if (formSgst) formSgst.textContent = `₹${totalSgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    if (formIgst) formIgst.textContent = `₹${totalIgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    if (formRoundoff) formRoundoff.textContent = `₹${roundOff.toFixed(2)}`;
    if (formGrandTotal) formGrandTotal.textContent = `₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    const cgstRow = document.getElementById('inv-cgst-row');
    const sgstRow = document.getElementById('inv-sgst-row');
    const igstRow = document.getElementById('inv-igst-row');
    if (cgstRow) cgstRow.style.display = isIntraState ? 'flex' : 'none';
    if (sgstRow) sgstRow.style.display = isIntraState ? 'flex' : 'none';
    if (igstRow) igstRow.style.display = isIntraState ? 'none' : 'flex';

    updatePreview(subtotalTaxable, totalCgst, totalSgst, totalIgst, roundOff, grandTotal, hsnSummary, isIntraState);
  }

  function updatePreview(taxable, cgst, sgst, igst, roundOff, grandTotal, hsnSummary, isIntraState) {
    const preview = document.getElementById('invoice-preview-container');
    if (!preview) return;

    const sellerName = document.getElementById('inv-seller-name')?.value || 'YOUR BUSINESS NAME';
    const sellerGstin = document.getElementById('inv-seller-gstin')?.value || '27AAAAA0000A1Z5';
    const sellerPan = document.getElementById('inv-seller-pan')?.value || 'AAAAA0000A';
    const sellerAddr = document.getElementById('inv-seller-address')?.value || 'Tech Park, Andheri East, Mumbai, Maharashtra';
    const sellerPhone = document.getElementById('inv-seller-phone')?.value || '+91 98765 43210';

    const buyerName = document.getElementById('inv-buyer-name')?.value || 'CLIENT ENTERPRISE PVT LTD';
    const buyerGstin = document.getElementById('inv-buyer-gstin')?.value || '27BBBBB1111B1Z2';
    const buyerPan = document.getElementById('inv-buyer-pan')?.value || 'BBBBB1111B';
    const buyerAddr = document.getElementById('inv-buyer-address')?.value || 'Cyber City, Sector 24, Gurugram, Haryana';

    const invNumber = document.getElementById('inv-number')?.value || 'INV-2026-001';
    const invDate = document.getElementById('inv-date')?.value || new Date().toISOString().split('T')[0];
    const invDueDate = document.getElementById('inv-due-date')?.value || '';
    const reverseCharge = document.getElementById('inv-reverse-charge')?.value || 'No';

    const sellerStateCode = document.getElementById('inv-seller-state')?.value || '27';
    const posCode = document.getElementById('inv-pos-state')?.value || '27';
    const sellerStateName = GST_STATES.find(s => s.code === sellerStateCode)?.name || '';
    const posStateName = GST_STATES.find(s => s.code === posCode)?.name || '';

    const bankName = document.getElementById('inv-bank-name')?.value || 'HDFC Bank';
    const bankAccount = document.getElementById('inv-bank-acc')?.value || '50200012345678';
    const bankIfsc = document.getElementById('inv-bank-ifsc')?.value || 'HDFC0001234';
    const bankUpi = document.getElementById('inv-bank-upi')?.value || 'business@okhdfcbank';
    const terms = document.getElementById('inv-terms')?.value || '1. Payment due within 15 days from date of invoice.\n2. Please quote invoice number during wire transfer.\n3. Subject to local court jurisdiction.';

    let itemsTableRows = '';
    invoiceItems.forEach((it, idx) => {
      const itemTaxable = it.qty * it.rate * (1 - (it.discount / 100));
      const itemTax = (itemTaxable * it.taxRate) / 100;
      const itemGross = itemTaxable + itemTax;

      itemsTableRows += `
        <tr>
          <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;">${idx + 1}</td>
          <td style="border:1px solid #cbd5e1;padding:6px;">${window.Xestus.escapeHTML(it.desc)}</td>
          <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;">${window.Xestus.escapeHTML(it.hsn)}</td>
          <td style="border:1px solid #cbd5e1;padding:6px;text-align:right;">${it.qty} ${window.Xestus.escapeHTML(it.unit)}</td>
          <td style="border:1px solid #cbd5e1;padding:6px;text-align:right;">₹${it.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td style="border:1px solid #cbd5e1;padding:6px;text-align:right;">${it.discount}%</td>
          <td style="border:1px solid #cbd5e1;padding:6px;text-align:right;">₹${itemTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;">${it.taxRate}%</td>
          <td style="border:1px solid #cbd5e1;padding:6px;text-align:right;font-weight:700;">₹${itemGross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
      `;
    });

    let hsnRows = '';
    if (hsnSummary) {
      Object.keys(hsnSummary).forEach(hsn => {
        const item = hsnSummary[hsn];
        hsnRows += `
          <tr>
            <td style="border:1px solid #cbd5e1;padding:4px 6px;text-align:center;">${hsn}</td>
            <td style="border:1px solid #cbd5e1;padding:4px 6px;text-align:right;">₹${item.taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            ${isIntraState ? `
              <td style="border:1px solid #cbd5e1;padding:4px 6px;text-align:right;">₹${item.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td style="border:1px solid #cbd5e1;padding:4px 6px;text-align:right;">₹${item.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            ` : `
              <td style="border:1px solid #cbd5e1;padding:4px 6px;text-align:right;">₹${item.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            `}
            <td style="border:1px solid #cbd5e1;padding:4px 6px;text-align:right;font-weight:700;">₹${item.totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
        `;
      });
    }

    const wordsTotal = window.Xestus.numberToWords(grandTotal || 0);

    preview.innerHTML = `
      <div class="invoice-paper" style="background:#ffffff;color:#0f172a;padding:2rem;border:1px solid #e2e8f0;border-radius:8px;font-family:system-ui,-apple-system,sans-serif;font-size:12px;line-height:1.4;box-shadow:0 4px 6px rgba(0,0,0,0.05);max-width:800px;margin:0 auto;">
        
        <!-- Header & Branding -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #059669;padding-bottom:1rem;margin-bottom:1rem;">
          <div>
            ${customLogoData ? `<img src="${customLogoData}" alt="Company Logo" style="max-height:50px;max-width:160px;margin-bottom:6px;display:block;">` : ''}
            <div style="font-size:1.4rem;font-weight:800;color:#059669;letter-spacing:-0.02em;">${window.Xestus.escapeHTML(sellerName)}</div>
            <div style="color:#475569;margin-top:2px;">${window.Xestus.escapeHTML(sellerAddr)}</div>
            <div style="margin-top:4px;"><strong>GSTIN:</strong> ${window.Xestus.escapeHTML(sellerGstin)} | <strong>PAN:</strong> ${window.Xestus.escapeHTML(sellerPan)}</div>
            <div><strong>State:</strong> ${sellerStateName} (${sellerStateCode}) | <strong>Phone:</strong> ${window.Xestus.escapeHTML(sellerPhone)}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:1.3rem;font-weight:800;color:#1e293b;text-transform:uppercase;">TAX INVOICE</div>
            <div style="font-size:10px;color:#64748b;margin-bottom:4px;">(Indian GST Rule 46 Compliant)</div>
            <div><strong>Invoice No:</strong> ${window.Xestus.escapeHTML(invNumber)}</div>
            <div><strong>Date:</strong> ${invDate}</div>
            ${invDueDate ? `<div><strong>Due Date:</strong> ${invDueDate}</div>` : ''}
            <div><strong>Place of Supply:</strong> ${posStateName} (${posCode})</div>
            <div><strong>Reverse Charge:</strong> ${reverseCharge}</div>
          </div>
        </div>

        <!-- Bill To Details -->
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;padding:0.75rem;margin-bottom:1rem;">
          <div style="font-size:11px;font-weight:700;color:#059669;text-transform:uppercase;margin-bottom:4px;">Billed To (Recipient Details):</div>
          <div style="font-size:13px;font-weight:700;">${window.Xestus.escapeHTML(buyerName)}</div>
          <div>${window.Xestus.escapeHTML(buyerAddr)}</div>
          <div><strong>GSTIN/UIN:</strong> ${window.Xestus.escapeHTML(buyerGstin)} | <strong>PAN:</strong> ${window.Xestus.escapeHTML(buyerPan)}</div>
        </div>

        <!-- Line Items Table -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:1rem;">
          <thead>
            <tr style="background:#f1f5f9;color:#334155;font-weight:700;">
              <th style="border:1px solid #cbd5e1;padding:6px;text-align:center;">#</th>
              <th style="border:1px solid #cbd5e1;padding:6px;text-align:left;">Item & Description</th>
              <th style="border:1px solid #cbd5e1;padding:6px;text-align:center;">HSN/SAC</th>
              <th style="border:1px solid #cbd5e1;padding:6px;text-align:right;">Qty</th>
              <th style="border:1px solid #cbd5e1;padding:6px;text-align:right;">Rate</th>
              <th style="border:1px solid #cbd5e1;padding:6px;text-align:right;">Disc%</th>
              <th style="border:1px solid #cbd5e1;padding:6px;text-align:right;">Taxable Val</th>
              <th style="border:1px solid #cbd5e1;padding:6px;text-align:center;">GST</th>
              <th style="border:1px solid #cbd5e1;padding:6px;text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsTableRows}
          </tbody>
        </table>

        <!-- Totals & Bank Details Grid -->
        <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:1.5rem;margin-bottom:1rem;">
          <div>
            <!-- Bank Details -->
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;padding:0.75rem;margin-bottom:0.75rem;">
              <div style="font-weight:700;color:#059669;margin-bottom:4px;font-size:11px;text-transform:uppercase;">Bank Payment Coordinates:</div>
              <div><strong>Bank Name:</strong> ${window.Xestus.escapeHTML(bankName)}</div>
              <div><strong>Account No:</strong> ${window.Xestus.escapeHTML(bankAccount)}</div>
              <div><strong>IFSC Code:</strong> ${window.Xestus.escapeHTML(bankIfsc)}</div>
              ${bankUpi ? `<div><strong>UPI ID:</strong> ${window.Xestus.escapeHTML(bankUpi)}</div>` : ''}
            </div>

            <!-- Amount in words -->
            <div style="font-size:11px;padding:0.5rem;background:#f1f5f9;border-left:3px solid #059669;border-radius:2px;">
              <strong>Amount in Words:</strong><br>
              <span style="font-weight:700;color:#0f172a;">${wordsTotal}</span>
            </div>
          </div>

          <!-- Total Calculation Table -->
          <div style="border:1px solid #e2e8f0;border-radius:4px;overflow:hidden;">
            <div style="display:flex;justify-content:space-between;padding:5px 8px;border-bottom:1px solid #f1f5f9;">
              <span>Taxable Value:</span>
              <strong style="font-family:monospace;">₹${(taxable || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>
            ${isIntraState ? `
              <div style="display:flex;justify-content:space-between;padding:5px 8px;border-bottom:1px solid #f1f5f9;">
                <span>CGST:</span>
                <strong style="font-family:monospace;">₹${(cgst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div style="display:flex;justify-content:space-between;padding:5px 8px;border-bottom:1px solid #f1f5f9;">
                <span>SGST:</span>
                <strong style="font-family:monospace;">₹${(sgst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
            ` : `
              <div style="display:flex;justify-content:space-between;padding:5px 8px;border-bottom:1px solid #f1f5f9;">
                <span>IGST:</span>
                <strong style="font-family:monospace;">₹${(igst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
            `}
            <div style="display:flex;justify-content:space-between;padding:5px 8px;border-bottom:1px solid #f1f5f9;">
              <span>Round Off:</span>
              <strong style="font-family:monospace;">₹${(roundOff || 0).toFixed(2)}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px;background:#059669;color:#ffffff;font-size:14px;font-weight:800;">
              <span>Grand Total:</span>
              <span style="font-family:monospace;">₹${(grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <!-- HSN Summary Table -->
        <div style="margin-bottom:1rem;">
          <div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:4px;">HSN / SAC Tax Breakup:</div>
          <table style="width:100%;border-collapse:collapse;font-size:11px;">
            <thead>
              <tr style="background:#f1f5f9;color:#475569;">
                <th style="border:1px solid #cbd5e1;padding:4px;text-align:center;">HSN/SAC</th>
                <th style="border:1px solid #cbd5e1;padding:4px;text-align:right;">Taxable Amt</th>
                ${isIntraState ? `
                  <th style="border:1px solid #cbd5e1;padding:4px;text-align:right;">CGST</th>
                  <th style="border:1px solid #cbd5e1;padding:4px;text-align:right;">SGST</th>
                ` : `
                  <th style="border:1px solid #cbd5e1;padding:4px;text-align:right;">IGST</th>
                `}
                <th style="border:1px solid #cbd5e1;padding:4px;text-align:right;">Total Tax</th>
              </tr>
            </thead>
            <tbody>
              ${hsnRows}
            </tbody>
          </table>
        </div>

        <!-- Terms & Signature -->
        <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:1.5rem;padding-top:1rem;border-top:1px dashed #cbd5e1;">
          <div style="width:58%;font-size:10px;color:#64748b;white-space:pre-line;">
            <strong>Terms & Conditions:</strong><br>${window.Xestus.escapeHTML(terms)}
          </div>
          <div style="text-align:center;width:35%;">
            <div style="font-size:11px;font-weight:700;color:#1e293b;margin-bottom:40px;">For ${window.Xestus.escapeHTML(sellerName)}</div>
            <div style="border-top:1px solid #94a3b8;font-size:10px;color:#475569;padding-top:4px;">Authorised Signatory</div>
          </div>
        </div>

        <div style="text-align:center;font-size:9px;color:#94a3b8;margin-top:1.25rem;">
          Created with GST Calculator & Tax Suite • Powered by XESTUS Company (100% In-Browser Privacy)
        </div>
      </div>
    `;
  }

  function attachInvoiceEvents() {
    // Add Item Button
    const addItemBtn = document.getElementById('btn-inv-add-item');
    if (addItemBtn) {
      addItemBtn.addEventListener('click', () => {
        invoiceItems.push({ desc: 'Professional Services', hsn: '9983', qty: 1, unit: 'Nos', rate: 10000, discount: 0, taxRate: 18 });
        renderInvoiceRows();
        calculateInvoice();
      });
    }

    // Input listeners for seller/buyer details
    const watchInputIds = [
      'inv-seller-name', 'inv-seller-gstin', 'inv-seller-pan', 'inv-seller-address', 'inv-seller-phone', 'inv-seller-email',
      'inv-buyer-name', 'inv-buyer-gstin', 'inv-buyer-pan', 'inv-buyer-address',
      'inv-number', 'inv-date', 'inv-due-date', 'inv-reverse-charge',
      'inv-seller-state', 'inv-buyer-state', 'inv-pos-state',
      'inv-bank-name', 'inv-bank-acc', 'inv-bank-ifsc', 'inv-bank-upi', 'inv-terms'
    ];

    watchInputIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', calculateInvoice);
        el.addEventListener('change', calculateInvoice);
      }
    });

    // Optional Logo Upload
    const logoInput = document.getElementById('inv-logo-input');
    if (logoInput) {
      logoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (re) => {
            customLogoData = re.target.result;
            calculateInvoice();
            window.Xestus.toast('Logo loaded onto invoice preview!');
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Print / PDF Button
    const printBtn = document.getElementById('btn-inv-print');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Save Draft locally
    const saveBtn = document.getElementById('btn-inv-save-draft');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const draftData = {
          items: invoiceItems,
          seller: {
            name: document.getElementById('inv-seller-name')?.value,
            gstin: document.getElementById('inv-seller-gstin')?.value,
            pan: document.getElementById('inv-seller-pan')?.value,
            addr: document.getElementById('inv-seller-address')?.value,
            phone: document.getElementById('inv-seller-phone')?.value,
            email: document.getElementById('inv-seller-email')?.value,
            state: document.getElementById('inv-seller-state')?.value
          },
          buyer: {
            name: document.getElementById('inv-buyer-name')?.value,
            gstin: document.getElementById('inv-buyer-gstin')?.value,
            pan: document.getElementById('inv-buyer-pan')?.value,
            addr: document.getElementById('inv-buyer-address')?.value,
            state: document.getElementById('inv-buyer-state')?.value
          },
          meta: {
            num: document.getElementById('inv-number')?.value,
            date: document.getElementById('inv-date')?.value,
            pos: document.getElementById('inv-pos-state')?.value
          }
        };
        try {
          localStorage.setItem('xestus_invoice_draft', JSON.stringify(draftData));
          window.Xestus.toast('Invoice draft saved securely to browser memory!');
        } catch (e) {
          window.Xestus.toast('Unable to save draft.');
        }
      });
    }

    // Load Draft
    const loadBtn = document.getElementById('btn-inv-load-draft');
    if (loadBtn) {
      loadBtn.addEventListener('click', () => {
        try {
          const raw = localStorage.getItem('xestus_invoice_draft');
          if (!raw) {
            window.Xestus.toast('No saved draft found.');
            return;
          }
          const data = JSON.parse(raw);
          if (data.items) invoiceItems = data.items;
          if (data.seller) {
            if (document.getElementById('inv-seller-name')) document.getElementById('inv-seller-name').value = data.seller.name || '';
            if (document.getElementById('inv-seller-gstin')) document.getElementById('inv-seller-gstin').value = data.seller.gstin || '';
            if (document.getElementById('inv-seller-pan')) document.getElementById('inv-seller-pan').value = data.seller.pan || '';
            if (document.getElementById('inv-seller-address')) document.getElementById('inv-seller-address').value = data.seller.addr || '';
            if (document.getElementById('inv-seller-state')) document.getElementById('inv-seller-state').value = data.seller.state || '27';
          }
          if (data.buyer) {
            if (document.getElementById('inv-buyer-name')) document.getElementById('inv-buyer-name').value = data.buyer.name || '';
            if (document.getElementById('inv-buyer-gstin')) document.getElementById('inv-buyer-gstin').value = data.buyer.gstin || '';
            if (document.getElementById('inv-buyer-address')) document.getElementById('inv-buyer-address').value = data.buyer.addr || '';
            if (document.getElementById('inv-buyer-state')) document.getElementById('inv-buyer-state').value = data.buyer.state || '27';
          }
          if (data.meta) {
            if (document.getElementById('inv-number')) document.getElementById('inv-number').value = data.meta.num || '';
            if (document.getElementById('inv-pos-state')) document.getElementById('inv-pos-state').value = data.meta.pos || '27';
          }
          renderInvoiceRows();
          calculateInvoice();
          window.Xestus.toast('Draft loaded successfully!');
        } catch (e) {
          window.Xestus.toast('Failed to load draft.');
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', initInvoiceForm);

})();

/**
 * XESTUS High-Performance SVG Chart Generator
 * 100% Vanilla JS & Inline SVG - Zero External Dependencies (<4KB)
 * Lighthouse 100 Performance Friendly
 */

const XestusChart = {
  /**
   * Render an interactive Donut Chart
   * @param {string} containerId - Element ID where SVG is inserted
   * @param {Array<{label: string, value: number, color: string}>} data
   * @param {string} centerLabel
   * @param {string} centerValue
   */
  renderDonut(containerId, data, centerLabel = '', centerValue = '') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const total = data.reduce((acc, item) => acc + (item.value || 0), 0);
    if (total <= 0) {
      container.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-muted);">No data to display</div>';
      return;
    }

    const size = 260;
    const strokeWidth = 32;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    let accumulatedAngle = -90; // Start at top
    let paths = '';

    data.forEach((item, index) => {
      const percentage = (item.value / total);
      const dashLength = percentage * circumference;
      const strokeDasharray = `${dashLength} ${circumference - dashLength}`;
      const rotation = accumulatedAngle;
      accumulatedAngle += percentage * 360;

      paths += `
        <circle
          cx="${center}"
          cy="${center}"
          r="${radius}"
          fill="transparent"
          stroke="${item.color}"
          stroke-width="${strokeWidth}"
          stroke-dasharray="${strokeDasharray}"
          stroke-dashoffset="0"
          transform="rotate(${rotation} ${center} ${center})"
          class="donut-segment"
          data-label="${item.label}"
          data-value="${item.value}"
          data-percentage="${(percentage * 100).toFixed(1)}%"
          style="transition: stroke-dasharray 0.6s ease;"
        >
          <title>${item.label}: ₹${item.value.toLocaleString('en-IN')} (${(percentage * 100).toFixed(1)}%)</title>
        </circle>
      `;
    });

    const legendHtml = data.map(item => {
      const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
      return `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.4rem;font-size:0.875rem;">
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <span style="width:10px;height:10px;border-radius:50%;background-color:${item.color};"></span>
            <span style="color:var(--text-secondary);">${item.label}</span>
          </div>
          <span class="font-mono" style="font-weight:700;color:var(--text-primary);">₹${item.value.toLocaleString('en-IN')} (${pct}%)</span>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="position:relative;width:${size}px;height:${size}px;">
          <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="overflow:visible;">
            <circle cx="${center}" cy="${center}" r="${radius}" fill="transparent" stroke="var(--bg-tertiary)" stroke-width="${strokeWidth}" />
            ${paths}
          </svg>
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);text-align:center;pointer-events:none;">
            <div style="font-size:0.75rem;text-transform:uppercase;color:var(--text-muted);font-weight:600;">${centerLabel}</div>
            <div class="font-mono" style="font-size:1.15rem;font-weight:800;color:var(--text-primary);margin-top:0.2rem;">${centerValue}</div>
          </div>
        </div>
        <div style="width:100%;max-width:320px;margin-top:1.25rem;">
          ${legendHtml}
        </div>
      </div>
    `;
  },

  /**
   * Render an SVG Stacked Bar Chart for Compounding (SIP / Loan Amortization)
   * @param {string} containerId 
   * @param {Array<{year: number, bar1: number, bar2: number}>} items
   * @param {string} label1
   * @param {string} color1
   * @param {string} label2
   * @param {string} color2
   */
  renderGrowthBars(containerId, items, label1, color1, label2, color2) {
    const container = document.getElementById(containerId);
    if (!container || !items.length) return;

    const maxTotal = Math.max(...items.map(it => it.bar1 + it.bar2));
    if (maxTotal <= 0) return;

    const height = 220;
    const width = 100; // In % coordinates

    const barNodes = items.map((item, idx) => {
      const h1 = (item.bar1 / maxTotal) * 180;
      const h2 = (item.bar2 / maxTotal) * 180;
      const totalH = h1 + h2;
      const y2 = 200 - totalH;
      const y1 = 200 - h1;

      return `
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end;" title="Year ${item.year}: ${label1} ₹${item.bar1.toLocaleString('en-IN')}, ${label2} ₹${item.bar2.toLocaleString('en-IN')}">
          <div style="width:70%;max-width:28px;display:flex;flex-direction:column;height:${(totalH / 180) * 100}%;border-radius:4px 4px 0 0;overflow:hidden;">
            <div style="background-color:${color2};height:${(h2 / totalH) * 100}%;"></div>
            <div style="background-color:${color1};height:${(h1 / totalH) * 100}%;"></div>
          </div>
          <div style="font-size:0.7rem;color:var(--text-muted);margin-top:0.35rem;white-space:nowrap;">Y${item.year}</div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div style="width:100%;">
        <div style="display:flex;gap:1.5rem;justify-content:center;margin-bottom:1rem;font-size:0.85rem;">
          <div style="display:flex;align-items:center;gap:0.4rem;">
            <span style="width:10px;height:10px;border-radius:2px;background-color:${color1};"></span>
            <span style="color:var(--text-secondary);">${label1}</span>
          </div>
          <div style="display:flex;align-items:center;gap:0.4rem;">
            <span style="width:10px;height:10px;border-radius:2px;background-color:${color2};"></span>
            <span style="color:var(--text-secondary);">${label2}</span>
          </div>
        </div>
        <div style="display:flex;align-items:flex-end;height:${height}px;border-bottom:1px solid var(--border-color);padding-bottom:0.25rem;gap:0.25rem;">
          ${barNodes}
        </div>
      </div>
    `;
  }
};

window.XestusChart = XestusChart;

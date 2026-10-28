/**
 * XESTUS High-Performance SVG Chart Generator
 * 100% Vanilla JS & Responsive SVG - Zero External Dependencies (<4KB)
 * Lighthouse 100 Performance Friendly
 */

const XestusChart = {
  /**
   * Render an interactive Donut Chart
   */
  renderDonut(containerId, data, centerLabel = '', centerValue = '') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const total = data.reduce((acc, item) => acc + (item.value || 0), 0);
    if (total <= 0) {
      container.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-muted);">Enter an amount to see visual breakdown</div>';
      return;
    }

    const size = 260;
    const strokeWidth = 32;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    let accumulatedAngle = -90; // Start at 12 o'clock
    let paths = '';

    const currSymbol = (window.Xestus && window.Xestus.getCurrency) ? window.Xestus.getCurrency().symbol : '₹';
    const isIndian = (window.Xestus && window.Xestus.getCurrency) ? window.Xestus.getCurrency().system === 'indian' : true;
    const localeStr = isIndian ? 'en-IN' : 'en-US';

    data.forEach((item) => {
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
          style="transition: stroke-dasharray 0.5s ease;"
        >
          <title>${item.label}: ${currSymbol}${item.value.toLocaleString(localeStr)} (${(percentage * 100).toFixed(1)}%)</title>
        </circle>
      `;
    });

    const legendHtml = data.map(item => {
      const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
      return `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.4rem;font-size:0.875rem;">
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <span style="width:10px;height:10px;border-radius:50%;background-color:${item.color};flex-shrink:0;"></span>
            <span style="color:var(--text-secondary);">${item.label}</span>
          </div>
          <span class="font-mono" style="font-weight:700;color:var(--text-primary);">${currSymbol}${item.value.toLocaleString(localeStr)} (${pct}%)</span>
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
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);text-align:center;pointer-events:none;width:80%;">
            <div style="font-size:0.75rem;text-transform:uppercase;color:var(--text-muted);font-weight:700;letter-spacing:0.04em;">${centerLabel}</div>
            <div class="font-mono" style="font-size:1.15rem;font-weight:800;color:var(--text-primary);margin-top:0.2rem;word-break:break-word;">${centerValue}</div>
          </div>
        </div>
        <div style="width:100%;max-width:320px;margin-top:1.25rem;">
          ${legendHtml}
        </div>
      </div>
    `;
  },

  /**
   * Render an SVG Stacked Bar Chart for Compounding (SIP & Loan Amortization)
   */
  renderGrowthBars(containerId, items, label1, color1, label2, color2) {
    const container = document.getElementById(containerId);
    if (!container || !items.length) return;

    const maxTotal = Math.max(...items.map(it => it.bar1 + it.bar2));
    if (maxTotal <= 0) return;

    const height = 220;

    // Filter or sample items if duration is high to prevent mobile crowding
    let displayItems = items;
    if (items.length > 20) {
      displayItems = items.filter((it, idx) => (idx + 1) % 2 === 0 || idx === items.length - 1);
    }

    const currSymbol = (window.Xestus && window.Xestus.getCurrency) ? window.Xestus.getCurrency().symbol : '₹';
    const isIndian = (window.Xestus && window.Xestus.getCurrency) ? window.Xestus.getCurrency().system === 'indian' : true;
    const localeStr = isIndian ? 'en-IN' : 'en-US';

    const barNodes = displayItems.map((item) => {
      const h1 = (item.bar1 / maxTotal) * 170;
      const h2 = (item.bar2 / maxTotal) * 170;
      const totalH = Math.max(1, h1 + h2);

      return `
        <div style="flex:1;min-width:18px;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end;" title="Year ${item.year}: ${label1} ${currSymbol}${item.bar1.toLocaleString(localeStr)}, ${label2} ${currSymbol}${item.bar2.toLocaleString(localeStr)}">
          <div style="width:75%;max-width:28px;display:flex;flex-direction:column;height:${(totalH / 170) * 100}%;border-radius:4px 4px 0 0;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.2);">
            <div style="background-color:${color2};height:${(h2 / totalH) * 100}%;"></div>
            <div style="background-color:${color1};height:${(h1 / totalH) * 100}%;"></div>
          </div>
          <div style="font-size:0.7rem;color:var(--text-muted);margin-top:0.35rem;white-space:nowrap;font-family:var(--font-mono);">Y${item.year}</div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div style="width:100%;">
        <div style="display:flex;gap:1.5rem;justify-content:center;margin-bottom:1rem;font-size:0.85rem;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:0.4rem;">
            <span style="width:12px;height:12px;border-radius:3px;background-color:${color1};"></span>
            <span style="color:var(--text-secondary);font-weight:600;">${label1}</span>
          </div>
          <div style="display:flex;align-items:center;gap:0.4rem;">
            <span style="width:12px;height:12px;border-radius:3px;background-color:${color2};"></span>
            <span style="color:var(--text-secondary);font-weight:600;">${label2}</span>
          </div>
        </div>
        <div style="overflow-x:auto;padding-bottom:0.5rem;">
          <div style="display:flex;align-items:flex-end;height:${height}px;border-bottom:1px solid var(--border-color);padding-bottom:0.25rem;gap:0.35rem;min-width:320px;">
            ${barNodes}
          </div>
        </div>
      </div>
    `;
  }
};

window.XestusChart = XestusChart;

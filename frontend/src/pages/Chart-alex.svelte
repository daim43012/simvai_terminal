<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Chart from 'chart.js/auto';
  import type {
    Chart as ChartJS,
    ChartConfiguration,
    ChartEvent,
    ActiveElement,
    Plugin
  } from 'chart.js';

  const API_URL = 'https://bot-advisor.com/api/robo-advisor/analytics';
  const BOT_NAME = 'AI_Analytic';
  const ICON_BASE = '/png_currency';

  let canvas: HTMLCanvasElement;
  let chart: ChartJS | null = null;
  let loading = true;
  let error: string | null = null;

  let labels: string[] = [];        
  let values: number[] = [];             
  let params: (string | null)[] = [];     

  function pick(obj: any, keys: string[]) {
    if (!obj) return undefined;
    const lower = Object.fromEntries(Object.keys(obj).map((k) => [k.toLowerCase(), obj[k]]));
    for (const k of keys) {
      const v = lower[k.toLowerCase()];
      if (v !== undefined && v !== null) return v;
    }
    return undefined;
  }

  async function fetchAndRender() {
    loading = true;
    error = null;

    try {
      const res = await fetch(API_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const rows: any[] = Array.isArray(json) ? json : [json];

      const filtered = rows
        .map((r) => {
          const bot = String(pick(r, ['bot']) ?? '');
          const code = String(pick(r, ['code']) ?? '');
          const valueRaw = pick(r, ['fclosepkt', 'FclosePkt', 'FclosePct', 'fclosepct']);
          const value = Number(valueRaw);
          const param = pick(r, ['parameter', 'tf']);
          return { bot, code, value, param: param != null ? String(param) : null };
        })
        .filter((r) => r.bot === BOT_NAME && r.code && Number.isFinite(r.value));

      filtered.sort((a, b) => b.value - a.value);

      labels = filtered.map((r) => r.code);
      values = filtered.map((r) => r.value);
      params = filtered.map((r) => r.param);

      render();
    } catch (e: any) {
      error = e?.message ?? 'Failed to load data';
      destroyChart();
    } finally {
      loading = false;
    }
  }

  function externalTooltipHandler(context: any) {
    const { chart, tooltip } = context;
    const parent = chart.canvas.parentNode as HTMLElement;

    let tooltipEl = parent.querySelector('div.chartjs-ext-tooltip') as HTMLDivElement | null;
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.className = 'chartjs-ext-tooltip';
      Object.assign(tooltipEl.style, {
        position: 'absolute',
        pointerEvents: 'none',
        background: 'rgba(17, 24, 39, 0.95)',
        color: '#e5e7eb',
        borderRadius: '10px',
        padding: '10px 12px',
        boxShadow: '0 6px 24px rgba(0,0,0,0.35)',
        transform: 'translate(-50%, -110%)',
        zIndex: '50',
        opacity: '0'
      } as CSSStyleDeclaration);
      parent.appendChild(tooltipEl);
    }

    if (tooltip.opacity === 0) {
      tooltipEl.style.opacity = '0';
      return;
    }

    if (tooltip.dataPoints && tooltip.dataPoints.length) {
      const dp = tooltip.dataPoints[0];
      const idx: number = dp.dataIndex ?? 0;
      const code = (labels[idx] || '').toUpperCase();
      const val = Number.isFinite(values[idx]) ? values[idx] : null;
      const percent = val !== null ? `${val.toLocaleString(undefined, { maximumFractionDigits: 2 })}%` : '';

      const lower = code.toLowerCase();
      const iconLower = `${ICON_BASE}/${lower}.png`;
      const iconUpper = `${ICON_BASE}/${code}.png`;

      tooltipEl.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
          <img src="${iconLower}" alt="${code}"
               style="width:22px; height:22px; border-radius:4px; object-fit:contain; background:#111827;"
               onerror="this.onerror=null; this.src='${iconUpper}';" />
          <div style="display:flex; flex-direction:column; line-height:1.25;">
            <div style="font-weight:700; letter-spacing:0.3px;">${code}</div>
            <div>
              ${percent ? `<span style='font-size:18px; font-weight:700;'>${percent}</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }

    const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;
    tooltipEl.style.left = positionX + tooltip.caretX + 'px';
    tooltipEl.style.top = positionY + tooltip.caretY + 'px';
    tooltipEl.style.opacity = '1';
  }

  const HoverGrowPlugin: Plugin<'bar'> = {
    id: 'hoverGrow',
    afterDatasetsDraw(chart) {
      const active = chart.getActiveElements();
      if (!active.length) return;

      const ae = active[0];
      const meta = chart.getDatasetMeta(ae.datasetIndex);
      const bar: any = meta?.data?.[ae.index];
      if (!bar) return;

      const { x, y, base, width } = bar.getProps(['x', 'y', 'base', 'width'], true);
      const area = chart.chartArea;
      const ctx = chart.ctx;



      const rawVal = (chart.data.datasets[ae.datasetIndex].data as number[])[ae.index] as number;
      const fill = rawVal >= 0 ? 'rgba(34,197,94,1)' : 'rgba(239,68,68,1)';

      ctx.save();
      ctx.beginPath();
      ctx.rect(area.left, area.top, area.right - area.left, area.bottom - area.top);
      ctx.clip();

      ctx.fillStyle = fill;
      ctx.restore();
    }
  };

  function render() {
    destroyChart();

    const colors = values.map((v) => (v >= 0 ? 'rgba(34,197,94,0.85)' : 'rgba(239,68,68,0.85)'));
    const borders = values.map((v) => (v >= 0 ? '#22c55e' : '#ef4444'));

    const cfg: ChartConfiguration<'bar', number[], string> = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: '',
            data: values,
            backgroundColor: colors,
            borderColor: borders,
            borderWidth: 0,         
            borderRadius: 0,       
            categoryPercentage: 0.95,
            barPercentage: 0.95
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: true },
        onHover: (_evt: ChartEvent, elements: ActiveElement[], chart) => {
          if (chart?.canvas) chart.canvas.style.cursor = elements.length ? 'pointer' : 'default';
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              maxRotation: 60,
              minRotation: 60,
              autoSkip: false,
              color: '#cbd5e1'
            },
            border: { display: false }
          },
          y: {
            beginAtZero: true,
            title: { display: false, text: '' },
            ticks: {
              color: '#94a3b8',
              callback: (v) => String(v)
            },
            grid: { color: 'rgba(148,163,184,0.2)' },
            border: { display: false }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: false,
            external: externalTooltipHandler,
            displayColors: false
          }
        },
        animations: { active: { duration: 120 } }
      },
      plugins: [HoverGrowPlugin]
    };

    chart = new Chart(canvas.getContext('2d')!, cfg);
  }

  function destroyChart() {
    const container = canvas?.parentNode as HTMLElement | null;
    const existing = container?.querySelector('.chartjs-ext-tooltip') as HTMLDivElement | null;
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

    if (chart) {
      chart.destroy();
      chart = null;
    }
  }

  onMount(() => {
    fetchAndRender();
    return () => destroyChart();
  });
</script>

<style>
  .wrap {
    width: 100%;
    height: 480px;
    border-radius: 0; 
    padding: 0;
    box-sizing: border-box;
    position: relative;
  }
  .wrap canvas {
    background: transparent;
  }
  .status {
    margin-bottom: 8px;
    font-size: 0.95rem;
    color: #ef4444;
  }
</style>

<div class="status">
  {#if loading}Loading…{/if}
  {#if error}{error}{/if}
</div>

<div class="wrap">
  <canvas bind:this={canvas}></canvas>
</div>
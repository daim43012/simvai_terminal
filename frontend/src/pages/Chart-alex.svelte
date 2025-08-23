<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import * as echarts from "echarts";
  type EChartsOption = echarts.EChartsOption;

  // ---------- Types ----------
  type ApiItem = {
    bot: string;        // "AI_Analytic"
    code: string;       // e.g., "AVAX"
    FclosePct: number;  // %
    close: number;      // API reference close
  };

  type Row = {
    code: string;
    FclosePct: number;
    close: number;
    lastPriceBinance?: number;
    delta?: number;    // computed %
    bar?: number;      // FclosePct + delta
  };

  // ---------- State ----------
  let chartEl: HTMLDivElement;
  let chart: echarts.ECharts | null = null;
  let ws: WebSocket | null = null;
  let refreshTimer: number | null = null;

  let rows: Record<string, Row> = {};
  const REFRESH_MS = 5000; // update every 5 seconds

  // ---------- Helpers (formulas unchanged) ----------
  function computeDelta(close: number, live?: number): number {
    if (!close || !live) return 0;
    if (live > close) return ((live - close) / close) * 100;
    if (close > live) return ((close - live) / close) * -100;
    return 0;
  }

  function recalcAll() {
    for (const code in rows) {
      const r = rows[code];
      r.delta = computeDelta(r.close, r.lastPriceBinance);
      r.bar = (r.FclosePct ?? 0) + (r.delta ?? 0);
    }
  }

  function toSortedArray(): Row[] {
    return Object.values(rows).sort((a, b) => (b.bar ?? 0) - (a.bar ?? 0));
  }

  // ---------- Tooltip HTML (Chart.js-style: icon + CODE + big %) ----------
  function tooltipHtml(r: Row) {
    const code = r.code.toUpperCase();
    const lower = code.toLowerCase();
    const iconLower = `/png_currency/${lower}.png`;
    const iconUpper = `/png_currency/${code}.png`;
    const val = Number(r.bar ?? 0);
    const percent = `${val.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;

    return `
      <div style="display:flex; align-items:center; gap:10px; padding:10px 12px;">
        <img src="${iconLower}" alt="${code}"
             style="width:22px; height:22px; border-radius:4px; object-fit:contain; background:#111827;"
             onerror="this.onerror=null; this.src='${iconUpper}';" />
        <div style="display:flex; flex-direction:column; line-height:1.25;">
          <div style="font-weight:700; letter-spacing:0.3px;">${code}</div>
          <div><span style="font-size:18px; font-weight:700;">${percent}</span></div>
        </div>
      </div>
    `;
  }

  // ---------- Render (Chart.js-like styling) ----------
  function render() {
    if (!chart) return;

    recalcAll();
    const arr = toSortedArray();

    const categories = arr.map((r) => r.code.toUpperCase());
    const data = arr.map((r) => {
      const v = Number((r.bar ?? 0).toFixed(2));
      const pos = v >= 0;
      return {
        value: v,
        itemStyle: {
          color: pos ? "rgba(34,197,94,0.85)" : "rgba(239,68,68,0.85)",
          borderColor: pos ? "#22c55e" : "#ef4444",
          borderWidth: 0,
          opacity: 0.95 // base opacity so blur looks subtle
        }
      };
    });

    const option: EChartsOption = {
      animationDuration: 300,
      grid: { left: 40, right: 20, top: 20, bottom: 80 },
      legend: { show: false },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        borderColor: "transparent",
        padding: 0,
        extraCssText:
          "border-radius:10px; box-shadow:0 6px 24px rgba(0,0,0,0.35); pointer-events:none;",
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params;
          const code: string = p?.name;
          const r = rows[code];
          return r ? tooltipHtml(r) : code;
        }
      },
      xAxis: {
        type: "category",
        data: categories,
        axisTick: { alignWithLabel: true },
        axisLabel: { rotate: 60, fontSize: 11, color: "#cbd5e1" },
        axisLine: { show: false },
        splitLine: { show: false }
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#94a3b8", formatter: (v: number) => String(v) },
        splitLine: { show: true, lineStyle: { color: "rgba(148,163,184,0.2)" } },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      series: [
        {
          type: "bar",
          name: "",
          data,
          barMaxWidth: 22,
          barCategoryGap: "5%",
          barGap: "10%",
          cursor: "pointer",
          label: { show: false }, // no numbers on top
          // ---- Hover styling: keep others darker, but less dark ----
          emphasis: {
            focus: "self",
            blurScope: "coordinateSystem",
            itemStyle: {
              shadowBlur: 18,
              shadowColor: "rgba(0,0,0,0.35)",
              opacity: 1
            }
          },
          blur: {
            // Less dark than default (e.g., 0.7 instead of ~0.1)
            itemStyle: { opacity: 0.7 }
          }
        }
      ]
    };

    chart.setOption(option, true);
  }

  // ---------- Data: API + WS ----------
  async function loadApi() {
    const res = await fetch("https://bot-advisor.com/api/robo-advisor/analytics", { cache: "no-store" });
    const json = await res.json();
    const items: ApiItem[] = Array.isArray(json) ? json : [];

    const filtered = items.filter((x) => x?.bot === "AI_Analytic" && x?.code);
    rows = {};
    for (const it of filtered) {
      const code = it.code.trim().toUpperCase();
      rows[code] = {
        code,
        FclosePct: Number(it.FclosePct ?? 0),
        close: Number(it.close ?? 0)
      };
    }

    render();
    startBinance(Object.keys(rows));
    startTimer();
  }

  function startBinance(codes: string[]) {
    if (!codes.length) return;
    const streams = codes.map((c) => `${c.toLowerCase()}usdt@ticker`).join("/");

    if (ws) { try { ws.close(); } catch {} ws = null; }
    ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

    // Cache price updates only; re-render on 5s timer
    ws.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        const d = payload?.data ?? payload;
        const symbol: string | undefined = d?.s;
        const lastStr: string | undefined = d?.c;
        if (!symbol || !lastStr) return;

        const code = symbol.endsWith("USDT") ? symbol.slice(0, -4) : symbol;
        const price = Number(lastStr);
        if (!isFinite(price)) return;

        const uCode = code.toUpperCase();
        if (rows[uCode]) rows[uCode].lastPriceBinance = price;
      } catch { /* ignore */ }
    };
  }

  function startTimer() {
    stopTimer();
    refreshTimer = window.setInterval(render, REFRESH_MS);
  }
  function stopTimer() {
    if (refreshTimer !== null) { clearInterval(refreshTimer); refreshTimer = null; }
  }

  // ---------- Mount / Resize ----------
  let resizeObserver: ResizeObserver | null = null;
  function handleWinResize() { chart?.resize(); }

  onMount(() => {
    chart = echarts.init(chartEl);
    loadApi();

    resizeObserver = new ResizeObserver(() => chart?.resize());
    resizeObserver.observe(chartEl);
    window.addEventListener("resize", handleWinResize);
  });

  onDestroy(() => {
    stopTimer();
    if (ws) try { ws.close(); } catch {}
    if (resizeObserver) resizeObserver.disconnect();
    window.removeEventListener("resize", handleWinResize);
    if (chart) { chart.dispose(); chart = null; }
  });
</script>

<!-- Container -->
<div bind:this={chartEl} style="width:100%;height:480px;position:relative;"></div>

<style>
  :global(.echarts) { user-select: none; }
</style>

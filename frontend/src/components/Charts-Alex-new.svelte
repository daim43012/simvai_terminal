<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import SparklineCanvas from "./SparklineCanvas.svelte";

  // -------- Types --------
  type Item = { id: number; bot: string; code: string };
  type AnalyticsRow = {
    code: string;
    bot: string;
    Closesession1: number; // Close
    Maxsession: number;    // High
    Minsession: number;    // Low
  };

  // -------- State --------
  let items: Item[] = [];
  let error: string | null = null;
  let loading = true;

  let livePrices: Record<string, number> = {};
  let lastPrices: Record<string, number> = {};
  let priceFlash: Record<string, "up" | "down" | null> = {};

  let sparkData: Record<string, number[]> = {};
  let sockets: WebSocket[] = [];

  // code -> H/L/C from bot-advisor
  let analyticsByCode: Record<string, AnalyticsRow> = {};

  // -------- Helpers --------
  async function fetchSparkline(symbol: string, limit = 96) {
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=15m&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Binance ${symbol}: ${res.status}`);
    const raw = await res.json();
    // kline: [openTime, open, high, low, close, volume, ...]
    return raw.map((r: any[]) => parseFloat(r[4]));
  }

  function subscribeTicker(symbol: string) {
    const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}usdt@ticker`;
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      const newPrice = parseFloat(data.c);
      const oldPrice = livePrices[symbol];

      if (oldPrice && newPrice !== oldPrice) {
        priceFlash[symbol] = newPrice > oldPrice ? "up" : "down";
        setTimeout(() => (priceFlash[symbol] = null), 1000);
      }

      lastPrices[symbol] = oldPrice;
      livePrices[symbol] = newPrice;
    };
    ws.onerror = () => console.warn("WS error", symbol);
    sockets.push(ws);
  }

  // Formats numbers for H/L/C and tooltips
  function fmt(n?: number) {
    if (n == null || Number.isNaN(n)) return "--";
    const abs = Math.abs(n);
    if (abs >= 1000) return n.toFixed(2);
    if (abs >= 1) return n.toFixed(4);
    if (abs >= 0.1) return n.toFixed(5);
    return n.toFixed(6);
  }

  // % change vs bot-advisor session close (Closesession1)
  function getChangePct(code: string): number | null {
    const close = analyticsByCode[code]?.Closesession1;
    const live = livePrices[code];
    if (!close || !live) return null;
    return ((live - close) / close) * 100;
  }

  // --- Vertical bar helpers ---
  function clamp01(x: number) {
    return Math.max(0, Math.min(1, x));
  }

  function getMarkerTopPctForClose(code: string): number {
    const a = analyticsByCode[code];
    if (!a) return 50;
    const { Maxsession: high, Minsession: low, Closesession1: close } = a;
    const span = Math.max(1e-12, high - low);
    const ratio = clamp01((close - low) / span); // 0=low, 1=high
    // CSS top percentage from the top: 0% at top (high), 100% at bottom (low)
    return (1 - ratio) * 100;
  }

  function getMarkerTopPctForLive(code: string): number {
    const a = analyticsByCode[code];
    const live = livePrices[code];
    if (!a || !Number.isFinite(live)) return 50;
    const { Maxsession: high, Minsession: low } = a;
    const span = Math.max(1e-12, high - low);
    const ratio = clamp01((live - low) / span);
    return (1 - ratio) * 100;
  }

  function getLiveLabel(code: string): string {
    const v = livePrices[code];
    return Number.isFinite(v) ? fmt(v) : "--";
  }
  function getCloseLabel(code: string): string {
    const v = analyticsByCode[code]?.Closesession1;
    return Number.isFinite(v as number) ? fmt(v) : "--";
  }
  function getHighLabel(code: string): string {
    const v = analyticsByCode[code]?.Maxsession;
    return Number.isFinite(v as number) ? fmt(v) : "--";
  }
  function getLowLabel(code: string): string {
    const v = analyticsByCode[code]?.Minsession;
    return Number.isFinite(v as number) ? fmt(v) : "--";
  }

  // -------- Lifecycle --------
  onMount(async () => {
    try {
      const res = await fetch("https://bot-advisor.com/api/robo-advisor/analytics");
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data: any[] = await res.json();
      const filtered = (data || []).filter((d: any) => d.bot === "AI_Analytic");

      // items for rendering
      items = filtered.map((d: any) => ({ id: d.id, bot: d.bot, code: d.code }));

      // H/L/C map
      for (const row of filtered) {
        analyticsByCode[row.code] = {
          code: row.code,
          bot: row.bot,
          Closesession1: row.Closesession1,
          Maxsession: row.Maxsession,
          Minsession: row.Minsession
        };
      }

      // Binance spark + live price
      for (const it of items) {
        try {
          sparkData[it.code] = await fetchSparkline(it.code);
          subscribeTicker(it.code);
          await new Promise((r) => setTimeout(r, 80)); // gentle staggering
        } catch (e) {
          console.warn("spark error", it.code, e);
        }
      }
    } catch (e: any) {
      error = e.message ?? "Unknown error";
    } finally {
      loading = false;
    }
  });

  onDestroy(() => {
    sockets.forEach((s) => s.close());
  });
</script>

{#if loading}
  <div class="status">Loading…</div>
{:else if error}
  <div class="status error">Error: {error}</div>
{:else}
  <div class="grid">
    {#each items as item}
      <div class="card">
        <div class="code-badge">
          <img
            src={`/png_currency/${item.code.toLowerCase()}.png`}
            alt={item.code}
            class="crypto-logo"
          />
          {item.code} / USDT
        </div>          

        <div class="price {priceFlash[item.code]}">
          {#if livePrices[item.code]}
            {livePrices[item.code].toFixed(4)}
          {:else}
            --
          {/if}
        </div>

        {#if getChangePct(item.code) !== null}
          <div
            class="change-badge"
            class:up={getChangePct(item.code)! > 0}
            class:down={getChangePct(item.code)! < 0}
            aria-label="Change vs session close"
          >
            {getChangePct(item.code)! > 0 ? "+" : ""}{getChangePct(item.code)!.toFixed(2)}%
          </div>
        {/if}

        <!-- C → H → L -->
        <div class="hlc-row">
          {#if analyticsByCode[item.code]}
            <div class="hlc-pill">
              <span class="hlc-label">C</span><span class="hlc-val">{fmt(analyticsByCode[item.code].Closesession1)}</span>
            </div>
            <div class="hlc-pill">
              <span class="hlc-label">H</span><span class="hlc-val">{fmt(analyticsByCode[item.code].Maxsession)}</span>
            </div>
            <div class="hlc-pill">
              <span class="hlc-label">L</span><span class="hlc-val">{fmt(analyticsByCode[item.code].Minsession)}</span>
            </div>
          {:else}
            <div class="hlc-pill"><span class="hlc-label">C</span><span class="hlc-val">--</span></div>
            <div class="hlc-pill"><span class="hlc-label">H</span><span class="hlc-val">--</span></div>
            <div class="hlc-pill"><span class="hlc-label">L</span><span class="hlc-val">--</span></div>
          {/if}
        </div>

        <div class="content-row">
          <div class="spark-wrap">
            {#if sparkData[item.code]}
              <SparklineCanvas values={sparkData[item.code]} height={64} />
            {:else}
              <div class="spark-skeleton"></div>
            {/if}
          </div>

          <!-- Vertical range bar: hover anywhere to see all metrics -->
          <div class="progress-slot">
            {#if analyticsByCode[item.code]}
              <div class="vp-wrap">
                <div class="vp-bar"></div>

                <!-- Close marker -->
                <div class="vp-marker" style={`top:${getMarkerTopPctForClose(item.code)}%`}>
                  <div class="vp-tip vp-tip--close">Close: {getCloseLabel(item.code)}</div>
                </div>                

                <!-- Live marker (always blue) -->
                <div
                  class="vp-live-marker"
                  style={`top:${getMarkerTopPctForLive(item.code)}%`}
                >
                  <div class="vp-live-tip">Current: {getLiveLabel(item.code)}</div>
                </div>

                <!-- Hover zones -->
                <div class="vp-high" title={`High: ${getHighLabel(item.code)}`}></div>
                <div class="vp-low" title={`Low: ${getLowLabel(item.code)}`}></div>

                <!-- All-metrics tooltip -->
                <div class="vp-alltip">
                  <div class="row row-high"><span>High</span><b>{getHighLabel(item.code)}</b></div>
                  <div class="row row-current"><span>Current</span><b>{getLiveLabel(item.code)}</b></div>
                  <div class="row row-close"><span>Close</span><b>{getCloseLabel(item.code)}</b></div>
                  <div class="row row-low"><span>Low</span><b>{getLowLabel(item.code)}</b></div>
                </div>                
              </div>
            {:else}
              <div class="vp-wrap"><div class="vp-bar"></div></div>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>
{/if}

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 0.75rem;
    padding-top: 3rem;
  }

  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    padding: 0;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
    min-height: 200px;
    overflow: hidden;
    background: #0f1115;
  }
  .card:hover {
    border-color: rgba(255, 255, 255, 0.14);
    transform: translateY(-1px);
    transition: 160ms ease;
  }

  .code-badge {
  display: flex;
  align-items: center;
  gap: 6px;           /* spacing between logo and text */
  font-size: 0.875rem;
  opacity: 0.8;
  padding: 6px 0 0 12px;
}

.crypto-logo {
  width: 15px;
  height: 15px;
  object-fit: contain;
  background-color: tra;
}

  .price {
    font-size: 1.6rem;
    font-weight: 600;
    padding: 2px 12px;
    border-radius: 4px;
    display: inline-block;
    transition: color 0.3s ease;
  }
  .price.up   { color: #22c55e; }
  .price.down { color: #ef4444; }

  .change-badge {
    position: absolute;
    top: 8px;
    right: 12px;
    font-size: 0.92rem;
    font-weight: 700;
    pointer-events: none;
  }
  .change-badge.up   { color: #22c55e; }
  .change-badge.down { color: #ef4444; }

  .hlc-row {
    display: flex;
    gap: 8px;
    padding: 2px 8px 6px 12px;
  }
  .hlc-pill {
    display: inline-flex;
    align-items: baseline;
    gap: 2px;
    padding: 2px 4px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }
  .hlc-label { font-size: 0.5rem; opacity: 0.7; }
  .hlc-val   { font-size: 0.5rem; font-weight: 600; }

  .content-row {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 36px;
    align-items: center;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .spark-wrap {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 10px;
  }

  .progress-slot {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-left: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 0 4px 4px 0;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }

  .vp-wrap {
    position: relative;
    width: 16px;
    height: 100%;
    display: flex;
    align-items: stretch;
    justify-content: center;
  }
  .vp-bar {
    width: 10px;
    border-radius: 6px;
    background: linear-gradient(180deg, #34d399 0%, #facc15 50%, #f87171 100%);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06);
  }

  .vp-marker {
    position: absolute;
    left: 0; right: 0;
    height: 0;
    pointer-events: auto;
  }
  .vp-marker::before {
    content: "";
    position: absolute;
    left: 2px; right: 2px;
    height: 3px;
    background: #9ca3af;
    border-radius: 2px;
    transform: translateY(-50%);
    box-shadow: 0 0 0 1px rgba(255,255,255,0.06);
  }
  .vp-tip {
    position: absolute;
    right: 16px; top: 50%;
    transform: translateY(-50%);
    background: rgba(17, 24, 39, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #e5e7eb;
    font-size: 0.72rem;
    padding: 4px 6px;
    border-radius: 6px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.12s;
  }

  /* Left accents on the small tiles to match their meanings */
  .vp-tip--close { border-left: 3px solid #9ca3af; padding-left: 8px; }
  .vp-live-tip  { border-left: 3px solid #3b82f6; padding-left: 8px; }

  .vp-marker:hover .vp-tip { opacity: 1; }

  /* Live marker always blue */
  .vp-live-marker {
    position: absolute;
    left: 0; right: 0;
    height: 0;
    pointer-events: auto;
  }
  .vp-live-marker::before {
    content: "";
    position: absolute;
    left: 2px; right: 2px;
    height: 3px;
    border-radius: 2px;
    transform: translateY(-50%);
    background: #3b82f6; /* blue */
    box-shadow: 0 0 0 1px rgba(255,255,255,0.06);
  }

  .vp-live-tip {
    position: absolute;
    right: 16px; top: 50%;
    transform: translateY(-50%);
    background: rgba(17, 24, 39, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #e5e7eb;
    font-size: 0.72rem;
    padding: 4px 6px;
    border-radius: 6px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.12s;
  }
  .vp-live-marker:hover .vp-live-tip { opacity: 1; }

  .vp-high, .vp-low {
    position: absolute;
    left: 0; right: 0;
    height: 12px;
  }
  .vp-high { top: 0; }
  .vp-low  { bottom: 0; }

  .vp-alltip {
    position: absolute;
    right: 16px; top: 50%;
    transform: translateY(-50%);
    background: rgba(17, 24, 39, 0.97);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #e5e7eb;
    font-size: 0.72rem;
    padding: 6px 8px;
    border-radius: 8px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.12s;
    box-shadow: 0 6px 18px rgba(0,0,0,0.35);
    
  }

  /* Colors for names + numbers in the all-metrics tooltip */
  .vp-alltip .row-high span,
  .vp-alltip .row-high b { color: #34d399; }  /* High = green */

  .vp-alltip .row-current span,
  .vp-alltip .row-current b { color: #3b82f6; }  /* Current = blue */

  .vp-alltip .row-close span,
  .vp-alltip .row-close b { color: #9ca3af; }  /* Close = gray */

  .vp-alltip .row-low span,
  .vp-alltip .row-low b { color: #ef4444; }  /* Low = red */

  .vp-wrap:hover .vp-alltip { opacity: 1; }
  .vp-alltip .row { display: flex; gap: 8px; justify-content: space-between; }
  .vp-alltip .row + .row { margin-top: 4px; }

  .spark-skeleton {
    width: 100%;
    height: 64px;
    border-radius: 4px;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.06) 25%,
      rgba(255, 255, 255, 0.12) 37%,
      rgba(255, 255, 255, 0.06) 63%
    );
    background-size: 400% 100%;
    animation: shimmer 1.2s infinite;
  }
  @keyframes shimmer {
    0% { background-position: 100% 0; }
    100% { background-position: 0 0; }
  }

  .status { opacity: 0.8; }
  .status.error { color: #ef4444; }
</style>



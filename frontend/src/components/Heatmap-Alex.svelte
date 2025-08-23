<script lang="ts">
  import { onMount } from "svelte";

  // API and selection logic
  export let apiUrl = "https://bot-advisor.com/api/robo-advisor/analytics";
  export let botName = "AI_Analytic";
  // Optional timeframe/parameter filter (set to null to include all)
  export let parameterFilter: string | null = null;

  // Layout controls
  export let columns = 8; // number of columns in the grid
  export let tileSize = 60; // width/height of each tile in px
  export let gap = 6; // gap in px
  export let topN: number | null = null; // limit items (null = all)

  // Icons are served from public/png_currency/<ticker>.png (lowercase filenames)
  const ICON_BASE = "/png_currency";

  let loading = true;
  let error: string | null = null;

  type Item = {
    code: string; // ticker
    value: number; // to display inside the tile (== power)
    power: number; // 0..100, used for color and display
    parameter: string | null;
  };

  let items: Item[] = [];
  let averagePower = 0; // 0..100

  // Case-insensitive pick
  function pick(obj: any, keys: string[]) {
    if (!obj) return undefined;
    const lower = Object.fromEntries(
      Object.keys(obj).map((k) => [k.toLowerCase(), obj[k]])
    );
    for (const k of keys) {
      const v = lower[k.toLowerCase()];
      if (v !== undefined && v !== null) return v;
    }
    return undefined;
  }

  // Palette
  function getColor(power: number): string {
    if (power >= 0 && power < 31) return "rgb(128, 0, 0)";
    if (power >= 31 && power < 44) return "rgb(255, 0, 0)";
    if (power >= 44 && power < 49) return "rgb(255, 115, 0)";
    if (power >= 49 && power < 51) return "rgb(215, 222, 8)";
    if (power >= 51 && power < 53) return "rgb(127,195,24)";
    if (power >= 53 && power < 56) return "rgb(40, 158, 40)";
    if (power >= 56 && power < 72) return "rgb(0, 118, 0)";
    if (power >= 72 && power <= 100) return "rgb(1, 50, 32)";
    return "rgb(255, 255, 255)";
  }

  // Ensure 0..100
  function clampPower(v: number): number {
    if (!Number.isFinite(v)) return 0;
    return Math.max(0, Math.min(100, v));
  }

  async function load() {
    loading = true;
    error = null;

    try {
      const res = await fetch(apiUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const rows: any[] = Array.isArray(json) ? json : [json];

      let tmp: Item[] = rows
        .map((r) => {
          const bot = String(pick(r, ["bot"]) ?? "");
          const code = String(pick(r, ["code"]) ?? "");
          const powerRaw = pick(r, ["power"]);
          const parameter = pick(r, ["parameter", "tf"]);
          const powerNum = clampPower(Number(powerRaw));
          return {
            bot,
            code,
            power: powerNum,
            value: powerNum,
            parameter: parameter != null ? String(parameter) : null,
          };
        })
        .filter((r) => r.bot === botName && r.code);

      if (parameterFilter !== null) {
        tmp = tmp.filter(
          (it) =>
            String(it.parameter ?? "").toLowerCase() ===
            String(parameterFilter).toLowerCase()
        );
      }

      // Sort by power desc
      tmp.sort((a, b) => b.power - a.power);

      if (topN && topN > 0) tmp = tmp.slice(0, topN);

      items = tmp;
      averagePower = items.length
        ? items.reduce((s, it) => s + it.power, 0) / items.length
        : 0;
    } catch (e: any) {
      error = e?.message ?? "Failed to load heatmap data";
      items = [];
      averagePower = 0;
    } finally {
      loading = false;
    }
  }

  onMount(load);
</script>

{#if loading}
  <div class="status">Loading…</div>
{:else if error}
  <div class="status">{error}</div>
{/if}

{#if items.length}
  <div class="crypto-box">
    <div
      class="crypto-grid"
      style="
        --cols: {columns};
        --tile-size: {tileSize}px;
        --gap: {gap}px;
      "
    >
      {#each items as it (it.code)}
        <div
          class="crypto-card"
          style="background-color: {getColor(it.power)};"
        >
          <img
            class="icon"
            src={`${ICON_BASE}/${it.code.toLowerCase()}.png`}
            alt={it.code}
          />
          <p class="crypto-code">{it.code.toUpperCase()}</p>
          <p class="crypto-percent">
            {it.power.toLocaleString(undefined, { maximumFractionDigits: 1 })}%
          </p>
        </div>
      {/each}
    </div>

    <div class="progress-bar-container">
      <div class="progress-bar"></div>
      <div class="progress-marker" style="left: {averagePower}%;">
        <span class="progress-label">{averagePower.toFixed(1)}%</span>
      </div>
    </div>
  </div>
{:else if !loading && !error}
  <div class="status">No data.</div>
{/if}

<style>
  .crypto-box {
    width: fit-content;
    margin: 0 auto;
    padding: 15px;
    border: 2px solid #fff;
    border-radius: 12px;
    background-color: rgba(0, 0, 0, 0.6);
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
  }

  .status {
    margin: 8px 0 12px;
    color: #ef4444;
    text-align: center;
  }

  /* --- PERFECTLY EVEN GRID --- */
  .crypto-grid {
    display: grid;
    justify-content: center;

    /* Squares with identical spacing; values come from inline CSS vars */
    grid-template-columns: repeat(var(--cols, 8), var(--tile-size));
    grid-auto-rows: var(--tile-size);
    gap: var(--gap);
  }

  .crypto-card {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 3px;
    border-radius: 6px;
    color: white;
    font-size: 12px;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    text-align: center;
    transition:
      transform 120ms ease,
      box-shadow 120ms ease,
      outline-color 120ms ease;
    outline: 1px solid rgba(255, 255, 255, 0.06);
    position: relative;
    z-index: 0;
    will-change: transform;
  }

  /* Scale only; do not translate, so spacing stays identical */
  .crypto-card:hover {
    transform: scale(1.04);
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.35);
    outline-color: rgba(255, 255, 255, 0.18);
    z-index: 2; /* draw above neighbors without affecting layout */
  }

  .crypto-code {
    font-weight: 700;
    font-size: 11px;
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
    margin: 0;
    line-height: 1.1;
  }

  .crypto-percent {
    font-size: 10px;
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
    margin: 2px 0 0;
    line-height: 1.1;
    opacity: 0.95;
  }

  .icon {
    width: 18px;
    height: 18px;
    object-fit: contain;
    border-radius: 3px;
    margin-bottom: 4px;
    pointer-events: none;
    user-select: none;
  }

  .progress-bar-container {
    width: 100%;
    margin-top: 14px;
    background: linear-gradient(
      to right,
      rgb(128, 0, 0),
      rgb(255, 0, 0),
      rgb(255, 115, 0),
      rgb(215, 222, 8),
      rgb(127, 195, 24),
      rgb(40, 158, 40),
      rgb(0, 118, 0),
      rgb(1, 50, 32)
    );
    border-radius: 10px;
    height: 20px;
    position: relative;
  }

  .progress-marker {
    position: absolute;
    height: 100%;
    width: 2px;
    background: black;
    top: 0;
  }

  .progress-label {
    position: absolute;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 2px 5px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
  }
</style>

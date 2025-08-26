<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import SparklineCanvas from "./SparklineCanvas.svelte";
  import VerticalProgress from "./VerticalProgress.svelte";

  type Item = {
    id: number;
    bot: string;
    code: string;
  };

  let items: Item[] = [];
  let error: string | null = null;
  let loading = true;

  let livePrices: Record<string, number> = {};
  let lastPrices: Record<string, number> = {};
  let priceFlash: Record<string, "up" | "down" | null> = {};

  let sparkData: Record<string, number[]> = {};
  let sockets: WebSocket[] = [];

  async function fetchSparkline(symbol: string, limit = 96) {
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=15m&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Binance ${symbol}: ${res.status}`);
    const raw = await res.json();
    return raw.map((r: any[]) => parseFloat(r[4]));
  }

  function subscribeTicker(symbol: string) {
    const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}usdt@ticker`;
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      const newPrice = parseFloat(data.c);
      const oldPrice = livePrices[symbol];

      // если есть старая цена — сравниваем
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

  onMount(async () => {
    try {
      const res = await fetch(
        "https://bot-advisor.com/api/robo-advisor/analytics"
      );
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data: Item[] = await res.json();
      items = (data || []).filter((d) => d.bot === "AI_Analytic");

      for (const it of items) {
        try {
          sparkData[it.code] = await fetchSparkline(it.code);
          subscribeTicker(it.code);
          await new Promise((r) => setTimeout(r, 80));
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
        <div class="code-badge">{item.code} / USDT</div>
        <div class="price {priceFlash[item.code]}">
          {#if livePrices[item.code]}
            {livePrices[item.code].toFixed(4)}
          {:else}
            --
          {/if}
        </div>

        <div class="content-row">
          <div class="spark-wrap">
            {#if sparkData[item.code]}
              <SparklineCanvas values={sparkData[item.code]} height={64} />
            {:else}
              <div class="spark-skeleton" />
            {/if}
          </div>

          <div class="progress-slot">
<VerticalProgress />
          </div>
        </div>
      </div>
    {/each}
  </div>
{/if}

<style>
  .content-row {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 36px;
    align-items: center;
  }

  .spark-wrap {
    height: 100%;
    display: flex;
  }

  .progress-slot {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-left: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 0 4px 4px 0;
  }

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
    padding: 0px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
    min-height: 200px;
    overflow: hidden;
  }
  .card:hover {
    border-color: rgba(255, 255, 255, 0.14);
    transform: translateY(-1px);
    transition: 160ms ease;
  }
  .code-badge {
    font-size: 0.875rem;
    opacity: 0.8;
    padding-top: 6px;
    padding-left: 12px;
  }

  .price {
    font-size: 1.6rem;
    font-weight: 500;
    transition: background-color 0.3s ease;
    padding: 2px 12px;
    border-radius: 4px;
    display: inline-block;
  }

  .price.up {
    animation: flashGreen 1s;
  }
  .price.down {
    animation: flashRed 1s;
  }

  @keyframes flashGreen {
    0% {
      background: rgba(34, 197, 94, 0.4);
    }
    100% {
      background: transparent;
    }
  }
  @keyframes flashRed {
    0% {
      background: rgba(239, 68, 68, 0.4);
    }
    100% {
      background: transparent;
    }
  }

  .spark-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .spark-skeleton {
    width: 100%;
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
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: 0 0;
    }
  }

  .status {
    opacity: 0.8;
  }
  .status.error {
    color: #ef4444;
  }
</style>

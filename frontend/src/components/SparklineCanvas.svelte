<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  export let values: number[] = [];
  export let height = 64;
  export let padding = 4;

  let wrapper: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;
  let ro: ResizeObserver;

  let tipVisible = false;
  let tipLeft = 0;
  let tipTop = 0;
  let tipValue: number | null = null;
  let tipSide: "center" | "left" | "right" = "center";

  function draw() {
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = height;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, w, h);

    if (!values.length) return;

    const min = Math.min(...values);
    const max = Math.max(...values);
    const denom = max - min || 1;
    const dx = values.length > 1 ? (w - padding * 2) / (values.length - 1) : 0;

    ctx.beginPath();
    ctx.moveTo(
      padding,
      h - padding - ((h - padding * 2) * (values[0] - min)) / denom
    );
    for (let i = 1; i < values.length; i++) {
      const x = padding + i * dx;
      const y = h - padding - ((h - padding * 2) * (values[i] - min)) / denom;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = values.at(-1)! >= values[0] ? "#22c55e" : "#ef4444";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function handleMove(e: MouseEvent) {
    if (!values.length) return;
    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const w = rect.width;
    const h = height;
    const dx = values.length > 1 ? (w - padding * 2) / (values.length - 1) : 0;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const denom = max - min || 1;

    let idx = dx ? Math.round((x - padding) / dx) : 0;
    idx = Math.max(0, Math.min(idx, values.length - 1));

    const xPos = padding + idx * dx;
    const yPos =
      h - padding - ((h - padding * 2) * (values[idx] - min)) / denom;

    const margin = 8;
    const leftClamped = Math.max(margin, Math.min(xPos, w - margin));
    if (leftClamped <= 64) tipSide = "left";
    else if (leftClamped >= w - 64) tipSide = "right";
    else tipSide = "center";

    tipLeft = leftClamped;
    tipTop = yPos;
    tipValue = values[idx];
    tipVisible = true;

    draw();
  }

  function handleLeave() {
    tipVisible = false;
    tipValue = null;
    draw();
  }

  onMount(() => {
    ctx = canvas.getContext("2d");
    ro = new ResizeObserver(draw);
    ro.observe(canvas);
    draw();
  });

  onDestroy(() => {
    ro?.disconnect();
  });

  $: (values, height, padding), draw();
</script>

<div class="sparkline-wrap" bind:this={wrapper} style="height:{height}px">
  <canvas
    bind:this={canvas}
    style="width:100%; height:100%; display:block; cursor:crosshair"
    on:mousemove={handleMove}
    on:mouseleave={handleLeave}
  />

  {#if tipVisible && tipValue !== null}
    <div
      class="sparkline-tooltip"
      class:center={tipSide === "center"}
      class:left={tipSide === "left"}
      class:right={tipSide === "right"}
      style="left:{tipLeft}px; top:{tipTop}px"
      aria-hidden="true"
    >
      {tipValue.toFixed(4)}
    </div>
  {/if}
</div>

<style>
  .sparkline-wrap {
    position: relative;
    width: 100%;
  }

  .sparkline-tooltip {
    position: absolute;
    z-index: 2147483647;
    pointer-events: none; 
    transform: translate(-50%, -110%); 
    padding: 6px 8px;
    font:
      12px/1.1 system-ui,
      -apple-system,
      Segoe UI,
      Roboto,
      sans-serif;
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 4px;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    white-space: nowrap;
  }

  .sparkline-tooltip::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: -5px;
    transform: translateX(-50%);
    border-width: 5px 5px 0 5px;
    border-style: solid;
    border-color: rgba(17, 24, 39, 0.9) transparent transparent transparent;
    filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.25));
  }

  .sparkline-tooltip.left {
    transform: translate(-8px, -110%); 
  }
  .sparkline-tooltip.left::after {
    left: 12px;
    transform: none;
  }

  .sparkline-tooltip.right {
    transform: translate(calc(-100% + 8px), -110%); 
  }
  .sparkline-tooltip.right::after {
    left: calc(100% - 12px);
    transform: none;
  }
</style>

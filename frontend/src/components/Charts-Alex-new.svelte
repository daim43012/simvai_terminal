<script lang="ts">
  import { onMount } from "svelte";

  type Item = {
    id: number;
    bot: string;
    code: string;
  };

  let items: Item[] = [];
  let error: string | null = null;
  let loading = true;

  onMount(async () => {
    try {
      const res = await fetch(
        "https://bot-advisor.com/api/robo-advisor/analytics"
      );
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data: Item[] = await res.json();
      items = (data || []).filter((d) => d.bot === "AI_Analytic");
    } catch (e: any) {
      error = e.message ?? "Unknown error";
    } finally {
      loading = false;
    }
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
    
      </div>
    {/each}
  </div>
{/if}

<style>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.75rem; /* a bit more breathing room */
  padding-top: 3rem;
}


  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    /* background: #0f172a;           */
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    padding: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
    min-height: 200px;
    overflow: hidden;
  }
  .card:hover {
    border-color: rgba(255, 255, 255, 0.14);
    transform: translateY(-1px);
    transition: 160ms ease;
  }
</style>

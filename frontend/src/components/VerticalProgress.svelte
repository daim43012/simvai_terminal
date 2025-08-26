<script lang="ts">
  let value: number = 50;
  $: pct = Math.max(0, Math.min(100, value));
</script>

<div class="v-progress">
  <div class="v-line" style="bottom:{pct}%"></div>
</div>

<style>
  .v-progress {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 10px;
    height: 100%;
    border-radius: 2px;
    overflow: hidden;
    background: linear-gradient(to top, #ef4444, #facc15, #22c55e);
  }

  .v-line {
    position: absolute;
    left: 0;
    width: 100%;
    height: 2px;
    background: #111;
    transform: translateY(50%);
  }
</style>

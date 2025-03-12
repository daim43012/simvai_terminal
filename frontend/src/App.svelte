<script>
  import Sidebar from "./components/Sidebar.svelte";
  import Home from "./pages/Home.svelte";
  import Chart from "./pages/Chart.svelte";
  import Balance from "./pages/Balance.svelte";
  import Settings from "./pages/Settings.svelte";

  let activePage = "home";
</script>

<style>
  .container {
    display: flex;
    width: 100%;
    height: 100vh;
  }

  .content {
    flex-grow: 1;
    padding: 20px;
  }
</style>

<div class="container">
  <Sidebar bind:activePage />

  <div class="content">
    {#if activePage === "home"}
      <Home />
    {:else if activePage === "chart"}
      <Chart />
    {:else if activePage === "balance"}
      <Balance />
    {:else if activePage === "settings"}
      <Settings />
    {/if}
  </div>
</div>

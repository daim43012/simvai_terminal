<script lang="ts">
  import Sidebar from "./components/Sidebar.svelte";
  import Home from "./pages/Home.svelte";
  import Chart from "./pages/Chart.svelte";
  import Balance from "./pages/Balance.svelte";
  import Settings from "./pages/Settings.svelte";
  import PortfolioPage from "./pages/PortfolioPage.svelte";
  import Header from "../src/components/Header.svelte";

  let activePage = "home";
  let selectedPortfolio : any;

  function openPortfolio(id : any) {
    activePage = "portfolio";
    selectedPortfolio = id;
  }
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
  <Header />

  <Sidebar bind:activePage />

  <div class="content">
    {#if activePage === "home"}
      <Home on:openPortfolio={event => openPortfolio(event.detail)} />
    {:else if activePage === "chart"}
      <Chart />
    {:else if activePage === "balance"}
      <Balance />
    {:else if activePage === "settings"}
      <Settings />
    {:else if activePage === "portfolio"}
<PortfolioPage {selectedPortfolio} on:back={() => activePage = "home"} />
    {/if}
  </div>
</div>

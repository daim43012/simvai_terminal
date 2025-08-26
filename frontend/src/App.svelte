<script lang="ts">
  import Sidebar from "./components/Sidebar.svelte";
  import Home from "./pages/Home.svelte";
  import Chart from "./pages/Chart.svelte";
  import Balance from "./pages/Balance.svelte";
  import Settings from "./pages/Settings.svelte";
  import PortfolioPage from "./pages/PortfolioPage.svelte";
  import Constructor from "./pages/Constructor.svelte";
  import AiAdviser from "./pages/Ai-adviser.svelte";
  import Analytic from "./pages/Analytic.svelte";
  import Study from "./pages/Study.svelte";
  import Header from "../src/components/Header.svelte";
  import ChartAlex from "./pages/Chart-alex.svelte";
  import HeatmapAlex from "./components/Heatmap-Alex.svelte";
  import ChartsAlex from "./components/Charts-Alex.svelte";
  import ChartsAlexNew from "./components/Charts-Alex-new.svelte";

  let activePage: string = "home";
  let selectedPortfolio: any;

  function openPortfolio(id: any) {
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

<Header />

<div class="container">
  <Sidebar bind:activePage />

  <div class="content">
    {#if activePage === "home"}
      <Home bind:activePage on:openPortfolio={event => openPortfolio(event.detail)} />
    {:else if activePage === "chart"}
      <!-- <Chart /> -->
      <ChartAlex />
      <HeatmapAlex />
      <ChartsAlexNew />

    {:else if activePage === "balance"}
      <Balance />
    {:else if activePage === "settings"}
      <Settings />
    {:else if activePage === "portfolio"}
      <PortfolioPage {selectedPortfolio} on:back={() => activePage = "home"} />
    {:else if activePage === "constructor"}
      <Constructor bind:activePage />
    {:else if activePage === "ai-adviser"}
      <AiAdviser bind:activePage />
    {:else if activePage === "analytic"}
      <Analytic bind:activePage />
    {:else if activePage === "study"}
      <Study bind:activePage />
    {/if}
  </div>
</div>

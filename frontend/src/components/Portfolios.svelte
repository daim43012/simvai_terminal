<script>
    import Portfolio from "./Portfolio.svelte";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    let portfolios = [
        { id: "strategies", name: "Популярные стратегии" },
        { id: "tools", name: "Инструменты Pro" },
        { id: "tools-2", name: "Инструменты Pro 2" }
    ];

    function handlePortfolioClick(id) {
        dispatch("openPortfolio", id);
    }
</script>

<h2>Portfolios</h2>
<div class="portfolios-container">
    {#each portfolios as portfolio}
        <div class="portfolio-wrapper" on:click={() => handlePortfolioClick(portfolio.id)}>
            <Portfolio name={portfolio.name} />
        </div>
    {/each}
</div>

<style>
    .portfolios-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 20px;
        padding: 10px;
        width: 100%;
    }

    .portfolio-wrapper {
        display: flex;
        justify-content: center;
        flex: 1; /* Растягиваем карточки равномерно */

    }

  .portfolio-wrapper:hover {
    opacity: 0.8;
  }
</style>

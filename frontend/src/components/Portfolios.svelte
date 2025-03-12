<script>
    import Portfolio from "./Portfolio.svelte";

    let portfolios = [
        { name: "Популярные стратегии" },
        { name: "Инструменты Pro" }, 
        { name: "Инструменты Pro 2" }, 
        

    ];
</script>

<h2 style="padding: 10px;">Portfolios</h2>
<div class="portfolios-container">
    {#each portfolios as portfolio}
        <div class="portfolio-wrapper">
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
</style>

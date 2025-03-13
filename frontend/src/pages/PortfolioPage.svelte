<script>
    import { createEventDispatcher } from "svelte";

    export let selectedPortfolio;
    const dispatch = createEventDispatcher();

    let portfolioData = {
        strategies: { name: "Популярные стратегии", description: "Описание стратегий" },
        tools: { name: "Инструменты Pro", description: "Описание инструментов" },
        "tools-2": { name: "Инструменты Pro 2", description: "Описание инструментов 2" }
    };

    let data = portfolioData[selectedPortfolio] || { name: "Не найдено", description: "Нет данных" };

    function goBack() {
        dispatch("back"); // Отправляем событие "back"
    }
</script>

<h1>{data.name}</h1>
<p>{data.description}</p>

<button on:click={goBack}>Назад</button>

<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Card from "../components/CardPortfolio.svelte";
  import CardMain from "../components/CardPortfolioMain.svelte";

  export let selectedPortfolio: "strategies" | "tools" | "tools-2";
  const dispatch = createEventDispatcher();

  let portfolioData: Record<
    "strategies" | "tools" | "tools-2",
    { name: string; description: string }
  > = {
    strategies: {
      name: "Популярные стратегии",
      description: "Описание стратегий",
    },
    tools: { name: "Инструменты Pro", description: "Описание инструментов" },
    "tools-2": {
      name: "Инструменты Pro 2",
      description: "Описание инструментов 2",
    },
  };

  let data = portfolioData[selectedPortfolio] || {
    name: "Не найдено",
    description: "Нет данных",
  };

  function goBack() {
    dispatch("back");
  }
</script>
<button on:click={goBack}>Назад</button>

<div style="margin-top: 50px;"><Card name="Trend Index" age="895" />
</div>
<div style="margin-top: 50px;"><CardMain /></div>


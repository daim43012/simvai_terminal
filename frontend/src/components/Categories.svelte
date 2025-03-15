<script lang="ts">
  import Category from "./Category.svelte";
  export let activePage; // Теперь `activePage` передается сверху

  let categories = [
    { name: "AI советник", page: "ai-adviser" },
    { name: "Аналитика", page: "analytic" },
    { name: "Обучение", page: "study" },
    { name: "Конструктор", page: "constructor" },
  ];

  function goToPage(page:any) {
    activePage = page; // Меняем активную страницу
  }
</script>

<h2 style="padding: 10px;">Categories</h2>
<div class="categories-container">
  {#each categories as category}
    <div class="category-wrapper" on:click={() => goToPage(category.page)}>
      <Category name={category.name} />
    </div>
  {/each}
</div>



<style>
  .categories-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 15px;
    padding: 10px;
    width: 100%; /* Теперь занимает всю ширину родителя */
  }

  .category-wrapper {
    display: flex;
    flex: 1; /* Растягиваем карточки равномерно */
    justify-content: center;
  }

  .category-card {
    width: 100%; /* Карточки занимают всю доступную ширину */
  }
</style>

<script>
  export let activePage;

  let menuItems = [
    { icon: "home-outline", tooltip: "Главная", page: "home" },
    { icon: "stats-chart-outline", tooltip: "График", page: "chart" },
    { icon: "wallet-outline", tooltip: "Баланс", page: "balance" },
    { icon: "settings-outline", tooltip: "Настройки", page: "settings" }
  ];
</script>

<style>
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 60px;
    height: 100vh;
    background: #1e1e1e;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 20px;
  }

  .menu-item {
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 10px 0;
    color: white;
    font-size: 24px;
    cursor: pointer;
  }

  .menu-item:hover {
    background: #333;
    border-radius: 8px;
  }

  ion-icon {
    font-size: 24px;
    color: white;
  }
</style>

<div class="sidebar">
  {#each menuItems as item}
    <div class="menu-item" title="{item.tooltip}" on:click={() => activePage = item.page}>
      <ion-icon name="{item.icon}"></ion-icon>
    </div>
  {/each}
</div>

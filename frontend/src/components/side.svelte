<script>
    let menuItems = [
      { icon: "🏠", tooltip: "Главная" },
      { icon: "📈", tooltip: "График" },
      { icon: "💰", tooltip: "Баланс" },
      { icon: "⚙️", tooltip: "Настройки" }
    ];
  </script>
  
  <style>
    /* Убираем отступы у body */
    :global(body) {
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
  
    /* Прижимаем Sidebar к левому краю */
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
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
  </style>
  
  <div class="sidebar">
    {#each menuItems as item}
      <div class="menu-item" title="{item.tooltip}">
        {item.icon}
      </div>
    {/each}
  </div>
  
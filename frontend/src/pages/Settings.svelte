<script>
  let activeTab = "trading";

  // Trading settings
  let tradingCapital = 1000;
  let leverage = 1;
  let isChanged = false;

  // Exchange settings
  let selectedExchange = "binance";
  let apiKey = "";
  let secretKey = "";
  let tradingMode = "spot"; // spot | futures
  let isExchangeChanged = false;

  function handleChange() {
    isChanged = true;
  }

  function handleExchangeChange() {
    isExchangeChanged = true;
  }

  function submitTrading() {
    console.log(`Trading Settings Submitted: Capital = ${tradingCapital}, Leverage = x${leverage}`);
    isChanged = false;
  }

  function submitExchange() {
    console.log(`Exchange Settings Submitted: Exchange = ${selectedExchange}, API Key = ${apiKey}, Trading Mode = ${tradingMode}`);
    isExchangeChanged = false;
  }
</script>

<style>
  .tabs {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    border-bottom: 2px solid #444;
  }

  .tab {
    padding: 6px 12px;
    cursor: pointer;
    font-size: 16px;
    color: #aaa;
    border-bottom: 3px solid transparent;
    transition: 0.3s;
  }

  .tab.active {
    color: white;
    border-bottom: 3px solid #ff9800;
  }

  .settings-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px;
    max-width: 300px;
  }

  label {
    font-size: 14px;
    color: #ccc;
    margin-bottom: -5px;
  }

  input, select {
    padding: 10px;
    font-size: 16px;
    width: 100%;
    border: 1px solid #555;
    background: #1e1e1e;
    color: white;
    border-radius: 5px;
  }

   .button-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* Общий стиль кнопки */
  button {
    padding: 10px;
    font-size: 16px;
    cursor: pointer;
    border: none;
    color: white;
    border-radius: 5px;
    width: 100%;
    transition: 0.3s;
  }

  /* Зелёная кнопка Submit (неактивная) */
  .submit-btn {
    background: #666;
    cursor: not-allowed;
  }

  /* Зелёная кнопка Submit (активная) */
  .submit-btn.active {
    background: #28a745;
    cursor: pointer;
  }

  /* Ховер эффект только если кнопка активна */
  .submit-btn.active:hover {
    background: #218838;
  }

  /* Оранжевая кнопка Rebalance */
  .rebalance-btn {
    background: #ff9800;
  }

  .rebalance-btn:hover {
    background: #e68900;
  }
</style>

<div>
  <!-- Вкладки -->
  <div class="tabs">
    <div class="tab {activeTab === 'trading' ? 'active' : ''}" on:click={() => activeTab = 'trading'}>Trading</div>
    <div class="tab {activeTab === 'exchange' ? 'active' : ''}" on:click={() => activeTab = 'exchange'}>Exchange</div>
  </div>

  <!-- Контент вкладок -->
  <div class="content">
    {#if activeTab === "trading"}
      <h2>⚡ Trading Settings</h2>
      <div class="settings-container">
        <label>Капитал для торговли ($):</label>
        <input type="number" bind:value={tradingCapital} min="0" on:input={handleChange}>

        <label>Торговое плечо (x):</label>
        <input type="number" bind:value={leverage} min="1" on:input={handleChange}>

       <div class="button-container">
  <button class="submit-btn {isChanged ? 'active' : ''}" on:click={submitTrading} disabled={!isChanged}>
    Submit
  </button>
  <button class="rebalance-btn">Rebalance</button>
</div>
      </div>

    {:else if activeTab === "exchange"}
      <h2>💱 Exchange Settings</h2>
      <div class="settings-container">
        <label>Выберите биржу:</label>
        <select bind:value={selectedExchange} on:change={handleExchangeChange}>
          <option value="binance">Binance</option>
          <option value="bybit">Bybit</option>
        </select>

        <label>API Key:</label>
        <input type="text" bind:value={apiKey} on:input={handleExchangeChange}>

        <label>Secret Key:</label>
        <input type="text" bind:value={secretKey} on:input={handleExchangeChange}>

        <label>Режим торговли:</label>
        <select bind:value={tradingMode} on:change={handleExchangeChange}>
          <option value="spot">Спотовая торговля</option>
          <option value="futures">Фьючерсы</option>
        </select>

       <div class="button-container">
  <button class="submit-btn {isExchangeChanged ? 'active' : ''}" on:click={submitExchange} disabled={!isExchangeChanged}>
    Submit
  </button>
</div>
      </div>
    {/if}
  </div>
</div>

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

  // General settings
  let selectedLanguage = "en";
  let darkMode = false;
  let isGeneralChanged = false;

  function handleChange() {
    isChanged = true;
  }

  function handleExchangeChange() {
    isExchangeChanged = true;
  }

  function handleGeneralChange() {
    isGeneralChanged = true;
  }

  function submitTrading() {
    console.log(
      `Trading Settings Submitted: Capital = ${tradingCapital}, Leverage = x${leverage}`
    );
    isChanged = false;
  }

  function submitExchange() {
    console.log(
      `Exchange Settings Submitted: Exchange = ${selectedExchange}, API Key = ${apiKey}, Trading Mode = ${tradingMode}`
    );
    isExchangeChanged = false;
  }

  function submitGeneral() {
    console.log(
      `General Settings Submitted: Language = ${selectedLanguage}, Dark Mode = ${darkMode}`
    );
    isGeneralChanged = false;
  }
</script>

<div>
  <div class="tabs">
    <div
      class="tab {activeTab === 'trading' ? 'active' : ''}"
      on:click={() => (activeTab = "trading")}
    >
      Trading
    </div>
    <div
      class="tab {activeTab === 'exchange' ? 'active' : ''}"
      on:click={() => (activeTab = "exchange")}
    >
      Exchange
    </div>
    <div
      class="tab {activeTab === 'general' ? 'active' : ''}"
      on:click={() => (activeTab = "general")}
    >
      General
    </div>
  </div>

  <div class="content">
    {#if activeTab === "trading"}
      <h2>⚡ Trading Settings</h2>
      <div class="settings-container">
        <label>Капитал для торговли ($):</label>
        <input
          type="number"
          bind:value={tradingCapital}
          min="0"
          on:input={handleChange}
        />

        <label>Торговое плечо (x):</label>
        <input
          type="number"
          bind:value={leverage}
          min="1"
          on:input={handleChange}
        />

        <div class="button-container">
          <button
            class="submit-btn {isChanged ? 'active' : ''}"
            on:click={submitTrading}
            disabled={!isChanged}
          >
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
        <input
          type="text"
          bind:value={apiKey}
          on:input={handleExchangeChange}
        />

        <label>Secret Key:</label>
        <input
          type="text"
          bind:value={secretKey}
          on:input={handleExchangeChange}
        />

        <label>Режим торговли:</label>
        <select bind:value={tradingMode} on:change={handleExchangeChange}>
          <option value="spot">Спотовая торговля</option>
          <option value="futures">Фьючерсы</option>
        </select>

        <div class="button-container">
          <button
            class="submit-btn {isExchangeChanged ? 'active' : ''}"
            on:click={submitExchange}
            disabled={!isExchangeChanged}
          >
            Submit
          </button>
        </div>
      </div>
    {:else if activeTab === "general"}
      <h2>⚙️ General Settings</h2>
      <div class="settings-container">
        <label>Выберите язык:</label>
        <select bind:value={selectedLanguage} on:change={handleGeneralChange}>
          <option value="en">English</option>
          <option value="ru">Русский</option>
        </select>

        <label>Тёмная тема:</label>

        <div class="setting-row">
          <div class="theme-toggle-container">
            <label for="theme-toggle" class="theme-switch">
              <span class="icon-sun">☀️</span>
              <input type="checkbox" id="theme-toggle" />
              <span class="slider"></span>
              <span class="icon-moon">🌙</span>
            </label>
          </div>
        </div>
        <div class="button-container">
          <button
            class="submit-btn {isGeneralChanged ? 'active' : ''}"
            on:click={submitGeneral}
            disabled={!isGeneralChanged}
          >
            Submit
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>

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

  input,
  select {
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

  .submit-btn {
    background: #666;
    cursor: not-allowed;
  }

  .submit-btn.active {
    background: #28a745;
    cursor: pointer;
  }

  .submit-btn.active:hover {
    background: #218838;
  }

  .rebalance-btn {
    background: #ff9800;
  }

  .rebalance-btn:hover {
    background: #e68900;
  }
  /* switcher theme */
  .theme-toggle-container {
    display: flex;
    align-items: center;
  }

  .theme-switch {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    width: 80px;
    height: 36px;
    background: var(--card-background, #3a3a3a);
    border-radius: 50px;
    padding: 0 8px;
    box-sizing: border-box;
    border: 2px solid var(--button-border-color, #555);
  }

  .icon-sun,
  .icon-moon {
    font-size: 18px;
    color: var(--text-color, #ffffff);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    user-select: none;
    pointer-events: none;
  }

  .theme-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    top: 50%;
    left: 4px;
    transform: translateY(-50%);
    width: 30px;
    height: 30px;
    background-color: var(--button-background, #ddd);
    border-radius: 50%;
    transition:
      transform 0.3s ease,
      background-color 0.3s ease;
    z-index: 0;
  }

  .theme-switch input:checked + .slider {
    transform: translate(42px, -50%);
    background-color: var(--button-hover-background, #007bff);
  }
</style>

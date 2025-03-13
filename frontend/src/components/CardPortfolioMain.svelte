<script>
    export let name = "";
    let activeTab = "review";
</script>

<style>
    .large-category-card {
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        font-size: 24px;
        font-weight: bold;
        min-height: 100vh; /* Высота на всю страницу */
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        cursor: pointer;
        transition: 0.3s;
        background: #2a2a2a;
        color: white;
        width: 100%; /* Растягиваем на всю ширину */
    }

    .tabs {
        display: flex;
        justify-content: flex-start; /* Прижимаем к левой стороне */
        gap: 10px;
        margin-bottom: 20px;
        padding: 10px;
        border-bottom: 2px solid #444;
        width: 100%;
    }

    .tab {
        padding: 5px 10px; /* Делаем меньше */
        cursor: pointer;
        font-size: 14px; /* Уменьшаем размер текста */
        color: #aaa;
        border-bottom: 2px solid transparent;
        transition: 0.3s;
    }

    .tab.active {
        color: white;
        border-bottom: 2px solid #ff9800;
    }
</style>

<div class="large-category-card">
    <div class="tabs">
        <div class="tab {activeTab === 'review' ? 'active' : ''}" on:click={() => activeTab = 'review'}>Review</div>
        <div class="tab {activeTab === 'positions' ? 'active' : ''}" on:click={() => activeTab = 'positions'}>Positions</div>
    </div>

    {#if activeTab === "review"}
        <h1>Review Content</h1>
        <p>Here is some placeholder content for the review section.</p>
    {:else if activeTab === "positions"}
        <h1>Positions Content</h1>
        <p>Here is some placeholder content for the positions section.</p>
    {/if}
</div>

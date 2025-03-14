<script lang="ts">
    export let name: string = "";
    export let age: string = "";
    export let minDeposit: string = "";
</script>

<style>
    .category-card {
        padding: 20px;
        border-radius: 12px;
        background: #2a2a2a;
        color: white;
        width: 100%;
        font-family: sans-serif;
    }

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .title {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .name {
        font-size: 22px;
        font-weight: bold;
    }

    .author {
        font-size: 14px;
        color: #bbb;
    }

    .divider {
        width: 100%;
        height: 1px;
        background: rgba(255, 255, 255, 0.2);
        margin: 12px 0;
    }

    .info {
        display: flex;
        font-size: 14px;
        color: #aaa;
        justify-content: flex-start;
        gap: 20px; /* Расстояние между элементами */
    }

    .highlight {
        font-weight: bold;
        color: white;
    }

    .footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 10px;
    }

    .invest-button {
        background: #a58bff;
        border-radius: 6px;
        padding: 8px 14px;
        cursor: pointer;
        transition: 0.3s;
        font-size: 14px;
        font-weight: bold;
        text-align: center;
    }

    .invest-button:hover {
        background: #8b73e6;
    }
</style>

<div class="category-card">
    <div class="header">
        <div class="title">
            <img src="/binance-icon.png" alt="Icon" width="24" height="24" />
            <div>
                <div class="name">{name}</div>
                <div class="author">от FinTechMe</div>
            </div>
        </div>
    </div>

    <div class="divider"></div>

    <div class="footer">
        <div class="info">
            <span>Возраст <span class="highlight">{age} дней</span></span> 
            <!-- <span>Мин. Депозит <span class="highlight">${minDeposit}K</span></span> -->
        </div>
        <div class="invest-button">Инвестировать</div>
    </div>
</div>

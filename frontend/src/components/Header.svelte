<script>
    import { onMount } from "svelte";

    let balance = 0;
</script>

<style>
    .header {
        position: fixed;
        top: 0;
        width: calc(100% - 60px); /* Заполняет оставшееся пространство */
        height: 50px; /* Тонкая плашка */
        background: #1e1e1e;
        color: white;
        display: flex;
        align-items: center;
        justify-content: space-between; /* Разделяем элементы */
        padding: 0 30px; /* Увеличили отступ справа */
        font-size: 14px;
        font-weight: normal;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        z-index: 0;
    }

    .right-section {
        display: flex;
        align-items: center;
        gap: 20px; /* Увеличили расстояние между иконками */
    }

    .icon {
        cursor: pointer;
        font-size: 18px;
        display: flex;
        align-items: center;
    }

    .balance {
        font-weight: bold;
        padding-right: 20px; /* Дополнительный отступ справа */
    }
        .icon {
        cursor: pointer;
        font-size: 20px;
        display: flex;
        align-items: center;
    }
</style>

<div class="header">
    <div></div> <!-- Пустой div для балансировки flex -->
    <div class="right-section">
            <div class="balance">0 USDT</div> <!-- Баланс с увеличенным отступом -->

         <div class="icon" title="Globe">
            <ion-icon name="globe-outline"></ion-icon>
        </div>
        <div class="icon" title="Moon">
            <ion-icon name="moon-outline"></ion-icon>
        </div>
    </div>
</div>

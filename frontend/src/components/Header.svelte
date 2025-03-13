<script>
    import { onMount } from "svelte";

    let balance = 0;

</script>

<style>
    .header {
        position: fixed;
        top: 0;
        left: 60px; /* Учитываем ширину sidebar */
        width: calc(100% - 60px); /* Заполняет оставшееся пространство */
        height: 50px; /* Тонкая плашка */
        background: #1e1e1e;
        color: white;
        display: flex;
        align-items: center;
        justify-content: flex-end; /* Перемещаем баланс направо */
        padding: 0 20px;
        font-size: 14px; /* Уменьшенный шрифт */
        font-weight: normal;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        z-index: 999; /* Ниже sidebar */
    }
</style>

<div class="header">
    Баланс: {balance} USDT
</div>
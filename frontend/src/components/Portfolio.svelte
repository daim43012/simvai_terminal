<script>
    export let name = "";
</script>

<style>
    .portfolio-card {
        padding: 30px;
        border-radius: 8px;
        text-align: center;
        font-size: 24px;
        font-weight: bold;
        height: 400px; /* Увеличенные квадратные блоки */
        width: 100%; /* Растягиваем на всю ширину */
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: 0.3s;
        background: #2a2a2a;
        color: white;
    }

    .portfolio-card:hover {
        filter: brightness(90%);
    }
</style>

<div class="portfolio-card">
    {name}
</div>

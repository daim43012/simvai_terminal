<script>
    export let name = "";
</script>

<style>
    .category-card {
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        font-size: 20px;
        font-weight: bold;
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: 0.3s;
        background: #2a2a2a;
        color: white;
        width: 100%; /* Растягиваем на всю ширину */
    }

    .category-card:hover {
        filter: brightness(90%);
    }
</style>

<div class="category-card">
    {name}
</div>

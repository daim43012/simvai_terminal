<script lang="ts">
    import Categories from "../components/Categories.svelte";
    import Portfolios from "../components/Portfolios.svelte";
    import { createEventDispatcher } from "svelte";

    export let activePage: string; // Теперь явно передаем

    const dispatch = createEventDispatcher();

    function openPortfolio(id: any) {
        dispatch("openPortfolio", id);
    }
</script>

<Categories bind:activePage />
<Portfolios on:openPortfolio={openPortfolio} />

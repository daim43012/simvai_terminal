<script>
    import Categories from "../components/Categories.svelte";
    import Portfolios from "../components/Portfolios.svelte";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    function openPortfolio(id) {
        dispatch("openPortfolio", id);
    }
</script>

<Categories />
<Portfolios on:openPortfolio={openPortfolio} />

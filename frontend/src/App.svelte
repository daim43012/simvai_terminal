<script>
  import Sidebar from "./components/side.svelte";
</script>

<style>
  .container {
    display: flex;
  }

  .content {
    flex-grow: 1;
    padding: 20px;
  }
</style>

<div class="container">
  <Sidebar />
  <div class="content">
    <h1>Добро пожаловать в Simvai Terminal</h1>
  </div>
</div>

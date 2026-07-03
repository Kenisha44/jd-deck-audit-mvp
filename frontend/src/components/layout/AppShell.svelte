<script>
  import Sidebar from "./Sidebar.svelte";
  import Topbar from "./Topbar.svelte";
</script>

<div class="layout">

    <Sidebar />

    <div class="content">

        <Topbar />

        <main>

            <slot />

        </main>

    </div>

</div>

<style>

.layout{
    display:grid;
    grid-template-columns:260px 1fr;
    min-height:100vh;
    background:#f8fafc;
}

.content{
    display:flex;
    flex-direction:column;
}

main{
    flex:1;
    padding:32px;
}

</style>
<script>
  import Sidebar from './Sidebar.svelte';
  import Topbar from './Topbar.svelte';

  export let activePage = 'dashboard';
  export let setActivePage = () => {};
  export let darkMode = false;
  export let toggleDarkMode = () => {};
</script>

<div class="layout">
  <Sidebar
    {activePage}
    {setActivePage}
  />

  <div class="content">
    <Topbar
      {darkMode}
      {toggleDarkMode}
    />

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
    background:var(--background);
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
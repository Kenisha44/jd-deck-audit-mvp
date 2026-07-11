<script>
  import Sidebar from './Sidebar.svelte';
  import Topbar from './Topbar.svelte';

  export let activePage = 'dashboard';
  export let setActivePage = () => {};
  export let darkMode = false;
  export let toggleDarkMode = () => {};
</script>

<div class="app-layout">
  <Sidebar
    {activePage}
    {setActivePage}
  />

  <div class="app-content">
    <Topbar
      {darkMode}
      {toggleDarkMode}
      {setActivePage}
    />

    <main class="page-content">
      <slot />
    </main>
  </div>
</div>

<style>
  .app-layout {
    display: grid;
    grid-template-columns:
      var(--sidebar-width, 240px)
      minmax(0, 1fr);

    min-height: 100vh;
    background: var(--background);
    color: var(--text);
  }

  .app-content {
    min-width: 0;
    display: flex;
    flex-direction: column;
    background: var(--background);
  }

  .page-content {
    flex: 1;
    min-width: 0;
    padding: 32px;
    background: var(--background);
    color: var(--text);
  }

  @media (max-width: 980px) {
    .app-layout {
      grid-template-columns: 1fr;
    }

    .page-content {
      padding: 22px;
    }
  }

  @media (max-width: 620px) {
    .page-content {
      padding: 16px;
    }
  }
</style>
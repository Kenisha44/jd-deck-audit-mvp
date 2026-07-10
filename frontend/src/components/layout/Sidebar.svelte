<script>
  export let activePage = 'dashboard';
  export let setActivePage = () => {};

  const items = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'new-audit', name: 'New Audit', icon: '✚' },
    { id: 'saved-audits', name: 'Saved Audits', icon: '📁' },
    { id: 'templates', name: 'Templates', icon: '📄' },
    { id: 'history', name: 'History', icon: '◷' },
    { id: 'analytics', name: 'Analytics', icon: '📈' },
    { id: 'settings', name: 'Settings', icon: '⚙' }
  ];

  function navigate(pageId) {
    setActivePage(pageId);
  }
</script>

<aside class="sidebar">
  <div class="brand">
    <div class="logo">JD</div>

    <div>
      <h2>Johken Design</h2>
      <span>Deck Audit</span>
    </div>
  </div>

  <nav aria-label="Primary navigation">
    {#each items as item}
      <button
        class:active={activePage === item.id}
        aria-current={activePage === item.id ? 'page' : undefined}
        on:click={() => navigate(item.id)}
      >
        <span class="icon">{item.icon}</span>
        <span>{item.name}</span>
      </button>
    {/each}
  </nav>

  <div class="upgrade">
    <h3>Upgrade to Pro</h3>

    <p>
      Unlimited audits<br />
      AI Rewrite<br />
      PDF Export<br />
      Priority Support
    </p>

    <button class="upgrade-button" on:click={() => navigate('billing')}>
      Upgrade
    </button>
  </div>
</aside>

<style>
  .sidebar {
    position: sticky;
    top: 0;
    height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 24px 18px;
    box-sizing: border-box;
    background: var(--panel);
    border-right: 1px solid var(--border);
  }

  .brand {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 36px;
  }

  .logo {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    background: #2563eb;
    color: white;
    border-radius: 8px;
    font-weight: 800;
  }

  .brand h2 {
    margin: 0;
    font-size: 16px;
  }

  .brand span {
    color: var(--muted);
    font-size: 12px;
  }

  nav {
    display: grid;
    gap: 6px;
  }

  nav button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--text);
    font: inherit;
    font-weight: 650;
    text-align: left;
    cursor: pointer;
  }

  nav button:hover {
    background: var(--surface-hover);
  }

  nav button.active {
    background: var(--active-background);
    color: #2563eb;
  }

  .icon {
    width: 20px;
    text-align: center;
  }

  .upgrade {
    margin-top: auto;
    padding: 18px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
  }

  .upgrade h3 {
    margin: 0 0 9px;
  }

  .upgrade p {
    color: var(--muted);
    font-size: 13px;
    line-height: 1.65;
  }

  .upgrade-button {
    width: 100%;
    margin-top: 12px;
    padding: 11px;
    border: 0;
    border-radius: 7px;
    background: #2563eb;
    color: white;
    font-weight: 750;
    cursor: pointer;
  }

  @media (max-width: 900px) {
    .sidebar {
      position: static;
      height: auto;
    }

    nav {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .upgrade {
      display: none;
    }
  }
</style>
<script>
  export let darkMode = false;
  export let toggleDarkMode = () => {};
  export let setActivePage = () => {};

  let search = '';
</script>

<header class="topbar">
  <div class="search-wrap">
    <span class="search-icon">⌕</span>

    <input
      bind:value={search}
      aria-label="Search audits and projects"
      placeholder="Search audits, projects..."
    />
  </div>

<div class="actions">
  <button
    class="icon-button"
    title={darkMode ? 'Use light mode' : 'Use dark mode'}
    aria-label={darkMode ? 'Use light mode' : 'Use dark mode'}
    on:click={toggleDarkMode}
  >
    {darkMode ? '☀️' : '🌙'}
  </button>

  <button
    class="icon-button notification"
    title="Notifications"
    aria-label="Notifications"
  >
    🔔
    <span class="notification-dot"></span>
  </button>

  <button
    class="avatar"
    aria-label="Open profile"
    on:click={() => setActivePage('profile')}
  >
    JD
  </button>
</div>
</header>

<style>
.topbar {
  position: sticky;
  top: 0;
  z-index: 20;

  min-height: 76px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;

  padding: 14px 32px;

  background: var(--panel);
  color: var(--text);

  border-bottom: 1px solid var(--border);
}

  .search-wrap {
    width: min(440px, 100%);
    position: relative;
  }

  .search-icon {
    position: absolute;
    top: 50%;
    left: 14px;
    transform: translateY(-50%);
    color: var(--muted);
  }

  input {
    width: 100%;
    box-sizing: border-box;
    padding: 12px 14px 12px 38px;
    border: 1px solid var(--border);
    border-radius: 9px;
    outline: none;
    background: var(--surface);
    color: var(--text);
    font: inherit;
  }

  input:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.14);
  }

.actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex: 0 0 auto;
}

.icon-button,
.avatar {
  width: 42px;
  height: 42px;
  min-width: 42px;

  display: inline-grid;
  place-items: center;

  margin: 0;
  padding: 0;

  border: 1px solid var(--border);
  border-radius: 9px;

  background: var(--surface);
  color: var(--text);

  line-height: 1;
  vertical-align: middle;

  cursor: pointer;
}

.icon-button:hover {
  background: var(--surface-hover);
}

 .notification {
  position: relative;
}

.notification-dot {
  position: absolute;
  top: 7px;
  right: 7px;

  width: 7px;
  height: 7px;

  border-radius: 50%;
  background: var(--danger);
}

 .avatar {
  position: static;
  transform: none;

  background: var(--blue);
  border-color: var(--blue);
  color: #ffffff;

  font-size: 14px;
  font-weight: 850;
}


  @media (max-width: 700px) {
    .topbar {
      padding: 12px 18px;
    }

    .search-wrap {
      display: none;
    }
  }
</style>
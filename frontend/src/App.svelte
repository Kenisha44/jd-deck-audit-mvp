<script>
  import { onMount } from 'svelte';

  import AppShell from './components/layout/AppShell.svelte';
  import DashboardPage from './pages/DashboardPage.svelte';
  import LoginPage from './pages/LoginPage.svelte';
  import SignupPage from './pages/SignupPage.svelte';
  import ProfilePage from './pages/ProfilePage.svelte';
  import SettingsPage from './pages/SettingsPage.svelte';
  import ComingSoon from './components/common/ComingSoon.svelte';

  let activePage = 'dashboard';
  let darkMode = false;
  
  onMount(() => {
    darkMode = localStorage.getItem('jd-theme') === 'dark';
    applyTheme();
  });

  function setActivePage(page) {
    activePage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toggleDarkMode() {
    darkMode = !darkMode;
    localStorage.setItem('jd-theme', darkMode ? 'dark' : 'light');
    applyTheme();
  }

  function applyTheme() {
    document.documentElement.dataset.theme =
      darkMode ? 'dark' : 'light';
  }
</script>

<AppShell
  {activePage}
  {setActivePage}
  {darkMode}
  {toggleDarkMode}
>
  {#if activePage === 'dashboard' || activePage === 'new-audit'}
    <DashboardPage />
  {:else if activePage === 'settings'}
    <SettingsPage />
  {:else if activePage === 'profile'}
    <ProfilePage />
  {:else if activePage === 'login'}
    <LoginPage />
  {:else if activePage === 'signup'}
    <SignupPage />
    {:else if activePage === 'saved-audits'}

    <ComingSoon
        title="Saved Audits"
        description="Cloud-saved audit history will appear here after authentication."
    />

{:else if activePage === 'templates'}

    <ComingSoon
        title="Templates"
        description="Executive presentation templates will live here."
    />

{:else if activePage === 'history'}

    <ComingSoon
        title="History"
        description="Review every audit you've completed."
    />

{:else if activePage === 'analytics'}

    <ComingSoon
        title="Analytics"
        description="Track score improvements and presentation trends."
    />
  {:else}
    <section class="placeholder-page">
      <p class="eyebrow accent">JD Workspace</p>
      <h1>{activePage.replace('-', ' ')}</h1>
      <p>This section will be completed during the next product sprint.</p>

      <button on:click={() => setActivePage('dashboard')}>
        Return to Dashboard
      </button>
    </section>
  {/if}

  
</AppShell>

<style>
  .placeholder-page {
    min-height: 420px;
    display: grid;
    place-content: center;
    justify-items: start;
    gap: 12px;
    padding: 36px;
    border: 1px solid var(--border);
    background: var(--panel);
  }

  .placeholder-page h1 {
    margin: 0;
    text-transform: capitalize;
  }

  .placeholder-page p {
    color: var(--muted);
  }

  .placeholder-page button {
    margin-top: 10px;
    padding: 11px 16px;
    border: 0;
    background: #2563eb;
    color: white;
    cursor: pointer;
  }
</style>
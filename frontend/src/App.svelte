<script>
  import { onMount } from 'svelte';

  import AppShell from './components/layout/AppShell.svelte';
  import ComingSoon from './components/common/ComingSoon.svelte';

  import DashboardPage from './pages/DashboardPage.svelte';
  import LoginPage from './pages/LoginPage.svelte';
  import SignupPage from './pages/SignupPage.svelte';
  import SettingsPage from './pages/SettingsPage.svelte';

  import ForgotPasswordPage from './pages/ForgotPasswordPage.svelte';
  import ResetPasswordPage from './pages/ResetPasswordPage.svelte';
  
  import {
    user,
    authLoading,
    initializeAuth,
    signOut
  } from './stores/authStore.js';

import NewAuditPage
  from './pages/NewAuditPage.svelte';


import SavedAuditsPage
from './pages/SavedAuditsPage.svelte';

  let latestAudit = null;
  let activePage = 'login';
  let darkMode = false;

 onMount(async () => {
  darkMode =
    localStorage.getItem('jd-theme') === 'dark';

  applyTheme();

  const requestedView =
    new URLSearchParams(
      window.location.search
    ).get('view');

  await initializeAuth();

  if (requestedView === 'reset-password') {
    activePage = 'reset-password';
  } else {
    activePage = $user
      ? 'dashboard'
      : 'login';
  }
});
if (window.location.hash.includes('reset-password')) {
  activePage = 'reset-password';
} else {
  activePage = $user
    ? 'dashboard'
    : 'login';
}

function handleOpenAudit(audit){

    latestAudit = audit;

}

function handleAuditComplete(completedAudit) {
  latestAudit = completedAudit;
}

  function applyTheme() {
    document.documentElement.dataset.theme =
      darkMode ? 'dark' : 'light';
  }

  function toggleDarkMode() {
    darkMode = !darkMode;

    localStorage.setItem(
      'jd-theme',
      darkMode ? 'dark' : 'light'
    );

    applyTheme();
  }

  function setActivePage(page) {
    const protectedPages = [
      'dashboard',
      'new-audit',
      'saved-audits',
      'templates',
      'history',
      'analytics',
      'settings',
      'billing'
    ];

    if (
      protectedPages.includes(page) &&
      !$user
    ) {
      activePage = 'login';
      return;
    }

    activePage = page;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  async function handleLogout() {
    const result = await signOut();

    if (result.success) {
      activePage = 'login';
    }
  }
</script>

{#if $authLoading}
  <section class="auth-loading">
    <div class="loading-card panel">
      <div class="loading-logo">JD</div>

      <div>
        <p class="eyebrow accent">
          Johken Design
        </p>

        <h1>Loading your workspace</h1>

        <p>
          Checking your account and restoring
          your session.
        </p>
      </div>
    </div>
  </section>

{:else if activePage === 'reset-password'}
  <main class="public-app">
    <header class="public-topbar">
      <button
        class="brand-button"
        on:click={() => setActivePage('login')}
      >
        <span class="brand-mark">JD</span>

        <span>
          <strong>Johken Design</strong>
          <small>Deck Audit</small>
        </span>
      </button>

      <button
        class="theme-button"
        on:click={toggleDarkMode}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
    </header>

    <ResetPasswordPage {setActivePage} />
  </main>


{:else if !$user}
  <main class="public-app">
    <header class="public-topbar">
      <button
        class="brand-button"
        on:click={() =>
          setActivePage('login')}
      >
        <span class="brand-mark">JD</span>

        <span>
          <strong>Johken Design</strong>
          <small>Deck Audit</small>
        </span>
      </button>

      <button
        class="theme-button"
        on:click={toggleDarkMode}
        aria-label={
          darkMode
            ? 'Switch to light mode'
            : 'Switch to dark mode'
        }
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
    </header>

   {#if activePage === 'signup'}
  <SignupPage {setActivePage} />

{:else if activePage === 'forgot-password'}
  <ForgotPasswordPage {setActivePage} />

{:else if activePage === 'reset-password'}
  <ResetPasswordPage {setActivePage} />

{:else}
  <LoginPage {setActivePage} />
{/if}
  </main>

{:else}
  <AppShell
    {activePage}
    {setActivePage}
    {darkMode}
    {toggleDarkMode}
  >
    {#if activePage === 'dashboard'}
  <DashboardPage
    initialAudit={latestAudit}
  />

    {:else if activePage === 'new-audit'}
  <NewAuditPage
    setActivePage={setActivePage}
    onAuditComplete={handleAuditComplete}
  />

    {:else if activePage === 'saved-audits'}

    <SavedAuditsPage

        setActivePage={setActivePage}

        onOpenAudit={handleOpenAudit}

    />


    {:else if activePage === 'templates'}
      <ComingSoon
        title="Templates"
        description="Executive presentation templates and JD layouts will live here."
      />

    {:else if activePage === 'history'}
      <ComingSoon
        title="Audit History"
        description="Review previous audits and compare presentation scores over time."
      />

    {:else if activePage === 'analytics'}
      <ComingSoon
        title="Analytics"
        description="Track audit activity, score improvements, and presentation trends."
      />

    {:else if activePage === 'settings'}
      <SettingsPage />

    {:else if activePage === 'billing'}
      <ComingSoon
        title="Billing"
        description="Subscription plans and account billing will be added in the SaaS billing epic."
      />

    {:else if activePage === 'profile'}
      <section class="profile-page panel">
        <p class="eyebrow accent">
          Account
        </p>

        <h1>
          {$user.user_metadata?.full_name ||
            'JD User'}
        </h1>

        <p class="profile-email">
          {$user.email}
        </p>

        <button
          class="primary-button"
          on:click={handleLogout}
          disabled={$authLoading}
        >
          {$authLoading
            ? 'Signing out...'
            : 'Sign Out'}
        </button>
      </section>

    {:else}
      <ComingSoon
        title="JD Workspace"
        description="This section is planned for a future product sprint."
      />
    {/if}
  </AppShell>
{/if}

<style>
  .auth-loading {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 24px;
    background: var(--background);
    color: var(--text);
  }

  .loading-card {
    width: min(100%, 560px);
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 18px;
    align-items: center;
    padding: 32px;
    background: var(--panel);
    color: var(--text);
  }

  .loading-logo,
  .brand-mark {
    width: 52px;
    height: 52px;
    display: grid;
    place-items: center;
    background: var(--blue);
    color: white;
    font-weight: 900;
  }

  .loading-card h1 {
    margin: 0;
  }

  .loading-card p:last-child {
    margin-top: 8px;
    color: var(--muted);
  }

  .public-app {
    min-height: 100vh;
    background: var(--background);
    color: var(--text);
  }

  .public-topbar {
    min-height: 76px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 12px 28px;
    border-bottom: 1px solid var(--border);
    background: var(--panel);
  }

  .brand-button {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--text);
    text-align: left;
    cursor: pointer;
  }

  .brand-button > span:last-child {
    display: grid;
    gap: 2px;
  }

  .brand-button strong {
    font-size: 15px;
  }

  .brand-button small {
    color: var(--muted);
  }

  .theme-button {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    border: 1px solid var(--border);
    border-radius: 9px;
    background: var(--surface);
    color: var(--text);
    cursor: pointer;
  }

  .profile-page {
    min-height: 420px;
    display: grid;
    place-content: center;
    justify-items: start;
    gap: 12px;
    padding: 36px;
    background: var(--panel);
    color: var(--text);
  }

  .profile-page h1 {
    margin: 0;
  }

  .profile-email {
    color: var(--muted);
  }

  @media (max-width: 620px) {
    .public-topbar {
      padding: 12px 18px;
    }

    .loading-card {
      grid-template-columns: 1fr;
    }
  }
</style>
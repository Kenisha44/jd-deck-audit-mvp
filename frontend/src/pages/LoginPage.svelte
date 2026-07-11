<script>
  import {
    signIn,
    authLoading,
    authError,
    clearAuthError
  } from '../stores/authStore.js';

  export let setActivePage = () => {};

  let email = '';
  let password = '';
  let localError = '';

  async function handleSubmit() {
    clearAuthError();
    localError = '';

    if (!email.trim() || !password) {
      localError =
        'Enter your email address and password.';
      return;
    }

    const result = await signIn({
      email: email.trim(),
      password
    });

    if (result.success) {
      setActivePage('dashboard');
    }
  }
</script>

<section class="auth-page">
  <div class="auth-card panel">
    <div class="auth-heading">
      <div class="logo">JD</div>

      <div>
        <p class="eyebrow accent">
          Welcome Back
        </p>

        <h1>Sign in to JD</h1>

        <p>
          Continue to your deck-audit workspace.
        </p>
      </div>
    </div>

    <form on:submit|preventDefault={handleSubmit}>
      <label>
        <span>Email address</span>

        <input
          bind:value={email}
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
        />
      </label>

      <label>
        <span>Password</span>

        <input
          bind:value={password}
          type="password"
          autocomplete="current-password"
          placeholder="Enter your password"
        />
      </label>

      {#if localError}
        <p class="message error">
          {localError}
        </p>
      {/if}

      {#if $authError}
        <p class="message error">
          {$authError}
        </p>
      {/if}

      <button
        class="primary-button"
        type="submit"
        disabled={$authLoading}
      >
        {$authLoading
          ? 'Signing in...'
          : 'Sign In'}
      </button>
    </form>

    <div class="auth-footer">
      <button
        type="button"
        on:click={() =>
          setActivePage('forgot-password')}
      >
        Forgot password?
      </button>

      <p>
        New to JD?

        <button
          type="button"
          on:click={() =>
            setActivePage('signup')}
        >
          Create an account
        </button>
      </p>
    </div>
  </div>
</section>

<style>
  .auth-page {
    min-height: calc(100vh - 150px);
    display: grid;
    place-items: center;
    padding: 30px;
  }

  .auth-card {
    width: min(100%, 520px);
    display: grid;
    gap: 28px;
    padding: 34px;
    background: var(--panel);
    color: var(--text);
  }

  .auth-heading {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 18px;
    align-items: start;
  }

  .logo {
    width: 52px;
    height: 52px;
    display: grid;
    place-items: center;
    background: var(--blue);
    color: #ffffff;
    font-weight: 900;
  }

  h1 {
    margin: 0;
    font-size: 34px;
  }

  .auth-heading p:last-child {
    margin-top: 8px;
    color: var(--muted);
  }

  form {
    display: grid;
    gap: 18px;
  }

  label {
    display: grid;
    gap: 8px;
  }

  label span {
    font-size: 13px;
    font-weight: 750;
  }

  input {
    width: 100%;
    padding: 14px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
  }

  input:focus {
    outline: none;
    border-color: var(--blue);
    box-shadow:
      0 0 0 3px rgba(37, 99, 235, 0.14);
  }

  .message {
    padding: 12px;
    border: 1px solid;
  }

  .message.error {
    color: var(--danger);
    background: var(--danger-soft);
    border-color: var(--danger-border);
  }

  .auth-footer {
    display: grid;
    gap: 14px;
    color: var(--muted);
    text-align: center;
  }

  .auth-footer button {
    border: 0;
    background: transparent;
    color: var(--blue);
    font-weight: 800;
    cursor: pointer;
  }

  @media (max-width: 620px) {
    .auth-page {
      padding: 16px;
    }

    .auth-card {
      padding: 24px;
    }

    .auth-heading {
      grid-template-columns: 1fr;
    }
  }
</style>
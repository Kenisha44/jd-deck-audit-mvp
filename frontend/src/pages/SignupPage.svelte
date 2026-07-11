<script>
  import {
    signUp,
    authLoading,
    authError,
    clearAuthError
  } from '../stores/authStore.js';

  export let setActivePage = () => {};

  let name = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let successMessage = '';
  let localError = '';

  async function handleSubmit() {
    clearAuthError();
    localError = '';
    successMessage = '';

    if (!name.trim()) {
      localError = 'Enter your name.';
      return;
    }

    if (!email.trim()) {
      localError = 'Enter your email address.';
      return;
    }

    if (password.length < 8) {
      localError =
        'Your password must contain at least 8 characters.';
      return;
    }

    if (password !== confirmPassword) {
      localError = 'The passwords do not match.';
      return;
    }

    const result = await signUp({
      name: name.trim(),
      email: email.trim(),
      password
    });

    if (result.success) {
      successMessage =
        'Account created. Check your email to confirm your account.';

      name = '';
      email = '';
      password = '';
      confirmPassword = '';
    }
  }
</script>

<section class="auth-page">
  <div class="auth-card panel">
    <div class="auth-heading">
      <div class="logo">JD</div>

      <div>
        <p class="eyebrow accent">
          Johken Design
        </p>

        <h1>Create your account</h1>

        <p>
          Save audits, revisit reports, and manage
          your presentation workspace.
        </p>
      </div>
    </div>

    <form on:submit|preventDefault={handleSubmit}>
      <label>
        <span>Full name</span>

        <input
          bind:value={name}
          autocomplete="name"
          placeholder="Kenisha Johnson"
        />
      </label>

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
          autocomplete="new-password"
          placeholder="At least 8 characters"
        />
      </label>

      <label>
        <span>Confirm password</span>

        <input
          bind:value={confirmPassword}
          type="password"
          autocomplete="new-password"
          placeholder="Repeat your password"
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

      {#if successMessage}
        <p class="message success">
          {successMessage}
        </p>
      {/if}

      <button
        class="primary-button"
        type="submit"
        disabled={$authLoading}
      >
        {$authLoading
          ? 'Creating account...'
          : 'Create Account'}
      </button>
    </form>

    <p class="switch-copy">
      Already have an account?

      <button
        type="button"
        on:click={() =>
          setActivePage('login')}
      >
        Sign in
      </button>
    </p>
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
    width: min(100%, 560px);
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

  .message.success {
    color: var(--success);
    background: var(--success-soft);
    border-color: var(--success-border);
  }

  .switch-copy {
    color: var(--muted);
    text-align: center;
  }

  .switch-copy button {
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
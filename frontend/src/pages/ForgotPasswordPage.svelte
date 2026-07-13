<script>
  import {
    sendPasswordReset,
    authLoading,
    authError,
    clearAuthError
  } from '../stores/authStore.js';

  export let setActivePage = () => {};

  let email = '';
  let localError = '';
  let successMessage = '';

  async function handleSubmit() {
    clearAuthError();
    localError = '';
    successMessage = '';

    if (!email.trim()) {
      localError = 'Enter your email address.';
      return;
    }

    const result = await sendPasswordReset(
      email.trim()
    );

    if (result.success) {
      successMessage =
        'Check your email for a password reset link.';
    }
  }
</script>

<section class="auth-page">
  <div class="auth-card panel">
    <p class="eyebrow accent">
      Account Recovery
    </p>

    <h1>Reset your password</h1>

    <p class="intro">
      Enter your account email and we’ll send you
      a secure reset link.
    </p>

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
          ? 'Sending reset link...'
          : 'Send Reset Link'}
      </button>
    </form>

    <button
      class="back-button"
      type="button"
      on:click={() =>
        setActivePage('login')}
    >
      Return to sign in
    </button>
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
    gap: 20px;
    padding: 34px;
    background: var(--panel);
    color: var(--text);
  }

  .intro {
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

  .back-button {
    border: 0;
    background: transparent;
    color: var(--blue);
    font-weight: 800;
    cursor: pointer;
  }
</style>
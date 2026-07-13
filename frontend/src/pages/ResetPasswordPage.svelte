<script>
  import {
    updatePassword,
    authLoading,
    authError,
    clearAuthError
  } from '../stores/authStore.js';

  export let setActivePage = () => {};

  let password = '';
  let confirmPassword = '';
  let localError = '';
  let successMessage = '';

  async function handleSubmit() {
    clearAuthError();
    localError = '';
    successMessage = '';

    if (password.length < 8) {
      localError =
        'Your password must contain at least 8 characters.';
      return;
    }

    if (password !== confirmPassword) {
      localError =
        'The passwords do not match.';
      return;
    }

    const result =
      await updatePassword(password);

    if (result.success) {
      successMessage =
        'Password updated successfully.';

      password = '';
      confirmPassword = '';
  window.history.replaceState(
  {},
  document.title,
  window.location.origin
);
      setTimeout(() => {
        setActivePage('dashboard');
      }, 1200);
    }
  }


</script>

<section class="auth-page">
  <div class="auth-card panel">
    <p class="eyebrow accent">
      Secure Account
    </p>

    <h1>Create a new password</h1>

    <p class="intro">
      Enter a new password for your JD account.
    </p>

    <form on:submit|preventDefault={handleSubmit}>
      <label>
        <span>New password</span>

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
          ? 'Updating password...'
          : 'Update Password'}
      </button>
    </form>
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
</style>
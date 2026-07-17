<script>
  export let audit = null;
</script>

{#if audit}
  <section
    class="completion-banner panel sharp-panel no-print"
  >
    <div class="completion-icon">
      ✓
    </div>

    <div>
      <p class="eyebrow accent">
        Audit Complete
      </p>

      <h2>
        Executive analysis generated
      </h2>

      <p>
        JD reviewed
        {audit.slides?.length || 0}
        slides and created Presentation DNA,
        priority recommendations, and an
        Executive Health Report.
      </p>
    </div>

    <div class="completion-score">
      <strong>
        {audit.overall ?? '--'}
      </strong>

      <span>
        Overall Score
      </span>
    </div>
  </section>
{/if}

<style>
  .completion-banner {
    width: 100%;
    display: grid;
    grid-template-columns:
      auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: var(--panel);
    color: var(--text);
  }

  .completion-icon {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    background: var(--success);
    color: white;
    font-size: 21px;
    font-weight: 900;
  }

  .completion-banner h2 {
    margin: 0;
    font-size: 24px;
    letter-spacing: -0.03em;
  }

  .completion-banner p:last-child {
    margin-top: 8px;
    color: var(--muted);
  }

  .completion-score {
    min-width: 100px;
    display: grid;
    justify-items: center;
    gap: 3px;
    padding: 12px;
    border: 1px solid var(--border);
    background: var(--surface);
  }

  .completion-score strong {
    color: var(--orange);
    font-size: 32px;
    line-height: 1;
  }

  .completion-score span {
    color: var(--muted);
    font-size: 12px;
    font-weight: 750;
  }

  @media (max-width: 720px) {
    .completion-banner {
      grid-template-columns: 1fr;
      justify-items: start;
    }

    .completion-score {
      width: 100%;
    }
  }
</style>
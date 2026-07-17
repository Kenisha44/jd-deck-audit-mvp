<script>
  export let loading = false;
  export let runDemoAudit;
</script>

<section class="empty-dashboard panel sharp-panel">
  <div class="empty-icon">
    JD
  </div>

  <p class="eyebrow accent">
    Audit Results
  </p>

  <h2>
    Your next executive presentation starts here
  </h2>

  <p>
    Run the demo, upload a presentation,
    or paste slide copy to generate
    Presentation DNA, priority fixes,
    slide-level findings, and an
    Executive Health Report.
  </p>

  <button
    class="secondary-link"
    on:click={runDemoAudit}
    disabled={loading}
  >
    Preview with Demo Audit
  </button>
</section>

<style>
  .empty-dashboard {
    min-height: 230px;
    display: grid;
    place-content: center;
    justify-items: start;
    gap: 10px;
    padding: 26px;
  }

  .empty-icon {
    width: 54px;
    height: 54px;
    display: grid;
    place-items: center;
    background: var(--blue);
    color: white;
    font-weight: 900;
  }

  .empty-dashboard h2 {
    margin: 0;
    font-size: 24px;
    letter-spacing: -0.03em;
  }

  .empty-dashboard p {
    max-width: 720px;
    color: var(--muted);
    line-height: 1.7;
  }

  @media (max-width: 720px) {
    .empty-dashboard {
      padding: 18px;
    }
  }
</style>
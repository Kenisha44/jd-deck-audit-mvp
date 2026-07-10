<script>
  export let audit = null;
  export let exportReport = () => {};

  $: report = audit?.healthReport || {};

  $: executiveSummary =
    report.summary ||
    report.executiveSummary ||
    audit?.summary ||
    'No executive summary is available for this audit.';

  $: strengths =
    report.strengths?.length
      ? report.strengths
      : audit?.strengths?.length
      ? audit.strengths
      : report.topStrength
      ? [report.topStrength]
      : [];

  $: opportunities =
    report.opportunities?.length
      ? report.opportunities
      : audit?.weaknesses?.length
      ? audit.weaknesses
      : report.biggestOpportunity
      ? [report.biggestOpportunity]
      : [];

  $: recommendation =
    report.recommendation ||
    report.nextSteps?.[0] ||
    audit?.rewrite?.executiveSummary ||
    'Address the highest-priority fixes and run the audit again.';

  $: grade =
    audit?.grade ||
    report.grade ||
    '--';

  $: overallScore =
    audit?.overall ??
    report.overall ??
    '--';

  $: executiveReadiness =
    audit?.readiness ||
    report.readiness ||
    'Not available';

  $: businessImpact =
    report.businessImpact ||
    audit?.businessImpact ||
    'Not available';

  $: slideCount =
    audit?.slides?.length ??
    report.slideSummary?.length ??
    '--';

  function gradeColor(value = '') {
    const normalized = String(value).toUpperCase();

    if (normalized.startsWith('A')) return 'excellent';
    if (normalized.startsWith('B')) return 'good';

    return 'warning';
  }
</script>

<section class="health-card panel sharp-panel">
  <header class="health-header">
    <div>
      <p class="eyebrow accent">
        Executive Health Report
      </p>

      <h2>
        {grade}
      </h2>

      <p>
        Overall executive readiness of this presentation.
      </p>
    </div>

    {#if audit}
      <button
        class="secondary-link"
        on:click={exportReport}
      >
        Export PDF
      </button>
    {/if}
  </header>

  {#if audit}
    <div class={`grade-box ${gradeColor(grade)}`}>
      <strong>{grade}</strong>
      <span>Overall Grade</span>
    </div>

    <div class="stats-grid">
      <article>
        <span>Overall Score</span>
        <strong>
          {overallScore === '--'
            ? '--'
            : `${overallScore}/100`}
        </strong>
      </article>

      <article>
        <span>Executive Readiness</span>
        <strong>{executiveReadiness}</strong>
      </article>

      <article>
        <span>Business Impact</span>
        <strong>{businessImpact}</strong>
      </article>

      <article>
        <span>Slides Reviewed</span>
        <strong>{slideCount}</strong>
      </article>
    </div>

    <section class="summary report-section">
      <h3>Executive Summary</h3>
      <p>{executiveSummary}</p>
    </section>

    <section class="strengths report-section">
      <h3>Top Strengths</h3>

      <ul>
        {#if strengths.length}
          {#each strengths as item}
            <li>{item}</li>
          {/each}
        {:else}
          <li>
            No strengths were returned for this audit.
          </li>
        {/if}
      </ul>
    </section>

    <section class="opportunities report-section">
      <h3>Top Opportunities</h3>

      <ul>
        {#if opportunities.length}
          {#each opportunities as item}
            <li>{item}</li>
          {/each}
        {:else}
          <li>
            No improvement opportunities were returned.
          </li>
        {/if}
      </ul>
    </section>

    <section class="recommendation report-section">
      <h3>Recommendation</h3>
      <p>{recommendation}</p>
    </section>
  {:else}
    <div class="empty">
      Run an audit to generate the Executive Health Report.
    </div>
  {/if}
</section>

<style>
  .health-card {
    display: grid;
    gap: 24px;
    padding: 28px;
    background: var(--panel);
    color: var(--text);
  }

  .health-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
  }

  .health-header h2 {
    margin: 6px 0;
    color: var(--text);
    font-size: 34px;
  }

  .health-header p {
    color: var(--muted);
  }

  .grade-box {
    display: grid;
    justify-items: center;
    gap: 6px;
    padding: 22px;
    border: 2px solid var(--border);
  }

  .grade-box strong {
    font-size: 46px;
    letter-spacing: -0.05em;
  }

  .grade-box span {
    font-size: 13px;
    font-weight: 750;
  }

  .grade-box.excellent {
    background: var(--success-soft);
    border-color: var(--success-border);
    color: var(--success);
  }

  .grade-box.good {
    background: var(--warning-soft);
    border-color: var(--warning-border);
    color: var(--warning);
  }

  .grade-box.warning {
    background: var(--danger-soft);
    border-color: var(--danger-border);
    color: var(--danger);
  }

  .stats-grid {
    display: grid;
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .stats-grid article {
    display: grid;
    gap: 8px;
    padding: 16px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
  }

  .stats-grid span {
    color: var(--muted);
    font-size: 12px;
    font-weight: 750;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .stats-grid strong {
    color: var(--text);
    font-size: 20px;
  }

  .report-section {
    padding: 18px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
  }

  .report-section h3 {
    margin: 0 0 12px;
    color: var(--text);
  }

  .report-section p {
    margin: 0;
    color: var(--muted);
    line-height: 1.65;
  }

  ul {
    display: grid;
    gap: 9px;
    margin: 0;
    padding-left: 20px;
  }

  li {
    color: var(--muted);
    line-height: 1.55;
  }

  .empty {
    padding: 60px 24px;
    border: 1px dashed var(--border-strong);
    background: var(--surface);
    color: var(--muted);
    text-align: center;
  }

  @media (max-width: 700px) {
    .health-card {
      padding: 22px;
    }

    .health-header {
      flex-direction: column;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
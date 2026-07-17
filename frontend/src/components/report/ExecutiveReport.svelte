<script>
  import ExecutiveReadiness
    from './ExecutiveReadiness.svelte';
 import {
    createEventDispatcher
  } from 'svelte';

  export let audit = null;
  export let onExport = () => {};

 const dispatch =
    createEventDispatcher();

  function requestExport() {
    dispatch('export');
  }

  $: dna = audit?.dna || {};
  $: healthReport =
    audit?.healthReport || {};
  $: metrics =
    audit?.metrics || {};
  $: priorityQueue =
    audit?.priorityQueue || [];

  $: strengths =
    healthReport.strengths?.length
      ? healthReport.strengths
      : audit?.strengths?.length
        ? audit.strengths
        : [];

  $: opportunities =
    healthReport.opportunities?.length
      ? healthReport.opportunities
      : audit?.weaknesses?.length
        ? audit.weaknesses
        : [];

  $: executiveSummary =
    healthReport.summary ||
    healthReport.executiveSummary ||
    audit?.summary ||
    'No executive summary is available for this report.';

  $: recommendation =
    healthReport.recommendation ||
    audit?.rewrite?.executiveSummary ||
    'Apply the highest-priority fixes and run the presentation through JD again.';

  $: generatedDate =
    audit?.generatedAt
      ? formatDate(audit.generatedAt)
      : formatDate(new Date());

  const dnaRows = [
    {
      key: 'executiveCommunication',
      label: 'Executive Communication'
    },
    {
      key: 'visualSimplicity',
      label: 'Visual Simplicity'
    },
    {
      key: 'businessStorytelling',
      fallback: 'storytelling',
      label: 'Business Storytelling'
    },
    {
      key: 'decisionReadiness',
      fallback: 'actionability',
      label: 'Decision Readiness'
    },
    {
      key: 'dataConfidence',
      fallback: 'dataStorytelling',
      label: 'Data Confidence'
    }
  ];

  function formatDate(value) {
    return new Date(value)
      .toLocaleDateString(
        undefined,
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }
      );
  }

  function dnaValue(item) {
    const value =
      dna?.[item.key] ??
      dna?.[item.fallback] ??
      0;

    return Math.max(
      0,
      Math.min(
        100,
        Math.round(
          Number(value) || 0
        )
      )
    );
  }

  function displayValue(value) {
    return value === null ||
      value === undefined ||
      value === ''
      ? 'Not available'
      : value;
  }

  function scoreTone(score = 0) {
    if (score >= 85) {
      return 'strong';
    }

    if (score >= 70) {
      return 'moderate';
    }

    return 'attention';
  }

  function safeImprovement(item) {
    return (
      item?.estimatedImprovement ??
      item?.impact ??
      3
    );
  }
</script>

{#if audit}
  <article
    id="executive-report"
    class="executive-report print-report"
  >
    <!-- ===================================================
         REPORT COVER
         =================================================== -->

    <header class="report-cover">
      <div class="cover-top">
        <div class="brand-lockup">
          <div class="brand-mark">
            JD
          </div>

          <div>
            <p class="brand-name">
              JOHKEN DESIGN
            </p>

            <p class="brand-subtitle">
              Executive Presentation Audit
            </p>
          </div>
        </div>

        <button
  type="button"
  class="export-button no-print"
  on:click={requestExport}
>
  Export PDF
</button>
      </div>

      <div class="cover-main">
        <div class="cover-copy">
          <p class="eyebrow accent">
            Professional Audit Report
          </p>

          <h1>
            {audit.deckName ||
              'Untitled Presentation'}
          </h1>

          <p>
            Executive communication analysis,
            storytelling assessment,
            presentation scoring, and
            strategic recommendations.
          </p>
        </div>

        <div
          class={`hero-score ${scoreTone(
            audit.overall
          )}`}
        >
          <strong>
            {audit.overall ?? '--'}
          </strong>

          <span>
            Overall Score
          </span>
        </div>
      </div>

      <div class="cover-metrics">
        <article>
          <span>Grade</span>

          <strong>
            {audit.grade || '--'}
          </strong>
        </article>

        <article>
          <span>Readiness</span>

          <strong>
            {audit.readiness ||
              'Needs Review'}
          </strong>
        </article>

        <article>
          <span>Slides</span>

          <strong>
            {displayValue(
              metrics.estimatedSlides ??
              audit.slides?.length
            )}
          </strong>
        </article>

        <article>
          <span>Generated</span>

          <strong class="date-value">
            {generatedDate}
          </strong>
        </article>
      </div>
    </header>

    <!-- ===================================================
         SUMMARY + READINESS
         =================================================== -->

    <div class="report-grid report-grid-primary">
      <section class="report-card summary-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow accent">
              Executive Overview
            </p>

            <h2>
              Executive Summary
            </h2>
          </div>

          <span class="personality-badge">
            {dna.personality ||
              'Balanced'}
          </span>
        </div>

        <p class="summary-copy">
          {executiveSummary}
        </p>
      </section>

      <ExecutiveReadiness
        score={audit.overall ?? 0}
      />
    </div>

    <!-- ===================================================
         DNA + PROFILE
         =================================================== -->

    <div class="report-grid report-grid-balanced">
      <section class="report-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow accent">
              Signature Analysis
            </p>

            <h2>
              Presentation DNA
            </h2>
          </div>
        </div>

        <div class="dna-list">
          {#each dnaRows as item}
            <div class="dna-row">
              <div class="dna-label">
                <span>
                  {item.label}
                </span>

                <strong>
                  {dnaValue(item)}
                </strong>
              </div>

              <div class="dna-track">
                <div
                  class="dna-fill"
                  style={`width:${dnaValue(item)}%`}
                ></div>
              </div>
            </div>
          {/each}
        </div>
      </section>

      <section class="report-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow accent">
              Audit Metrics
            </p>

            <h2>
              Presentation Profile
            </h2>
          </div>
        </div>

        <div class="profile-grid">
          <article>
            <span>
              Slides Reviewed
            </span>

            <strong>
              {displayValue(
                metrics.estimatedSlides ??
                audit.slides?.length
              )}
            </strong>
          </article>

          <article>
            <span>
              Words Analyzed
            </span>

            <strong>
              {displayValue(
                metrics.estimatedWords
              )}
            </strong>
          </article>

          <article>
            <span>
              File Type
            </span>

            <strong>
              {displayValue(
                audit.fileType
              )}
            </strong>
          </article>

          <article>
            <span>
              Risk Level
            </span>

            <strong>
              {displayValue(
                metrics.riskLevel
              )}
            </strong>
          </article>

          <article>
            <span>
              Audit Time
            </span>

            <strong>
              {displayValue(
                metrics.estimatedAuditTime
              )}
            </strong>
          </article>

          <article>
            <span>
              Priority Actions
            </span>

            <strong>
              {priorityQueue.length}
            </strong>
          </article>
        </div>
      </section>
    </div>

    <!-- ===================================================
         STRENGTHS + OPPORTUNITIES
         =================================================== -->

    <div class="report-grid report-grid-balanced">
      <section class="report-card insights-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow success-label">
              Strongest Areas
            </p>

            <h2>
              Top Strengths
            </h2>
          </div>
        </div>

        <ul class="insight-list">
          {#if strengths.length}
            {#each strengths.slice(0, 5) as strength}
              <li>
                <span class="insight-icon success-icon">
                  ✓
                </span>

                <span>
                  {strength}
                </span>
              </li>
            {/each}
          {:else}
            <li>
              <span class="insight-icon success-icon">
                ✓
              </span>

              <span>
                The presentation provides a
                workable foundation for
                refinement.
              </span>
            </li>
          {/if}
        </ul>
      </section>

      <section class="report-card insights-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow warning-label">
              Highest-Value Improvements
            </p>

            <h2>
              Top Opportunities
            </h2>
          </div>
        </div>

        <ul class="insight-list">
          {#if opportunities.length}
            {#each opportunities.slice(0, 5) as opportunity}
              <li>
                <span class="insight-icon warning-icon">
                  !
                </span>

                <span>
                  {opportunity}
                </span>
              </li>
            {/each}
          {:else}
            <li>
              <span class="insight-icon warning-icon">
                !
              </span>

              <span>
                Complete a final
                executive-readiness review
                before presenting.
              </span>
            </li>
          {/if}
        </ul>
      </section>
    </div>

    <!-- ===================================================
         PRIORITY RECOMMENDATIONS
         =================================================== -->

    <section class="report-card priority-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow accent">
            Action Plan
          </p>

          <h2>
            Priority Recommendations
          </h2>
        </div>

        <span class="section-count">
          {priorityQueue.length}
          Actions
        </span>
      </div>

      {#if priorityQueue.length}
        <div class="priority-grid">
          {#each priorityQueue.slice(0, 4) as item, index}
            <article class="priority-item">
              <div class="priority-header">
                <div class="priority-number">
                  {index + 1}
                </div>

                <div class="priority-title">
                  <div class="priority-meta">
                    <span>
                      Slide
                      {item.slide ??
                        item.slideNumber ??
                        '—'}
                    </span>

                    <span
                      class={`severity ${String(
                        item.severity ||
                        'Medium'
                      ).toLowerCase()}`}
                    >
                      {item.severity ||
                        'Medium'}
                    </span>
                  </div>

                  <h3>
                    {item.title}
                  </h3>
                </div>

                <div class="improvement-badge">
                  +{safeImprovement(item)}
                </div>
              </div>

              <div class="priority-body">
                <p>
                  <strong>
                    Business impact
                  </strong>

                  {item.businessImpact ||
                    'The issue may reduce message clarity and executive confidence.'}
                </p>

                <p>
                  <strong>
                    Recommended action
                  </strong>

                  {item.recommendation ||
                    item.description ||
                    'Revise the slide using the recommended presentation standards.'}
                </p>

                {#if item.evidence}
                  <details>
                    <summary>
                      View supporting evidence
                    </summary>

                    <p>
                      {item.evidence}
                    </p>
                  </details>
                {/if}
              </div>
            </article>
          {/each}
        </div>
      {:else}
        <p class="empty-copy">
          No priority recommendations were
          returned.
        </p>
      {/if}
    </section>

    <!-- ===================================================
         RECOMMENDATION
         =================================================== -->

    <section class="report-card recommendation-card">
      <div>
        <p class="eyebrow accent">
          Johken Recommendation
        </p>

        <h2>
          Recommended Next Move
        </h2>

        <p>
          {recommendation}
        </p>
      </div>

      <div class="target-score">
        <span>
          Current
        </span>

        <strong>
          {audit.overall ?? '--'}
        </strong>

        <div class="score-arrow">
          →
        </div>

        <span>
          Target
        </span>

        <strong>
          {Math.min(
            100,
            Number(
              audit.overall || 0
            ) + 10
          )}
        </strong>
      </div>
    </section>

    <!-- ===================================================
         CONSULTING CTA
         =================================================== -->

    <section class="consulting-cta">
      <div class="cta-copy">
        <p class="eyebrow cta-eyebrow">
          Johken Design Professional Services
        </p>

        <h2>
          Ready for an Executive-Level
          Presentation?
        </h2>

        <p>
          JD identified your highest-impact
          improvements. Let Johken Design
          transform your presentation into a
          polished executive deck for leadership,
          client, investor, or board review.
        </p>

        <div class="service-list">
          <span>
            ✓ Executive storytelling
          </span>

          <span>
            ✓ Slide redesign
          </span>

          <span>
            ✓ Data visualization
          </span>

          <span>
            ✓ Executive messaging
          </span>

          <span>
            ✓ 48-hour turnaround
          </span>
        </div>
      </div>

      <div class="cta-action">
        <div class="cta-price">
          <span>
            Professional reviews
            starting at
          </span>

          <strong>
            $297
          </strong>
        </div>

        <button
          class="cta-primary no-print"
          type="button"
        >
          Book Professional Review
        </button>

        <button
          class="cta-secondary no-print"
          type="button"
        >
          View Services
        </button>
      </div>
    </section>

    <!-- ===================================================
         FOOTER
         =================================================== -->

    <footer class="report-footer">
      <div>
        <strong>
          Johken Design
        </strong>

        <p>
          Executive presentation analysis,
          redesign, and business storytelling.
        </p>
      </div>

      <div class="footer-date">
        <strong>
          Report Generated
        </strong>

        <p>
          {generatedDate}
        </p>
      </div>
    </footer>
  </article>
{:else}
  <section class="report-empty panel sharp-panel">
    <p class="eyebrow accent">
      Executive Report
    </p>

    <h2>
      Run an audit to generate your report
    </h2>

    <p>
      The professional report will include
      Presentation DNA, strengths,
      opportunities, priority actions, and
      consulting recommendations.
    </p>
  </section>
{/if}

<style>
  .executive-report {
    width: 100%;
    min-width: 0;
    display: grid;
    gap: 16px;
    color: var(--text);
  }

  .report-cover,
  .report-card,
  .consulting-cta,
  .report-footer {
    width: 100%;
    min-width: 0;
    border: 1px solid var(--border);
    background: var(--panel);
    color: var(--text);
    box-shadow:
      6px 6px 0
      rgba(3, 138, 142, 0.1);
  }

  /* Cover */

  .report-cover {
    display: grid;
    gap: 24px;
    padding: 28px;
    overflow: hidden;
  }

  .cover-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
  }

  .brand-lockup {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .brand-mark {
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    background: var(--blue);
    color: #ffffff;
    font-weight: 900;
  }

  .brand-name,
  .brand-subtitle {
    margin: 0;
  }

  .brand-name {
    font-size: 13px;
    font-weight: 900;
    letter-spacing: 0.08em;
  }

  .brand-subtitle {
    margin-top: 3px;
    color: var(--muted);
    font-size: 12px;
  }

  .export-button {
    padding: 11px 15px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    font-weight: 750;
    cursor: pointer;
  }

  .cover-main {
    display: grid;
    grid-template-columns:
      minmax(0, 1fr)
      auto;
    gap: 30px;
    align-items: end;
  }

  .cover-copy {
    display: grid;
    gap: 10px;
  }

  .cover-copy h1 {
    max-width: 920px;
    margin: 0;
    font-size:
      clamp(36px, 5vw, 60px);
    line-height: 0.98;
    letter-spacing: -0.055em;
  }

  .cover-copy > p:last-child {
    max-width: 760px;
    margin: 0;
    color: var(--muted);
    font-size: 16px;
    line-height: 1.6;
  }

  .hero-score {
    min-width: 160px;
    display: grid;
    justify-items: center;
    gap: 5px;
    padding: 20px;
    border: 2px solid var(--border);
    background: var(--surface);
  }

  .hero-score strong {
    font-size: 54px;
    line-height: 1;
  }

  .hero-score span {
    color: var(--muted);
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .hero-score.strong {
    border-color: var(--success-border);
    background: var(--success-soft);
    color: var(--success);
  }

  .hero-score.moderate {
    border-color: var(--warning-border);
    background: var(--warning-soft);
    color: var(--warning);
  }

  .hero-score.attention {
    border-color: var(--danger-border);
    background: var(--danger-soft);
    color: var(--danger);
  }

  .cover-metrics {
    display: grid;
    grid-template-columns:
      repeat(4, minmax(0, 1fr));
    gap: 10px;
  }

  .cover-metrics article {
    min-height: 82px;
    display: grid;
    align-content: center;
    gap: 6px;
    padding: 14px;
    border: 1px solid var(--border);
    background: var(--surface);
  }

  .cover-metrics span,
  .profile-grid span {
    color: var(--muted);
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .cover-metrics strong {
    font-size: 21px;
  }

  .cover-metrics .date-value {
    font-size: 16px;
    line-height: 1.3;
  }

  /* Report grids */

  .report-grid {
    width: 100%;
    display: grid;
    gap: 16px;
    align-items: stretch;
  }

  .report-grid-primary {
    grid-template-columns:
      minmax(0, 1.2fr)
      minmax(320px, 0.8fr);
  }

  .report-grid-balanced {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .report-card {
    display: grid;
    align-content: start;
    gap: 16px;
    padding: 22px;
  }

  .section-heading {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 14px;
  }

  .section-heading h2,
  .recommendation-card h2,
  .consulting-cta h2 {
    margin: 0;
    font-size: 24px;
    letter-spacing: -0.035em;
  }

  .personality-badge,
  .section-count {
    padding: 7px 10px;
    border: 1px solid var(--info-border);
    background: var(--info-soft);
    color: var(--info);
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .summary-copy {
    margin: 0;
    color: var(--text-soft);
    font-size: 16px;
    line-height: 1.65;
  }

  /* DNA */

  .dna-list {
    display: grid;
    gap: 12px;
  }

  .dna-row {
    display: grid;
    gap: 6px;
  }

  .dna-label {
    display: flex;
    justify-content: space-between;
    gap: 16px;
  }

  .dna-label span {
    color: var(--text-soft);
    font-size: 13px;
    font-weight: 700;
  }

  .dna-label strong {
    color: var(--orange);
  }

  .dna-track {
    height: 9px;
    overflow: hidden;
    border: 1px solid var(--border);
    background: var(--surface-hover);
  }

  .dna-fill {
    height: 100%;
    background:
      linear-gradient(
        90deg,
        var(--teal),
        var(--blue),
        var(--orange)
      );
  }

  /* Profile */

  .profile-grid {
    display: grid;
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
    gap: 9px;
  }

  .profile-grid article {
    min-height: 78px;
    display: grid;
    align-content: center;
    gap: 6px;
    padding: 12px;
    border: 1px solid var(--border);
    background: var(--surface);
  }

  .profile-grid strong {
    font-size: 18px;
  }

  /* Insights */

  .success-label {
    color: var(--success);
  }

  .warning-label {
    color: var(--warning);
  }

  .insight-list {
    display: grid;
    gap: 9px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .insight-list li {
    display: grid;
    grid-template-columns:
      auto minmax(0, 1fr);
    gap: 9px;
    align-items: start;
    color: var(--text-soft);
    line-height: 1.45;
  }

  .insight-icon {
    width: 24px;
    height: 24px;
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 900;
  }

  .success-icon {
    background: var(--success-soft);
    color: var(--success);
  }

  .warning-icon {
    background: var(--warning-soft);
    color: var(--warning);
  }

  /* Priority recommendations */

  .priority-grid {
    display: grid;
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .priority-item {
    min-width: 0;
    display: grid;
    gap: 13px;
    padding: 16px;
    border: 1px solid var(--border);
    background: var(--surface);
  }

  .priority-header {
    display: grid;
    grid-template-columns:
      auto minmax(0, 1fr) auto;
    gap: 11px;
    align-items: start;
  }

  .priority-number {
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    background: var(--blue);
    color: #ffffff;
    font-weight: 900;
  }

  .priority-title h3 {
    margin: 3px 0 0;
    font-size: 17px;
    line-height: 1.25;
  }

  .priority-meta {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .priority-meta span {
    padding: 4px 6px;
    background: var(--surface-hover);
    color: var(--muted);
    font-size: 9px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .severity.critical,
  .severity.high {
    color: var(--danger);
  }

  .severity.medium {
    color: var(--warning);
  }

  .severity.low {
    color: var(--success);
  }

  .improvement-badge {
    min-width: 42px;
    padding: 7px;
    border: 1px solid var(--success-border);
    background: var(--success-soft);
    color: var(--success);
    text-align: center;
    font-weight: 900;
  }

  .priority-body {
    display: grid;
    gap: 9px;
  }

  .priority-body p {
    display: grid;
    gap: 3px;
    margin: 0;
    color: var(--muted);
    font-size: 13px;
    line-height: 1.45;
  }

  .priority-body p strong {
    color: var(--text);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  details {
    border-top: 1px solid var(--border);
    padding-top: 8px;
  }

  summary {
    color: var(--teal);
    font-size: 12px;
    font-weight: 750;
    cursor: pointer;
  }

  details p {
    margin-top: 7px !important;
  }

  /* Recommendation */

  .recommendation-card {
    grid-template-columns:
      minmax(0, 1fr)
      auto;
    align-items: center;
    gap: 26px;
    border-left:
      7px solid var(--orange);
  }

  .recommendation-card > div:first-child > p:last-child {
    max-width: 850px;
    margin: 10px 0 0;
    color: var(--text-soft);
    line-height: 1.6;
  }

  .target-score {
    min-width: 235px;
    display: grid;
    grid-template-columns:
      repeat(3, auto);
    align-items: center;
    gap: 6px 10px;
    padding: 14px;
    border: 1px solid var(--border);
    background: var(--surface);
  }

  .target-score span {
    color: var(--muted);
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .target-score strong {
    color: var(--orange);
    font-size: 28px;
  }

  .score-arrow {
    grid-row: span 2;
    color: var(--teal);
    font-size: 24px;
  }

  /* CTA */

  .consulting-cta {
    display: grid;
    grid-template-columns:
      minmax(0, 1.5fr)
      minmax(240px, 0.5fr);
    gap: 32px;
    align-items: center;
    padding: 28px;
    border-left:
      8px solid var(--orange);
  }

  .cta-copy {
    display: grid;
    gap: 11px;
  }

  .cta-eyebrow {
    color: var(--orange);
  }

  .cta-copy > p:not(.eyebrow) {
    max-width: 820px;
    margin: 0;
    color: var(--muted);
    line-height: 1.6;
  }

  .service-list {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 6px;
  }

  .service-list span {
    padding: 7px 9px;
    border: 1px solid var(--border);
    background: var(--surface);
    font-size: 11px;
    font-weight: 700;
  }

  .cta-action {
    display: grid;
    gap: 9px;
  }

  .cta-price {
    display: grid;
    justify-items: center;
    gap: 5px;
    padding: 16px;
    border: 2px solid var(--orange);
    background:
      rgba(254, 91, 26, 0.07);
    text-align: center;
  }

  .cta-price span {
    color: var(--muted);
    font-size: 11px;
    font-weight: 700;
  }

  .cta-price strong {
    color: var(--orange);
    font-size: 38px;
  }

  .cta-primary,
  .cta-secondary {
    width: 100%;
    padding: 12px;
    font-weight: 850;
    cursor: pointer;
  }

  .cta-primary {
    border: 2px solid var(--text);
    background: var(--orange);
    color: #ffffff;
    box-shadow:
      5px 5px 0 var(--teal);
  }

  .cta-secondary {
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
  }

  /* Footer */

  .report-footer {
    display: flex;
    justify-content: space-between;
    gap: 24px;
    padding: 17px 21px;
  }

  .report-footer p {
    margin: 4px 0 0;
    color: var(--muted);
    font-size: 12px;
  }

  .footer-date {
    text-align: right;
  }

  .report-empty {
    min-height: 300px;
    display: grid;
    place-content: center;
    justify-items: start;
    gap: 11px;
    padding: 30px;
  }

  .report-empty h2,
  .report-empty p {
    margin: 0;
  }

  .report-empty p:last-child,
  .empty-copy {
    color: var(--muted);
  }

  /* Responsive */

  @media (max-width: 1100px) {
    .report-grid-primary,
    .report-grid-balanced,
    .consulting-cta {
      grid-template-columns: 1fr;
    }

    .priority-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 800px) {
    .cover-main {
      grid-template-columns: 1fr;
    }

    .hero-score {
      width: 100%;
    }

    .cover-metrics,
    .profile-grid {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }

    .recommendation-card {
      grid-template-columns: 1fr;
    }

    .target-score {
      width: 100%;
    }
  }

  @media (max-width: 600px) {
    .report-cover,
    .report-card,
    .consulting-cta {
      padding: 18px;
    }

    .cover-top,
    .section-heading,
    .report-footer {
      align-items: stretch;
      flex-direction: column;
    }

    .cover-metrics,
    .profile-grid {
      grid-template-columns: 1fr;
    }

    .priority-header {
      grid-template-columns:
        auto minmax(0, 1fr);
    }

    .improvement-badge {
      grid-column: 1 / -1;
      justify-self: start;
    }

    .footer-date {
      text-align: left;
    }
  }

  /* Print */

  @media print {
    .executive-report {
      display: block;
      color: #111111;
      background: #ffffff;
    }

    .report-cover,
    .report-card,
    .consulting-cta,
    .report-footer {
      margin-bottom: 12px;
      border: 1px solid #cccccc;
      background: #ffffff !important;
      color: #111111 !important;
      box-shadow: none !important;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .report-grid {
      display: grid;
      gap: 10px;
      margin-bottom: 12px;
    }

    .priority-grid {
      grid-template-columns: 1fr;
    }

    .priority-item,
    .profile-grid,
    .dna-list,
    .recommendation-card {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .no-print {
      display: none !important;
    }

    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
  .executive-report {
  width: 100%;
  max-width: 100%;
}

.report-cover,
.report-grid,
.report-card,
.consulting-cta,
.report-footer {
  width: 100%;
}

.report-grid-primary {
  grid-template-columns:
    minmax(0, 1.35fr)
    minmax(360px, 0.65fr);
}
</style>
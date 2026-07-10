<script>
  export let dna = null;

  const fallbackProfile = [
    { key: 'visualDesign', label: 'Visual Design', score: 0 },
    { key: 'storytelling', label: 'Storytelling', score: 0 },
    { key: 'readability', label: 'Readability', score: 0 },
    { key: 'executiveCommunication', label: 'Executive Communication', score: 0 },
    { key: 'executivePresence', label: 'Executive Presence', score: 0 },
    { key: 'brandConsistency', label: 'Brand Consistency', score: 0 }
  ];

  $: profile = dna?.profile?.length
    ? dna.profile
    : fallbackProfile;

  function scoreTone(score = 0) {
    if (score >= 85) return 'strong';
    if (score >= 70) return 'moderate';
    return 'weak';
  }

  function insightText() {
    if (!dna) {
      return 'Run an audit to generate the deck’s communication profile.';
    }

    return `The deck’s strongest area is ${dna.topStrength}. The biggest opportunity is ${dna.biggestOpportunity}.`;
  }
</script>

<section class="dna-card panel sharp-panel">
  <header class="dna-header">
    <div>
      <p class="eyebrow accent">Presentation DNA</p>
      <h2>{dna?.topStrength || 'Audit profile preview'}</h2>
      <p>
        A category-level view of how effectively the presentation communicates,
        persuades, and supports executive decisions.
      </p>
    </div>

    {#if dna}
      <div class="dna-summary">
        <span>Top strength</span>
        <strong>{dna.topStrength}</strong>
      </div>
    {/if}
  </header>

  <div class="dna-list">
    {#each profile as trait}
      <article class="dna-row">
        <div class="trait-heading">
          <span>{trait.label}</span>
          <strong class={scoreTone(trait.score)}>{trait.score}/100</strong>
        </div>

        <div
          class="progress-track"
          role="progressbar"
          aria-label={trait.label}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={trait.score}
        >
          <div
            class={`progress-fill ${scoreTone(trait.score)}`}
            style={`width: ${Math.max(0, Math.min(100, trait.score))}%`}
          ></div>
        </div>
      </article>
    {/each}
  </div>

  <aside class="dna-insight">
    <div class="insight-icon">JD</div>

    <div>
      <p class="eyebrow">DNA Insight</p>
      <p>{insightText()}</p>
    </div>
  </aside>
</section>

<style>
  .dna-card {
    display: grid;
    gap: 26px;
    padding: 28px;
  }

  .dna-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 24px;
  }

  .dna-header h2 {
    margin: 5px 0 0;
    font-size: 28px;
    letter-spacing: -0.035em;
  }

  .dna-header > div > p:last-child {
    max-width: 620px;
    margin-top: 9px;
    color: var(--muted);
    line-height: 1.6;
  }

  .dna-summary {
    min-width: 160px;
    display: grid;
    gap: 5px;
    padding: 14px;
    border: 1px solid var(--border);
    background: rgba(37, 99, 235, 0.05);
  }

  .dna-summary span {
    color: var(--muted);
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .dna-summary strong {
    font-size: 16px;
    line-height: 1.35;
  }

  .dna-list {
    display: grid;
    gap: 18px;
  }

  .dna-row {
    display: grid;
    gap: 9px;
  }

  .trait-heading {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    align-items: center;
  }

  .trait-heading span {
    font-weight: 750;
  }

  .trait-heading strong {
    font-size: 13px;
  }

  .trait-heading strong.strong {
    color: #15803d;
  }

  .trait-heading strong.moderate {
    color: #c2410c;
  }

  .trait-heading strong.weak {
    color: #b91c1c;
  }

  .progress-track {
    height: 10px;
    overflow: hidden;
    background: var(--surface-hover);
    border: 1px solid #dbe2ea;
  }

  .progress-fill {
    height: 100%;
    transition: width 600ms ease;
  }

  .progress-fill.strong {
    background: linear-gradient(90deg, #2563eb, #16a34a);
  }

  .progress-fill.moderate {
    background: linear-gradient(90deg, #2563eb, #f59e0b);
  }

  .progress-fill.weak {
    background: linear-gradient(90deg, #f59e0b, #dc2626);
  }

  .dna-insight {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 16px;
    align-items: start;
    padding: 18px;
    border: 1px solid #c7d2fe;
    background: var(--info-soft)
  }

  .insight-icon {
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    background: #4f46e5;
    color: white;
    font-size: 13px;
    font-weight: 900;
  }

  .dna-insight p:last-child {
    margin-top: 5px;
    color: var(--text);
    line-height: 1.55;
  }

  @media (max-width: 720px) {
    .dna-card {
      padding: 22px;
    }

    .dna-header {
      flex-direction: column;
    }

    .dna-summary {
      width: 100%;
    }
  }
</style>
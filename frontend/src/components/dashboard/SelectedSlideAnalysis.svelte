<script>
  export let slide = null;

  function scoreTone(score = 0) {
    if (score >= 85) return 'strong';
    if (score >= 70) return 'moderate';
    return 'weak';
  }

  function formatCategory(category = '') {
    return category
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, letter => letter.toUpperCase());
  }
</script>

<section class="analysis-card panel sharp-panel">
  <header class="analysis-header">
    <div>
      <p class="eyebrow accent">Selected Slide Analysis</p>

      <h2>
        {slide
          ? `Slide ${slide.number}: ${slide.title}`
          : 'Choose a slide'}
      </h2>

      <p>
        {slide
          ? 'Review the slide’s strengths, risks, scoring categories, and recommended improvements.'
          : 'Select a slide in the navigator to view its detailed audit.'}
      </p>
    </div>

    {#if slide}
      <div class={`overall-score ${scoreTone(slide.score)}`}>
        <strong>{slide.score}</strong>
        <span>/100</span>
      </div>
    {/if}
  </header>

  {#if slide}
    <section class="summary-panel">
      <p class="eyebrow">Why it matters</p>
      <p>{slide.summary}</p>
    </section>

    {#if slide.scores}
      <section class="category-section">
        <div class="section-heading">
          <h3>Category Scores</h3>
          <span>Slide-level performance</span>
        </div>

        <div class="category-grid">
          {#each Object.entries(slide.scores) as [category, score]}
            <article class="category-card">
              <div class="category-heading">
                <span>{formatCategory(category)}</span>
                <strong class={scoreTone(score)}>{score}</strong>
              </div>

              <div
                class="score-track"
                role="progressbar"
                aria-label={formatCategory(category)}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={score}
              >
                <div
                  class={`score-fill ${scoreTone(score)}`}
                  style={`width: ${Math.max(0, Math.min(100, score))}%`}
                ></div>
              </div>
            </article>
          {/each}
        </div>
      </section>
    {/if}

    <div class="findings-grid">
      <section class="finding-section strengths">
        <div class="section-heading">
          <h3>Strengths</h3>
          <span>{slide.strengths?.length || 0} detected</span>
        </div>

        {#if slide.strengths?.length}
          <div class="finding-list">
            {#each slide.strengths as strength}
              <article>
                <span class="finding-icon">✓</span>
                <p>{strength}</p>
              </article>
            {/each}
          </div>
        {:else}
          <p class="empty-message">
            No notable strengths were detected for this slide.
          </p>
        {/if}
      </section>

      <section class="finding-section weaknesses">
        <div class="section-heading">
          <h3>Issues</h3>
          <span>{slide.weaknesses?.length || 0} detected</span>
        </div>

        {#if slide.weaknesses?.length}
          <div class="finding-list">
            {#each slide.weaknesses as weakness}
              <article>
                <span class="finding-icon">!</span>
                <p>{weakness}</p>
              </article>
            {/each}
          </div>
        {:else}
          <p class="empty-message">
            No major issues were detected for this slide.
          </p>
        {/if}
      </section>
    </div>

    <section class="recommendations">
      <div class="section-heading">
        <h3>Recommended Fixes</h3>
        <span>Ordered by likely impact</span>
      </div>

      {#if slide.fixes?.length}
        <div class="recommendation-list">
          {#each slide.fixes as fix, index}
            <article>
              <div class="recommendation-number">
                {index + 1}
              </div>

              <p>{fix}</p>
            </article>
          {/each}
        </div>
      {:else}
        <p class="empty-message">
          This slide currently has no required fixes.
        </p>
      {/if}
    </section>
  {:else}
    <section class="empty-state">
      <div class="empty-icon">JD</div>

      <div>
        <h3>No slide selected</h3>
        <p>
          Choose a slide from the Slide Navigator to review its full analysis.
        </p>
      </div>
    </section>
  {/if}
</section>

<style>
.analysis-card {
  background: var(--panel);
  color: var(--text);
}

.summary-panel {
  background: var(--info-soft);
  color: var(--text);
}

.summary-panel p:last-child {
  color: var(--text-soft);
}

.category-card,
.finding-section {
  background: var(--surface);
  color: var(--text);
  border-color: var(--border);
}

.finding-list article {
  background: var(--surface-secondary);
  color: var(--text);
}

.finding-list p,
.recommendation-list p {
  color: var(--muted);
}

.recommendations {
  background: var(--info-soft);
  color: var(--text);
  border-color: var(--info-border);
}

.recommendation-list article {
  border-color: var(--border);
}

  .recommendation-number {
    width: 28px;
    height: 28px;
    display: grid;
    place-items: center;
    background: #4f46e5;
    color: white;
    font-size: 12px;
    font-weight: 900;
  }

  .empty-message {
    margin: 0;
    color: var(--muted);
    line-height: 1.6;
  }

  .empty-state {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 16px;
    align-items: center;
    min-height: 180px;
    padding: 22px;
    border: 1px dashed var(--border);
  }

  .empty-icon {
    width: 54px;
    height: 54px;
    display: grid;
    place-items: center;
    background: #2563eb;
    color: white;
    font-weight: 900;
  }

  .empty-state h3 {
    margin: 0;
  }

  .empty-state p {
    margin-top: 7px;
    color: var(--muted);
    line-height: 1.6;
  }

  @media (max-width: 760px) {
    .analysis-card {
      padding: 22px;
    }

    .analysis-header {
      flex-direction: column;
    }

    .category-grid,
    .findings-grid {
      grid-template-columns: 1fr;
    }

    .empty-state {
      grid-template-columns: 1fr;
    }
  }
</style>
<script>
  export let priorityQueue = [];

  function priorityColor(severity = '') {
    const value = String(severity).toLowerCase();

    if (
      value === 'critical' ||
      value === 'high'
    ) {
      return 'high';
    }

    if (
      value === 'moderate' ||
      value === 'medium'
    ) {
      return 'medium';
    }

    return 'low';
  }

  function displaySeverity(severity = '') {
    const value = String(severity).toLowerCase();

    if (!value) return 'Medium';
    if (value === 'critical') return 'High';
    if (value === 'moderate') return 'Medium';

    return severity;
  }

  function estimatedScoreImpact(impact = 0) {
    if (impact >= 95) {
      return '+8 Executive Score';
    }

    if (impact >= 85) {
      return '+5 Executive Score';
    }

    return '+2 Executive Score';
  }

  function itemScope(item = {}) {
    if (item.slideNumber) {
      return `Slide ${item.slideNumber}`;
    }

    if (item.slide) {
      return `Slide ${item.slide}`;
    }

    return 'Deck-wide';
  }
</script>

<section class="priority-card panel sharp-panel">
  <header class="priority-header">
    <div>
      <p class="eyebrow accent">
        Priority Queue
      </p>

      <h2>
        Recommended Actions
      </h2>

      <p>
        Complete these recommendations in order to
        maximize presentation quality.
      </p>
    </div>

    <div class="count">
      {priorityQueue.length}
    </div>
  </header>

  {#if priorityQueue.length}
    <div class="queue">
      {#each priorityQueue as item}
        <article class="queue-item">
          <div class="item-top">
            <span
              class={`badge ${priorityColor(
                item.severity
              )}`}
            >
              {displaySeverity(item.severity)}
            </span>

            <span class="impact">
              {estimatedScoreImpact(item.impact)}
            </span>
          </div>

          <h3>
            {item.title ||
              'Presentation Improvement'}
          </h3>

          <p>
            {item.description ||
              'Review this recommendation before the final presentation.'}
          </p>

          <footer>
            <span>{itemScope(item)}</span>

            <span>
              {item.category ||
                'General Improvement'}
            </span>
          </footer>
        </article>
      {/each}
    </div>
  {:else}
    <div class="empty">
      No priority items were found.
    </div>
  {/if}
</section>

<style>
  .priority-card {
    display: grid;
    gap: 24px;
    padding: 28px;
    background: var(--panel);
    color: var(--text);
  }

  .priority-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
  }

  .priority-header h2 {
    margin: 5px 0 0;
    color: var(--text);
    font-size: 28px;
  }

  .priority-header p {
    margin-top: 8px;
    color: var(--muted);
    line-height: 1.6;
  }

  .count {
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    background: var(--blue);
    color: #ffffff;
    font-size: 20px;
    font-weight: 800;
  }

  .queue {
    display: grid;
    gap: 18px;
  }

  .queue-item {
    display: grid;
    gap: 14px;
    padding: 18px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      border-color 0.2s ease;
  }

  .queue-item:hover {
    transform: translateY(-2px);
    border-color: var(--border-strong);
    box-shadow: var(--shadow-hover);
  }

  .item-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .badge {
    display: inline-flex;
    padding: 6px 12px;
    color: #ffffff;
    font-size: 11px;
    font-weight: 850;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .badge.high {
    background: var(--danger);
  }

  .badge.medium {
    background: var(--warning);
  }

  .badge.low {
    background: var(--success);
  }

  .impact {
    color: var(--muted);
    font-size: 12px;
    font-weight: 750;
  }

  .queue-item h3 {
    margin: 0;
    color: var(--text);
    font-size: 20px;
  }

  .queue-item p {
    margin: 0;
    color: var(--muted);
    line-height: 1.6;
  }

  footer {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding-top: 10px;
    border-top: 1px solid var(--border);
    color: var(--muted);
    font-size: 12px;
    font-weight: 750;
  }

  .empty {
    padding: 60px 24px;
    border: 1px dashed var(--border-strong);
    background: var(--surface);
    color: var(--muted);
    text-align: center;
  }

  @media (max-width: 700px) {
    .priority-card {
      padding: 22px;
    }

    .priority-header {
      flex-direction: column;
    }
  }
</style>
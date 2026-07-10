<script>
  export let deckMetadata = null;
  export let selectedSlide = null;
  export let audit = null;
  export let exportReport = () => {};

  $: statusLabel =
    deckMetadata?.status ||
    (audit ? 'Audit complete' : 'Waiting for presentation');

  $: statusClass =
    statusLabel.toLowerCase().includes('complete')
      ? 'success'
      : statusLabel.toLowerCase().includes('ready')
      ? 'ready'
      : statusLabel.toLowerCase().includes('attention')
      ? 'danger'
      : 'neutral';
</script>

<section class="workspace-panel panel sharp-panel">
  <header class="workspace-header">
    <div>
      <p class="eyebrow accent">Audit Workspace</p>
      <h2>{deckMetadata?.name || 'No presentation loaded'}</h2>
      <p class="workspace-subtitle">
        {audit
          ? 'Review the deck summary, current slide, and audit details.'
          : 'Upload a PPTX or PDF, paste slide copy, or run the demo audit.'}
      </p>
    </div>

    <div class="header-actions">
      <span class={`status-badge ${statusClass}`}>
        <span class="status-dot"></span>
        {statusLabel}
      </span>

      {#if audit}
        <button class="secondary-link" on:click={exportReport}>
          Export Report
        </button>
      {/if}
    </div>
  </header>

  {#if deckMetadata}
    <div class="metadata-grid">
      <article class="meta-card">
        <span>File Type</span>
        <strong>{deckMetadata.type}</strong>
      </article>

      <article class="meta-card">
        <span>File Size</span>
        <strong>{deckMetadata.size}</strong>
      </article>

      <article class="meta-card">
        <span>Slides</span>
        <strong>{deckMetadata.slides}</strong>
      </article>

      <article class="meta-card">
        <span>Words</span>
        <strong>{deckMetadata.words}</strong>
      </article>

      <article class="meta-card">
        <span>Audit Time</span>
        <strong>{deckMetadata.auditTime}</strong>
      </article>

      <article class="meta-card">
        <span>Overall Score</span>
        <strong>{audit?.overall ?? '--'}</strong>
      </article>
    </div>
  {/if}

  {#if selectedSlide}
    <section class="slide-preview">
      <div class="slide-preview-header">
        <div>
          <p class="eyebrow">Current Slide</p>
          <h3>Slide {selectedSlide.number}</h3>
        </div>

        <div class="slide-score">
          <strong>{selectedSlide.score}</strong>
          <span>/100</span>
        </div>
      </div>

      <div class="slide-content">
        <h3>{selectedSlide.title}</h3>
        <p>{selectedSlide.summary}</p>
      </div>

      <div class="slide-footer">
        <span>
          {selectedSlide.strengths?.length || 0}
          strengths
        </span>

        <span>
          {selectedSlide.fixes?.length || 0}
          recommended fixes
        </span>
      </div>
    </section>
  {:else}
    <section class="empty-workspace">
      <div class="empty-icon">JD</div>

      <div>
        <h3>No presentation loaded yet</h3>
        <p>
          Run the demo audit or upload a presentation to see deck metadata,
          slide-level analysis, and executive recommendations.
        </p>
      </div>
    </section>
  {/if}
</section>

<style>
  .workspace-panel {
    display: grid;
    gap: 24px;
    padding: 28px;
  }

  .workspace-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 24px;
  }

  .workspace-header h2 {
    margin: 5px 0 0;
    font-size: 28px;
    letter-spacing: -0.035em;
  }

  .workspace-subtitle {
    max-width: 620px;
    margin-top: 9px;
    color: var(--muted);
    line-height: 1.6;
  }

  .header-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    flex-wrap: wrap;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 11px;
    border: 1px solid var(--border);
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
  }

  .status-badge.success {
    color: #15803d;
    background: #f0fdf4;
    border-color: #bbf7d0;
  }

  .status-badge.ready {
    color: #0369a1;
    background: #f0f9ff;
    border-color: #bae6fd;
  }

  .status-badge.danger {
    color: #b91c1c;
    background: #fef2f2;
    border-color: #fecaca;
  }

  .status-badge.neutral {
    color: #64748b;
    background: #f8fafc;
  }

  .metadata-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .meta-card {
    display: grid;
    gap: 7px;
    min-height: 92px;
    padding: 16px;
    border: 1px solid var(--border);
    background: rgba(3, 138, 142, 0.04);
  }

  .meta-card span {
    color: var(--muted);
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .meta-card strong {
    font-size: 18px;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }

  .slide-preview {
    display: grid;
    gap: 20px;
    padding: 22px;
    border: 1px solid var(--border);
    background:
      linear-gradient(
        135deg,
        rgba(3, 138, 142, 0.06),
        rgba(255, 255, 255, 0)
      );
  }

  .slide-preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border);
  }

  .slide-preview-header h3 {
    margin: 4px 0 0;
    font-size: 20px;
  }

  .slide-score {
    display: flex;
    align-items: baseline;
    gap: 3px;
  }

  .slide-score strong {
    font-size: 34px;
    letter-spacing: -0.04em;
  }

  .slide-score span {
    color: var(--muted);
    font-size: 13px;
    font-weight: 700;
  }

  .slide-content h3 {
    margin: 0;
    font-size: 24px;
    letter-spacing: -0.03em;
  }

  .slide-content p {
    margin-top: 10px;
    color: var(--muted);
    line-height: 1.65;
  }

  .slide-footer {
    display: flex;
    gap: 18px;
    flex-wrap: wrap;
    color: var(--muted);
    font-size: 13px;
    font-weight: 700;
  }

  .empty-workspace {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 18px;
    min-height: 190px;
    padding: 24px;
    border: 1px dashed var(--border);
    background: rgba(3, 138, 142, 0.03);
  }

  .empty-icon {
    width: 62px;
    height: 62px;
    display: grid;
    place-items: center;
    background: var(--teal);
    color: white;
    font-size: 20px;
    font-weight: 900;
  }

  .empty-workspace h3 {
    margin: 0;
    font-size: 21px;
  }

  .empty-workspace p {
    max-width: 560px;
    margin-top: 8px;
    color: var(--muted);
    line-height: 1.65;
  }

  @media (max-width: 900px) {
    .workspace-header {
      flex-direction: column;
    }

    .header-actions {
      justify-content: flex-start;
    }

    .metadata-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 620px) {
    .workspace-panel {
      padding: 20px;
    }

    .metadata-grid {
      grid-template-columns: 1fr;
    }

    .empty-workspace {
      grid-template-columns: 1fr;
    }
  }
</style>
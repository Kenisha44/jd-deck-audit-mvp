<script>
  export let deckMetadata = null;
  export let selectedSlide = null;
  export let audit = null;
  export let exportReport = () => {};
</script>

<div class="workspace-panel panel sharp-panel">
  <div class="workspace-header">
    <div>
      <p class="eyebrow accent">Audit Workspace</p>
      <h3>{deckMetadata?.name || "No deck loaded"}</h3>
    </div>

    {#if audit}
      <button class="secondary-link" on:click={exportReport}>
        Export Report
      </button>
    {/if}
  </div>

  {#if deckMetadata}
    <div class="metadata-grid">
      <div class="meta-card"><span>File Type</span><strong>{deckMetadata.type}</strong></div>
      <div class="meta-card"><span>File Size</span><strong>{deckMetadata.size}</strong></div>
      <div class="meta-card"><span>Slides</span><strong>{deckMetadata.slides}</strong></div>
      <div class="meta-card"><span>Words</span><strong>{deckMetadata.words}</strong></div>
      <div class="meta-card"><span>Audit Time</span><strong>{deckMetadata.auditTime}</strong></div>
      <div class="meta-card"><span>Status</span><strong>{deckMetadata.status}</strong></div>
    </div>
  {/if}

  {#if selectedSlide}
    <div class="slide-preview">
      <div class="slide-preview-header">
        <h4>Slide {selectedSlide.number}</h4>
        <span>Score {selectedSlide.score}/100</span>
      </div>

      <h3>{selectedSlide.title}</h3>
      <p>{selectedSlide.summary}</p>
    </div>
  {:else}
    <div class="empty-workspace">
      Upload a deck or run the demo to preview slide-by-slide analysis.
    </div>
  {/if}
</div>
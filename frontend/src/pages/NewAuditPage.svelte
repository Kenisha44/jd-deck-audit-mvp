<script>
  import { API_BASE_URL } from '../lib/config.js';

  export let onAuditComplete = () => {};
  export let setActivePage = () => {};

  let selectedFile = null;
  let auditType = 'executive';
  let activeMode = 'upload';

  let slideTitle = 'Executive Update';
  let slideText = '';

  let loading = false;
  let error = '';

  let stage = 'Ready';
  let progress = 0;

  const MAX_FILE_SIZE_MB = 15;
  const MAX_FILE_SIZE_BYTES =
    MAX_FILE_SIZE_MB * 1024 * 1024;

  const auditTypes = [
    {
      id: 'executive',
      title: 'Executive Deck',
      description:
        'Leadership updates, strategy decks, and internal decision presentations.',
      icon: '◈'
    },
    {
      id: 'board',
      title: 'Board Presentation',
      description:
        'Board-level reporting, governance updates, and strategic decisions.',
      icon: '▦'
    },
    {
      id: 'investor',
      title: 'Investor Pitch',
      description:
        'Funding decks, investor updates, and growth narratives.',
      icon: '↗'
    },
    {
      id: 'sales',
      title: 'Sales Presentation',
      description:
        'Client pitches, proposals, and revenue-focused presentations.',
      icon: '◆'
    },
    {
      id: 'consulting',
      title: 'Consulting Deck',
      description:
        'Recommendations, findings, business cases, and client deliverables.',
      icon: '▤'
    },
    {
      id: 'training',
      title: 'Training Presentation',
      description:
        'Instructional decks, workshops, and internal learning presentations.',
      icon: '▣'
    }
  ];

  function validateFile(file) {
    if (!file) {
      return 'Choose a PPTX or PDF file first.';
    }

    const fileName =
      file.name.toLowerCase();

    if (
      !fileName.endsWith('.pptx') &&
      !fileName.endsWith('.pdf')
    ) {
      return 'Only PPTX and PDF files are supported.';
    }

    if (
      file.size >
      MAX_FILE_SIZE_BYTES
    ) {
      return `Files must be smaller than ${MAX_FILE_SIZE_MB}MB.`;
    }

    return '';
  }

  function handleFileChange(event) {
    selectedFile =
      event.target.files?.[0] ||
      null;

    error =
      validateFile(selectedFile);
  }

  function updateProgress(
    nextStage,
    nextProgress
  ) {
    stage = nextStage;
    progress = nextProgress;
  }

  async function parseResponse(
    response
  ) {
    const text =
      await response.text();

    let data = {};

    try {
      data = text
        ? JSON.parse(text)
        : {};
    } catch {
      throw new Error(
        'The backend returned an unexpected response.'
      );
    }

    if (!response.ok) {
      throw new Error(
        data.error ||
        'The audit could not be completed.'
      );
    }

    return data;
  }

  async function submitFileAudit() {
    const validationError =
      validateFile(selectedFile);

    if (validationError) {
      error = validationError;
      return;
    }

    loading = true;
    error = '';

    updateProgress(
      'Uploading presentation',
      15
    );

    const formData =
      new FormData();

    formData.append(
      'deck',
      selectedFile
    );

    formData.append(
      'auditType',
      auditType
    );

    try {
      updateProgress(
        'Extracting slides',
        35
      );

      const response = await fetch(
        `${API_BASE_URL}/api/audit`,
        {
          method: 'POST',
          body: formData
        }
      );

      updateProgress(
        'Analyzing presentation',
        65
      );

      const audit =
        await parseResponse(response);

      updateProgress(
        'Building executive report',
        90
      );

      await new Promise(resolve =>
        setTimeout(resolve, 300)
      );

      updateProgress(
        'Audit complete',
        100
      );

      onAuditComplete(audit);

      setActivePage(
        'dashboard'
      );
    } catch (err) {
      error =
        err.message ||
        'The presentation could not be audited.';

      updateProgress(
        'Audit failed',
        0
      );
    } finally {
      loading = false;
    }
  }

  async function submitTextAudit() {
    if (!slideText.trim()) {
      error =
        'Paste slide content before starting the audit.';
      return;
    }

    loading = true;
    error = '';

    updateProgress(
      'Analyzing slide copy',
      35
    );

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/audit/text`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: JSON.stringify({
            title:
              slideTitle,

            text:
              slideText,

            auditType
          })
        }
      );

      updateProgress(
        'Building recommendations',
        75
      );

      const audit =
        await parseResponse(response);

      updateProgress(
        'Audit complete',
        100
      );

      onAuditComplete(audit);

      setActivePage(
        'dashboard'
      );
    } catch (err) {
      error =
        err.message ||
        'The pasted text could not be audited.';

      updateProgress(
        'Audit failed',
        0
      );
    } finally {
      loading = false;
    }
  }
</script>

<section class="new-audit-page">
  <header class="page-header">
    <div>
      <p class="eyebrow accent">
        New Audit
      </p>

      <h1>
        Start a presentation audit
      </h1>

      <p>
        Choose the presentation type, upload
        your deck, and generate a professional
        executive analysis.
      </p>
    </div>

    <button
      class="secondary-link"
      on:click={() =>
        setActivePage('dashboard')}
    >
      Back to Dashboard
    </button>
  </header>

  <section class="step-card panel sharp-panel">
    <div class="step-heading">
      <span>01</span>

      <div>
        <p class="eyebrow accent">
          Audit Type
        </p>

        <h2>
          What kind of presentation is this?
        </h2>
      </div>
    </div>

    <div class="type-grid">
      {#each auditTypes as type}
        <button
          class="type-card"
          class:selected={
            auditType === type.id
          }
          on:click={() =>
            (auditType = type.id)}
          type="button"
        >
          <span class="type-icon">
            {type.icon}
          </span>

          <strong>
            {type.title}
          </strong>

          <small>
            {type.description}
          </small>
        </button>
      {/each}
    </div>
  </section>

  <section class="step-card panel sharp-panel">
    <div class="step-heading">
      <span>02</span>

      <div>
        <p class="eyebrow accent">
          Presentation Content
        </p>

        <h2>
          Upload a deck or paste slide copy
        </h2>
      </div>
    </div>

    <div class="mode-tabs">
      <button
        class:active={
          activeMode === 'upload'
        }
        on:click={() =>
          (activeMode = 'upload')}
        disabled={loading}
      >
        Upload Deck
      </button>

      <button
        class:active={
          activeMode === 'paste'
        }
        on:click={() =>
          (activeMode = 'paste')}
        disabled={loading}
      >
        Paste Text
      </button>
    </div>

    {#if activeMode === 'upload'}
      <div class="upload-area">
        <input
          id="new-audit-file"
          type="file"
          accept=".pptx,.pdf"
          on:change={handleFileChange}
          disabled={loading}
        />

        <label for="new-audit-file">
          <span class="upload-icon">
            ↑
          </span>

          <strong>
            {selectedFile
              ? selectedFile.name
              : 'Choose presentation file'}
          </strong>

          <small>
            PPTX or PDF · Maximum 15MB ·
            Maximum 30 slides
          </small>
        </label>
      </div>
    {:else}
      <div class="paste-area">
        <label>
          Slide title

          <input
            bind:value={slideTitle}
            placeholder="Executive Update"
            disabled={loading}
          />
        </label>

        <label>
          Slide copy

          <textarea
            bind:value={slideText}
            rows="10"
            placeholder="Paste the slide headline, bullets, body text, or speaker notes..."
            disabled={loading}
          ></textarea>
        </label>
      </div>
    {/if}
  </section>

  <section class="step-card panel sharp-panel">
    <div class="step-heading">
      <span>03</span>

      <div>
        <p class="eyebrow accent">
          Audit Options
        </p>

        <h2>
          Included in your report
        </h2>
      </div>
    </div>

    <div class="included-grid">
      <article>
        <span>✓</span>

        <div>
          <strong>
            Presentation DNA
          </strong>

          <small>
            Category-level scoring and
            presentation personality.
          </small>
        </div>
      </article>

      <article>
        <span>✓</span>

        <div>
          <strong>
            Executive Readiness
          </strong>

          <small>
            Audience-specific readiness
            assessment.
          </small>
        </div>
      </article>

      <article>
        <span>✓</span>

        <div>
          <strong>
            Priority Recommendations
          </strong>

          <small>
            Consulting-quality improvement
            actions.
          </small>
        </div>
      </article>

      <article>
        <span>✓</span>

        <div>
          <strong>
            Executive Report
          </strong>

          <small>
            A printable professional audit
            report.
          </small>
        </div>
      </article>
    </div>

    {#if loading}
      <div class="audit-progress">
        <div class="progress-heading">
          <strong>{stage}</strong>

          <span>{progress}%</span>
        </div>

        <div class="progress-track">
          <div
            class="progress-fill"
            style={`width:${progress}%`}
          ></div>
        </div>
      </div>
    {/if}

    {#if error}
      <div
        class="error-state"
        role="alert"
      >
        <strong>
          We could not start the audit.
        </strong>

        <p>{error}</p>
      </div>
    {/if}

    <button
      class="start-button"
      on:click={
        activeMode === 'upload'
          ? submitFileAudit
          : submitTextAudit
      }
      disabled={
        loading ||
        (
          activeMode === 'upload' &&
          !selectedFile
        ) ||
        (
          activeMode === 'paste' &&
          !slideText.trim()
        )
      }
    >
      {loading
        ? stage
        : 'Start Executive Audit'}
    </button>
  </section>
</section>

<style>
  .new-audit-page {
    width: 100%;
    display: grid;
    gap: 20px;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
  }

  .page-header h1 {
    margin: 0;
    font-size:
      clamp(32px, 4vw, 46px);
    letter-spacing: -0.045em;
  }

  .page-header > div > p:last-child {
    margin-top: 8px;
    color: var(--muted);
    line-height: 1.6;
  }

  .step-card {
    display: grid;
    gap: 22px;
    padding: 28px;
  }

  .step-heading {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }

  .step-heading > span {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    background: var(--blue);
    color: white;
    font-weight: 900;
  }

  .step-heading h2 {
    margin: 0;
    font-size: 25px;
    letter-spacing: -0.03em;
  }

  .type-grid {
    display: grid;
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .type-card {
    min-height: 150px;
    display: grid;
    align-content: start;
    justify-items: start;
    gap: 10px;
    padding: 18px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    text-align: left;
    cursor: pointer;
  }

  .type-card:hover {
    border-color: var(--teal);
    background: var(--surface-hover);
  }

  .type-card.selected {
    border: 2px solid var(--orange);
    background:
      rgba(254, 91, 26, 0.07);
    box-shadow:
      5px 5px 0
      rgba(3, 138, 142, 0.18);
  }

  .type-icon {
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    background: var(--blue);
    color: white;
    font-weight: 900;
  }

  .type-card strong {
    font-size: 17px;
  }

  .type-card small {
    color: var(--muted);
    line-height: 1.5;
  }

  .mode-tabs {
    display: flex;
    gap: 8px;
  }

  .mode-tabs button {
    padding: 10px 14px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    font-weight: 750;
    cursor: pointer;
  }

  .mode-tabs button.active {
    border-color: var(--text);
    background: var(--orange);
    color: white;
    box-shadow:
      4px 4px 0 var(--teal);
  }

  .upload-area input {
    display: none;
  }

  .upload-area label {
    min-height: 190px;
    display: grid;
    place-content: center;
    justify-items: center;
    gap: 9px;
    padding: 28px;
    border: 2px dashed var(--teal);
    background:
      rgba(3, 138, 142, 0.06);
    cursor: pointer;
    text-align: center;
  }

  .upload-icon {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    background: var(--teal);
    color: white;
    font-size: 22px;
    font-weight: 900;
  }

  .upload-area label strong {
    font-size: 18px;
  }

  .upload-area label small {
    color: var(--muted);
  }

  .paste-area {
    display: grid;
    gap: 14px;
  }

  .paste-area label {
    display: grid;
    gap: 7px;
    color: var(--text);
    font-size: 13px;
    font-weight: 750;
  }

  .paste-area input,
  .paste-area textarea {
    width: 100%;
    padding: 13px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    font: inherit;
  }

  .included-grid {
    display: grid;
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .included-grid article {
    display: grid;
    grid-template-columns:
      auto minmax(0, 1fr);
    gap: 11px;
    padding: 14px;
    border: 1px solid var(--border);
    background: var(--surface);
  }

  .included-grid article > span {
    width: 28px;
    height: 28px;
    display: grid;
    place-items: center;
    background: var(--success-soft);
    color: var(--success);
    font-weight: 900;
  }

  .included-grid article div {
    display: grid;
    gap: 4px;
  }

  .included-grid small {
    color: var(--muted);
    line-height: 1.45;
  }

  .audit-progress {
    display: grid;
    gap: 9px;
    padding: 16px;
    border: 1px solid var(--border);
    background: var(--surface);
  }

  .progress-heading {
    display: flex;
    justify-content: space-between;
    gap: 20px;
  }

  .progress-heading span {
    color: var(--orange);
    font-weight: 850;
  }

  .progress-track {
    height: 11px;
    overflow: hidden;
    background: var(--surface-hover);
  }

  .progress-fill {
    height: 100%;
    background:
      linear-gradient(
        90deg,
        var(--teal),
        var(--blue),
        var(--orange)
      );
    transition: width 300ms ease;
  }

  .error-state {
    display: grid;
    gap: 7px;
    padding: 15px;
    border: 1px solid var(--danger-border);
    background: var(--danger-soft);
    color: var(--danger);
  }

  .error-state p {
    margin: 0;
  }

  .start-button {
    width: 100%;
    padding: 16px;
    border: 2px solid var(--text);
    background: var(--orange);
    color: white;
    box-shadow:
      6px 6px 0 var(--teal);
    font-size: 15px;
    font-weight: 900;
    cursor: pointer;
  }

  .start-button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  @media (max-width: 950px) {
    .type-grid {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 650px) {
    .page-header {
      align-items: stretch;
      flex-direction: column;
    }

    .type-grid,
    .included-grid {
      grid-template-columns: 1fr;
    }

    .step-card {
      padding: 20px;
    }

    .upload-area label {
      min-height: 150px;
    }
  }
</style>
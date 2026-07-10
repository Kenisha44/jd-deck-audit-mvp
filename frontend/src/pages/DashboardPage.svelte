<script>
  import { onMount } from 'svelte';
  import { API_BASE_URL } from '../lib/config.js';

  import MetricCard from '../components/common/MetricCard.svelte';
  import AuditWorkspace from '../components/workspace/AuditWorkspace.svelte';
  import PresentationDNA from '../components/dashboard/PresentationDNA.svelte';
  import SlideNavigator from '../components/dashboard/SlideNavigator.svelte';
  import PriorityQueue from '../components/dashboard/PriorityQueue.svelte';
  import ExecutiveHealthReport from '../components/dashboard/ExecutiveHealthReport.svelte';
  import SelectedSlideAnalysis from '../components/dashboard/SelectedSlideAnalysis.svelte';

  let selectedFile = null;
  let loading = false;
  let error = '';
  let audit = null;

  let activeMode = 'upload';
  let activeSlideIndex = 0;

  let slideTitle = 'Executive Update Slide';
  let slideText = '';

  let projects = [];

  const MAX_FILE_SIZE_MB = 15;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  $: selectedSlide =
    audit?.slides?.[activeSlideIndex] ||
    audit?.slides?.[0] ||
    null;

  $: deckMetadata = buildDeckMetadata(audit, selectedFile, error);

  onMount(() => {
    try {
      projects = JSON.parse(
        localStorage.getItem('jd-projects') || '[]'
      );
    } catch {
      projects = [];
    }
  });

  function saveProject(data) {
    const project = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...data
    };

    projects = [project, ...projects].slice(0, 8);

    localStorage.setItem(
      'jd-projects',
      JSON.stringify(projects)
    );
  }

  async function parseJsonResponse(
    response,
    fallbackMessage
  ) {
    const text = await response.text();
    let data = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(
        'The backend returned an unexpected response. Confirm that localhost:5050 is running.'
      );
    }

    if (!response.ok) {
      throw new Error(
        data.error || fallbackMessage
      );
    }

    return data;
  }

  function validateFile(file) {
    if (!file) {
      return 'Please choose a PPTX or PDF file first.';
    }

    const fileName = file.name.toLowerCase();

    if (
      !fileName.endsWith('.pptx') &&
      !fileName.endsWith('.pdf')
    ) {
      return 'Only PPTX and PDF files are supported.';
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `This audit supports files up to ${MAX_FILE_SIZE_MB}MB.`;
    }

    return '';
  }

  function formatFileSize(bytes = 0) {
    if (!bytes) {
      return 'Not available';
    }

    if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  function buildDeckMetadata(currentAudit, currentFile, currentError) {
  if (currentAudit) {
    return {
      name:
        currentAudit.deckName ||
        currentAudit.title ||
        'Untitled presentation',

      type:
        currentAudit.fileType ||
        currentAudit.source ||
        'Deck',

      size:
        currentAudit.metrics?.fileSize ||
        'Not available',

      slides:
        currentAudit.metrics?.estimatedSlides ||
        currentAudit.slides?.length ||
        'Not available',

      words:
        currentAudit.metrics?.estimatedWords ??
        'Not available',

      auditTime:
        currentAudit.metrics?.estimatedAuditTime ||
        'Under 10 seconds',

      status: 'Audit complete'
    };
  }

  if (currentFile) {
    return {
      name: currentFile.name,

      type:
        currentFile.name
          .split('.')
          .pop()
          ?.toUpperCase() || 'Deck',

      size: formatFileSize(currentFile.size),

      slides: 'Verified after upload',

      words: 'Calculated during audit',

      auditTime: '5–10 seconds',

      status: currentError
        ? 'Needs attention'
        : 'Ready to audit'
    };
  }

  return null;
}

  function handleFileChange(event) {
    selectedFile =
      event.target.files?.[0] ||
      null;

    audit = null;
    activeSlideIndex = 0;
    error = validateFile(selectedFile);
  }

  async function runDemoAudit() {
    loading = true;
    error = '';

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/audit/demo`
      );

      audit = await parseJsonResponse(
        response,
        'Demo audit failed.'
      );

      activeSlideIndex = 0;
      saveProject(audit);
    } catch (err) {
      error =
        err.message ||
        'The demo audit could not run.';
    } finally {
      loading = false;
    }
  }

  async function submitDeck() {
    const validationError =
      validateFile(selectedFile);

    if (validationError) {
      error = validationError;
      return;
    }

    const formData = new FormData();
    formData.append(
      'deck',
      selectedFile
    );

    loading = true;
    error = '';

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/audit`,
        {
          method: 'POST',
          body: formData
        }
      );

      audit = await parseJsonResponse(
        response,
        'Deck audit failed.'
      );

      activeSlideIndex = 0;
      saveProject(audit);
    } catch (err) {
      error =
        err.message ||
        'The deck could not be audited.';
    } finally {
      loading = false;
    }
  }

  async function submitText() {
    if (!slideText.trim()) {
      error =
        'Paste slide copy before running the audit.';
      return;
    }

    loading = true;
    error = '';

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
            title: slideTitle,
            text: slideText
          })
        }
      );

      audit = await parseJsonResponse(
        response,
        'Text audit failed.'
      );

      activeSlideIndex = 0;
      saveProject(audit);
    } catch (err) {
      error =
        err.message ||
        'The pasted text could not be audited.';
    } finally {
      loading = false;
    }
  }

  function loadProject(project) {
    audit = project;
    activeSlideIndex = 0;
    error = '';
  }

  function setActiveSlide(index) {
    activeSlideIndex = index;
  }

  function exportReport() {
    window.print();
  }
</script>

<section class="dashboard-page">
  <header class="dashboard-header">
    <div>
      <p class="eyebrow accent">
        JD Workspace
      </p>

      <h1>
        Deck Audit Dashboard
      </h1>

      <p class="dashboard-description">
        Upload a presentation, paste slide
        copy, or run the demonstration audit.
      </p>
    </div>

    <button
      class="primary-button"
      on:click={runDemoAudit}
      disabled={loading}
    >
      {loading
        ? 'Running Audit...'
        : 'Run Demo Audit'}
    </button>
  </header>

  <div class="metrics">
    <MetricCard
      title="Overall Score"
      value={audit?.overall ?? '--'}
      subtitle="Executive readiness"
      color="#2563eb"
    />

    <MetricCard
      title="Slides"
      value={audit?.slides?.length ?? '--'}
      subtitle="Slides reviewed"
      color="#16a34a"
    />

    <MetricCard
      title="Business Impact"
      value={audit?.healthReport?.businessImpact ?? '--'}
      subtitle="Estimated impact"
      color="#f59e0b"
    />

    <MetricCard
      title="Priority Fixes"
      value={audit?.priorityQueue?.length ?? 0}
      subtitle="Recommended changes"
      color="#dc2626"
    />
  </div>

  <div class="workspace-grid">
    <section class="upload-section panel sharp-panel">
      <div class="mode-tabs">
        <button
          class:active={activeMode === 'upload'}
          on:click={() =>
            (activeMode = 'upload')}
        >
          Upload Deck
        </button>

        <button
          class:active={activeMode === 'paste'}
          on:click={() =>
            (activeMode = 'paste')}
        >
          Paste Text
        </button>
      </div>

      {#if activeMode === 'upload'}
        <div class="section-copy">
          <p class="eyebrow accent">
            New Audit
          </p>

          <h2>
            Upload a PPTX or PDF
          </h2>

          <p>
            Upload a presentation to receive
            slide-level feedback, category scores,
            and an executive health report.
          </p>
        </div>

        <div class="upload-box">
          <input
            id="deck-file"
            type="file"
            accept=".pptx,.pdf"
            on:change={handleFileChange}
          />

          <label for="deck-file">
            <strong>
              {selectedFile
                ? selectedFile.name
                : 'Choose presentation file'}
            </strong>

            <span>
              PPTX or PDF · Maximum 15MB ·
              Maximum 30 slides
            </span>
          </label>

          <button
            class="primary-button"
            on:click={submitDeck}
            disabled={loading}
          >
            {loading
              ? 'Auditing Presentation...'
              : 'Generate Executive Audit'}
          </button>
        </div>
      {:else}
        <div class="section-copy">
          <p class="eyebrow accent">
            Slide Clarity Mode
          </p>

          <h2>
            Audit pasted slide copy
          </h2>

          <p>
            Test a headline, slide, executive
            summary, or group of presentation
            bullets.
          </p>
        </div>

        <div class="paste-box">
          <input
            bind:value={slideTitle}
            placeholder="Slide title"
          />

          <textarea
            bind:value={slideText}
            rows="9"
            placeholder="Paste slide text, bullets, or speaker notes..."
          ></textarea>

          <button
            class="primary-button"
            on:click={submitText}
            disabled={loading}
          >
            {loading
              ? 'Auditing Text...'
              : 'Audit Slide Copy'}
          </button>
        </div>
      {/if}

      {#if error}
        <p class="error-box">
          {error}
        </p>
      {/if}
    </section>

    <div class="workspace-side">
      <AuditWorkspace
        deckMetadata={deckMetadata}
        selectedSlide={selectedSlide}
        audit={audit}
        exportReport={exportReport}
      />

      <aside class="panel sharp-panel project-panel">
        <p class="eyebrow accent">
          Saved Projects
        </p>

        <h2>
          Recent Reports
        </h2>

        {#if projects.length === 0}
          <p class="muted">
            Completed audits will be saved
            locally and displayed here.
          </p>
        {:else}
          <div class="project-list">
            {#each projects as project}
              <button
                on:click={() =>
                  loadProject(project)}
              >
                <strong>
                  {project.deckName}
                </strong>

                <span>
                  {project.overall}/100 ·
                  {project.readiness ||
                    project.grade}
                </span>
              </button>
            {/each}
          </div>
        {/if}
      </aside>
    </div>
  </div>

  {#if audit}
    <div class="dashboard-grid">
      <div class="dashboard-column">
        <PresentationDNA
          dna={audit.dna}
        />

        <PriorityQueue
          priorityQueue={audit.priorityQueue}
        />
      </div>

      <div class="dashboard-column">
  <SlideNavigator
    slides={audit.slides}
    selectedSlide={selectedSlide}
    activeSlideIndex={activeSlideIndex}
    setActiveSlide={setActiveSlide}
  />

  <SelectedSlideAnalysis slide={selectedSlide} />

  <ExecutiveHealthReport
    audit={audit}
    exportReport={exportReport}
  />
</div>
    </div>
  {:else}
    <section class="empty-dashboard panel sharp-panel">
      <p class="eyebrow accent">
        Audit Results
      </p>

      <h2>
        Your executive analysis will appear here
      </h2>

      <p>
        Run the demo, upload a presentation, or
        paste slide copy to generate Presentation
        DNA, priority fixes, slide-level findings,
        and an Executive Health Report.
      </p>

      <button
        class="secondary-link"
        on:click={runDemoAudit}
        disabled={loading}
      >
        Preview with Demo Audit
      </button>
    </section>
  {/if}
</section>

<style>
  .dashboard-page {
    display: flex;
    flex-direction: column;
    gap: 28px;
    width: 100%;
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
  }

  .dashboard-header h1 {
    margin: 0;
    font-size: clamp(32px, 4vw, 46px);
    letter-spacing: -0.04em;
  }

  .dashboard-description {
    margin-top: 8px;
    color: var(--muted);
    line-height: 1.6;
  }

  .metrics {
    display: grid;
    grid-template-columns:
      repeat(4, minmax(0, 1fr));
    gap: 20px;
  }

  .workspace-grid {
    display: grid;
    grid-template-columns:
      minmax(0, 1.35fr)
      minmax(320px, 0.65fr);
    gap: 24px;
    align-items: start;
  }

  .workspace-side {
    display: grid;
    gap: 24px;
  }

  .upload-section {
    padding: 30px;
    display: grid;
    gap: 24px;
  }

  .section-copy {
    display: grid;
    gap: 8px;
  }

  .section-copy h2,
  .project-panel h2,
  .empty-dashboard h2 {
    margin: 0;
    font-size: 27px;
    letter-spacing: -0.03em;
  }

  .section-copy p {
    color: var(--muted);
    line-height: 1.65;
  }

  .mode-tabs {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .upload-box,
  .paste-box {
    display: grid;
    gap: 14px;
  }

  .upload-box input {
    display: none;
  }

  .upload-box label {
    display: grid;
    gap: 8px;
    min-height: 180px;
    place-content: center;
    text-align: center;
    padding: 28px;
    border: 2px dashed var(--teal);
    background:
      rgba(3, 138, 142, 0.06);
    cursor: pointer;
  }

  .upload-box label strong {
    font-size: 19px;
  }

  .upload-box label span {
    color: var(--muted);
    line-height: 1.5;
  }

  .paste-box input,
  .paste-box textarea {
    width: 100%;
    padding: 14px;
    border: 1px solid var(--border);
    background: var(--panel);
    color: var(--text);
    font: inherit;
  }

  .project-panel {
    padding: 28px;
  }

  .project-list {
    display: grid;
    gap: 10px;
    margin-top: 18px;
  }

  .project-list button {
    display: grid;
    gap: 5px;
    text-align: left;
    padding: 14px;
    border: 1px solid var(--border);
    background:
      rgba(3, 138, 142, 0.05);
    cursor: pointer;
  }

  .project-list span {
    color: var(--muted);
    font-size: 13px;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
    gap: 24px;
    align-items: start;
  }

  .dashboard-column {
    display: grid;
    gap: 24px;
  }

  .empty-dashboard {
    padding: 36px;
    min-height: 260px;
    display: grid;
    place-content: center;
    justify-items: start;
    gap: 14px;
  }

  .empty-dashboard p {
    max-width: 720px;
    color: var(--muted);
    line-height: 1.7;
  }

  @media (max-width: 1180px) {
    .metrics {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }

    .workspace-grid,
    .dashboard-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 720px) {
    .dashboard-header {
      flex-direction: column;
      align-items: stretch;
    }

    .metrics {
      grid-template-columns: 1fr;
    }

    .upload-section,
    .project-panel,
    .empty-dashboard {
      padding: 22px;
    }
  }
</style>
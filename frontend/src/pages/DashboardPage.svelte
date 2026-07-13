<script>
  import { onMount } from 'svelte';
  import { API_BASE_URL } from '../lib/config.js';

  import AuditWorkspace from '../components/workspace/AuditWorkspace.svelte';
  import DashboardMetrics from '../components/dashboard/DashboardMetrics.svelte';
  import SavedAuditsPanel from '../components/dashboard/SavedAuditsPanel.svelte';
  import PresentationDNA from '../components/dashboard/PresentationDNA.svelte';
  import SlideNavigator from '../components/dashboard/SlideNavigator.svelte';
  import PriorityQueue from '../components/dashboard/PriorityQueue.svelte';
  import ExecutiveHealthReport from '../components/dashboard/ExecutiveHealthReport.svelte';
  import SelectedSlideAnalysis from '../components/dashboard/SelectedSlideAnalysis.svelte';

  import { user } from '../stores/authStore.js';

  import {
    saveAudit as saveCloudAudit,
    loadAudits,
    renameAudit,
    deleteAudit,
    duplicateAudit
  } from '../lib/database/auditService.js';

  let selectedFile = null;
  let loading = false;
  let error = '';
  let audit = null;

  let activeMode = 'upload';
  let activeSlideIndex = 0;

  let slideTitle = 'Executive Update Slide';
  let slideText = '';

  let cloudAudits = [];
  let loadingCloudAudits = false;
  let savingAudit = false;
  let saveMessage = '';

  const MAX_FILE_SIZE_MB = 15;
  const MAX_FILE_SIZE_BYTES =
    MAX_FILE_SIZE_MB * 1024 * 1024;

  $: selectedSlide =
    audit?.slides?.[activeSlideIndex] ||
    audit?.slides?.[0] ||
    null;

  $: deckMetadata = buildDeckMetadata(
    audit,
    selectedFile,
    error
  );

  onMount(async () => {
    await refreshCloudAudits();
  });

  async function refreshCloudAudits() {
    if (!$user?.id) {
      cloudAudits = [];
      return;
    }

    loadingCloudAudits = true;
    error = '';

    const result = await loadAudits($user.id);

    if (result.success) {
      cloudAudits = result.data;
    } else {
      console.error(
        'Unable to load cloud audits:',
        result.error
      );

      error =
        result.error?.message ||
        'Unable to load your saved audits.';
    }

    loadingCloudAudits = false;
  }

  async function parseJsonResponse(
    response,
    fallbackMessage
  ) {
    const text = await response.text();
    let data = {};

    try {
      data = text
        ? JSON.parse(text)
        : {};
    } catch {
      throw new Error(
        'The backend returned an unexpected response. Confirm that localhost:5050 is running.'
      );
    }

    if (!response.ok) {
      throw new Error(
        data.error ||
        fallbackMessage
      );
    }

    return data;
  }

  function validateFile(file) {
    if (!file) {
      return 'Please choose a PPTX or PDF file first.';
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
      return `This audit supports files up to ${MAX_FILE_SIZE_MB}MB.`;
    }

    return '';
  }

  function formatFileSize(bytes = 0) {
    if (!bytes) {
      return 'Not available';
    }

    if (bytes < 1024 * 1024) {
      return `${Math.round(
        bytes / 1024
      )} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  function buildDeckMetadata(
    currentAudit,
    currentFile,
    currentError
  ) {
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
            ?.toUpperCase() ||
          'Deck',

        size:
          formatFileSize(
            currentFile.size
          ),

        slides:
          'Verified after upload',

        words:
          'Calculated during audit',

        auditTime:
          '5–10 seconds',

        status:
          currentError
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
    saveMessage = '';
    activeSlideIndex = 0;

    error = validateFile(
      selectedFile
    );
  }

  async function runDemoAudit() {
    loading = true;
    error = '';
    saveMessage = '';

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/audit/demo`
      );

      audit =
        await parseJsonResponse(
          response,
          'Demo audit failed.'
        );

      selectedFile = null;
      activeSlideIndex = 0;
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

    const formData =
      new FormData();

    formData.append(
      'deck',
      selectedFile
    );

    loading = true;
    error = '';
    saveMessage = '';

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/audit`,
        {
          method: 'POST',
          body: formData
        }
      );

      audit =
        await parseJsonResponse(
          response,
          'Deck audit failed.'
        );

      activeSlideIndex = 0;
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
    saveMessage = '';

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

      audit =
        await parseJsonResponse(
          response,
          'Text audit failed.'
        );

      selectedFile = null;
      activeSlideIndex = 0;
    } catch (err) {
      error =
        err.message ||
        'The pasted text could not be audited.';
    } finally {
      loading = false;
    }
  }

  async function saveCurrentAudit() {
    if (!audit) {
      error =
        'Run an audit before saving it.';
      return;
    }

    if (!$user?.id) {
      error =
        'You must be signed in to save an audit.';
      return;
    }

    savingAudit = true;
    saveMessage = '';
    error = '';

    const title =
      selectedFile?.name ||
      audit.deckName ||
      audit.title ||
      slideTitle ||
      'Untitled Audit';

    const result =
      await saveCloudAudit({
        userId: $user.id,

        title,

        presentationName:
          selectedFile?.name ||
          audit.deckName ||
          audit.title ||
          'Untitled Presentation',

        audit
      });

    if (!result.success) {
      error =
        result.error?.message ||
        'The audit could not be saved.';

      savingAudit = false;
      return;
    }

    cloudAudits = [
      result.data,
      ...cloudAudits
    ];

    saveMessage =
      'Audit saved to your JD workspace.';

    savingAudit = false;
  }

  function loadCloudAudit(savedAudit) {
    if (!savedAudit?.audit) {
      error =
        'This saved audit does not contain report data.';
      return;
    }

    audit = savedAudit.audit;
    selectedFile = null;
    activeSlideIndex = 0;
    error = '';

    saveMessage =
      `Opened "${savedAudit.title}".`;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  async function handleRenameAudit(savedAudit) {
    const nextTitle =
      window.prompt(
        'Rename audit',
        savedAudit.title
      );

    if (!nextTitle?.trim()) {
      return;
    }

    error = '';
    saveMessage = '';

    const result =
      await renameAudit(
        savedAudit.id,
        nextTitle.trim()
      );

    if (!result.success) {
      error =
        result.error?.message ||
        'The audit could not be renamed.';
      return;
    }

    cloudAudits =
      cloudAudits.map(item =>
        item.id === savedAudit.id
          ? result.data
          : item
      );

    saveMessage =
      'Audit renamed successfully.';
  }

  async function handleDeleteAudit(savedAudit) {
    const confirmed =
      window.confirm(
        `Delete "${savedAudit.title}"? This cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    error = '';
    saveMessage = '';

    const result =
      await deleteAudit(
        savedAudit.id
      );

    if (!result.success) {
      error =
        result.error?.message ||
        'The audit could not be deleted.';
      return;
    }

    cloudAudits =
      cloudAudits.filter(
        item =>
          item.id !== savedAudit.id
      );

    saveMessage =
      'Audit deleted successfully.';
  }

  async function handleDuplicateAudit(savedAudit) {
    error = '';
    saveMessage = '';

    const result =
      await duplicateAudit(
        savedAudit
      );

    if (!result.success) {
      error =
        result.error?.message ||
        'The audit could not be duplicated.';
      return;
    }

    cloudAudits = [
      result.data,
      ...cloudAudits
    ];

    saveMessage =
      'Audit duplicated successfully.';
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

    <div class="dashboard-actions">
      <button
        class="secondary-link"
        on:click={saveCurrentAudit}
        disabled={!audit || savingAudit}
      >
        {savingAudit
          ? 'Saving...'
          : 'Save Audit'}
      </button>

      <button
        class="primary-button"
        on:click={runDemoAudit}
        disabled={loading}
      >
        {loading
          ? 'Running Audit...'
          : 'Run Demo Audit'}
      </button>
    </div>
  </header>

  {#if saveMessage}
    <p class="save-message">
      {saveMessage}
    </p>
  {/if}

  <DashboardMetrics
    audits={cloudAudits}
  />

  <div class="workspace-grid">
    <section class="upload-section panel sharp-panel">
      <div class="mode-tabs">
        <button
          class:active={
            activeMode === 'upload'
          }
          on:click={() =>
            (activeMode = 'upload')}
        >
          Upload Deck
        </button>

        <button
          class:active={
            activeMode === 'paste'
          }
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
            slide-level feedback, category
            scores, and an executive health
            report.
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

      <SavedAuditsPanel
        audits={cloudAudits}
        loading={loadingCloudAudits}
        onRefresh={refreshCloudAudits}
        onOpen={loadCloudAudit}
        onRename={handleRenameAudit}
        onDuplicate={handleDuplicateAudit}
        onDelete={handleDeleteAudit}
      />
    </div>
  </div>

  {#if audit}
    <div class="dashboard-grid">
      <div class="dashboard-column">
        <PresentationDNA
          dna={audit.dna}
        />

        <PriorityQueue
          priorityQueue={
            audit.priorityQueue
          }
        />
      </div>

      <div class="dashboard-column">
        <SlideNavigator
          slides={audit.slides}
          selectedSlide={selectedSlide}
          activeSlideIndex={
            activeSlideIndex
          }
          setActiveSlide={
            setActiveSlide
          }
        />

        <SelectedSlideAnalysis
          slide={selectedSlide}
        />

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
  {/if}
</section>

<style>
  .dashboard-page {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
  }

  .dashboard-header h1 {
    margin: 0;
    font-size:
      clamp(32px, 4vw, 46px);
    letter-spacing: -0.04em;
  }

  .dashboard-description {
    margin-top: 8px;
    color: var(--muted);
    line-height: 1.6;
  }

  .dashboard-actions {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
  }

  .save-message {
    margin: 0;
    padding: 12px 14px;
    border: 1px solid
      var(--success-border);
    background:
      var(--success-soft);
    color: var(--success);
    font-weight: 750;
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
    display: grid;
    gap: 24px;
    padding: 30px;
  }

  .section-copy {
    display: grid;
    gap: 8px;
  }

  .section-copy h2,
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
    min-height: 180px;
    display: grid;
    place-content: center;
    gap: 8px;
    padding: 28px;
    border: 2px dashed
      var(--teal);
    background:
      rgba(3, 138, 142, 0.06);
    text-align: center;
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
    border: 1px solid
      var(--border);
    background: var(--panel);
    color: var(--text);
    font: inherit;
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
    min-height: 260px;
    display: grid;
    place-content: center;
    justify-items: start;
    gap: 14px;
    padding: 36px;
  }

  .empty-dashboard p {
    max-width: 720px;
    color: var(--muted);
    line-height: 1.7;
  }

  @media (max-width: 1180px) {
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

    .dashboard-actions {
      align-items: stretch;
    }

    .dashboard-actions button {
      flex: 1;
    }

    .upload-section,
    .empty-dashboard {
      padding: 22px;
    }
  }
</style>
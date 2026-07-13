<script>
  import { onDestroy, onMount } from 'svelte';
  import { API_BASE_URL } from '../lib/config.js';

  import AuditProgress from '../components/common/AuditProgress.svelte';
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

  let auditStage = 'Preparing';
  let auditProgress = 0;
  let progressTimers = [];

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

  onDestroy(() => {
    clearProgressTimers();
  });

  function clearProgressTimers() {
    progressTimers.forEach(timer => {
      clearTimeout(timer);
    });

    progressTimers = [];
  }

  function scheduleProgressStage(
    delay,
    stage,
    progress
  ) {
    const timer = setTimeout(() => {
      if (!loading) {
        return;
      }

      auditStage = stage;
      auditProgress = progress;
    }, delay);

    progressTimers.push(timer);
  }

  function startAuditProgress(mode = 'upload') {
    clearProgressTimers();

    auditProgress = 8;

    auditStage =
      mode === 'upload'
        ? 'Uploading Presentation'
        : 'Analyzing Content';

    if (mode === 'upload') {
      scheduleProgressStage(
        450,
        'Extracting Slides',
        30
      );

      scheduleProgressStage(
        1050,
        'Analyzing Content',
        55
      );
    } else {
      scheduleProgressStage(
        450,
        'Analyzing Content',
        48
      );
    }

    scheduleProgressStage(
      1650,
      'Generating Presentation DNA',
      76
    );

    scheduleProgressStage(
      2350,
      'Building Executive Report',
      92
    );
  }

  async function completeAuditProgress() {
    clearProgressTimers();

    auditStage = 'Complete';
    auditProgress = 100;

    await new Promise(resolve => {
      setTimeout(resolve, 350);
    });
  }

  function resetAuditProgress() {
    clearProgressTimers();
    auditStage = 'Preparing';
    auditProgress = 0;
  }

  async function refreshCloudAudits() {
    if (!$user?.id) {
      cloudAudits = [];
      return;
    }

    loadingCloudAudits = true;
    error = '';

    const result = await loadAudits(
      $user.id
    );

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

    if (
      bytes <
      1024 * 1024
    ) {
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

        status:
          'Audit complete'
      };
    }

    if (currentFile) {
      return {
        name:
          currentFile.name,

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

    resetAuditProgress();

    error = validateFile(
      selectedFile
    );
  }

  async function runDemoAudit() {
    loading = true;
    error = '';
    saveMessage = '';

    startAuditProgress('demo');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/audit/demo`
      );

      const result =
        await parseJsonResponse(
          response,
          'Demo audit failed.'
        );

      auditStage =
        'Generating Presentation DNA';

      auditProgress = 82;

      audit = result;

      selectedFile = null;
      activeSlideIndex = 0;

      await completeAuditProgress();
    } catch (err) {
      resetAuditProgress();

      error =
        err.message ||
        'The demo audit could not run.';
    } finally {
      loading = false;
    }
  }

  async function submitDeck() {
    const validationError =
      validateFile(
        selectedFile
      );

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

    startAuditProgress('upload');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/audit`,
        {
          method: 'POST',
          body: formData
        }
      );

      auditStage =
        'Analyzing Content';

      auditProgress =
        Math.max(
          auditProgress,
          62
        );

      const result =
        await parseJsonResponse(
          response,
          'Deck audit failed.'
        );

      auditStage =
        'Generating Presentation DNA';

      auditProgress = 84;

      audit = result;
      activeSlideIndex = 0;

      await completeAuditProgress();
    } catch (err) {
      resetAuditProgress();

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

    startAuditProgress('text');

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
              slideText
          })
        }
      );

      auditStage =
        'Generating Presentation DNA';

      auditProgress = 82;

      const result =
        await parseJsonResponse(
          response,
          'Text audit failed.'
        );

      audit = result;

      selectedFile = null;
      activeSlideIndex = 0;

      await completeAuditProgress();
    } catch (err) {
      resetAuditProgress();

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
        userId:
          $user.id,

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

    audit =
      savedAudit.audit;

    selectedFile = null;
    activeSlideIndex = 0;
    error = '';

    resetAuditProgress();

    saveMessage =
      `Opened "${savedAudit.title}".`;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  async function handleRenameAudit(
    savedAudit
  ) {
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

  async function handleDeleteAudit(
    savedAudit
  ) {
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
          item.id !==
          savedAudit.id
      );

    saveMessage =
      'Audit deleted successfully.';
  }

  async function handleDuplicateAudit(
    savedAudit
  ) {
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
        disabled={
          !audit ||
          savingAudit ||
          loading
        }
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
    <p
      class="save-message"
      role="status"
    >
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
            disabled={loading}
          />

          <label
            for="deck-file"
            class:disabled={loading}
          >
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
            disabled={
              loading ||
              !selectedFile
            }
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
            disabled={loading}
          />

          <textarea
            bind:value={slideText}
            rows="9"
            placeholder="Paste slide text, bullets, or speaker notes..."
            disabled={loading}
          ></textarea>

          <button
            class="primary-button"
            on:click={submitText}
            disabled={
              loading ||
              !slideText.trim()
            }
          >
            {loading
              ? 'Auditing Text...'
              : 'Audit Slide Copy'}
          </button>
        </div>
      {/if}

      {#if error}
        <div
          class="error-state"
          role="alert"
        >
          <strong>
            We could not complete the audit.
          </strong>

          <p>{error}</p>

          <ul>
            <li>
              Confirm the backend is running.
            </li>

            <li>
              Check that the presentation is
              not corrupted or password protected.
            </li>

            <li>
              Try a smaller PPTX file.
            </li>
          </ul>
        </div>
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

  {#if loading}
    <AuditProgress
      stage={auditStage}
      progress={auditProgress}
    />
  {/if}

  {#if audit && !loading}
    <div class="completion-banner panel sharp-panel">
      <div class="completion-icon">
        ✓
      </div>

      <div>
        <p class="eyebrow accent">
          Audit Complete
        </p>

        <h2>
          Executive analysis generated
        </h2>

        <p>
          JD reviewed
          {audit.slides?.length || 0}
          slides and created Presentation DNA,
          priority recommendations, and an
          Executive Health Report.
        </p>
      </div>

      <div class="completion-score">
        <strong>
          {audit.overall ?? '--'}
        </strong>

        <span>
          Overall Score
        </span>
      </div>
    </div>

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
  {:else if !loading}
    <section class="empty-dashboard panel sharp-panel">
      <div class="empty-icon">
        JD
      </div>

      <p class="eyebrow accent">
        Audit Results
      </p>

      <h2>
        Your next executive presentation starts here
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
  .empty-dashboard h2,
  .completion-banner h2 {
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

  .upload-box label.disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

  .error-state {
    display: grid;
    gap: 10px;
    padding: 18px;
    border: 1px solid
      var(--danger-border);
    background:
      var(--danger-soft);
    color: var(--danger);
  }

  .error-state p {
    margin: 0;
  }

  .error-state ul {
    display: grid;
    gap: 6px;
    margin: 0;
    padding-left: 20px;
  }

  .completion-banner {
    display: grid;
    grid-template-columns:
      auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 20px;
    padding: 26px;
    background: var(--panel);
    color: var(--text);
  }

  .completion-icon {
    width: 52px;
    height: 52px;
    display: grid;
    place-items: center;
    background: var(--success);
    color: white;
    font-size: 25px;
    font-weight: 900;
  }

  .completion-banner p:last-child {
    margin-top: 8px;
    color: var(--muted);
  }

  .completion-score {
    min-width: 112px;
    display: grid;
    justify-items: center;
    gap: 3px;
    padding: 14px;
    border: 1px solid
      var(--border);
    background: var(--surface);
  }

  .completion-score strong {
    color: var(--orange);
    font-size: 38px;
    line-height: 1;
  }

  .completion-score span {
    color: var(--muted);
    font-size: 12px;
    font-weight: 750;
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
    min-height: 320px;
    display: grid;
    place-content: center;
    justify-items: start;
    gap: 14px;
    padding: 36px;
  }

  .empty-icon {
    width: 54px;
    height: 54px;
    display: grid;
    place-items: center;
    background: var(--blue);
    color: white;
    font-weight: 900;
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

    .completion-banner {
      grid-template-columns: 1fr;
      justify-items: start;
    }

    .completion-score {
      width: 100%;
    }

    .upload-section,
    .empty-dashboard {
      padding: 22px;
    }
  }
</style>
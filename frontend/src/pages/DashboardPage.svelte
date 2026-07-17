<script>
  import { API_BASE_URL } from '../lib/config.js';
  import {
    onDestroy,
    onMount
  } from 'svelte';
  
  export let initialAudit = null;
  
  import AuditProgress from '../components/common/AuditProgress.svelte';
  import DashboardMetrics from '../components/dashboard/DashboardMetrics.svelte';
  
  import { user } from '../stores/authStore.js';

  import {
    saveAudit as saveCloudAudit,
    loadAudits,
    renameAudit,
    deleteAudit,
    duplicateAudit
  } from '../lib/database/auditService.js';

  import ExecutiveReport
  from '../components/report/ExecutiveReport.svelte';

import DashboardHeader
from '../components/dashboard/layout/DashboardHeader.svelte';

import UploadPanel
from '../components/dashboard/sections/UploadPanel.svelte';

import CompletionBanner
from '../components/dashboard/sections/CompletionBanner.svelte';

import EmptyDashboard
from '../components/dashboard/empty/EmptyDashboard.svelte';

import WorkspaceSidebar
  from '../components/dashboard/sections/WorkspaceSidebar.svelte';

import ResultsDashboard
  from '../components/dashboard/results/ResultsDashboard.svelte';

import {
  printExecutiveReport,
  handleAfterPrint
}
from '../lib/dashboard/printReport.js';

  let selectedFile = null;
  let loading = false;
  let error = '';
  let audit = initialAudit;

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
$: if (
  initialAudit &&
  initialAudit !== audit
) {
  audit = initialAudit;
  selectedFile = null;
  activeSlideIndex = 0;
  error = '';
  saveMessage =
    'Your new executive audit is ready.';
}

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

 
  return () => {
    window.removeEventListener(
      'afterprint',
      handleAfterPrint
    );
  };
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

  

  async function exportReport() {
    error = '';

    await printExecutiveReport({
      audit,

      reportElement:
        document.getElementById(
          'executive-report'
        ),

      setError: message => {
        error = message;
      }
    });
  }

</script>

<section class="dashboard-page">
<DashboardHeader
    {loading}
    {savingAudit}
    {audit}
    {runDemoAudit}
    {saveCurrentAudit}
/>
  {#if saveMessage}
    <p
      class="save-message no-print"
      role="status"
    >
      {saveMessage}
    </p>
  {/if}

  <div class="no-print">
  <DashboardMetrics audits={cloudAudits} />
</div>

  <div class="workspace-grid no-print">
    <UploadPanel
    bind:activeMode
    bind:slideTitle
    bind:slideText

    {loading}
    {selectedFile}
    {error}

    {handleFileChange}
    {submitDeck}
    {submitText}

    setUploadMode={() => activeMode = 'upload'}
    setPasteMode={() => activeMode = 'paste'}
/>

   <WorkspaceSidebar
  {deckMetadata}
  {selectedSlide}
  {audit}
  {exportReport}

  audits={cloudAudits}
  loading={loadingCloudAudits}

  onRefresh={refreshCloudAudits}
  onOpen={loadCloudAudit}
  onRename={handleRenameAudit}
  onDuplicate={handleDuplicateAudit}
  onDelete={handleDeleteAudit}
/> 
  </div>

  {#if loading}
  <div class="no-print">
    <AuditProgress
      stage={auditStage}
      progress={auditProgress}
    />
  </div>
{/if}

  {#if audit && !loading}
    <CompletionBanner {audit} />
<ExecutiveReport
  {audit}
   on:export={exportReport}
/>
    <ResultsDashboard
  {audit}
  {selectedSlide}
  {activeSlideIndex}
  {setActiveSlide}
  {exportReport}
/>
  {:else if !loading}
   <EmptyDashboard
  {loading}
  {runDemoAudit}
/>
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

    
    .upload-section{
  }
  }
  /* =========================================================
   LAUNCH POLISH — COMPACT DASHBOARD
   ========================================================= */

.dashboard-page {
  gap: 18px;
}

.dashboard-header {
  gap: 18px;
  padding-bottom: 2px;
}

.dashboard-header h1 {
  font-size: clamp(30px, 3.5vw, 42px);
}

.dashboard-description {
  margin-top: 5px;
  line-height: 1.45;
}

.dashboard-actions {
  gap: 10px;
}

.save-message {
  padding: 10px 12px;
}

.workspace-grid {
  gap: 16px;
  grid-template-columns:
    minmax(0, 1.45fr)
    minmax(300px, 0.55fr);
}

.workspace-side {
  gap: 16px;
}

.upload-section {
  gap: 16px;
  padding: 22px;
}

.section-copy {
  gap: 5px;
}

.section-copy h2 {

}

.section-copy p {
  line-height: 1.5;
}

.mode-tabs {
  gap: 8px;
}

.mode-tabs button {
  padding: 10px 14px;
}

.upload-box,
.paste-box {
  gap: 10px;
}

.upload-box label {
  min-height: 125px;
  padding: 20px;
}

.upload-box label strong {
  font-size: 17px;
}

.paste-box input,
.paste-box textarea {
  padding: 12px;
}


.dashboard-grid {
  gap: 16px;
}

.dashboard-column {
  gap: 16px;
}


@media (max-width: 1180px) {
  .workspace-grid,
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .dashboard-page {
    gap: 14px;
  }

  .upload-section{

  }
}

/* Final report alignment */

.dashboard-page {
  gap: 16px;
}


#executive-report {
  width: 100%;
  max-width: none;
}

.executive-report {
  width: 100%;
  max-width: none;
}

.dashboard-grid {
  margin-top: 0;
}

@media (min-width: 1181px) {
  .executive-report {
    grid-column: 1 / -1;
  }
}


.executive-report {
  width: 100%;
  max-width: none;
  min-width: 0;
}

</style>
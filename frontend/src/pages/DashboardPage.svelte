<script>
  import { onMount } from 'svelte';
  import { API_BASE_URL } from '../lib/config.js';

  import AuditWorkspace from '../components/workspace/AuditWorkspace.svelte';
  import PresentationDNA from '../components/dashboard/PresentationDNA.svelte';
  import SlideNavigator from '../components/dashboard/SlideNavigator.svelte';
  import PriorityQueue from '../components/dashboard/PriorityQueue.svelte';
  import ExecutiveHealthReport from '../components/dashboard/ExecutiveHealthReport.svelte';
  import MetricCard from '../components/common/MetricCard.svelte';

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

  $: selectedSlide = audit?.slides?.[activeSlideIndex] || audit?.slides?.[0] || null;
  $: deckMetadata = buildDeckMetadata();

  onMount(() => {
    projects = JSON.parse(localStorage.getItem('jd-projects') || '[]');
  });

  function saveProject(data) {
    const project = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...data };
    projects = [project, ...projects].slice(0, 8);
    localStorage.setItem('jd-projects', JSON.stringify(projects));
  }

  async function parseJsonResponse(response, fallbackMessage) {
    const text = await response.text();
    let data = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error('Backend returned an unexpected response. Make sure localhost:5050 is running.');
    }

    if (!response.ok) throw new Error(data.error || fallbackMessage);
    return data;
  }

  function validateFile(file) {
    if (!file) return 'Please choose a PPTX or PDF file first.';

    const lowerName = file.name.toLowerCase();

    if (!lowerName.endsWith('.pptx') && !lowerName.endsWith('.pdf')) {
      return 'Only PPTX and PDF files are supported.';
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `This audit supports files up to ${MAX_FILE_SIZE_MB}MB.`;
    }

    return '';
  }

  function formatFileSize(bytes = 0) {
    if (!bytes) return 'Not available';
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function buildDeckMetadata() {
    if (audit) {
      return {
        name: audit.deckName || 'Untitled report',
        type: audit.fileType || 'Deck',
        size: audit.metrics?.fileSize || 'Not available',
        slides: audit.metrics?.estimatedSlides || audit.slides?.length || 'Not available',
        words: audit.metrics?.estimatedWords ?? 'Not available',
        auditTime: audit.metrics?.estimatedAuditTime || 'Under 10 seconds',
        status: 'Audit complete'
      };
    }

    if (selectedFile) {
      return {
        name: selectedFile.name,
        type: selectedFile.name.split('.').pop()?.toUpperCase() || 'Deck',
        size: formatFileSize(selectedFile.size),
        slides: 'Verified after upload',
        words: 'Calculated during audit',
        auditTime: '5–10 seconds',
        status: error ? 'Needs attention' : 'Ready to audit'
      };
    }

    return null;
  }

  function handleFileChange(event) {
    selectedFile = event.target.files?.[0] || null;
    audit = null;
    activeSlideIndex = 0;
    error = validateFile(selectedFile);
  }

  async function runDemoAudit() {
    loading = true;
    error = '';

    try {
      const response = await fetch(`${API_BASE_URL}/api/audit/demo`);
      audit = await parseJsonResponse(response, 'Demo audit failed.');
      activeSlideIndex = 0;
      saveProject(audit);
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function submitDeck() {
    const validationError = validateFile(selectedFile);

    if (validationError) {
      error = validationError;
      return;
    }

    const formData = new FormData();
    formData.append('deck', selectedFile);

    loading = true;
    error = '';

    try {
      const response = await fetch(`${API_BASE_URL}/api/audit`, {
        method: 'POST',
        body: formData
      });

      audit = await parseJsonResponse(response, 'Audit failed.');
      activeSlideIndex = 0;
      saveProject(audit);
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function submitText() {
    if (!slideText.trim()) {
      error = 'Paste slide copy first.';
      return;
    }

    loading = true;
    error = '';

    try {
      const response = await fetch(`${API_BASE_URL}/api/audit/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: slideTitle, text: slideText })
      });

      audit = await parseJsonResponse(response, 'Text audit failed.');
      activeSlideIndex = 0;
      saveProject(audit);
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  function loadProject(project) {
    audit = project;
    activeSlideIndex = 0;
  }

  function setActiveSlide(index) {
    activeSlideIndex = index;
  }

  function exportReport() {
    window.print();
  }
</script>

<section class="dashboard-page">
  <div class="dashboard-header">
    <div>
      <p class="eyebrow accent">JD Workspace</p>
      <h1>Deck Audit Dashboard</h1>
      <p>Upload a deck, run a demo audit, or paste slide copy.</p>
    </div>

    <button class="primary-button" on:click={runDemoAudit} disabled={loading}>
      {loading ? 'Running...' : 'Run Demo Audit'}
    </button>
  </div>

  <div class="metrics">
    <MetricCard title="Overall Score" value={audit?.overall || '--'} subtitle="Executive Readiness" color="#2563eb" />
    <MetricCard title="Slides" value={audit?.slides?.length || '--'} subtitle="Slides Reviewed" color="#16a34a" />
    <MetricCard title="Business Impact" value={audit?.healthReport?.businessImpact || '--'} subtitle="Estimated Impact" color="#f59e0b" />
    <MetricCard title="Priority Fixes" value={audit?.priorityQueue?.length || '0'} subtitle="Recommended Changes" color="#dc2626" />
  </div>

  <div class="workspace-grid">
    <div class="upload-section panel sharp-panel">
      <div class="mode-tabs">
        <button class:active={activeMode === 'upload'} on:click={() => (activeMode = 'upload')}>Upload Deck</button>
        <button class:active={activeMode === 'paste'} on:click={() => (activeMode = 'paste')}>Paste Text</button>
      </div>

      {#if activeMode === 'upload'}
        <h3>Upload a PPTX or PDF</h3>

        <div class="upload-box">
          <input id="deck" type="file" accept=".pptx,.pdf" on:change={handleFileChange} />
          <label for="deck">
            <strong>{selectedFile ? selectedFile.name : 'Choose deck file'}</strong>
            <span>PPTX or PDF · Max 15MB · Max 30 slides</span>
          </label>

          <button class="primary-button" on:click={submitDeck} disabled={loading}>
            {loading ? 'Auditing...' : 'Generate Audit'}
          </button>
        </div>
      {:else}
        <h3>Paste slide copy</h3>

        <div class="paste-box">
          <input bind:value={slideTitle} placeholder="Slide title" />
          <textarea bind:value={slideText} rows="8" placeholder="Paste slide text..."></textarea>

          <button class="primary-button" on:click={submitText} disabled={loading}>
            {loading ? 'Auditing...' : 'Audit Text'}
          </button>
        </div>
      {/if}

      {#if error}
        <p class="error-box">{error}</p>
      {/if}
    </div>

    <div class="workspace-side">
      <AuditWorkspace
        deckMetadata={deckMetadata}
        selectedSlide={selectedSlide}
        audit={audit}
        exportReport={exportReport}
      />

      <aside class="panel sharp-panel project-panel">
        <p class="eyebrow accent">Saved Projects</p>
        <h3>Recent Reports</h3>

        {#if projects.length === 0}
          <p class="muted">Run an audit and it will save here locally.</p>
        {:else}
          <div class="project-list">
            {#each projects as project}
              <button on:click={() => loadProject(project)}>
                <strong>{project.deckName}</strong>
                <span>{project.overall}/100 · {project.readiness || project.grade}</span>
              </button>
            {/each}
          </div>
        {/if}
      </aside>
    </div>
  </div>

  {#if audit}
    <div class="dashboard-grid">
      <div class="workspace-column">
        <PresentationDNA dna={audit.dna} />
        <PriorityQueue priorityQueue={audit.priorityQueue} />
      </div>

      <div class="insights-column">
        <SlideNavigator
          slides={audit.slides}
          selectedSlide={selectedSlide}
          activeSlideIndex={activeSlideIndex}
          setActiveSlide={setActiveSlide}
        />

        <ExecutiveHealthReport
          audit={audit}
          exportReport={exportReport}
        />
      </div>
    </div>
  {/if}
</section>

<style>
  .dashboard-page {
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
    font-size: 42px;
    margin: 0;
  }

  .dashboard-header p {
    color: var(--muted);
    margin-top: 8px;
  }

  .metrics {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    align-items: start;
  }

  .workspace-column,
  .insights-column {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  @media (max-width: 1200px) {
    .metrics,
    .dashboard-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 700px) {
    .metrics,
    .dashboard-grid {
      grid-template-columns: 1fr;
    }

    .dashboard-header {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
<script>
  import { onMount } from 'svelte';
  import { API_BASE_URL } from './lib/config.js';

  import AuditWorkspace from './components/AuditWorkspace.svelte';
  import PresentationDNA from './components/PresentationDNA.svelte';
  import SlideNavigator from './components/SlideNavigator.svelte';
  import PriorityQueue from './components/PriorityQueue.svelte';
  import ExecutiveHealthReport from './components/ExecutiveHealthReport.svelte';

  let darkMode = false;
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

  $: document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
  $: selectedSlide = audit?.slides?.[activeSlideIndex] || audit?.slides?.[0] || null;
  $: deckMetadata = buildDeckMetadata();

  onMount(() => {
    projects = JSON.parse(localStorage.getItem('jd-projects') || '[]');
  });

  function saveProject(data) {
    const project = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...data
    };

    projects = [project, ...projects].slice(0, 8);
    localStorage.setItem('jd-projects', JSON.stringify(projects));
  }

  async function parseJsonResponse(response, fallbackMessage) {
    const text = await response.text();
    let data = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error('The audit server returned an unexpected response. Make sure the backend is running on localhost:5050.');
    }

    if (!response.ok) {
      throw new Error(data.error || fallbackMessage);
    }

    return data;
  }

  function validateFile(file) {
    if (!file) return 'Please choose a PPTX or PDF file first.';

    const lowerName = file.name.toLowerCase();

    if (!lowerName.endsWith('.pptx') && !lowerName.endsWith('.pdf')) {
      return 'Only PPTX and PDF files are supported in this V1 audit.';
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `This V1 audit supports files up to ${MAX_FILE_SIZE_MB}MB. Please upload a smaller deck or request a Professional Deck Audit.`;
    }

    return '';
  }

  function handleFileChange(event) {
    selectedFile = event.target.files?.[0] || null;
    audit = null;
    activeSlideIndex = 0;
    error = validateFile(selectedFile);
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
        type: audit.fileType || audit.source || 'Deck',
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
        auditTime: selectedFile.size > 8 * 1024 * 1024 ? '15–30 seconds' : '5–10 seconds',
        status: error ? 'Needs attention' : 'Ready to audit'
      };
    }

    return null;
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
      error = err.message || 'Something went wrong.';
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

      const data = await parseJsonResponse(response, 'Audit failed.');
      audit = data;
      activeSlideIndex = 0;
      saveProject(data);
    } catch (err) {
      error = err.message || 'Something went wrong.';
    } finally {
      loading = false;
    }
  }

  async function submitText() {
    if (!slideText.trim()) {
      error = 'Paste slide copy or deck notes first.';
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

      const data = await parseJsonResponse(response, 'Text audit failed.');
      audit = data;
      activeSlideIndex = 0;
      saveProject(data);
    } catch (err) {
      error = err.message || 'Something went wrong.';
    } finally {
      loading = false;
    }
  }

  function loadProject(project) {
    audit = project;
    activeSlideIndex = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function exportReport() {
    window.print();
  }

  function setActiveSlide(index) {
    activeSlideIndex = index;
  }
</script>

<main class="app-shell">
  <nav class="topbar no-print">
    <div class="brand-lockup">
      <div class="logo-mark">JD</div>
      <div>
        <p class="eyebrow">Johken Design</p>
        <h1>Deck Audit Engine V1</h1>
      </div>
    </div>

    <div class="nav-actions">
      <a class="secondary-link" href="#pricing">Pricing</a>
      <button class="theme-toggle" on:click={() => (darkMode = !darkMode)}>
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
    </div>
  </nav>

  <section class="hero-grid no-print">
    <div class="hero-copy panel sharp-panel">
      <p class="eyebrow accent">Presentation Audit AI</p>
      <h2>Turn messy decks into executive-ready decisions.</h2>
      <p class="hero-text">
        Upload a PPTX/PDF or paste slide copy to generate a JD-style audit with scores, executive rewrite suggestions, priority fixes, and a client-ready report.
      </p>

      <div class="hero-actions">
        <a class="primary-link" href="#workspace">Start Audit</a>
        <button class="secondary-link" on:click={runDemoAudit} disabled={loading}>
          Run Demo Audit
        </button>
      </div>
    </div>

    <div class="score-preview panel sharp-panel">
      <p class="eyebrow">V1 Modules</p>
      <div class="focus-list">
        <span>Deck Upload</span>
        <span>Audit Workspace</span>
        <span>Presentation DNA</span>
        <span>Executive Health Report</span>
      </div>
      <div class="color-strip">
        <span class="c1"></span>
        <span class="c2"></span>
        <span class="c3"></span>
        <span class="c4"></span>
      </div>
    </div>
  </section>

  <section id="workspace" class="workspace-grid no-print">
    <div class="upload-section panel sharp-panel">
      <div class="mode-tabs">
        <button class:active={activeMode === 'upload'} on:click={() => (activeMode = 'upload')}>
          Upload Deck
        </button>
        <button class:active={activeMode === 'paste'} on:click={() => (activeMode = 'paste')}>
          Paste Text
        </button>
      </div>

      {#if activeMode === 'upload'}
        <div>
          <p class="eyebrow accent">Step 1</p>
          <h3>Upload a PPTX or PDF</h3>
          <p>V1 accepts files and returns a structured executive audit. PPTX text extraction is included for slide-level review.</p>
        </div>

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
        <div>
          <p class="eyebrow accent">Slide Clarity Mode</p>
          <h3>Paste slide copy</h3>
          <p>Use this for quick audits before you upload a full deck.</p>
        </div>

        <div class="paste-box">
          <input bind:value={slideTitle} placeholder="Slide title" />
          <textarea bind:value={slideText} rows="8" placeholder="Paste slide text, bullets, or speaker notes..."></textarea>
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
          <p class="muted">Run an audit and it will save here locally for quick demos.</p>
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
  </section>

{#if audit}
  <div class="dashboard-grid">
    <PresentationDNA dna={audit.dna} />

    <SlideNavigator
      slides={audit.slides}
      selectedSlide={selectedSlide}
      activeSlideIndex={activeSlideIndex}
      setActiveSlide={setActiveSlide}
    />

    <PriorityQueue priorityQueue={audit.priorityQueue} />

    <ExecutiveHealthReport
      audit={audit}
      exportReport={exportReport}
    />
  </div>
{:else}
  <div class="dashboard-grid dashboard-placeholder no-print">
    <section class="panel sharp-panel preview-card">
      <p class="eyebrow accent">Presentation DNA</p>
      <h3>Audit profile preview</h3>
      <p>Run an audit to see executive communication, storytelling, visual design, readability, and brand consistency scores.</p>
    </section>

    <section class="panel sharp-panel preview-card">
      <p class="eyebrow accent">Slide Navigator</p>
      <h3>Slide-by-slide review</h3>
      <p>After upload, each slide gets its own score, summary, strengths, and priority fixes.</p>
    </section>

    <section class="panel sharp-panel preview-card">
      <p class="eyebrow accent">Priority Fix Queue</p>
      <h3>Highest-impact edits</h3>
      <p>JD ranks the top improvements so users know what to fix first.</p>
    </section>

    <section class="panel sharp-panel preview-card wide-panel">
      <p class="eyebrow accent">Executive Health Report</p>
      <h3>Export-ready summary</h3>
      <p>Generate a polished report with overall score, risks, top strengths, biggest opportunity, and next steps.</p>
    </section>
  </div>
{/if}

  <section id="pricing" class="pricing-grid no-print">
    <article class="panel sharp-panel">
      <p class="eyebrow">Free</p>
      <h3>$0</h3>
      <p>Demo audit, basic scoring, limited exports.</p>
    </article>

    <article class="panel sharp-panel featured">
      <p class="eyebrow accent">Pro</p>
      <h3>$19/mo</h3>
      <p>Saved reports, AI rewrites, PDF/print exports, priority audit history.</p>
    </article>

    <article class="panel sharp-panel">
      <p class="eyebrow">Service</p>
      <h3>$97+</h3>
      <p>Human JD audit, slide-by-slide notes, redesign upsell.</p>
    </article>
  </section>
</main>
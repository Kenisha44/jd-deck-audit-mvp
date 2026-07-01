<script>
  import { onMount } from 'svelte';
  import { API_BASE_URL } from './lib/config.js';

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

  $: document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
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

  const MAX_FILE_SIZE_MB = 15;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  async function parseJsonResponse(response, fallbackMessage) {
    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch (err) {
      throw new Error('The audit server returned an unexpected response. Make sure the backend is running on localhost:5050.');
    }
    if (!response.ok) throw new Error(data.error || fallbackMessage);
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
      const response = await fetch(`${API_BASE_URL}/api/audit`, { method: 'POST', body: formData });
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
      <button class="theme-toggle" on:click={() => (darkMode = !darkMode)}>{darkMode ? 'Light Mode' : 'Dark Mode'}</button>
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
        <button class="secondary-link" on:click={runDemoAudit} disabled={loading}>Run Demo Audit</button>
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
      <div class="color-strip"><span class="c1"></span><span class="c2"></span><span class="c3"></span><span class="c4"></span></div>
    </div>
  </section>

  <section id="workspace" class="workspace-grid no-print">
    <div class="upload-section panel sharp-panel">
      <div class="mode-tabs">
        <button class:active={activeMode === 'upload'} on:click={() => (activeMode = 'upload')}>Upload Deck</button>
        <button class:active={activeMode === 'paste'} on:click={() => (activeMode = 'paste')}>Paste Text</button>
      </div>

      {#if activeMode === 'upload'}
        <div>
          <p class="eyebrow accent">Step 1</p>
          <h3>Upload a PPTX or PDF</h3>
          <p>V1 accepts files and returns a structured executive audit. PPTX text extraction is included for slide-level review.</p>
        </div>
        <div class="upload-box">
          <input id="deck" type="file" accept=".pptx,.pdf" on:change={handleFileChange} />
          <label for="deck"><strong>{selectedFile ? selectedFile.name : 'Choose deck file'}</strong><span>PPTX or PDF · Max 15MB · Max 30 slides</span></label>
          <button class="primary-button" on:click={submitDeck} disabled={loading}>{loading ? 'Auditing...' : 'Generate Audit'}</button>
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
          <button class="primary-button" on:click={submitText} disabled={loading}>{loading ? 'Auditing...' : 'Audit Text'}</button>
        </div>
      {/if}

      {#if error}<p class="error-box">{error}</p>{/if}
    </div>

    <div class="workspace-side">
      <aside class="panel sharp-panel audit-workspace">
        <p class="eyebrow accent">Audit Workspace</p>
        <h3>Deck Preview</h3>
        {#if deckMetadata}
          <div class="meta-grid">
            <div><span>File</span><strong>{deckMetadata.name}</strong></div>
            <div><span>Type</span><strong>{deckMetadata.type}</strong></div>
            <div><span>Size</span><strong>{deckMetadata.size}</strong></div>
            <div><span>Slides</span><strong>{deckMetadata.slides}</strong></div>
            <div><span>Words</span><strong>{deckMetadata.words}</strong></div>
            <div><span>Audit Time</span><strong>{deckMetadata.auditTime}</strong></div>
          </div>
          <div class="status-strip"><span>{deckMetadata.status}</span></div>
        {:else}
          <p class="muted">Upload a deck to preview audit metadata, slide count, word count, and estimated audit time.</p>
        {/if}
      </aside>

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
                <span>{project.overall}/100 · {project.grade}</span>
              </button>
            {/each}
          </div>
        {/if}
      </aside>
    </div>
  </section>

  {#if audit}
    <section class="results-section report-page">
      <div class="print-brand print-only">
        <div class="logo-mark">JD</div>
        <div>
          <p class="eyebrow">Johken Design</p>
          <h1>Executive Health Report</h1>
        </div>
      </div>

      <div class="results-header panel sharp-panel">
        <div>
          <p class="eyebrow accent">Executive Summary</p>
          <h3>{audit.deckName}</h3>
          <p>{audit.summary}</p>
          <div class="pill-row"><span>{audit.grade}</span><span>{audit.metrics.textDensity} Density</span><span>{audit.metrics.riskLevel} Risk</span><span>{audit.dna?.topStrength || 'Clarity'} Strength</span></div>
        </div>
        <div class="overall-score"><span>{audit.overall}</span><small>/100</small></div>
      </div>

      <div class="health-grid">
        <article class="panel sharp-panel health-card">
          <p class="eyebrow accent">Executive Health Report</p>
          <h4>{audit.healthReport?.businessImpact || 'Moderate'} Business Impact</h4>
          <div class="health-list">
            <span><strong>Top Strength</strong>{audit.healthReport?.topStrength || audit.dna?.topStrength}</span>
            <span><strong>Biggest Opportunity</strong>{audit.healthReport?.biggestOpportunity || audit.dna?.biggestOpportunity}</span>
            <span><strong>Risk Level</strong>{audit.metrics.riskLevel}</span>
            <span><strong>Estimated Improvement</strong>{audit.healthReport?.estimatedImprovementTime || '15–25 minutes'}</span>
          </div>
        </article>

        {#if audit.dna}
          <article class="dna-panel panel sharp-panel">
            <div>
              <p class="eyebrow accent">Presentation DNA</p>
              <h4>{audit.dna.topStrength}</h4>
              <p>Biggest Opportunity: {audit.dna.biggestOpportunity}</p>
            </div>
            <div class="dna-bars">
              {#each audit.dna.profile as item}
                <div class="dna-bar-wrap">
                  <div class="dna-row"><span>{item.label}</span><strong>{item.score}/100</strong></div>
                  <div class="dna-track"><span style={`width: ${item.score}%`}></span></div>
                </div>
              {/each}
            </div>
          </article>
        {/if}
      </div>

      <div class="score-grid no-print">
        <div class="score-card panel sharp-panel"><span>{audit.scores.clarity}</span><p>Clarity</p></div>
        <div class="score-card panel sharp-panel"><span>{audit.scores.storytelling}</span><p>Storytelling</p></div>
        <div class="score-card panel sharp-panel"><span>{audit.scores.executiveReadiness}</span><p>Executive Readiness</p></div>
        <div class="score-card panel sharp-panel"><span>{audit.scores.visualSimplicity}</span><p>Visual Simplicity</p></div>
        <div class="score-card panel sharp-panel"><span>{audit.scores.dataStorytelling}</span><p>Data Storytelling</p></div>
        <div class="score-card panel sharp-panel"><span>{audit.scores.actionability}</span><p>Actionability</p></div>
      </div>

      <div class="audit-detail-grid">
        <article class="panel sharp-panel priority-card">
          <h4>Priority Fix Queue</h4>
          {#each audit.priorityFixes || audit.fixes as item, index}
            <div class="priority-item">
              <span class={`severity ${(item.severity || 'Moderate').toLowerCase()}`}>{item.severity || (index < 2 ? 'Critical' : 'Moderate')}</span>
              <div>
                <strong>{item.title || item}</strong>
                {#if item.reason}<p>{item.reason}</p>{/if}
              </div>
            </div>
          {/each}
        </article>

        <article class="panel sharp-panel slide-card">
          <div class="slide-card-header">
            <div>
              <p class="eyebrow accent">Slide Navigator</p>
              <h4>{selectedSlide?.title || 'Slide Review'}</h4>
            </div>
            <span>{selectedSlide?.score || audit.overall}/100</span>
          </div>

          {#if audit.slides?.length}
            <div class="slide-nav no-print">
              {#each audit.slides as slide, index}
                <button class:active={activeSlideIndex === index} on:click={() => (activeSlideIndex = index)}>
                  {slide.number}
                </button>
              {/each}
            </div>
          {/if}

          {#if selectedSlide}
            <p class="slide-summary">{selectedSlide.summary}</p>
            <div class="slide-notes">
              {#each selectedSlide.issues as issue}<span>⚠ {issue}</span>{/each}
              {#each selectedSlide.fixes as fix}<span>✓ {fix}</span>{/each}
            </div>
          {:else}
            <p class="muted">Slide-level notes will appear after an audit.</p>
          {/if}
        </article>
      </div>

      <div class="findings-grid">
        <article class="panel sharp-panel"><h4>Strengths</h4>{#each audit.strengths as item}<p class="finding good">✓ {item}</p>{/each}</article>
        <article class="panel sharp-panel"><h4>Weaknesses</h4>{#each audit.weaknesses as item}<p class="finding warning">⚠ {item}</p>{/each}</article>
        <article class="panel sharp-panel wide-card rewrite-card">
          <h4>AI Rewrite Direction</h4>
          <p class="rewrite-headline">{audit.rewrite.headline}</p>
          <p>{audit.rewrite.executiveSummary}</p>
          <div class="rewrite-grid">{#each audit.rewrite.betterBullets as item}<span>{item}</span>{/each}</div>
        </article>
      </div>

      <div class="cta-panel panel sharp-panel no-print">
        <div><p class="eyebrow accent">Next Step</p><h3>{audit.cta.title}</h3><p>{audit.cta.description}</p></div>
        <div class="cta-actions"><button class="secondary-link" on:click={exportReport}>Export Executive Health Report</button><button class="primary-button">{audit.cta.price}</button></div>
      </div>
    </section>
  {/if}

  <section id="pricing" class="pricing-grid no-print">
    <article class="panel sharp-panel"><p class="eyebrow">Free</p><h3>$0</h3><p>Demo audit, basic scoring, limited exports.</p></article>
    <article class="panel sharp-panel featured"><p class="eyebrow accent">Pro</p><h3>$19/mo</h3><p>Saved reports, AI rewrites, PDF/print exports, priority audit history.</p></article>
    <article class="panel sharp-panel"><p class="eyebrow">Service</p><h3>$97+</h3><p>Human JD audit, slide-by-slide notes, redesign upsell.</p></article>
  </section>
</main>
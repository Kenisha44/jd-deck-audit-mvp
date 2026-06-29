<script>
  import { onMount } from 'svelte';
  import { API_BASE_URL } from './lib/config.js';

  let darkMode = false;
  let selectedFile = null;
  let loading = false;
  let error = '';
  let audit = null;
  let activeMode = 'upload';
  let slideTitle = 'Executive Update Slide';
  let slideText = '';
  let projects = [];

  $: document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';

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
    error = validateFile(selectedFile);
  }

  async function runDemoAudit() {
    loading = true;
    error = '';
    try {
      const response = await fetch(`${API_BASE_URL}/api/audit/demo`);
      audit = await parseJsonResponse(response, 'Demo audit failed.');
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
      saveProject(data);
    } catch (err) {
      error = err.message || 'Something went wrong.';
    } finally {
      loading = false;
    }
  }

  function loadProject(project) {
    audit = project;
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
        <span>Slide Clarity Audit</span>
        <span>AI Rewrite</span>
        <span>Saved Reports</span>
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
          <p>V1 accepts files and returns a structured executive audit. Real slide extraction/AI parsing can be added next.</p>
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
          <p>Use this for quick audits before you add full PPT extraction.</p>
        </div>
        <div class="paste-box">
          <input bind:value={slideTitle} placeholder="Slide title" />
          <textarea bind:value={slideText} rows="8" placeholder="Paste slide text, bullets, or speaker notes..."></textarea>
          <button class="primary-button" on:click={submitText} disabled={loading}>{loading ? 'Auditing...' : 'Audit Text'}</button>
        </div>
      {/if}

      {#if error}<p class="error-box">{error}</p>{/if}
    </div>

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
  </section>

  {#if audit}
    <section class="results-section report-page">
      <div class="results-header panel sharp-panel">
        <div>
          <p class="eyebrow accent">Executive Summary</p>
          <h3>{audit.deckName}</h3>
          <p>{audit.summary}</p>
          <div class="pill-row"><span>{audit.grade}</span><span>{audit.metrics.textDensity} Density</span><span>{audit.metrics.riskLevel} Risk</span><span>{audit.dna?.topStrength || 'Clarity'} Strength</span></div>
        </div>
        <div class="overall-score"><span>{audit.overall}</span><small>/100</small></div>
      </div>

      <div class="score-grid">
        <div class="score-card panel sharp-panel"><span>{audit.scores.clarity}</span><p>Clarity</p></div>
        <div class="score-card panel sharp-panel"><span>{audit.scores.storytelling}</span><p>Storytelling</p></div>
        <div class="score-card panel sharp-panel"><span>{audit.scores.executiveReadiness}</span><p>Executive Readiness</p></div>
        <div class="score-card panel sharp-panel"><span>{audit.scores.visualSimplicity}</span><p>Visual Simplicity</p></div>
        <div class="score-card panel sharp-panel"><span>{audit.scores.dataStorytelling}</span><p>Data Storytelling</p></div>
        <div class="score-card panel sharp-panel"><span>{audit.scores.actionability}</span><p>Actionability</p></div>
      </div>

      {#if audit.dna}
        <div class="dna-panel panel sharp-panel">
          <div>
            <p class="eyebrow accent">Presentation DNA</p>
            <h4>Top Strength: {audit.dna.topStrength}</h4>
            <p>Biggest Opportunity: {audit.dna.biggestOpportunity}</p>
          </div>
          <div class="dna-bars">
            {#each audit.dna.profile as item}
              <div class="dna-row"><span>{item.label}</span><strong>{item.score}/100</strong></div>
            {/each}
          </div>
        </div>
      {/if}

      <div class="findings-grid">
        <article class="panel sharp-panel"><h4>Strengths</h4>{#each audit.strengths as item}<p class="finding good">✓ {item}</p>{/each}</article>
        <article class="panel sharp-panel"><h4>Weaknesses</h4>{#each audit.weaknesses as item}<p class="finding warning">⚠ {item}</p>{/each}</article>
        <article class="panel sharp-panel wide-card"><h4>Priority Fixes</h4><ol>{#each audit.fixes as item}<li>{item}</li>{/each}</ol></article>
        <article class="panel sharp-panel wide-card rewrite-card">
          <h4>AI Rewrite Direction</h4>
          <p class="rewrite-headline">{audit.rewrite.headline}</p>
          <p>{audit.rewrite.executiveSummary}</p>
          <div class="rewrite-grid">{#each audit.rewrite.betterBullets as item}<span>{item}</span>{/each}</div>
        </article>
      </div>

      <div class="cta-panel panel sharp-panel no-print">
        <div><p class="eyebrow accent">Next Step</p><h3>{audit.cta.title}</h3><p>{audit.cta.description}</p></div>
        <div class="cta-actions"><button class="secondary-link" on:click={exportReport}>Export / Print Report</button><button class="primary-button">{audit.cta.price}</button></div>
      </div>
    </section>
  {/if}

  <section id="pricing" class="pricing-grid no-print">
    <article class="panel sharp-panel"><p class="eyebrow">Free</p><h3>$0</h3><p>Demo audit, basic scoring, limited exports.</p></article>
    <article class="panel sharp-panel featured"><p class="eyebrow accent">Pro</p><h3>$19/mo</h3><p>Saved reports, AI rewrites, PDF/print exports, priority audit history.</p></article>
    <article class="panel sharp-panel"><p class="eyebrow">Service</p><h3>$97+</h3><p>Human JD audit, slide-by-slide notes, redesign upsell.</p></article>
  </section>
</main>

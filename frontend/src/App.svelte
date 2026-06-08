<script>
  import { API_BASE_URL } from './lib/config.js';

  let darkMode = false;
  let selectedFile = null;
  let loading = false;
  let error = '';
  let audit = null;

  $: document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';

  function handleFileChange(event) {
    selectedFile = event.target.files?.[0] || null;
    error = '';
    audit = null;
  }

  async function runDemoAudit() {
    loading = true;
    error = '';
    try {
      const response = await fetch(`${API_BASE_URL}/api/audit/demo`);
      if (!response.ok) throw new Error('Demo audit failed.');
      audit = await response.json();
    } catch (err) {
      error = err.message || 'Something went wrong.';
    } finally {
      loading = false;
    }
  }

  async function submitDeck() {
    if (!selectedFile) {
      error = 'Please choose a PPTX or PDF file first.';
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

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Audit failed.');
      audit = data;
    } catch (err) {
      error = err.message || 'Something went wrong.';
    } finally {
      loading = false;
    }
  }
</script>

<main class="app-shell">
  <nav class="topbar">
    <div class="brand-lockup">
      <div class="logo-mark">JD</div>
      <div>
        <p class="eyebrow">Johken Design</p>
        <h1>Deck Audit Engine</h1>
      </div>
    </div>

    <button class="theme-toggle" on:click={() => (darkMode = !darkMode)}>
      {darkMode ? 'Light Mode' : 'Dark Mode'}
    </button>
  </nav>

  <section class="hero-grid">
    <div class="hero-copy panel sharp-panel">
      <p class="eyebrow accent">Presentation Audit AI</p>
      <h2>Upload your deck. Get executive-level feedback in seconds.</h2>
      <p class="hero-text">
        A square, sharp, JD-branded MVP for auditing PPTX and PDF presentations. This version uses a mock scoring engine now, so you can validate the funnel before adding real parsing and AI.
      </p>
      <div class="hero-actions">
        <a class="primary-link" href="#upload">Upload Deck</a>
        <button class="secondary-link" on:click={runDemoAudit} disabled={loading}>Run Demo Audit</button>
      </div>
    </div>

    <div class="score-preview panel sharp-panel">
      <p class="eyebrow">Audit Focus</p>
      <div class="focus-list">
        <span>Clarity</span>
        <span>Storytelling</span>
        <span>Executive Readiness</span>
        <span>Visual Simplicity</span>
      </div>
      <div class="color-strip">
        <span class="c1"></span>
        <span class="c2"></span>
        <span class="c3"></span>
        <span class="c4"></span>
      </div>
    </div>
  </section>

  <section id="upload" class="upload-section panel sharp-panel">
    <div>
      <p class="eyebrow accent">Step 1</p>
      <h3>Upload a PPTX or PDF</h3>
      <p>For V1, the backend accepts files and returns a polished mock audit. Real text extraction can be added next.</p>
    </div>

    <div class="upload-box">
      <input id="deck" type="file" accept=".pptx,.pdf" on:change={handleFileChange} />
      <label for="deck">
        <strong>{selectedFile ? selectedFile.name : 'Choose deck file'}</strong>
        <span>PPTX or PDF · Max 15MB</span>
      </label>
      <button class="primary-button" on:click={submitDeck} disabled={loading}>
        {loading ? 'Auditing...' : 'Generate Audit'}
      </button>
    </div>

    {#if error}
      <p class="error-box">{error}</p>
    {/if}
  </section>

  {#if audit}
    <section class="results-section">
      <div class="results-header panel sharp-panel">
        <div>
          <p class="eyebrow accent">Executive Summary</p>
          <h3>{audit.deckName}</h3>
          <p>{audit.summary}</p>
        </div>
        <div class="overall-score">
          <span>{audit.overall}</span>
          <small>/100</small>
        </div>
      </div>

      <div class="score-grid">
        <div class="score-card panel sharp-panel"><span>{audit.scores.clarity}</span><p>Clarity</p></div>
        <div class="score-card panel sharp-panel"><span>{audit.scores.storytelling}</span><p>Storytelling</p></div>
        <div class="score-card panel sharp-panel"><span>{audit.scores.executiveReadiness}</span><p>Executive Readiness</p></div>
        <div class="score-card panel sharp-panel"><span>{audit.scores.visualSimplicity}</span><p>Visual Simplicity</p></div>
      </div>

      <div class="findings-grid">
        <article class="panel sharp-panel">
          <h4>Strengths</h4>
          {#each audit.strengths as item}
            <p class="finding good">✓ {item}</p>
          {/each}
        </article>

        <article class="panel sharp-panel">
          <h4>Weaknesses</h4>
          {#each audit.weaknesses as item}
            <p class="finding warning">⚠ {item}</p>
          {/each}
        </article>

        <article class="panel sharp-panel wide-card">
          <h4>Priority Fixes</h4>
          <ol>
            {#each audit.fixes as item}
              <li>{item}</li>
            {/each}
          </ol>
        </article>
      </div>

      <div class="cta-panel panel sharp-panel">
        <div>
          <p class="eyebrow accent">Next Step</p>
          <h3>{audit.cta.title}</h3>
          <p>{audit.cta.description}</p>
        </div>
        <button class="primary-button">{audit.cta.price}</button>
      </div>
    </section>
  {/if}
</main>

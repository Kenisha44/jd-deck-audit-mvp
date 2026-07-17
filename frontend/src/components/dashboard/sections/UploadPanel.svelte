<script>
  export let activeMode = 'upload';
  export let loading = false;

  export let selectedFile = null;
  export let slideTitle = '';
  export let slideText = '';

  export let error = '';

  export let handleFileChange;
  export let submitDeck;
  export let submitText;

  export let setUploadMode;
  export let setPasteMode;
</script>

<section class="upload-section panel sharp-panel">

    <div class="mode-tabs">

        <button
            class:active={activeMode === 'upload'}
            on:click={setUploadMode}
            disabled={loading}
        >
            Upload Deck
        </button>

        <button
            class:active={activeMode === 'paste'}
            on:click={setPasteMode}
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
                slide-level feedback,
                category scores,
                and an executive health report.
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

                    PPTX or PDF ·
                    Maximum 15MB ·
                    Maximum 30 slides

                </span>

            </label>

            <button
                class="primary-button"
                on:click={submitDeck}
                disabled={loading || !selectedFile}
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
                Test a headline,
                slide,
                executive summary,
                or speaker notes.
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
                placeholder="Paste slide text..."
                disabled={loading}
            />

            <button
                class="primary-button"
                on:click={submitText}
                disabled={loading || !slideText.trim()}
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
                    Check that the presentation
                    is not corrupted.
                </li>

                <li>
                    Try a smaller PPTX file.
                </li>

            </ul>

        </div>

    {/if}

</section>

<style>

.upload-section{
display:grid;
gap:16px;
padding:22px;
}

.section-copy{
display:grid;
gap:5px;
}

.section-copy h2{
margin:0;
font-size:24px;
}

.section-copy p{
line-height:1.5;
color:var(--muted);
}

.mode-tabs{
display:flex;
gap:8px;
}

.upload-box,
.paste-box{
display:grid;
gap:10px;
}

.upload-box input{
display:none;
}

.upload-box label{
min-height:125px;
display:grid;
place-content:center;
gap:8px;
padding:20px;
border:2px dashed var(--teal);
background:rgba(3,138,142,.06);
text-align:center;
cursor:pointer;
}

.upload-box label.disabled{
opacity:.6;
cursor:not-allowed;
}

.upload-box label strong{
font-size:17px;
}

.upload-box label span{
color:var(--muted);
}

.paste-box input,
.paste-box textarea{
width:100%;
padding:12px;
border:1px solid var(--border);
background:var(--panel);
color:var(--text);
font:inherit;
}

.error-state{
display:grid;
gap:10px;
padding:18px;
border:1px solid var(--danger-border);
background:var(--danger-soft);
color:var(--danger);
}

.error-state p{
margin:0;
}

.error-state ul{
margin:0;
padding-left:20px;
display:grid;
gap:6px;
}

</style>
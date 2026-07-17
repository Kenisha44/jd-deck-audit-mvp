<script>
  export let loading = false;
  export let savingAudit = false;
  export let audit = null;

  export let runDemoAudit;
  export let saveCurrentAudit;
</script>

<header class="dashboard-header no-print">
  <div>
    <p class="eyebrow accent">
      JD Workspace
    </p>

    <h1>
      Deck Audit Dashboard
    </h1>

    <p class="dashboard-description">
      Upload a presentation, paste slide copy,
      or run the demonstration audit.
    </p>
  </div>

  <div class="dashboard-actions">
    <button
      class="secondary-link"
      on:click={saveCurrentAudit}
      disabled={!audit || savingAudit || loading}
    >
      {savingAudit ? 'Saving...' : 'Save Audit'}
    </button>

    <button
      class="primary-button"
      on:click={runDemoAudit}
      disabled={loading}
    >
      {loading ? 'Running Audit...' : 'Run Demo Audit'}
    </button>
  </div>
</header>

<style>
.dashboard-header{
display:flex;
justify-content:space-between;
align-items:center;
gap:18px;
padding-bottom:2px;
}

.dashboard-header h1{
margin:0;
font-size:clamp(30px,3.5vw,42px);
}

.dashboard-description{
margin-top:5px;
line-height:1.45;
color:var(--muted);
}

.dashboard-actions{
display:flex;
gap:10px;
flex-wrap:wrap;
}

@media(max-width:720px){

.dashboard-header{
flex-direction:column;
align-items:stretch;
}

.dashboard-actions{
align-items:stretch;
}

.dashboard-actions button{
flex:1;
}

}
</style>
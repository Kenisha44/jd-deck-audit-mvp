<script>
  export let audit;
  export let exportReport = () => {};
</script>

<section class="panel sharp-panel wide-panel report-card">
  <div class="report-heading">
    <div>
      <p class="eyebrow accent">Executive Health Report</p>
      <h2>{audit.healthReport.businessImpact}</h2>
    </div>

    <div class="report-score">
      <strong>{audit.healthReport.overall}</strong>
      <span>/100</span>
    </div>
  </div>

  <p class="report-summary">
    {audit.healthReport.executiveSummary}
  </p>

  <div class="report-grid">
    <div>
      <span>Top Strength</span>
      <strong>{audit.healthReport.topStrength}</strong>
    </div>

    <div>
      <span>Biggest Opportunity</span>
      <strong>{audit.healthReport.biggestOpportunity}</strong>
    </div>

    <div>
      <span>Estimated Improvement</span>
      <strong>{audit.healthReport.estimatedImprovement}</strong>
    </div>

    <div>
      <span>Readiness</span>
      <strong>{audit.readiness}</strong>
    </div>
  </div>

  <div class="next-steps">
    <h4>Recommended Next Steps</h4>

    {#each audit.healthReport.nextSteps as step}
      <p>{step}</p>
    {/each}
  </div>

  <button class="primary-button no-print" on:click={exportReport}>
    Export Executive Health Report
  </button>
</section>
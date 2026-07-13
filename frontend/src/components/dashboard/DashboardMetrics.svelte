<script>
  import MetricCard from '../common/MetricCard.svelte';

  export let audits = [];

  $: totalAudits = audits.length;

  $: averageScore =
    totalAudits === 0
      ? '--'
      : Math.round(
          audits.reduce(
            (sum, audit) =>
              sum + (audit.overall_score || 0),
            0
          ) / totalAudits
        );

  $: highestScore =
    totalAudits === 0
      ? '--'
      : Math.max(
          ...audits.map(
            audit => audit.overall_score || 0
          )
        );

  $: thisMonthCount =
    audits.filter(audit => {

      const created =
        new Date(audit.created_at);

      const now =
        new Date();

      return (

        created.getMonth() ===
          now.getMonth()

        &&

        created.getFullYear() ===
          now.getFullYear()

      );

    }).length;
</script>

<div class="metrics-grid">

  <MetricCard
    title="Total Audits"
    value={totalAudits}
    subtitle="Saved in workspace"
    color="#2563eb"
  />

  <MetricCard
    title="Average Score"
    value={averageScore}
    subtitle="Across all audits"
    color="#16a34a"
  />

  <MetricCard
    title="Highest Score"
    value={highestScore}
    subtitle="Best presentation"
    color="#f59e0b"
  />

  <MetricCard
    title="This Month"
    value={thisMonthCount}
    subtitle="Audits completed"
    color="#dc2626"
  />

</div>

<style>

.metrics-grid{

display:grid;

grid-template-columns:
repeat(4,minmax(0,1fr));

gap:20px;

}

@media(max-width:1100px){

.metrics-grid{

grid-template-columns:
repeat(2,1fr);

}

}

@media(max-width:650px){

.metrics-grid{

grid-template-columns:1fr;

}

}

</style>
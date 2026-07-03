<script>
  export let priorityQueue = [];
</script>

<section class="panel sharp-panel">
  <p class="eyebrow accent">Priority Fix Queue</p>
  <h3>Highest-impact improvements</h3>

  <div class="priority-list">
    {#each priorityQueue as item}
      <article class="priority-item">
        <span class={`severity ${item.severity.toLowerCase()}`}>
          {item.severity}
        </span>

        <div>
          <strong>{item.title}</strong>
          <p>{item.description}</p>
          <small>{item.category} · Impact {item.impact}</small>
        </div>
      </article>
    {/each}
  </div>
</section>
<script>
  export let eyebrow = 'JD Workspace';
  export let title = 'Coming Soon';
  export let description = 'This section is planned for an upcoming sprint.';
</script>

<section class="coming-soon panel sharp-panel">
  <p class="eyebrow accent">{eyebrow}</p>
  <h1>{title}</h1>
  <p>{description}</p>
</section>

<style>
  .coming-soon {
    min-height: 420px;
    display: grid;
    place-content: center;
    justify-items: start;
    gap: 12px;
    padding: 36px;
    background: var(--panel);
    color: var(--text);
  }

  h1 {
    margin: 0;
  }

  p:last-child {
    max-width: 620px;
    color: var(--muted);
    line-height: 1.7;
  }
</style>
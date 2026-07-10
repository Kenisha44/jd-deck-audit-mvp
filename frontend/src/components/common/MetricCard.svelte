<script>
  export let title = "";
  export let value = "";
  export let subtitle = "";
  export let color = "#2563eb";
</script>

<div class="metric-card">

    <div class="top">

        <span>{title}</span>

        <div
            class="indicator"
            style={`background:${color}`}
        ></div>

    </div>

    <h2>{value}</h2>

    <p>{subtitle}</p>

</div>

<style>
  .metric-card {
    background: var(--panel);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 22px;
    box-shadow: var(--shadow-soft);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  .metric-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
  }

  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
  }

  .top span {
    color: var(--muted);
    font-size: 13px;
    font-weight: 650;
  }

  .indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  h2 {
    margin: 0;
    color: var(--text);
    font-size: 34px;
    font-weight: 800;
  }

  p {
    margin-top: 8px;
    color: var(--muted);
    font-size: 13px;
  }
</style>
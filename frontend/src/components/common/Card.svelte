<script>
  export let title = "";
  export let subtitle = "";
  export let padding = "24px";
  export let hover = false;
</script>

<div
  class:hoverable={hover}
  class="card"
  style={`padding:${padding};`}
>
  {#if title}
    <div class="card-header">
      <div>
        <h3>{title}</h3>

        {#if subtitle}
          <p>{subtitle}</p>
        {/if}
      </div>

      <slot name="actions" />
    </div>
  {/if}

  <div class="card-body">
    <slot />
  </div>
</div>

<style>
.card{
  background:white;
  border:1px solid #e5e7eb;
  border-radius:8px;
  box-shadow:0 2px 10px rgba(15,23,42,.05);
  transition:.2s ease;
}

.hoverable:hover{
  transform:translateY(-2px);
  box-shadow:0 10px 25px rgba(15,23,42,.08);
}

.card-header{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  margin-bottom:20px;
}

.card-header h3{
  margin:0;
  font-size:1.15rem;
  font-weight:700;
}

.card-header p{
  margin-top:6px;
  color:#64748b;
  font-size:.9rem;
}

.card-body{
  display:flex;
  flex-direction:column;
  gap:18px;
}
</style>
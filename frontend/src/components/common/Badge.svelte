<script>
  export let color="blue";
</script>

<span class={`badge ${color}`}>
  <slot />
</span>

<style>
.badge{
  display:inline-flex;
  padding:4px 10px;
  border-radius:999px;
  font-size:.75rem;
  font-weight:700;
}

.blue{
  background:#dbeafe;
  color:#1d4ed8;
}

.green{
  background:#dcfce7;
  color:#15803d;
}

.orange{
  background:#ffedd5;
  color:#c2410c;
}

.red{
  background:#fee2e2;
  color:#b91c1c;
}
</style>
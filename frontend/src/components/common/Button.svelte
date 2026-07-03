<script>
  export let variant = "primary";
  export let disabled = false;
  export let type = "button";
</script>

<button
  class={variant}
  {disabled}
  {type}
>
  <slot />
</button>

<style>
button{
  border:none;
  padding:12px 18px;
  font-weight:600;
  cursor:pointer;
  transition:.2s;
  border-radius:8px;
}

.primary{
  background:#2563eb;
  color:white;
}

.primary:hover{
  background:#1d4ed8;
}

.secondary{
  background:white;
  border:1px solid #d1d5db;
}

.secondary:hover{
  background:#f8fafc;
}

.success{
  background:#16a34a;
  color:white;
}

.danger{
  background:#dc2626;
  color:white;
}

button:disabled{
  opacity:.5;
  cursor:not-allowed;
}
</style>
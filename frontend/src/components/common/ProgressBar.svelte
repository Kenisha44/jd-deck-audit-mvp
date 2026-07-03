<script>
export let value=0;
</script>

<div class="track">

<div
class="fill"
style={`width:${value}%`}
></div>

</div>

<style>
.track{
height:8px;
background:#e5e7eb;
border-radius:999px;
overflow:hidden;
}

.fill{
height:100%;
background:#2563eb;
transition:width .4s ease;
}
</style>
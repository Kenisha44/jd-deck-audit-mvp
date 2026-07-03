<script>
export let eyebrow="";
export let title="";
export let subtitle="";
</script>

<div class="header">

{#if eyebrow}
<span>{eyebrow}</span>
{/if}

<h2>{title}</h2>

{#if subtitle}
<p>{subtitle}</p>
{/if}

</div>

<style>
.header{
margin-bottom:24px;
}

span{
text-transform:uppercase;
letter-spacing:.08em;
font-size:.75rem;
font-weight:700;
color:#2563eb;
}

h2{
margin:8px 0;
font-size:2rem;
}

p{
color:#64748b;
line-height:1.7;
}
</style>
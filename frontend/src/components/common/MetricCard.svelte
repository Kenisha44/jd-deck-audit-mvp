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

.metric-card{

background:white;

border:1px solid #e5e7eb;

border-radius:12px;

padding:22px;

box-shadow:0 2px 10px rgba(15,23,42,.04);

transition:.2s;

}

.metric-card:hover{

transform:translateY(-2px);

box-shadow:0 8px 20px rgba(15,23,42,.08);

}

.top{

display:flex;

justify-content:space-between;

align-items:center;

margin-bottom:18px;

}

.top span{

font-size:14px;

color:#64748b;

font-weight:600;

}

.indicator{

width:12px;

height:12px;

border-radius:50%;

}

h2{

margin:0;

font-size:34px;

font-weight:700;

color:#0f172a;

}

p{

margin-top:8px;

font-size:13px;

color:#94a3b8;

}

</style>
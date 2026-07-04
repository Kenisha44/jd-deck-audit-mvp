<script>

let search = "";

</script>

<header class="topbar">

    <div class="left">

        <input
            bind:value={search}
            placeholder="Search audits, projects..."
        />

    </div>

    <div class="right">

        <button class="icon-btn" title="Toggle Theme">
            🌙
        </button>

        <button class="icon-btn notification" title="Notifications">
            🔔
            <span class="dot"></span>
        </button>

        <div class="avatar">
            JD
        </div>

    </div>

</header>

<style>

.topbar{

display:flex;

justify-content:space-between;

align-items:center;

padding:18px 32px;

background:white;

border-bottom:1px solid #e5e7eb;

position:sticky;

top:0;

z-index:20;

}

.left{

flex:1;

}

input{

width:420px;

max-width:100%;

padding:12px 16px;

border:1px solid #d1d5db;

border-radius:10px;

font-size:14px;

transition:.2s;

outline:none;

}

input:focus{

border-color:#2563eb;

box-shadow:0 0 0 3px rgba(37,99,235,.15);

}

.right{

display:flex;

align-items:center;

gap:14px;

}

.icon-btn{

position:relative;

width:42px;

height:42px;

display:grid;

place-items:center;

border:none;

background:#f8fafc;

border-radius:10px;

cursor:pointer;

font-size:18px;

transition:.2s;

}

.icon-btn:hover{

background:#e2e8f0;

}

.notification .dot{

position:absolute;

top:9px;

right:10px;

width:8px;

height:8px;

background:#ef4444;

border-radius:50%;

}

.avatar{

width:42px;

height:42px;

display:grid;

place-items:center;

background:#2563eb;

color:white;

font-weight:700;

border-radius:10px;

font-size:14px;

cursor:pointer;

}

</style>
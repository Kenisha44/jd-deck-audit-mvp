<script>

let search="";

</script>

<header>

<input

bind:value={search}

placeholder="Search audits..."

>

<div class="actions">

<button>

🌙

</button>

<button>

🔔

</button>

<div class="avatar">

JD

</div>

</div>

</header>

<style>

header{

display:flex;

justify-content:space-between;

align-items:center;

padding:20px 32px;

background:white;

border-bottom:1px solid #e5e7eb;

}

input{

width:360px;

padding:12px;

border:1px solid #d1d5db;

}

.actions{

display:flex;

gap:16px;

align-items:center;

}

.actions button{

border:none;

background:#f8fafc;

padding:10px;

cursor:pointer;

}

.avatar{

width:40px;

height:40px;

display:grid;

place-items:center;

background:#2563eb;

color:white;

font-weight:bold;

}

</style>
<script>

const items=[
    "Dashboard",
    "New Audit",
    "Saved Audits",
    "Templates",
    "History",
    "Analytics",
    "Settings"
];

</script>

<aside>

<div class="logo">

    <div class="mark">
        JD
    </div>

    <div>

        <h2>Johken Design</h2>

        <p>Deck Audit</p>

    </div>

</div>

<nav>

{#each items as item}

<button>

{item}

</button>

{/each}

</nav>

<div class="upgrade">

<h3>Upgrade to Pro</h3>

<p>

Unlimited audits

PDF exports

AI Rewrite

</p>

<button>

Upgrade

</button>

</div>

</aside>

<style>

aside{
height:100%;
background:white;
border-right:1px solid #e5e7eb;
padding:24px;
display:flex;
flex-direction:column;
}

.logo{
display:flex;
gap:16px;
align-items:center;
margin-bottom:40px;
}

.mark{
width:48px;
height:48px;
display:grid;
place-items:center;
background:#2563eb;
color:white;
font-weight:bold;
}

nav{
display:flex;
flex-direction:column;
gap:8px;
}

nav button{
text-align:left;
padding:12px;
background:none;
border:none;
cursor:pointer;
font-weight:600;
}

nav button:hover{
background:#eff6ff;
}

.upgrade{
margin-top:auto;
border-top:1px solid #e5e7eb;
padding-top:24px;
}

.upgrade button{
width:100%;
margin-top:12px;
padding:12px;
background:#2563eb;
color:white;
border:none;
cursor:pointer;
}

</style>
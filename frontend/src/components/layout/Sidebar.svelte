<script>
  const items = [
    { name: "Dashboard", icon: "📊", active: true },
    { name: "New Audit", icon: "➕" },
    { name: "Saved Audits", icon: "📁" },
    { name: "Templates", icon: "📄" },
    { name: "History", icon: "🕒" },
    { name: "Analytics", icon: "📈" },
    { name: "Settings", icon: "⚙️" }
  ];
</script>

<aside class="sidebar">

  <div class="brand">

    <div class="logo">
      JD
    </div>

    <div>
      <h2>Johken Design</h2>
      <span>Deck Audit</span>
    </div>

  </div>

  <nav>

    {#each items as item}

      <button class:active={item.active}>

        <span class="icon">{item.icon}</span>

        <span>{item.name}</span>

      </button>

    {/each}

  </nav>

  <div class="upgrade">

    <h3>Upgrade to Pro</h3>

    <p>

      Unlimited audits<br>
      AI Rewrite<br>
      PDF Export<br>
      Priority Support

    </p>

    <button>

      Upgrade

    </button>

  </div>

</aside>

<style>

.sidebar{

height:100vh;

display:flex;

flex-direction:column;

width:240px;

background:white;

border-right:1px solid #e5e7eb;

padding:24px;

box-sizing:border-box;

}

.brand{

display:flex;

gap:14px;

align-items:center;

margin-bottom:40px;

}

.logo{

width:46px;

height:46px;

background:#2563eb;

color:white;

display:grid;

place-items:center;

font-weight:700;

font-size:18px;

border-radius:8px;

}

.brand h2{

margin:0;

font-size:18px;

font-weight:700;

}

.brand span{

color:#64748b;

font-size:13px;

}

nav{

display:flex;

flex-direction:column;

gap:6px;

}

nav button{

display:flex;

align-items:center;

gap:12px;

padding:12px 14px;

border:none;

background:transparent;

cursor:pointer;

border-radius:8px;

font-size:15px;

font-weight:600;

color:#334155;

transition:.2s;

}

nav button:hover{

background:#f1f5f9;

}

nav button.active{

background:#eff6ff;

color:#2563eb;

}

.icon{

width:20px;

text-align:center;

}

.upgrade{

margin-top:auto;

padding:20px;

background:#f8fafc;

border:1px solid #e2e8f0;

border-radius:12px;

}

.upgrade h3{

margin:0 0 10px;

font-size:18px;

}

.upgrade p{

font-size:14px;

line-height:1.7;

color:#64748b;

margin-bottom:16px;

}

.upgrade button{

width:100%;

padding:12px;

background:#2563eb;

color:white;

border:none;

border-radius:8px;

font-weight:600;

cursor:pointer;

transition:.2s;

}

.upgrade button:hover{

background:#1d4ed8;

}

</style>
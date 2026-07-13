<script>
  export let stage = "Preparing";
  export let progress = 0;

  const stages = [
    "Uploading Presentation",
    "Extracting Slides",
    "Analyzing Content",
    "Generating Presentation DNA",
    "Building Executive Report",
    "Complete"
  ];
</script>

<section class="progress-card panel">

    <p class="eyebrow accent">
        Executive Audit
    </p>

    <h2>{stage}</h2>

    <div class="progress-bar">

        <div
            class="progress-fill"
            style={`width:${progress}%`}
        />

    </div>

    <ul>

        {#each stages as item}

            <li class:active={item===stage}>
                {item}
            </li>

        {/each}

    </ul>

</section>

<style>

.progress-card{

padding:32px;

display:grid;

gap:22px;

}

.progress-bar{

height:12px;

background:var(--border);

overflow:hidden;

}

.progress-fill{

height:100%;

background:linear-gradient(
90deg,
var(--teal),
var(--orange)
);

transition:width .45s ease;

}

ul{

margin:0;

padding:0;

list-style:none;

display:grid;

gap:8px;

}

li{

opacity:.45;

font-weight:600;

transition:.25s;

}

.active{

opacity:1;

color:var(--orange);

font-weight:900;

}

</style>
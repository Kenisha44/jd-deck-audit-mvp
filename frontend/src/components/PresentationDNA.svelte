<script>
  export let dna;
</script>

<section class="panel sharp-panel">
  <p class="eyebrow accent">Presentation DNA</p>
  <h2>{dna.topStrength}</h2>

  {#each dna.profile as trait}
    <div class="dna-row">
      <span>{trait.label}</span>

      <div class="dna-bar">
        <div class="dna-fill" style={`width:${trait.score}%`}></div>
      </div>

      <strong>{trait.score}</strong>
    </div>
  {/each}
</section>
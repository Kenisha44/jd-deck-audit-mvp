<script>
  export let slides = [];
  export let activeSlideIndex = 0;
  export let selectedSlide = null;
  export let setActiveSlide = () => {};
</script>

<section class="panel sharp-panel">
  <p class="eyebrow accent">Slide Navigator</p>
  <h3>Drill into individual slides</h3>

  <div class="slide-nav">
    {#each slides as slide, index}
      <button
        class:active={activeSlideIndex === index}
        on:click={() => setActiveSlide(index)}
      >
        <span>{slide.number}</span>
        <small>{slide.score}/100</small>
      </button>
    {/each}
  </div>

  {#if selectedSlide}
    <div class="slide-detail">
      <h4>{selectedSlide.title}</h4>
      <p>{selectedSlide.summary}</p>

      <div class="slide-feedback-grid">
        <div>
          <strong>Strengths</strong>
          {#each selectedSlide.strengths as item}
            <p class="good">✓ {item}</p>
          {/each}
        </div>

        <div>
          <strong>Fixes</strong>
          {#each selectedSlide.fixes as item}
            <p class="warning">⚠ {item}</p>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</section>
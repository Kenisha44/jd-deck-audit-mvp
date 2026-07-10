<script>
  export let slides = [];
  export let selectedSlide = null;
  export let activeSlideIndex = 0;
  export let setActiveSlide = () => {};

  function scoreClass(score) {
    if (score >= 85) return "excellent";
    if (score >= 70) return "good";
    return "needs";
  }
</script>

<section class="navigator panel sharp-panel">

    <div class="header">

        <div>

            <p class="eyebrow accent">
                Slides
            </p>

            <h2>
                Slide Navigator
            </h2>

        </div>

        <span class="count">

            {slides.length}

        </span>

    </div>

    {#if slides.length}

        <div class="slide-list">

            {#each slides as slide, index}

                <button

                    class:selected={index===activeSlideIndex}

                    on:click={() => setActiveSlide(index)}

                >

                    <div class="left">

                        <div class="number">

                            {slide.number}

                        </div>

                        <div>

                            <strong>

                                {slide.title}

                            </strong>

                            <p>

                                {slide.summary}

                            </p>

                        </div>

                    </div>

                    <div class={`score ${scoreClass(slide.score)}`}>

                        {slide.score}

                    </div>

                </button>

            {/each}

        </div>

    {:else}

        <div class="empty">

            Run an audit to view slides.

        </div>

    {/if}

</section>

<style>

.navigator {
  padding: 28px;
  display: grid;
  gap: 22px;
  background: var(--panel);
  color: var(--text);
}

.slide-list button {
  background: var(--surface);
  color: var(--text);
  border-color: var(--border);
}

.slide-list button:hover {
  border-color: var(--blue);
  background: var(--surface-hover);
}

.slide-list button.selected {
  border-left: 6px solid var(--blue);
  background: var(--active-background);
}

.number {
  background: var(--surface-hover);
  color: var(--text);
}

.left p {
  color: var(--muted);
}

.empty {
  color: var(--muted);
  border-color: var(--border-strong);
  background: var(--surface);
}
</style>
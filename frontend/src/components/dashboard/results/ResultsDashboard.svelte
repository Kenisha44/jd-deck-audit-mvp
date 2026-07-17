<script>
  import PresentationDNA
    from '../PresentationDNA.svelte';

  import PriorityQueue
    from '../PriorityQueue.svelte';

  import SlideNavigator
    from '../SlideNavigator.svelte';

  import SelectedSlideAnalysis
    from '../SelectedSlideAnalysis.svelte';

  import ExecutiveHealthReport
    from '../ExecutiveHealthReport.svelte';

  export let audit = null;
  export let selectedSlide = null;
  export let activeSlideIndex = 0;

  export let setActiveSlide;
  export let exportReport;
</script>

<div class="dashboard-grid no-print">
  <div class="dashboard-column">
    <PresentationDNA
      dna={audit?.dna}
    />

    <PriorityQueue
      priorityQueue={audit?.priorityQueue}
    />
  </div>

  <div class="dashboard-column">
    <SlideNavigator
      slides={audit?.slides || []}
      {selectedSlide}
      {activeSlideIndex}
      {setActiveSlide}
    />

    <SelectedSlideAnalysis
      slide={selectedSlide}
    />

    <ExecutiveHealthReport
      {audit}
      {exportReport}
    />
  </div>
</div>

<style>
  .dashboard-grid {
    display: grid;
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
    gap: 16px;
    align-items: start;
    margin-top: 0;
  }

  .dashboard-column {
    display: grid;
    gap: 16px;
    min-width: 0;
  }

  @media (max-width: 1180px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
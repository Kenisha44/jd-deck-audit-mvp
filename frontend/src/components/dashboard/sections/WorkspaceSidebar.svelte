<script>
  import AuditWorkspace
    from '../../workspace/AuditWorkspace.svelte';

  import SavedAuditsPanel
    from '../SavedAuditsPanel.svelte';

  export let deckMetadata = null;
  export let selectedSlide = null;
  export let audit = null;

  export let exportReport;

  export let audits = [];
  export let loading = false;

  export let onRefresh;
  export let onOpen;
  export let onRename;
  export let onDuplicate;
  export let onDelete;
</script>

<aside class="workspace-side no-print">
  <AuditWorkspace
    {deckMetadata}
    {selectedSlide}
    {audit}
    {exportReport}
  />

  <SavedAuditsPanel
    {audits}
    {loading}
    {onRefresh}
    {onOpen}
    {onRename}
    {onDuplicate}
    {onDelete}
  />
</aside>

<style>
  .workspace-side {
    display: grid;
    gap: 16px;
    min-width: 0;
  }
</style>
<script>
    import { onMount, createEventDispatcher } from 'svelte';

    import AuditToolbar from './AuditToolbar.svelte';
    import AuditGrid from './AuditGrid.svelte';
    import EmptyAuditState from './EmptyAuditState.svelte';

    import { auditStore } from '../../stores/auditStore';

    export let fullPage = false;

    const dispatch = createEventDispatcher();

    let audits = [];
    let loading = false;

    let search = '';
    let sort = 'newest';

    const unsubscribe =
        auditStore.subscribe(value => {
            audits = value;
        });

    const unsubscribeLoading =
        auditStore.loading.subscribe(value => {
            loading = value;
        });

    onMount(async () => {
        await auditStore.refresh();

        return () => {
            unsubscribe();
            unsubscribeLoading();
        };
    });

    $: filteredAudits = [...audits]
        .filter(a =>
            (a.title || '')
                .toLowerCase()
                .includes(search.toLowerCase())
        )
        .sort(sortAudits);

    function sortAudits(a, b) {

        switch (sort) {

            case 'oldest':
                return new Date(a.createdAt)
                    - new Date(b.createdAt);

            case 'highest':
                return (b.overallScore || 0)
                    - (a.overallScore || 0);

            case 'lowest':
                return (a.overallScore || 0)
                    - (b.overallScore || 0);

            case 'alphabetical':
                return (a.title || '')
                    .localeCompare(b.title || '');

            default:
                return new Date(b.createdAt)
                    - new Date(a.createdAt);

        }

    }

    function openAudit(event) {
  const savedAudit = event.detail;

  dispatch(
    'openAudit',
    savedAudit.report
  );
}

    async function renameAudit(event) {

        const audit = event.detail;

        const title =
            prompt(
                'Rename presentation',
                audit.title
            );

        if (!title) return;

        await auditStore.rename(
            audit.id,
            title
        );

    }

    async function duplicateAudit(event) {
  await auditStore.duplicate(
    event.detail
  );
}

    async function deleteAudit(event) {

        const confirmed =
            confirm(
                'Delete this audit?'
            );

        if (!confirmed) return;

        await auditStore.remove(
            event.detail.id
        );

    }

    function newAudit() {
        dispatch('newAudit');
    }
    
function downloadAudit(event) {
  const savedAudit = event.detail;

  dispatch('downloadAudit', {
    audit: savedAudit.report,
    savedAudit
  });
}
</script>

<section class="audit-library">

    <AuditToolbar

        {search}
        {sort}

        total={filteredAudits.length}

        {fullPage}

        on:search={(e)=>search=e.detail}

        on:sort={(e)=>sort=e.detail}

        on:newAudit={newAudit}

    />

    {#if !loading && filteredAudits.length===0}

        <EmptyAuditState
            on:newAudit={newAudit}
        />

    {:else}

    <AuditGrid
  audits={filteredAudits}
  {loading}
  on:open={openAudit}
  on:rename={renameAudit}
  on:duplicate={duplicateAudit}
  on:download={downloadAudit}
  on:delete={deleteAudit}
/>
    {/if}
<AuditLibrary
  fullPage={true}
  on:newAudit={newAudit}
  on:openAudit={openAudit}
  on:downloadAudit={downloadAudit}
/>
</section>

<style>

.audit-library{

display:grid;

gap:24px;

}

</style>
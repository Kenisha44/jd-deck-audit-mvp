<script>
    import AuditLibrary
        from '../components/audit/AuditLibrary.svelte';

    export let setActivePage = () => {};

    export let onOpenAudit = () => {};

    function newAudit() {

        setActivePage('new-audit');

    }

    function openAudit(event) {

        onOpenAudit(event.detail);

        setActivePage('dashboard');

    }

    function downloadAudit(event) {
  const completedAudit = event.detail.audit;

  onOpenAudit(completedAudit);

  sessionStorage.setItem(
    'jd-scroll-to-export',
    'true'
  );

  setActivePage('dashboard');
}

</script>

<section class="saved-audits-page">

    <AuditLibrary

        fullPage={true}

        on:newAudit={newAudit}

        on:openAudit={openAudit}

    />

</section>

<style>

.saved-audits-page{

display:grid;

gap:24px;

width:100%;

}

</style>
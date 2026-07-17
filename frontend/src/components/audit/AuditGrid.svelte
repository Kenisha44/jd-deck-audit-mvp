<script>
    import AuditCard from './AuditCard.svelte';

    export let audits = [];

    export let loading = false;

    import { createEventDispatcher }
        from 'svelte';

    const dispatch =
        createEventDispatcher();

    function forward(eventName, audit) {
        dispatch(eventName, audit);
    }
</script>

{#if loading}

<section class="loading">

    <div class="spinner"></div>

    <p>
        Loading saved audits...
    </p>

</section>

{:else}

<div class="audit-grid">

    {#each audits as audit (audit.id)}

        <AuditCard
            {audit}
            on:open={(e)=>forward('open',e.detail)}
            on:rename={(e)=>forward('rename',e.detail)}
            on:duplicate={(e)=>forward('duplicate',e.detail)}
            on:download={(e)=>forward('download',e.detail)}
            on:delete={(e)=>forward('delete',e.detail)}
        />

    {/each}

</div>

{/if}

<style>

.audit-grid{

display:grid;

grid-template-columns:
repeat(auto-fit,minmax(420px,1fr));

gap:24px;

align-items:start;

}

.loading{

display:grid;

justify-items:center;

padding:80px;

gap:20px;

}

.spinner{

width:46px;

height:46px;

border:4px solid var(--border);

border-top-color:var(--orange);

border-radius:50%;

animation:spin .8s linear infinite;

}

@keyframes spin{

to{

transform:rotate(360deg);

}

}

.loading p{

color:var(--muted);

font-weight:600;

}

@media(max-width:760px){

.audit-grid{

grid-template-columns:1fr;

}

}

</style>
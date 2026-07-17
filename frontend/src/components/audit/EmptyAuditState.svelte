<script>
    import { createEventDispatcher } from 'svelte';

    export let title =
        'No saved audits yet';

    export let description =
        'Run your first executive audit to begin building your presentation library.';

    const dispatch =
        createEventDispatcher();

    function newAudit() {
        dispatch('newAudit');
    }
</script>

<section class="empty-state panel sharp-panel">

    <div class="icon">
        📄
    </div>

    <h2>
        {title}
    </h2>

    <p>
        {description}
    </p>

    <button
        class="primary"
        on:click={newAudit}>
        Start New Audit
    </button>

</section>

<style>

.empty-state{

display:grid;

justify-items:center;

gap:18px;

padding:72px 40px;

text-align:center;

}

.icon{

width:90px;

height:90px;

display:grid;

place-items:center;

font-size:46px;

background:rgba(3,138,142,.08);

border:2px solid var(--teal);

}

.empty-state h2{

margin:0;

font-size:32px;

letter-spacing:-.03em;

}

.empty-state p{

max-width:520px;

margin:0;

line-height:1.7;

color:var(--muted);

}

.primary{

margin-top:10px;

padding:16px 28px;

background:var(--orange);

color:white;

font-weight:800;

border:2px solid var(--text);

cursor:pointer;

box-shadow:6px 6px 0 var(--teal);

transition:.18s;

}

.primary:hover{

transform:translateY(-2px);

box-shadow:8px 8px 0 var(--teal);

}

</style>
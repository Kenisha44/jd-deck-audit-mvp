<script>
  import { createEventDispatcher } from 'svelte';

  export let audit;

  const dispatch = createEventDispatcher();

  function emit(name) {
    dispatch(name, audit);
  }

  function formatDate(date) {
    if (!date) return 'Unknown';

    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function readiness(score = 0) {
    if (score >= 90) return 'Executive Ready';
    if (score >= 75) return 'Leadership Ready';
    if (score >= 60) return 'Needs Refinement';
    return 'Requires Revision';
  }
</script>

<article class="audit-card panel sharp-panel">

    <div class="header">

        <div>

            <p class="eyebrow accent">
                Saved Audit
            </p>

            <h2>
                {audit.title || 'Untitled Presentation'}
            </h2>

        </div>

        <div class="score">

            <span>{audit.overallScore ?? 0}</span>

            <small>Overall</small>

        </div>

    </div>

    <div class="details">

        <div>

            <strong>
                Executive Readiness
            </strong>

            <span>
                {readiness(audit.overallScore)}
            </span>

        </div>

        <div>

            <strong>
                Slides
            </strong>

            <span>
                {audit.slideCount ?? audit.slides?.length ?? 0}
            </span>

        </div>

        <div>

            <strong>
                Saved
            </strong>

            <span>
                {formatDate(audit.updatedAt || audit.createdAt)}
            </span>

        </div>

    </div>

    <div class="actions">

        <button
            on:click={() => emit('open')}>
            Open
        </button>

        <button
            on:click={() => emit('rename')}>
            Rename
        </button>

        <button
            on:click={() => emit('duplicate')}>
            Duplicate
        </button>

        <button
            on:click={() => emit('download')}>
            PDF
        </button>

        <button
            class="danger"
            on:click={() => emit('delete')}>
            Delete
        </button>

    </div>

</article>

<style>

.audit-card{

display:grid;

gap:24px;

padding:28px;

}

.header{

display:flex;

justify-content:space-between;

align-items:flex-start;

gap:24px;

}

.header h2{

margin:4px 0 0;

font-size:28px;

letter-spacing:-.03em;

}

.score{

width:92px;

height:92px;

display:grid;

place-items:center;

background:var(--blue);

color:white;

font-weight:900;

}

.score span{

font-size:34px;

line-height:1;

}

.score small{

font-size:12px;

opacity:.85;

}

.details{

display:grid;

grid-template-columns:repeat(3,1fr);

gap:16px;

}

.details div{

padding:16px;

background:var(--surface);

border:1px solid var(--border);

display:grid;

gap:6px;

}

.details strong{

font-size:12px;

text-transform:uppercase;

letter-spacing:.08em;

}

.details span{

font-size:18px;

font-weight:700;

}

.actions{

display:flex;

flex-wrap:wrap;

gap:12px;

}

.actions button{

padding:11px 18px;

font-weight:700;

cursor:pointer;

background:var(--surface);

border:1px solid var(--border);

}

.actions button:hover{

border-color:var(--teal);

}

.danger{

color:#d62828;

}

@media(max-width:760px){

.details{

grid-template-columns:1fr;

}

.header{

flex-direction:column;

}

}

</style>
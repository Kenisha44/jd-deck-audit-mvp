<script>
  export let audits = [];
  export let loading = false;

  export let onRefresh = () => {};
  export let onOpen = () => {};
  export let onRename = () => {};
  export let onDuplicate = () => {};
  export let onDelete = () => {};

  let searchQuery = '';
  let sortBy = 'newest';

  $: filteredAudits = [...audits]
    .filter(audit =>
      audit.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {

      switch (sortBy) {

        case 'score':
          return (b.overall_score || 0) - (a.overall_score || 0);

        case 'name':
          return a.title.localeCompare(b.title);

        default:
          return (
            new Date(b.created_at) -
            new Date(a.created_at)
          );

      }

    });
</script>

<section class="panel sharp-panel project-panel">

    <div class="header">

        <div>

            <p class="eyebrow accent">

                Saved Projects

            </p>

            <h2>

                Recent Reports

            </h2>

        </div>

        <button
            class="refresh"
            on:click={onRefresh}
        >

            Refresh

        </button>

    </div>

    <div class="toolbar">

        <input

            bind:value={searchQuery}

            placeholder="Search audits..."

        />

        <select bind:value={sortBy}>

            <option value="newest">

                Newest

            </option>

            <option value="score">

                Highest Score

            </option>

            <option value="name">

                Alphabetical

            </option>

        </select>

    </div>

    {#if loading}

        <p class="muted">

            Loading audits...

        </p>

    {:else if filteredAudits.length===0}

        <p class="muted">

            No saved audits.

        </p>

    {:else}

        <div class="audit-list">

            {#each filteredAudits as audit}

                <article class="audit-card">

                    <button

                        class="main"

                        on:click={() =>
                            onOpen(audit)
                        }

                    >

                        <strong>

                            {audit.title}

                        </strong>

                        <span>

                            {audit.overall_score}/100

                        </span>

                        <small>

                            {new Date(
                                audit.created_at
                            ).toLocaleDateString()}

                        </small>

                    </button>

                    <div class="actions">

                        <button
                            on:click={() =>
                                onOpen(audit)
                            }
                        >

                            Open

                        </button>

                        <button
                            on:click={() =>
                                onRename(audit)
                            }
                        >

                            Rename

                        </button>

                        <button
                            on:click={() =>
                                onDuplicate(audit)
                            }
                        >

                            Duplicate

                        </button>

                        <button
                            class="danger"
                            on:click={() =>
                                onDelete(audit)
                            }
                        >

                            Delete

                        </button>

                    </div>

                </article>

            {/each}

        </div>

    {/if}

</section>

<style>

.project-panel{

padding:28px;

display:grid;

gap:20px;

}

.header{

display:flex;

justify-content:space-between;

align-items:center;

}

.toolbar{

display:flex;

gap:12px;

}

.toolbar input,
.toolbar select{

flex:1;

padding:12px;

background:var(--surface);

border:1px solid var(--border);

color:var(--text);

}

.audit-list{

display:grid;

gap:14px;

}

.audit-card{

padding:16px;

border:1px solid var(--border);

background:var(--surface);

display:grid;

gap:12px;

}

.main{

background:none;

border:none;

text-align:left;

display:grid;

gap:5px;

cursor:pointer;

color:var(--text);

}

.main span,
.main small{

color:var(--muted);

}

.actions{

display:flex;

gap:8px;

flex-wrap:wrap;

padding-top:10px;

border-top:1px solid var(--border);

}

.actions button{

padding:8px 12px;

cursor:pointer;

border:1px solid var(--border);

background:var(--panel);

color:var(--text);

}

.danger{

color:var(--danger);

}

.refresh{

padding:10px 14px;

cursor:pointer;

}

</style>
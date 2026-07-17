<script>
  import { createEventDispatcher } from 'svelte';

  export let search = '';
  export let sort = 'newest';
  export let total = 0;
  export let fullPage = false;

  const dispatch = createEventDispatcher();

  function updateSearch(event) {
    search = event.target.value;
    dispatch('search', search);
  }

  function updateSort(event) {
    sort = event.target.value;
    dispatch('sort', sort);
  }

  function newAudit() {
    dispatch('newAudit');
  }
</script>

<section class="toolbar panel sharp-panel">

    <div class="toolbar-header">

        <div>

            <p class="eyebrow accent">
                Audit Library
            </p>

            <h1>
                Saved Audits
            </h1>

            <small>
                {total}
                saved presentation{total === 1 ? '' : 's'}
            </small>

        </div>

        {#if fullPage}
            <button
                class="primary"
                on:click={newAudit}>
                + New Audit
            </button>
        {/if}

    </div>

    <div class="toolbar-controls">

        <input
            type="search"
            placeholder="Search presentations..."
            bind:value={search}
            on:input={updateSearch}
        />

        <select
            bind:value={sort}
            on:change={updateSort}
        >
            <option value="newest">
                Newest
            </option>

            <option value="oldest">
                Oldest
            </option>

            <option value="highest">
                Highest Score
            </option>

            <option value="lowest">
                Lowest Score
            </option>

            <option value="alphabetical">
                Alphabetical
            </option>

        </select>

    </div>

</section>

<style>

.toolbar{

display:grid;

gap:24px;

padding:28px;

}

.toolbar-header{

display:flex;

justify-content:space-between;

align-items:center;

gap:24px;

}

.toolbar-header h1{

margin:4px 0;

font-size:36px;

letter-spacing:-.04em;

}

.toolbar-header small{

color:var(--muted);

}

.primary{

padding:14px 22px;

background:var(--orange);

color:white;

font-weight:800;

border:2px solid var(--text);

cursor:pointer;

box-shadow:5px 5px 0 var(--teal);

}

.primary:hover{

transform:translateY(-2px);

}

.toolbar-controls{

display:grid;

grid-template-columns:1fr 220px;

gap:16px;

}

.toolbar-controls input{

padding:14px;

font:inherit;

border:1px solid var(--border);

background:var(--surface);

color:var(--text);

}

.toolbar-controls select{

padding:14px;

font:inherit;

border:1px solid var(--border);

background:var(--surface);

color:var(--text);

cursor:pointer;

}

@media(max-width:800px){

.toolbar-header{

flex-direction:column;

align-items:flex-start;

}

.toolbar-controls{

grid-template-columns:1fr;

}

.primary{

width:100%;

}

}

</style>
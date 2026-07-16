<script>
  export let score = 0;

  const audiences = [
    {
      label: 'Internal Team Meeting',
      threshold: 60
    },
    {
      label: 'Leadership Review',
      threshold: 70
    },
    {
      label: 'Client Presentation',
      threshold: 80
    },
    {
      label: 'Board Meeting',
      threshold: 90
    },
    {
      label: 'Investor Pitch',
      threshold: 95
    }
  ];

  function status(threshold) {
    if (score >= threshold) {
      return {
        icon: '✓',
        class: 'ready',
        text: 'Ready'
      };
    }

    if (score >= threshold - 8) {
      return {
        icon: '⚠',
        class: 'almost',
        text: 'Almost'
      };
    }

    return {
      icon: '✕',
      class: 'not-ready',
      text: 'Not Ready'
    };
  }
</script>

<section class="report-section">

  <div class="section-heading">

    <div>

      <p class="eyebrow accent">
        Executive Readiness
      </p>

      <h2>
        Presentation Readiness
      </h2>

    </div>

  </div>

  <div class="meter">

    <div
      class="fill"
      style={`width:${score}%`}
    ></div>

  </div>

  <div class="score-row">

    <strong>
      {score}/100
    </strong>

    <span>
      Executive Readiness Score
    </span>

  </div>

  <div class="audience-grid">

    {#each audiences as audience}

      {@const result=status(audience.threshold)}

      <div class={`audience ${result.class}`}>

        <span class="icon">
          {result.icon}
        </span>

        <div>

          <strong>
            {audience.label}
          </strong>

          <small>
            {result.text}
          </small>

        </div>

      </div>

    {/each}

  </div>

</section>

<style>

.meter{

height:18px;

background:var(--surface-hover);

border:1px solid var(--border);

overflow:hidden;

margin:24px 0;

}

.fill{

height:100%;

background:linear-gradient(
90deg,
var(--teal),
var(--aqua),
var(--orange)
);

}

.score-row{

display:flex;

justify-content:space-between;

margin-bottom:28px;

}

.score-row strong{

font-size:34px;

}

.score-row span{

color:var(--muted);

align-self:center;

}

.audience-grid{

display:grid;

gap:14px;

}

.audience{

display:flex;

gap:16px;

align-items:center;

padding:16px;

border:1px solid var(--border);

background:var(--surface);

}

.icon{

font-size:24px;

font-weight:900;

width:36px;

text-align:center;

}

.ready{

border-left:6px solid #22c55e;

}

.almost{

border-left:6px solid #f59e0b;

}

.not-ready{

border-left:6px solid #ef4444;

}

small{

display:block;

color:var(--muted);

margin-top:4px;

}
section {
  padding: 21px;
}

.meter {
  height: 12px;
  margin: 14px 0;
}

.score-row {
  margin-bottom: 16px;
}

.score-row strong {
  font-size: 28px;
}

.audience-grid {
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 9px;
}

.audience {
  gap: 10px;
  min-height: 67px;
  padding: 11px;
}

.icon {
  width: 28px;
  font-size: 19px;
}

small {
  margin-top: 2px;
}

@media (max-width: 650px) {
  .audience-grid {
    grid-template-columns: 1fr;
  }
}
</style>
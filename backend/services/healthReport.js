export function buildHealthReport({
  overall,
  grade,
  dna,
  scores,
  priorityQueue = [],
  slides = []
}) {
  const businessImpact =
    overall >= 90
      ? 'Excellent'
      : overall >= 80
      ? 'Strong'
      : overall >= 70
      ? 'Moderate'
      : 'Needs Attention';

  const executiveSummary = buildExecutiveSummary(
    overall,
    dna,
    priorityQueue
  );

  const strengths = collectStrengths(slides, dna);
  const opportunities = collectOpportunities(
    slides,
    priorityQueue,
    dna
  );

  const recommendation = buildRecommendation(
    overall,
    priorityQueue,
    dna
  );

  const estimatedImprovement =
    estimateImprovement(priorityQueue);

  const nextSteps = buildNextSteps(priorityQueue);

  return {
    overall,
    grade,
    businessImpact,

    // Existing fields
    executiveSummary,
    topStrength: dna?.topStrength || 'Not available',
    biggestOpportunity:
      dna?.biggestOpportunity || 'Not available',
    estimatedImprovement,
    priorityFixes: priorityQueue,
    nextSteps,

    // Fields expected by the redesigned frontend
    summary: executiveSummary,
    strengths,
    opportunities,
    recommendation,

    categoryScores: scores,

    slideSummary: slides.map(slide => ({
      slide: slide.number,
      title: slide.title,
      score: slide.score
    }))
  };
}

function buildExecutiveSummary(
  overall,
  dna = {},
  priorityQueue = []
) {
  let summary =
    `The presentation received an overall score of ${overall}/100. `;

  summary +=
    `Its strongest area is ${dna.topStrength || 'not yet identified'}, `;

  summary +=
    `while the biggest opportunity is ${
      dna.biggestOpportunity || 'not yet identified'
    }. `;

  if (priorityQueue.length) {
    summary +=
      `Addressing the ${priorityQueue.length} highest-priority recommendations should produce the largest improvement in executive readiness.`;
  } else {
    summary +=
      'No major priority issues were identified in the current audit.';
  }

  return summary;
}

function collectStrengths(slides = [], dna = {}) {
  const slideStrengths = slides.flatMap(
    slide => slide.strengths || []
  );

  const strengths = [
    dna.topStrength
      ? `Strongest presentation category: ${dna.topStrength}`
      : null,
    ...slideStrengths
  ].filter(Boolean);

  return [...new Set(strengths)].slice(0, 5);
}

function collectOpportunities(
  slides = [],
  priorityQueue = [],
  dna = {}
) {
  const weaknesses = slides.flatMap(
    slide => slide.weaknesses || []
  );

  const priorityTitles = priorityQueue.map(
    item => item.title
  );

  const opportunities = [
    dna.biggestOpportunity
      ? `Improve ${dna.biggestOpportunity}`
      : null,
    ...priorityTitles,
    ...weaknesses
  ].filter(Boolean);

  return [...new Set(opportunities)].slice(0, 5);
}

function buildRecommendation(
  overall,
  priorityQueue = [],
  dna = {}
) {
  if (overall >= 90) {
    return 'The deck is ready for executive review. Complete a final quality-control pass before presenting.';
  }

  if (overall >= 80) {
    return `The deck has a strong foundation. Refine ${
      dna.biggestOpportunity || 'the weakest category'
    } and address the highest-priority recommendations before the final presentation.`;
  }

  if (overall >= 70) {
    return `Complete the top ${
      Math.min(priorityQueue.length, 3) || 3
    } priority fixes before executive review, with special attention to ${
      dna.biggestOpportunity || 'executive communication'
    }.`;
  }

  return 'The deck requires another revision cycle before executive review. Prioritize decision clarity, slide structure, and recommendation language.';
}

function estimateImprovement(queue = []) {
  if (!queue.length) return 'Minimal';

  const critical = queue.filter(
    item => item.severity === 'Critical'
  ).length;

  if (critical >= 2) {
    return '15–30 point improvement';
  }

  if (critical === 1) {
    return '10–20 point improvement';
  }

  return '5–10 point improvement';
}

function buildNextSteps(queue = []) {
  const steps = queue
    .slice(0, 5)
    .map(item => `• ${item.title}`);

  steps.push(
    '• Re-run the JD Deck Audit after revisions.'
  );

  steps.push(
    '• Consider a professional Johken Design review for high-stakes executive presentations.'
  );

  return steps;
}
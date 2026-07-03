export function buildHealthReport({
    overall,
    grade,
    dna,
    scores,
    priorityQueue,
    slides
  }) {
  
    const businessImpact =
      overall >= 90
        ? "Excellent"
        : overall >= 80
        ? "Strong"
        : overall >= 70
        ? "Moderate"
        : "Needs Attention";
  
    const executiveSummary = buildExecutiveSummary(
      overall,
      dna,
      priorityQueue
    );
  
    const topStrength =
      dna.topStrength;
  
    const biggestOpportunity =
      dna.biggestOpportunity;
  
    const estimatedImprovement =
      estimateImprovement(priorityQueue);
  
    return {
  
      overall,
  
      grade,
  
      businessImpact,
  
      executiveSummary,
  
      topStrength,
  
      biggestOpportunity,
  
      estimatedImprovement,
  
      priorityFixes: priorityQueue,
  
      nextSteps: buildNextSteps(priorityQueue),
  
      slideSummary: slides.map(slide => ({
        slide: slide.number,
        title: slide.title,
        score: slide.score
      }))
  
    };
  }
  
  function buildExecutiveSummary(
    overall,
    dna,
    priorityQueue
  ) {
  
    let summary =
      `Overall presentation quality is ${overall}/100. `;
  
    summary +=
      `The strongest area is ${dna.topStrength}. `;
  
    summary +=
      `The biggest opportunity is ${dna.biggestOpportunity}. `;
  
    if (priorityQueue.length) {
  
      summary +=
        `Addressing the top ${priorityQueue.length} recommendations should produce the largest improvement in executive readiness.`;
  
    }
  
    return summary;
  }
  
  function estimateImprovement(queue) {
  
    if (!queue.length)
      return "Minimal";
  
    const critical =
      queue.filter(
        x => x.severity === "Critical"
      ).length;
  
    if (critical >= 2)
      return "15–30 point improvement";
  
    if (critical === 1)
      return "10–20 point improvement";
  
    return "5–10 point improvement";
  }
  
  function buildNextSteps(queue) {
  
    const steps = [];
  
    queue.forEach(item => {
  
      steps.push(
        `• ${item.title}`
      );
  
    });
  
    steps.push(
      "• Re-run the JD Deck Audit after revisions."
    );
  
    steps.push(
      "• Schedule a professional Johken Design review for executive presentations."
    );
  
    return steps;
  }
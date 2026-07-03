export function buildPriorityQueue(slides = [], overallScores = {}) {
    const queue = [];
  
    // ---------- Executive Recommendation ----------
    if (overallScores.actionability < 75) {
      queue.push({
        severity: "Critical",
        category: "Decision Making",
        title: "Add a Clear Executive Recommendation",
        description:
          "End the presentation with a specific decision, owner, and next step.",
        impact: 100
      });
    }
  
    // ---------- Data Story ----------
    if (overallScores.dataStorytelling < 75) {
      queue.push({
        severity: "Critical",
        category: "Business Insight",
        title: "Support Claims with Data",
        description:
          "Add metrics, trends, benchmarks, or financial evidence.",
        impact: 96
      });
    }
  
    // ---------- Clarity ----------
    if (overallScores.clarity < 78) {
      queue.push({
        severity: "Moderate",
        category: "Executive Communication",
        title: "Improve Slide Headlines",
        description:
          "Rewrite headlines as conclusions instead of topics.",
        impact: 90
      });
    }
  
    // ---------- Visual ----------
    if (overallScores.visualSimplicity < 78) {
      queue.push({
        severity: "Moderate",
        category: "Visual Design",
        title: "Reduce Text Density",
        description:
          "Simplify layouts and remove unnecessary text.",
        impact: 86
      });
    }
  
    // ---------- Storytelling ----------
    if (overallScores.storytelling < 80) {
      queue.push({
        severity: "Moderate",
        category: "Storytelling",
        title: "Strengthen Narrative Flow",
        description:
          "Ensure every slide builds toward the final recommendation.",
        impact: 84
      });
    }
  
    // ---------- Weakest Slide ----------
    if (slides.length) {
  
      const weakest = [...slides].sort(
        (a, b) => a.score - b.score
      )[0];
  
      if (weakest.score < 80) {
  
        queue.push({
          severity: "Moderate",
          category: "Slide Review",
          title: `Prioritize Slide ${weakest.number}`,
          description:
            weakest.summary ||
            "This slide has the highest opportunity for improvement.",
          impact: 82
        });
  
      }
    }
  
    // ---------- Sort ----------
    queue.sort((a, b) => b.impact - a.impact);
  
    return queue.slice(0, 5);
  }
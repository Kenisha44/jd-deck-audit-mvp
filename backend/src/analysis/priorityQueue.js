const CATEGORY_MAP = {
    readability: {
      title: 'Improve Executive Readability',
      businessImpact:
        'Executives may spend additional time interpreting the slide instead of focusing on the decision.',
      action:
        'Reduce text density, shorten sentences, and emphasize one primary takeaway.'
    },
  
    clarity: {
      title: 'Strengthen Message Clarity',
      businessImpact:
        'The primary message may not be immediately understood by senior leadership.',
      action:
        'Rewrite the headline so it communicates the conclusion before supporting details.'
    },
  
    storytelling: {
      title: 'Improve Business Storytelling',
      businessImpact:
        'The presentation may feel informational instead of driving a business decision.',
      action:
        'Connect the problem, evidence, recommendation, and expected outcome.'
    },
  
    visual: {
      title: 'Improve Visual Hierarchy',
      businessImpact:
        'Important information may compete for attention with secondary content.',
      action:
        'Increase whitespace, simplify layouts, and emphasize key metrics.'
    },
  
    data: {
      title: 'Strengthen Data Storytelling',
      businessImpact:
        'Recommendations appear less persuasive without supporting evidence.',
      action:
        'Include metrics, trends, or comparisons that reinforce the recommendation.'
    }
  };
  
  function estimateImprovement(score) {
    if (score < 55) return 12;
    if (score < 65) return 10;
    if (score < 75) return 8;
    if (score < 85) return 5;
    return 3;
  }
  
  function severity(score) {
    if (score < 60) return 'Critical';
    if (score < 75) return 'High';
    if (score < 85) return 'Medium';
    return 'Low';
  }
  
  export function buildPriorityQueue(
    slides = [],
    scores = {}
  ) {
    return slides
      .slice()
      .sort(
        (a, b) => a.score - b.score
      )
      .slice(0, 5)
      .map(slide => {
        const weakestCategory =
          Object.entries(slide.categoryScores || {})
            .sort((a, b) => a[1] - b[1])[0]?.[0] ||
          'clarity';
  
        const template =
          CATEGORY_MAP[weakestCategory] ||
          CATEGORY_MAP.clarity;
  
        return {
          slide: slide.number,
  
          title: template.title,
  
          category:
            weakestCategory,
  
          severity:
            severity(slide.score),
  
          currentScore:
            slide.score,
  
          estimatedImprovement:
            estimateImprovement(slide.score),
  
          businessImpact:
            template.businessImpact,
  
          recommendation:
            template.action,
  
          description:
            template.action,
  
          evidence:
            `${slide.stats?.wordCount || 0} words • ${
              slide.stats?.sentenceCount || 0
            } sentences`,
  
          priority:
            severity(slide.score)
        };
      });
  }
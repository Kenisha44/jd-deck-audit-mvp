export function buildDeckRecommendations(
    dna = {}
  ) {
    const strengths = [];
    const opportunities = [];
  
    if (
      dna.executiveCommunication >= 85
    ) {
      strengths.push(
        'Strong executive messaging.'
      );
    } else {
      opportunities.push(
        'Improve conclusion-led headlines.'
      );
    }
  
    if (
      dna.dataConfidence >= 85
    ) {
      strengths.push(
        'Excellent use of measurable evidence.'
      );
    } else {
      opportunities.push(
        'Support recommendations with more metrics.'
      );
    }
  
    if (
      dna.decisionReadiness >= 85
    ) {
      strengths.push(
        'The presentation clearly communicates decisions.'
      );
    } else {
      opportunities.push(
        'End with a clear recommendation, owner, and next step.'
      );
    }
  
    if (
      dna.visualSimplicity < 75
    ) {
      opportunities.push(
        'Reduce visual and text density.'
      );
    }
  
    if (
      dna.businessStorytelling < 75
    ) {
      opportunities.push(
        'Improve narrative flow between slides.'
      );
    }
  
    if (!strengths.length) {
      strengths.push(
        'The deck provides a workable foundation for refinement.'
      );
    }
  
    if (!opportunities.length) {
      opportunities.push(
        'Complete a final executive-readiness review.'
      );
    }
  
    return {
      strengths,
      opportunities
    };
  }
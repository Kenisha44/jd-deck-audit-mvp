export function generateRecommendations({
    title = '',
    text = '',
    metrics = {},
    readability = {},
    scores = {}
  }) {
    const strengths = [];
    const weaknesses = [];
    const fixes = [];
  
    if (scores.clarity >= 85) {
      strengths.push(
        'The slide is easy to scan and understand.'
      );
    }
  
    if (scores.visualSimplicity >= 85) {
      strengths.push(
        'The slide maintains strong visual simplicity.'
      );
    }
  
    if (
      scores.dataStorytelling >= 80
    ) {
      strengths.push(
        'The slide uses measurable evidence effectively.'
      );
    }
  
    if (!title.trim()) {
      weaknesses.push(
        'The slide does not have a clear headline.'
      );
  
      fixes.push(
        'Add a conclusion-led headline that communicates the main takeaway.'
      );
    }
  
    if (title.length > 70) {
      weaknesses.push(
        'The headline is too long for fast executive scanning.'
      );
  
      fixes.push(
        'Shorten the headline to fewer than 70 characters.'
      );
    }
  
    if (metrics.wordCount > 120) {
      weaknesses.push(
        'The slide contains too much text.'
      );
  
      fixes.push(
        'Reduce supporting copy or split the content across two slides.'
      );
    }
  
    if (metrics.bulletCount > 7) {
      weaknesses.push(
        'The slide has too many bullet points.'
      );
  
      fixes.push(
        'Reduce the list to three to five priority points.'
      );
    }
  
    if (
      readability.averageSentenceLength > 22
    ) {
      weaknesses.push(
        'The slide uses long sentence structures.'
      );
  
      fixes.push(
        'Break long sentences into shorter, more direct statements.'
      );
    }
  
    if (
      readability.passiveVoiceCount > 2
    ) {
      weaknesses.push(
        'The copy relies heavily on passive voice.'
      );
  
      fixes.push(
        'Use active voice to make ownership and decisions clearer.'
      );
    }
  
    if (scores.actionability < 70) {
      weaknesses.push(
        'The slide does not clearly communicate a decision or next step.'
      );
  
      fixes.push(
        'Add a specific recommendation, owner, or decision request.'
      );
    }
  
    if (
      scores.dataStorytelling < 70
    ) {
      weaknesses.push(
        'The slide lacks strong measurable evidence.'
      );
  
      fixes.push(
        'Add metrics, benchmarks, trends, or financial evidence.'
      );
    }
  
    if (!strengths.length) {
      strengths.push(
        'The slide provides a usable foundation for revision.'
      );
    }
  
    if (!fixes.length) {
      fixes.push(
        'Complete a final quality-control pass before presenting.'
      );
    }
  
    return {
      strengths:
        [...new Set(strengths)],
  
      weaknesses:
        [...new Set(weaknesses)],
  
      fixes:
        [...new Set(fixes)]
    };
  }
  
  export function buildSlideSummary({
    scores = {},
    metrics = {}
  }) {
    if (scores.overall >= 85) {
      return 'This slide is clear, focused, and well suited for executive review.';
    }
  
    if (scores.overall >= 70) {
      return 'This slide has a solid foundation but would benefit from targeted improvements.';
    }
  
    if (metrics.wordCount > 120) {
      return 'This slide is text-heavy and may be difficult to process during a presentation.';
    }
  
    return 'This slide requires revision before it is ready for executive review.';
  }
function clampScore(score) {
    return Math.max(
      0,
      Math.min(100, Math.round(score))
    );
  }
  
  export function scoreClarity({
    wordCount = 0,
    averageSentenceLength = 0,
    readabilityScore = 100
  }) {
    let score = readabilityScore;
  
    if (wordCount > 100) {
      score -= 10;
    }
  
    if (wordCount > 150) {
      score -= 15;
    }
  
    if (averageSentenceLength > 22) {
      score -= 10;
    }
  
    return clampScore(score);
  }
  
  export function scoreVisualSimplicity({
    wordCount = 0,
    bulletCount = 0
  }) {
    let score = 100;
  
    if (wordCount > 75) {
      score -= 10;
    }
  
    if (wordCount > 120) {
      score -= 20;
    }
  
    if (bulletCount > 6) {
      score -= 12;
    }
  
    if (bulletCount > 10) {
      score -= 18;
    }
  
    return clampScore(score);
  }
  
  export function scoreExecutiveCommunication({
    title = '',
    wordCount = 0
  }) {
    let score = 100;
  
    if (!title.trim()) {
      score -= 30;
    }
  
    if (title.length > 70) {
      score -= 15;
    }
  
    if (title.length < 5) {
      score -= 10;
    }
  
    if (wordCount > 120) {
      score -= 15;
    }
  
    return clampScore(score);
  }
  
  export function scoreActionability({
    title = '',
    text = ''
  }) {
    let score = 65;
  
    const combined =
      `${title} ${text}`.toLowerCase();
  
    const actionWords = [
      'recommend',
      'approve',
      'decide',
      'next step',
      'launch',
      'increase',
      'reduce',
      'prioritize',
      'invest',
      'implement'
    ];
  
    const actionCount =
      actionWords.filter(word =>
        combined.includes(word)
      ).length;
  
    score += actionCount * 7;
  
    return clampScore(score);
  }
  
  export function scoreDataStorytelling({
    text = ''
  }) {
    let score = 60;
  
    const hasPercentage =
      /\d+%/.test(text);
  
    const hasCurrency =
      /[$€£]\s?\d/.test(text);
  
    const hasNumericData =
      /\b\d+(\.\d+)?\b/.test(text);
  
    const hasComparison =
      /\b(vs|versus|increase|decrease|growth|decline|higher|lower|year over year|yoy)\b/i.test(
        text
      );
  
    if (hasPercentage) {
      score += 12;
    }
  
    if (hasCurrency) {
      score += 10;
    }
  
    if (hasNumericData) {
      score += 8;
    }
  
    if (hasComparison) {
      score += 10;
    }
  
    return clampScore(score);
  }
  
  export function scoreStorytelling({
    slideIndex = 0,
    totalSlides = 1,
    title = ''
  }) {
    let score = 75;
  
    if (title.trim()) {
      score += 8;
    }
  
    if (slideIndex === 0) {
      score += 5;
    }
  
    if (
      slideIndex ===
      totalSlides - 1
    ) {
      score += 5;
    }
  
    return clampScore(score);
  }
  
  export function calculateSlideScores({
    title = '',
    text = '',
    metrics = {},
    readability = {},
    slideIndex = 0,
    totalSlides = 1
  }) {
    const clarity =
      scoreClarity({
        wordCount:
          metrics.wordCount,
  
        averageSentenceLength:
          metrics.averageSentenceLength,
  
        readabilityScore:
          readability.score
      });
  
    const visualSimplicity =
      scoreVisualSimplicity({
        wordCount:
          metrics.wordCount,
  
        bulletCount:
          metrics.bulletCount
      });
  
    const executiveCommunication =
      scoreExecutiveCommunication({
        title,
        wordCount:
          metrics.wordCount
      });
  
    const actionability =
      scoreActionability({
        title,
        text
      });
  
    const dataStorytelling =
      scoreDataStorytelling({
        text
      });
  
    const storytelling =
      scoreStorytelling({
        slideIndex,
        totalSlides,
        title
      });
  
    const overall =
      clampScore(
        (
          clarity * 0.2 +
          visualSimplicity * 0.18 +
          executiveCommunication * 0.2 +
          actionability * 0.17 +
          dataStorytelling * 0.15 +
          storytelling * 0.1
        )
      );
  
    return {
      overall,
      clarity,
      visualSimplicity,
      executiveCommunication,
      actionability,
      dataStorytelling,
      storytelling
    };
  }
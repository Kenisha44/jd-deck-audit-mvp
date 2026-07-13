import {
    countWords,
    countSentences,
    averageSentenceLength
  } from './metrics.js';
  
  const COMPLEX_WORD_PATTERN =
    /\b\w{9,}\b/g;
  
  const PASSIVE_VOICE_PATTERN =
    /\b(am|is|are|was|were|be|been|being)\s+\w+(ed|en)\b/gi;
  
  export function countComplexWords(text = '') {
    const matches =
      text.match(COMPLEX_WORD_PATTERN);
  
    return matches?.length || 0;
  }
  
  export function countPassiveVoice(text = '') {
    const matches =
      text.match(PASSIVE_VOICE_PATTERN);
  
    return matches?.length || 0;
  }
  
  export function calculateComplexityScore(text = '') {
    const wordCount =
      Math.max(countWords(text), 1);
  
    const complexWords =
      countComplexWords(text);
  
    return Math.round(
      (complexWords / wordCount) * 100
    );
  }
  
  export function calculateReadabilityScore(text = '') {
    const words =
      Math.max(countWords(text), 1);
  
    const sentences =
      Math.max(countSentences(text), 1);
  
    const averageWordsPerSentence =
      words / sentences;
  
    const complexWordPercentage =
      calculateComplexityScore(text);
  
    let score = 100;
  
    if (averageWordsPerSentence > 18) {
      score -= 10;
    }
  
    if (averageWordsPerSentence > 25) {
      score -= 15;
    }
  
    if (complexWordPercentage > 12) {
      score -= 10;
    }
  
    if (complexWordPercentage > 20) {
      score -= 15;
    }
  
    if (countPassiveVoice(text) > 2) {
      score -= 10;
    }
  
    return Math.max(
      0,
      Math.min(100, score)
    );
  }
  
  export function getReadabilityLabel(score = 0) {
    if (score >= 85) {
      return 'Very Clear';
    }
  
    if (score >= 70) {
      return 'Clear';
    }
  
    if (score >= 55) {
      return 'Moderate';
    }
  
    return 'Complex';
  }
  
  export function analyzeReadability(text = '') {
    const score =
      calculateReadabilityScore(text);
  
    return {
      score,
  
      label:
        getReadabilityLabel(score),
  
      averageSentenceLength:
        averageSentenceLength(text),
  
      complexWordCount:
        countComplexWords(text),
  
      complexityPercentage:
        calculateComplexityScore(text),
  
      passiveVoiceCount:
        countPassiveVoice(text)
    };
  }
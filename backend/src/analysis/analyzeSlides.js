import {
    countWords,
    countCharacters,
    countBullets,
    countSentences,
    averageSentenceLength,
    estimateReadTime
  } from './metrics.js';
  
  import {
    analyzeReadability
  } from './readability.js';
  
  import {
    calculateSlideScores
  } from './scoring.js';
  
  import {
    generateRecommendations,
    buildSlideSummary
  } from './recommendations.js';

  import {
    analyzeVisualStructure
  }
  from "./visualAnalysis.js";

  export function analyzeSlide(
    slide = {},
    slideIndex = 0,
    totalSlides = 1
  ) {
    const title =
      slide.title || '';
  
    const text =
      slide.text || '';
  
    const metrics = {
      wordCount:
        countWords(text),
  
      characterCount:
        countCharacters(text),
  
      bulletCount:
        countBullets(text),
  
      sentenceCount:
        countSentences(text),
  
      averageSentenceLength:
        averageSentenceLength(text),
  
      estimatedReadTime:
        estimateReadTime(text)
    };
  const visual =
  analyzeVisualStructure({
    title,
    text
  });
    const readability =
      analyzeReadability(text);
  
    const scores =
      calculateSlideScores({
        title,
        text,
        metrics,
        readability,
        slideIndex,
        totalSlides
      });
  
    const findings =
      generateRecommendations({
        title,
        text,
        metrics,
        readability,
        scores
      });
  
    return {
      number:
        slide.number ||
        slideIndex + 1,
  
      title:
        title ||
        `Slide ${slideIndex + 1}`,
  
      text,
  
      score:
        scores.overall,
  
      summary:
        buildSlideSummary({
          scores,
          metrics
        }),
  
      metrics,
  
      readability,
  
      scores,
  
      strengths:
        findings.strengths,
  
      weaknesses:
        findings.weaknesses,
  
      fixes:
        findings.fixes
    };
  }
  
  export function analyzeSlides(
    slides = []
  ) {
    return slides.map(
      (slide, index) =>
        analyzeSlide(
          slide,
          index,
          slides.length
        )
    );
  }
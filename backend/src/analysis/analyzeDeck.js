import {
    analyzeSlides
  } from './analyzeSlides.js';
  
  import {
    buildPresentationDNA
  } from './presentationDNA.js';
  
  import {
    buildDeckRecommendations
  } from './deckRecommendations.js';
  
  export function analyzeDeck(
    slides = []
  ) {
    const analyzedSlides =
      analyzeSlides(slides);
  
    const slideCount =
      analyzedSlides.length;
  
    const overall =
      slideCount > 0
        ? Math.round(
            analyzedSlides.reduce(
              (sum, slide) =>
                sum +
                (slide.score || 0),
              0
            ) / slideCount
          )
        : 0;
  
    const dna =
      buildPresentationDNA(
        analyzedSlides
      );
  
    const recommendations =
      buildDeckRecommendations(
        dna
      );
  
    return {
      overall,
      slideCount,
      dna,
      recommendations,
      slides: analyzedSlides
    };
  }
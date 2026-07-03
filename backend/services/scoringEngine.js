import { clamp } from "../utils/textHelpers.js";

export function calculateOverallScore(scores) {
  const values = Object.values(scores);

  if (!values.length) return 0;

  return clamp(
    values.reduce((sum, value) => sum + value, 0) / values.length
  );
}

export function calculateCategoryScores(slides = []) {
  if (!slides.length) {
    return {
      clarity: 0,
      storytelling: 0,
      executiveReadiness: 0,
      visualSimplicity: 0,
      dataStorytelling: 0,
      actionability: 0
    };
  }

  const categories = [
    "clarity",
    "storytelling",
    "executiveReadiness",
    "visualSimplicity",
    "dataStorytelling",
    "actionability"
  ];

  const result = {};

  categories.forEach(category => {

    const average =
      slides.reduce(
        (sum, slide) => sum + slide.scores[category],
        0
      ) / slides.length;

    result[category] = clamp(average);

  });

  return result;
}

export function gradeDeck(overall) {

  if (overall >= 95) return "A+";

  if (overall >= 90) return "A";

  if (overall >= 85) return "A-";

  if (overall >= 80) return "B+";

  if (overall >= 75) return "B";

  if (overall >= 70) return "C";

  if (overall >= 60) return "D";

  return "F";
}

export function executiveReadiness(overall) {

  if (overall >= 90)
    return "Boardroom Ready";

  if (overall >= 82)
    return "Executive Ready";

  if (overall >= 74)
    return "Strong Foundation";

  if (overall >= 65)
    return "Needs Executive Polish";

  return "Needs Redesign";
}

export function deckRisk(overall) {

  if (overall >= 90)
    return "Low";

  if (overall >= 75)
    return "Moderate";

  return "High";
}
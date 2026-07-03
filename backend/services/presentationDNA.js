import { clamp } from "../utils/textHelpers.js";

export function buildPresentationDNA(scores) {

  const dna = {
    executiveCommunication: clamp(
      (scores.clarity + scores.executiveReadiness) / 2
    ),

    storytelling: clamp(
      scores.storytelling
    ),

    visualDesign: clamp(
      scores.visualSimplicity
    ),

    readability: clamp(
      scores.clarity
    ),

    executivePresence: clamp(
      (scores.executiveReadiness + scores.actionability) / 2
    ),

    brandConsistency: clamp(
      (scores.visualSimplicity + scores.clarity) / 2
    )
  };

  const entries = Object.entries(dna)
    .sort((a, b) => b[1] - a[1]);

  return {
    profile: entries.map(([key, value]) => ({
      key,
      label: formatLabel(key),
      score: value
    })),

    topStrength: formatLabel(entries[0][0]),

    biggestOpportunity: formatLabel(
      entries[entries.length - 1][0]
    )
  };
}

function formatLabel(key) {

  const labels = {

    executiveCommunication:
      "Executive Communication",

    storytelling:
      "Storytelling",

    visualDesign:
      "Visual Design",

    readability:
      "Readability",

    executivePresence:
      "Executive Presence",

    brandConsistency:
      "Brand Consistency"

  };

  return labels[key] || key;
}
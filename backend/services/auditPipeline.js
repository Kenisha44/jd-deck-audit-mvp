import {
  analyzeDeck
} from '../src/analysis/analyzeDeck.js';

import {
  calculateCategoryScores,
  calculateOverallScore,
  gradeDeck,
  executiveReadiness,
  deckRisk
} from './scoringEngine.js';

import {
  buildPresentationDNA
} from './presentationDNA.js';

import {
  buildPriorityQueue
} from './priorityQueue.js';

import {
  buildHealthReport
} from './healthReport.js';

import {
  estimateAuditTime
} from '../utils/pptParser.js';

function normalizeAnalyzedSlide(
  slide,
  index
) {
  const metrics =
    slide.metrics || {};

  const scores =
    slide.scores || {};

  const strengths =
    Array.isArray(slide.strengths)
      ? slide.strengths
      : [];

  const weaknesses =
    Array.isArray(slide.weaknesses)
      ? slide.weaknesses
      : [];

  const fixes =
    Array.isArray(slide.fixes)
      ? slide.fixes
      : [];

  return {
    ...slide,

    number:
      slide.number ||
      index + 1,

    title:
      slide.title ||
      `Slide ${index + 1}`,

    text:
      slide.text || '',

    score:
      slide.score ??
      scores.overall ??
      0,

    summary:
      slide.summary ||
      'This slide was analyzed using the JD deterministic audit engine.',

    /*
     * Preserve the new engine structure.
     */
    metrics,
    readability:
      slide.readability || {},
    scores,

    strengths,
    weaknesses,
    fixes,

    /*
     * Backward-compatible aliases for the
     * existing dashboard and legacy services.
     */
    stats: {
      ...metrics,

      wordCount:
        metrics.wordCount ?? 0,

      characterCount:
        metrics.characterCount ?? 0,

      bulletCount:
        metrics.bulletCount ?? 0,

      sentenceCount:
        metrics.sentenceCount ?? 0,

      averageSentenceLength:
        metrics.averageSentenceLength ?? 0,

      estimatedReadTime:
        metrics.estimatedReadTime ?? 0
    },

    categoryScores: {
      clarity:
        scores.clarity ?? 0,

      visualSimplicity:
        scores.visualSimplicity ?? 0,

      executiveCommunication:
        scores.executiveCommunication ?? 0,

      actionability:
        scores.actionability ?? 0,

      dataStorytelling:
        scores.dataStorytelling ?? 0,

      storytelling:
        scores.storytelling ?? 0
    },

    recommendations:
      fixes,

    issues:
      weaknesses
  };
}

function buildCompatibleDNA(
  categoryScores,
  engineDNA
) {
  const existingDNA =
    buildPresentationDNA(
      categoryScores
    );

  return {
    ...existingDNA,

    /*
     * Add the new signature DNA fields
     * without removing the fields currently
     * consumed by the frontend.
     */
    personality:
      engineDNA?.personality ||
      'Balanced',

    businessStorytelling:
      engineDNA?.businessStorytelling ??
      categoryScores.storytelling ??
      0,

    decisionReadiness:
      engineDNA?.decisionReadiness ??
      categoryScores.actionability ??
      0,

    dataConfidence:
      engineDNA?.dataConfidence ??
      categoryScores.dataStorytelling ??
      0,

    executiveCommunication:
      engineDNA?.executiveCommunication ??
      categoryScores.executiveCommunication ??
      existingDNA.executiveCommunication ??
      0,

    visualSimplicity:
      engineDNA?.visualSimplicity ??
      categoryScores.visualSimplicity ??
      existingDNA.visualSimplicity ??
      0
  };
}

function uniqueItems(items = []) {
  return [
    ...new Set(
      items.filter(Boolean)
    )
  ];
}

export function auditPipeline({
  slides = [],
  deckName = 'Untitled Deck',
  fileType = 'PPTX',
  fileSize = 'Not available',
  source = 'upload'
}) {
  const safeSlides =
    slides.length
      ? slides
      : [
          {
            number: 1,
            title: deckName,
            text: deckName
          }
        ];

  /*
   * New deterministic engine:
   *
   * metrics
   * readability
   * scoring
   * strengths
   * weaknesses
   * fixes
   * Presentation DNA
   */
  const engineResult =
    analyzeDeck(
      safeSlides
    );

  const analyzedSlides =
    engineResult.slides.map(
      normalizeAnalyzedSlide
    );

  /*
   * Continue using the existing deck-level
   * services so the frontend response shape
   * remains stable.
   */
  const scores =
    calculateCategoryScores(
      analyzedSlides
    );

  const overall =
    calculateOverallScore(
      scores
    );

  const grade =
    gradeDeck(
      overall
    );

  const readiness =
    executiveReadiness(
      overall
    );

  const riskLevel =
    deckRisk(
      overall
    );

  const dna =
    buildCompatibleDNA(
      scores,
      engineResult.dna
    );

  const priorityQueue =
    buildPriorityQueue(
      analyzedSlides,
      scores
    );

  const healthReport =
    buildHealthReport({
      overall,
      grade,
      dna,
      scores,
      priorityQueue,
      slides:
        analyzedSlides
    });

  const estimatedWords =
    analyzedSlides.reduce(
      (sum, slide) =>
        sum +
        (
          slide.metrics
            ?.wordCount ||
          slide.stats
            ?.wordCount ||
          0
        ),
      0
    );

  const strengths =
    uniqueItems(
      analyzedSlides.flatMap(
        slide =>
          slide.strengths || []
      )
    ).slice(0, 5);

  const weaknesses =
    uniqueItems(
      analyzedSlides.flatMap(
        slide =>
          slide.weaknesses || []
      )
    ).slice(0, 5);

  const fixes =
    uniqueItems([
      ...priorityQueue.map(
        item => item.title
      ),

      ...analyzedSlides.flatMap(
        slide =>
          slide.fixes || []
      )
    ]).slice(0, 8);

  const weakestSlide =
    analyzedSlides
      .slice()
      .sort(
        (a, b) =>
          a.score - b.score
      )[0];

  const strongestSlide =
    analyzedSlides
      .slice()
      .sort(
        (a, b) =>
          b.score - a.score
      )[0];

  const topStrength =
    dna.topStrength ||
    engineResult
      .recommendations
      ?.strengths?.[0] ||
    strengths[0] ||
    'Presentation structure';

  const biggestOpportunity =
    dna.biggestOpportunity ||
    engineResult
      .recommendations
      ?.opportunities?.[0] ||
    weaknesses[0] ||
    'Executive clarity';

  return {
    deckName,
    fileType,
    source,

    generatedAt:
      new Date().toISOString(),

    overall,
    grade,
    readiness,
    scores,
    dna,

    priorityQueue,
    priorityFixes:
      priorityQueue,

    healthReport,

    slides:
      analyzedSlides,

    /*
     * Expose the complete deterministic
     * engine result for future debugging,
     * analytics, and AI enhancement.
     */
    engine: {
      version:
        'deterministic-v1',

      overall:
        engineResult.overall,

      dna:
        engineResult.dna,

      recommendations:
        engineResult.recommendations ||
        {
          strengths: [],
          opportunities: []
        }
    },

    metrics: {
      estimatedSlides:
        analyzedSlides.length,

      estimatedWords,

      fileSize,

      riskLevel,

      estimatedAuditTime:
        estimateAuditTime(
          analyzedSlides
        ),

      weakestSlide:
        weakestSlide?.number ??
        null,

      strongestSlide:
        strongestSlide?.number ??
        null
    },

    summary:
      `This deck is rated ${readiness.toLowerCase()} ` +
      `with an overall score of ${overall}/100. ` +
      `Presentation personality: ${dna.personality}. ` +
      `Top strength: ${topStrength}. ` +
      `Biggest opportunity: ${biggestOpportunity}.`,

    strengths,
    weaknesses,
    fixes,

    rewrite: {
      headline:
        'Executive Recommendation: Clarify the decision and next step',

      executiveSummary:
        'Use the audit findings to turn the deck into a clearer executive narrative with evidence, implications, and a visible recommendation.',

      betterBullets:
        priorityQueue
          .map(
            item =>
              item.description
          )
          .filter(Boolean)
          .slice(0, 4),

      cta:
        'Apply the priority fixes, then re-run the JD audit.'
    },

    cta: {
      title:
        'Want a human review?',

      description:
        'Get a Johken Design professional audit with slide-by-slide recommendations within 48 hours.',

      price:
        '$97 Audit'
    }
  };
}
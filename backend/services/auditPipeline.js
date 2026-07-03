import { analyzeSlide } from './slideAnalyzer.js';
import {
  calculateCategoryScores,
  calculateOverallScore,
  gradeDeck,
  executiveReadiness,
  deckRisk
} from './scoringEngine.js';
import { buildPresentationDNA } from './presentationDNA.js';
import { buildPriorityQueue } from './priorityQueue.js';
import { buildHealthReport } from './healthReport.js';
import { estimateAuditTime } from '../utils/pptParser.js';

export function auditPipeline({
  slides = [],
  deckName = 'Untitled Deck',
  fileType = 'PPTX',
  fileSize = 'Not available',
  source = 'upload'
}) {
  const safeSlides = slides.length
    ? slides
    : [{ number: 1, title: deckName, text: deckName }];

  const analyzedSlides = safeSlides.map(analyzeSlide);
  const scores = calculateCategoryScores(analyzedSlides);
  const overall = calculateOverallScore(scores);
  const grade = gradeDeck(overall);
  const readiness = executiveReadiness(overall);
  const riskLevel = deckRisk(overall);
  const dna = buildPresentationDNA(scores);
  const priorityQueue = buildPriorityQueue(analyzedSlides, scores);

  const healthReport = buildHealthReport({
    overall,
    grade,
    dna,
    scores,
    priorityQueue,
    slides: analyzedSlides
  });

  const estimatedWords = analyzedSlides.reduce((sum, slide) => {
    return sum + (slide.stats?.wordCount || 0);
  }, 0);

  return {
    deckName,
    fileType,
    source,
    generatedAt: new Date().toISOString(),

    overall,
    grade,
    readiness,
    scores,
    dna,
    priorityQueue,
    priorityFixes: priorityQueue,
    healthReport,
    slides: analyzedSlides,

    metrics: {
      estimatedSlides: analyzedSlides.length,
      estimatedWords,
      fileSize,
      riskLevel,
      estimatedAuditTime: estimateAuditTime(analyzedSlides),
      weakestSlide: analyzedSlides
        .slice()
        .sort((a, b) => a.score - b.score)[0]?.number,
      strongestSlide: analyzedSlides
        .slice()
        .sort((a, b) => b.score - a.score)[0]?.number
    },

    summary: `This deck is rated ${readiness.toLowerCase()} with an overall score of ${overall}/100. Top strength: ${dna.topStrength}. Biggest opportunity: ${dna.biggestOpportunity}.`,

    strengths: analyzedSlides.flatMap(slide => slide.strengths).slice(0, 5),
    weaknesses: analyzedSlides.flatMap(slide => slide.weaknesses).slice(0, 5),
    fixes: priorityQueue.map(item => item.title),

    rewrite: {
      headline: 'Executive Recommendation: Clarify the decision and next step',
      executiveSummary:
        'Use the audit findings to turn the deck into a clearer executive narrative with evidence, implications, and a visible recommendation.',
      betterBullets: priorityQueue.map(item => item.description).slice(0, 4),
      cta: 'Apply the priority fixes, then re-run the JD audit.'
    },

    cta: {
      title: 'Want a human review?',
      description:
        'Get a Johken Design professional audit with slide-by-slide recommendations within 48 hours.',
      price: '$97 Audit'
    }
  };
}
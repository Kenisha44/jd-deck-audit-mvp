import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';

const router = express.Router();

const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_SLIDES = 30;
const MIN_TEXT_CHARS = 8;

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowed = ['.pptx', '.pdf'];
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Only PPTX and PDF files are supported in this V1 audit.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES }
});

const WEAK_WORDS = ['good', 'bad', 'nice', 'things', 'stuff', 'very', 'really', 'basically', 'overall', 'various'];
const HEDGE_WORDS = ['maybe', 'might', 'could', 'probably', 'possibly', 'somewhat', 'kind of', 'sort of', 'appears to'];
const JARGON_WORDS = ['synergy', 'leverage', 'robust', 'enablement', 'stakeholder', 'alignment', 'strategic', 'optimize', 'streamline'];
const ACTION_WORDS = ['approve', 'decide', 'launch', 'reduce', 'increase', 'invest', 'prioritize', 'assign', 'fund', 'pause', 'expand', 'cut', 'ship'];
const RECOMMENDATION_WORDS = ['recommend', 'therefore', 'next step', 'should', 'propose', 'decision', 'approve', 'action'];
const RISK_WORDS = ['risk', 'delay', 'blocked', 'issue', 'decline', 'churn', 'miss', 'overrun', 'gap', 'constraint'];
const POSITIVE_WORDS = ['increase', 'growth', 'improved', 'higher', 'stronger', 'reduced', 'savings', 'retention', 'conversion'];

function clamp(score, min = 35, max = 98) {
  return Math.max(min, Math.min(max, Math.round(score)));
}

function countMatches(text, terms) {
  const lower = text.toLowerCase();
  return terms.reduce((count, term) => count + (lower.match(new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g')) || []).length, 0);
}

function splitWords(text = '') {
  return text.trim().split(/\s+/).filter(Boolean);
}

function splitSentences(text = '') {
  return text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 3);
}

function countBullets(text = '') {
  const lineBullets = text.split('\n').filter(line => /^\s*(•|-|\*|\d+[.)])\s+/.test(line)).length;
  const symbolBullets = (text.match(/[•]/g) || []).length;
  return Math.max(lineBullets, symbolBullets);
}

function estimateSlideCount(filePath, ext) {
  try {
    if (ext === '.pptx') {
      const zip = new AdmZip(filePath);
      return zip.getEntries().filter(entry => /^ppt\/slides\/slide\d+\.xml$/i.test(entry.entryName)).length;
    }

    if (ext === '.pdf') {
      const pdfText = fs.readFileSync(filePath, 'latin1');
      const pages = (pdfText.match(/\/Type\s*\/Page\b/g) || []).length;
      return pages || null;
    }
  } catch (error) {
    return null;
  }
  return null;
}

function analyzeText(text = '') {
  const normalized = text.replace(/\s+/g, ' ').trim();
  const words = splitWords(normalized);
  const sentences = splitSentences(normalized);
  const wordCount = words.length;
  const sentenceCount = sentences.length || (wordCount ? 1 : 0);
  const avgSentenceLength = sentenceCount ? wordCount / sentenceCount : 0;
  const longSentences = sentences.filter(s => splitWords(s).length > 22).length;
  const veryLongSentences = sentences.filter(s => splitWords(s).length > 32).length;
  const bullets = countBullets(text);
  const numbers = (normalized.match(/\b\d+(\.\d+)?%?\b/g) || []).length;
  const money = (normalized.match(/[$€£]\s?\d|\b\d+(\.\d+)?\s?(k|m|million|billion)\b/gi) || []).length;
  const dates = (normalized.match(/\b(q[1-4]|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|202\d|203\d)\b/gi) || []).length;
  const weakWords = countMatches(normalized, WEAK_WORDS);
  const hedgeWords = countMatches(normalized, HEDGE_WORDS);
  const jargonWords = countMatches(normalized, JARGON_WORDS);
  const actionWords = countMatches(normalized, ACTION_WORDS);
  const recommendationWords = countMatches(normalized, RECOMMENDATION_WORDS);
  const riskWords = countMatches(normalized, RISK_WORDS);
  const positiveWords = countMatches(normalized, POSITIVE_WORDS);
  const hasQuestion = /\?/.test(normalized);
  const hasColonHeadline = /:/.test(normalized.slice(0, 120));
  const titleCaseOveruse = (normalized.match(/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g) || []).length > 5;

  return {
    wordCount,
    sentenceCount,
    avgSentenceLength,
    longSentences,
    veryLongSentences,
    bullets,
    numbers,
    money,
    dates,
    weakWords,
    hedgeWords,
    jargonWords,
    actionWords,
    recommendationWords,
    riskWords,
    positiveWords,
    hasQuestion,
    hasColonHeadline,
    titleCaseOveruse
  };
}

function scoreFromStats(stats, source = 'text') {
  const densityPenalty = stats.wordCount > 120 ? 16 : stats.wordCount > 80 ? 8 : stats.wordCount < 12 ? 10 : 0;
  const sentencePenalty = stats.avgSentenceLength > 30 ? 14 : stats.avgSentenceLength > 22 ? 8 : stats.avgSentenceLength < 6 && stats.wordCount > 20 ? 3 : 0;
  const longPenalty = stats.longSentences * 4 + stats.veryLongSentences * 4;
  const bulletPenalty = stats.bullets > 7 ? 9 : stats.bullets > 5 ? 5 : 0;
  const evidenceBoost = Math.min(14, stats.numbers * 3 + stats.money * 3 + stats.dates * 1.5);
  const actionBoost = Math.min(12, stats.actionWords * 3 + stats.recommendationWords * 4);
  const jargonPenalty = stats.jargonWords * 4;
  const hedgePenalty = stats.hedgeWords * 5;
  const weakPenalty = stats.weakWords * 3;
  const riskBoost = Math.min(7, stats.riskWords * 2);

  return {
    clarity: clamp(86 - densityPenalty - sentencePenalty - longPenalty - jargonPenalty - hedgePenalty - weakPenalty + (stats.bullets >= 2 && stats.bullets <= 5 ? 4 : 0)),
    storytelling: clamp(70 + evidenceBoost + riskBoost + (stats.positiveWords ? 4 : 0) - densityPenalty * 0.45 - (stats.recommendationWords ? 0 : 8)),
    executiveReadiness: clamp(76 + evidenceBoost * 0.7 + actionBoost - hedgePenalty - weakPenalty - jargonPenalty - sentencePenalty),
    visualSimplicity: clamp(88 - densityPenalty - bulletPenalty - longPenalty - (stats.wordCount > 180 ? 12 : 0)),
    dataStorytelling: clamp(58 + evidenceBoost * 2.2 + (stats.money ? 6 : 0) + (stats.dates ? 4 : 0) - jargonPenalty),
    actionability: clamp(62 + actionBoost * 2 + (stats.recommendationWords ? 8 : 0) - hedgePenalty - (stats.actionWords ? 0 : 10))
  };
}

function gradeFromOverall(overall) {
  if (overall >= 90) return 'Boardroom Ready';
  if (overall >= 82) return 'Executive Ready with Minor Edits';
  if (overall >= 74) return 'Strong Foundation';
  if (overall >= 65) return 'Needs Executive Polish';
  return 'Needs Redesign';
}

function densityLabel(stats) {
  if (stats.wordCount > 160 || stats.bullets > 8) return 'High';
  if (stats.wordCount > 70 || stats.bullets > 5) return 'Medium';
  return 'Low';
}

function riskLabel(overall, stats) {
  if (overall < 65 || stats.hedgeWords > 2 || stats.longSentences > 2) return 'High';
  if (overall < 78 || stats.wordCount > 120 || !stats.recommendationWords) return 'Moderate';
  return 'Low';
}

function unique(list, limit = 5) {
  return [...new Set(list)].slice(0, limit);
}

function buildFindings(stats, scores, source) {
  const strengths = [];
  const weaknesses = [];
  const fixes = [];

  if (stats.numbers || stats.money) strengths.push(`Includes ${stats.numbers + stats.money} quantitative signal${stats.numbers + stats.money === 1 ? '' : 's'}, which gives the audience evidence to trust.`);
  else weaknesses.push('No clear metrics were detected, so the message may feel opinion-based instead of evidence-led.');

  if (stats.actionWords || stats.recommendationWords) strengths.push('Contains action-oriented language that can support a decision-focused executive slide.');
  else weaknesses.push('No clear recommendation or decision language was detected.');

  if (stats.avgSentenceLength && stats.avgSentenceLength <= 18) strengths.push(`Average sentence length is ${Math.round(stats.avgSentenceLength)} words, which is easy to scan.`);
  if (stats.avgSentenceLength > 22) weaknesses.push(`Average sentence length is ${Math.round(stats.avgSentenceLength)} words; executives may need a faster scan path.`);

  if (stats.longSentences) weaknesses.push(`${stats.longSentences} long sentence${stats.longSentences === 1 ? '' : 's'} detected; split them into insight + implication.`);
  if (stats.bullets >= 2 && stats.bullets <= 5) strengths.push(`Bullet structure is within a useful executive range (${stats.bullets} bullets).`);
  if (stats.bullets > 6) weaknesses.push(`${stats.bullets} bullets detected; this may read like notes instead of a decision slide.`);
  if (stats.hedgeWords) weaknesses.push(`${stats.hedgeWords} hedging phrase${stats.hedgeWords === 1 ? '' : 's'} detected; replace uncertainty with evidence or a clear ask.`);
  if (stats.weakWords) weaknesses.push(`${stats.weakWords} weak/general word${stats.weakWords === 1 ? '' : 's'} detected; use specific business language.`);
  if (stats.jargonWords > 1) weaknesses.push(`${stats.jargonWords} jargon term${stats.jargonWords === 1 ? '' : 's'} detected; simplify for executive clarity.`);
  if (stats.riskWords) strengths.push('Risk or constraint language is present, which can help frame urgency.');

  if (scores.dataStorytelling < 75) fixes.push('Add one concrete metric, benchmark, or trend so the audience can see why the message matters.');
  if (scores.actionability < 75) fixes.push('End with a decision, owner, timeline, or next step.');
  if (scores.clarity < 78) fixes.push('Rewrite the headline as a conclusion rather than a topic label.');
  if (scores.visualSimplicity < 78) fixes.push('Reduce the slide to one core idea and move supporting detail to notes or appendix.');
  if (stats.hedgeWords || stats.weakWords) fixes.push('Replace vague words like “good,” “things,” “maybe,” or “very” with measurable business language.');
  if (stats.longSentences) fixes.push('Split long sentences into short executive bullets: context, insight, recommendation.');
  if (stats.bullets > 6) fixes.push('Group bullets into three buckets: What changed, why it matters, what to do next.');

  if (!fixes.length) fixes.push('Keep the structure, then sharpen the final recommendation and make the next decision unmistakable.');

  return {
    strengths: unique(strengths.length ? strengths : ['The content has enough raw material to become an executive-ready message.'], 5),
    weaknesses: unique(weaknesses.length ? weaknesses : ['The message is solid, but the recommendation can be made more explicit.'], 5),
    fixes: unique(fixes, 6)
  };
}

function buildRewrite({ title = 'Executive Update', text = '', stats, scores }) {
  const lower = text.toLowerCase();
  let headline = 'Executive Recommendation: Clarify the decision and next step';

  if (lower.includes('revenue') || lower.includes('sales')) headline = 'Revenue Momentum: Prioritize the highest-return growth drivers';
  else if (lower.includes('churn') || lower.includes('retention')) headline = 'Retention Risk: Focus intervention on the accounts most likely to churn';
  else if (lower.includes('cost') || lower.includes('budget')) headline = 'Cost Control: Reallocate spend toward measurable business impact';
  else if (lower.includes('launch') || lower.includes('roadmap')) headline = 'Launch Readiness: Remove blockers before the next milestone';
  else if (stats.riskWords) headline = 'Risk Update: Resolve the highest-impact constraint first';
  else if (stats.numbers) headline = 'Performance Update: Turn the metric into a clear executive decision';

  const summaryParts = [];
  if (stats.numbers || stats.money) summaryParts.push('The slide includes useful evidence, but the numbers should be tied directly to the business implication.');
  else summaryParts.push('The slide needs stronger evidence so the audience can understand the size and urgency of the issue.');
  if (stats.recommendationWords || stats.actionWords) summaryParts.push('The action direction is present; make the owner, timeline, and decision request more explicit.');
  else summaryParts.push('Add a clear recommendation so the audience knows what decision is needed next.');
  if (stats.longSentences || stats.wordCount > 90) summaryParts.push('Shorten the copy so the slide can be scanned in under ten seconds.');

  const bullets = [];
  if (stats.numbers || stats.money) bullets.push('Lead with the most important metric and explain what changed.');
  else bullets.push('Add one metric, benchmark, or trend to support the claim.');
  if (stats.riskWords) bullets.push('Separate the risk from the recommended mitigation.');
  if (stats.hedgeWords) bullets.push('Remove hedging and replace it with evidence-backed language.');
  if (stats.bullets > 6) bullets.push('Consolidate bullets into three executive takeaways.');
  bullets.push('Close with a decision, owner, and next milestone.');

  return {
    headline,
    executiveSummary: summaryParts.join(' '),
    betterBullets: unique(bullets, 4),
    cta: scores.actionability < 75 ? 'Ask the audience to approve a specific next step.' : 'Confirm the next owner and execution timeline.'
  };
}

function presentationDNA(scores) {
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return {
    topStrength: labelForScore(entries[0][0]),
    biggestOpportunity: labelForScore(entries[entries.length - 1][0]),
    profile: entries.map(([key, value]) => ({ key, label: labelForScore(key), score: value }))
  };
}

function labelForScore(key) {
  return ({
    clarity: 'Clarity',
    storytelling: 'Storytelling',
    executiveReadiness: 'Executive Readiness',
    visualSimplicity: 'Visual Simplicity',
    dataStorytelling: 'Data Storytelling',
    actionability: 'Actionability'
  })[key] || key;
}

function createAudit({ name = 'Untitled Deck', text = '', source = 'file', slideCount = null } = {}) {
  const extension = path.extname(name).toUpperCase().replace('.', '') || (source === 'text' ? 'TEXT' : 'DECK');
  const workingText = text || name.replace(/[-_]/g, ' ');
  const stats = analyzeText(workingText);
  const scores = scoreFromStats(stats, source);
  const overall = clamp(Object.values(scores).reduce((sum, value) => sum + value, 0) / Object.values(scores).length);
  const grade = gradeFromOverall(overall);
  const findings = buildFindings(stats, scores, source);
  const dna = presentationDNA(scores);

  return {
    deckName: name,
    fileType: extension,
    source,
    generatedAt: new Date().toISOString(),
    overall,
    grade,
    scores,
    dna,
    metrics: {
      estimatedSlides: slideCount || (source === 'text' ? Math.max(1, Math.ceil(stats.wordCount / 85)) : null),
      estimatedWords: stats.wordCount,
      textDensity: densityLabel(stats),
      riskLevel: riskLabel(overall, stats),
      avgSentenceLength: Math.round(stats.avgSentenceLength || 0),
      longSentences: stats.longSentences,
      numericSignals: stats.numbers + stats.money,
      actionSignals: stats.actionWords + stats.recommendationWords,
      hedgeSignals: stats.hedgeWords,
      jargonSignals: stats.jargonWords
    },
    summary: `This ${source === 'text' ? 'slide copy' : 'deck'} is rated ${grade.toLowerCase()}. Top strength: ${dna.topStrength}. Biggest opportunity: ${dna.biggestOpportunity}. The fastest improvement path is to pair clearer takeaway headlines with evidence, recommendation language, and a visible next decision.`,
    strengths: findings.strengths,
    weaknesses: findings.weaknesses,
    fixes: findings.fixes,
    rewrite: buildRewrite({ title: name, text: workingText, stats, scores }),
    cta: {
      title: slideCount && slideCount > 20 ? 'Need a full deck review?' : 'Want a human review?',
      description: slideCount && slideCount > 20
        ? 'This deck is within V1 limits, but larger decks benefit from a JD professional audit with slide-by-slide notes.'
        : 'Get a Johken Design professional audit with slide-by-slide recommendations within 48 hours.',
      price: '$97 Audit'
    }
  };
}

function handleUploadError(error, req, res, next) {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: `This V1 audit supports files up to ${MAX_FILE_SIZE_MB}MB. Please upload a smaller deck or request a Professional Deck Audit.`
    });
  }

  if (error) {
    return res.status(400).json({ error: error.message || 'Upload failed. Please try a PPTX or PDF file.' });
  }

  next();
}

router.post('/', (req, res, next) => {
  upload.single('deck')(req, res, error => handleUploadError(error, req, res, next));
}, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a PPTX or PDF deck.' });
  }

  const ext = path.extname(req.file.originalname).toLowerCase();
  const slideCount = estimateSlideCount(req.file.path, ext);

  if (slideCount && slideCount > MAX_SLIDES) {
    return res.status(413).json({
      error: `This V1 audit supports decks up to ${MAX_SLIDES} slides. Your file appears to have ${slideCount} slides. Split the deck into a smaller section or request a Professional Deck Audit.`
    });
  }

  res.json(createAudit({ name: req.file.originalname, source: 'file', slideCount }));
});

router.post('/text', (req, res) => {
  const { title = 'Pasted Slide Copy', text = '' } = req.body || {};
  if (!text.trim() || text.trim().length < MIN_TEXT_CHARS) {
    return res.status(400).json({ error: 'Please paste at least one complete sentence or a few slide bullets.' });
  }
  res.json(createAudit({ name: title, text, source: 'text' }));
});

router.post('/rewrite', (req, res) => {
  const { title = 'Executive Update', text = '' } = req.body || {};
  const stats = analyzeText(text || title);
  const scores = scoreFromStats(stats, 'text');
  res.json(buildRewrite({ title, text, stats, scores }));
});

router.get('/demo', (req, res) => {
  const demoText = `Q3 revenue increased 18% year over year, but enterprise churn rose to 7%. Customer interviews show onboarding delays are the main constraint. We recommend prioritizing onboarding automation before expanding the outbound sales campaign in Q4.`;
  res.json(createAudit({ name: 'Demo Executive Deck.pptx', text: demoText, source: 'demo', slideCount: 8 }));
});

export default router;

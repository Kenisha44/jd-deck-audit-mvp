import {
    ACTION_WORDS,
    HEDGE_WORDS,
    JARGON_WORDS,
    POSITIVE_WORDS,
    RECOMMENDATION_WORDS,
    RISK_WORDS,
    WEAK_WORDS
  } from '../utils/constants.js';
  
  import {
    clamp,
    countBullets,
    countMatches,
    splitSentences,
    splitWords,
    unique
  } from '../utils/textHelpers.js';
  
  export function analyzeText(text = '') {
    const normalized = text.replace(/\s+/g, ' ').trim();
    const words = splitWords(normalized);
    const sentences = splitSentences(normalized);
  
    const wordCount = words.length;
    const sentenceCount = sentences.length || (wordCount ? 1 : 0);
    const avgSentenceLength = sentenceCount ? wordCount / sentenceCount : 0;
  
    return {
      wordCount,
      sentenceCount,
      avgSentenceLength,
      longSentences: sentences.filter(s => splitWords(s).length > 22).length,
      veryLongSentences: sentences.filter(s => splitWords(s).length > 32).length,
      bullets: countBullets(text),
      numbers: (normalized.match(/\b\d+(\.\d+)?%?\b/g) || []).length,
      money: (normalized.match(/[$€£]\s?\d|\b\d+(\.\d+)?\s?(k|m|million|billion)\b/gi) || []).length,
      dates: (normalized.match(/\b(q[1-4]|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|202\d|203\d)\b/gi) || []).length,
      weakWords: countMatches(normalized, WEAK_WORDS),
      hedgeWords: countMatches(normalized, HEDGE_WORDS),
      jargonWords: countMatches(normalized, JARGON_WORDS),
      actionWords: countMatches(normalized, ACTION_WORDS),
      recommendationWords: countMatches(normalized, RECOMMENDATION_WORDS),
      riskWords: countMatches(normalized, RISK_WORDS),
      positiveWords: countMatches(normalized, POSITIVE_WORDS)
    };
  }
  
  export function scoreSlide(stats) {
    const densityPenalty =
      stats.wordCount > 120 ? 16 :
      stats.wordCount > 80 ? 8 :
      stats.wordCount < 12 ? 10 : 0;
  
    const sentencePenalty =
      stats.avgSentenceLength > 30 ? 14 :
      stats.avgSentenceLength > 22 ? 8 :
      stats.avgSentenceLength < 6 && stats.wordCount > 20 ? 3 : 0;
  
    const longPenalty = stats.longSentences * 4 + stats.veryLongSentences * 4;
    const bulletPenalty = stats.bullets > 7 ? 9 : stats.bullets > 5 ? 5 : 0;
  
    const evidenceBoost = Math.min(
      14,
      stats.numbers * 3 + stats.money * 3 + stats.dates * 1.5
    );
  
    const actionBoost = Math.min(
      12,
      stats.actionWords * 3 + stats.recommendationWords * 4
    );
  
    const jargonPenalty = stats.jargonWords * 4;
    const hedgePenalty = stats.hedgeWords * 5;
    const weakPenalty = stats.weakWords * 3;
    const riskBoost = Math.min(7, stats.riskWords * 2);
  
    return {
      clarity: clamp(
        86 -
        densityPenalty -
        sentencePenalty -
        longPenalty -
        jargonPenalty -
        hedgePenalty -
        weakPenalty +
        (stats.bullets >= 2 && stats.bullets <= 5 ? 4 : 0)
      ),
  
      storytelling: clamp(
        70 +
        evidenceBoost +
        riskBoost +
        (stats.positiveWords ? 4 : 0) -
        densityPenalty * 0.45 -
        (stats.recommendationWords ? 0 : 8)
      ),
  
      executiveReadiness: clamp(
        76 +
        evidenceBoost * 0.7 +
        actionBoost -
        hedgePenalty -
        weakPenalty -
        jargonPenalty -
        sentencePenalty
      ),
  
      visualSimplicity: clamp(
        88 -
        densityPenalty -
        bulletPenalty -
        longPenalty -
        (stats.wordCount > 180 ? 12 : 0)
      ),
  
      dataStorytelling: clamp(
        58 +
        evidenceBoost * 2.2 +
        (stats.money ? 6 : 0) +
        (stats.dates ? 4 : 0) -
        jargonPenalty
      ),
  
      actionability: clamp(
        62 +
        actionBoost * 2 +
        (stats.recommendationWords ? 8 : 0) -
        hedgePenalty -
        (stats.actionWords ? 0 : 10)
      )
    };
  }
  
  export function buildFindings(stats, scores) {
    const strengths = [];
    const weaknesses = [];
    const fixes = [];
  
    if (stats.numbers || stats.money) {
      strengths.push(`Includes ${stats.numbers + stats.money} quantitative signal(s), which gives the audience evidence to trust.`);
    } else {
      weaknesses.push('No clear metrics were detected, so the message may feel opinion-based instead of evidence-led.');
    }
  
    if (stats.actionWords || stats.recommendationWords) {
      strengths.push('Contains action-oriented language that can support a decision-focused executive slide.');
    } else {
      weaknesses.push('No clear recommendation or decision language was detected.');
    }
  
    if (stats.avgSentenceLength && stats.avgSentenceLength <= 18) {
      strengths.push(`Average sentence length is ${Math.round(stats.avgSentenceLength)} words, which is easy to scan.`);
    }
  
    if (stats.avgSentenceLength > 22) {
      weaknesses.push(`Average sentence length is ${Math.round(stats.avgSentenceLength)} words; executives may need a faster scan path.`);
    }
  
    if (stats.longSentences) {
      weaknesses.push(`${stats.longSentences} long sentence(s) detected; split them into insight + implication.`);
    }
  
    if (stats.bullets >= 2 && stats.bullets <= 5) {
      strengths.push(`Bullet structure is within a useful executive range (${stats.bullets} bullets).`);
    }
  
    if (stats.bullets > 6) {
      weaknesses.push(`${stats.bullets} bullets detected; this may read like notes instead of a decision slide.`);
    }
  
    if (stats.hedgeWords) {
      weaknesses.push(`${stats.hedgeWords} hedging phrase(s) detected; replace uncertainty with evidence or a clear ask.`);
    }
  
    if (stats.weakWords) {
      weaknesses.push(`${stats.weakWords} weak/general word(s) detected; use specific business language.`);
    }
  
    if (stats.jargonWords > 1) {
      weaknesses.push(`${stats.jargonWords} jargon term(s) detected; simplify for executive clarity.`);
    }
  
    if (scores.dataStorytelling < 75) {
      fixes.push('Add one concrete metric, benchmark, or trend so the audience can see why the message matters.');
    }
  
    if (scores.actionability < 75) {
      fixes.push('End with a decision, owner, timeline, or next step.');
    }
  
    if (scores.clarity < 78) {
      fixes.push('Rewrite the headline as a conclusion rather than a topic label.');
    }
  
    if (scores.visualSimplicity < 78) {
      fixes.push('Reduce the slide to one core idea and move supporting detail to notes or appendix.');
    }
  
    if (stats.hedgeWords || stats.weakWords) {
      fixes.push('Replace vague words with measurable business language.');
    }
  
    if (stats.longSentences) {
      fixes.push('Split long sentences into short executive bullets: context, insight, recommendation.');
    }
  
    if (!fixes.length) {
      fixes.push('Keep the structure, then sharpen the final recommendation and make the next decision unmistakable.');
    }
  
    return {
      strengths: unique(strengths.length ? strengths : ['The content has enough raw material to become executive-ready.'], 5),
      weaknesses: unique(weaknesses.length ? weaknesses : ['The message is solid, but the recommendation can be more explicit.'], 5),
      fixes: unique(fixes, 6)
    };
  }
  
  export function analyzeSlide(slide) {
    const stats = analyzeText(slide.text || slide.title || '');
    const scores = scoreSlide(stats);
    const overall = clamp(
      Object.values(scores).reduce((sum, value) => sum + value, 0) /
      Object.values(scores).length
    );
  
    const findings = buildFindings(stats, scores);
  
    return {
      number: slide.number,
      title: slide.title || `Slide ${slide.number}`,
      text: slide.text || '',
      score: overall,
      scores,
      stats,
      strengths: findings.strengths,
      weaknesses: findings.weaknesses,
      fixes: findings.fixes,
      summary: `${findings.weaknesses[0] || findings.strengths[0]}`
    };
  }
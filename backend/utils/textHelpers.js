export function clamp(score, min = 35, max = 98) {
    return Math.max(min, Math.min(max, Math.round(score)));
  }
  
  export function countMatches(text = '', terms = []) {
    const lower = text.toLowerCase();
  
    return terms.reduce((count, term) => {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matches = lower.match(new RegExp(`\\b${escaped}\\b`, 'g')) || [];
      return count + matches.length;
    }, 0);
  }
  
  export function splitWords(text = '') {
    return text.trim().split(/\s+/).filter(Boolean);
  }
  
  export function splitSentences(text = '') {
    return text
      .split(/[.!?]+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 3);
  }
  
  export function countBullets(text = '') {
    const lineBullets = text
      .split('\n')
      .filter(line => /^\s*(•|-|\*|\d+[.)])\s+/.test(line)).length;
  
    const symbolBullets = (text.match(/[•]/g) || []).length;
  
    return Math.max(lineBullets, symbolBullets);
  }
  
  export function decodeXmlText(value = '') {
    return value
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  export function unique(list = [], limit = 5) {
    return [...new Set(list.filter(Boolean))].slice(0, limit);
  }
export function countWords(text = '') {
    return text
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .length;
  }
  
  export function countCharacters(text = '') {
    return text.length;
  }
  
  export function countSentences(text = '') {
    return text
      .split(/[.!?]+/)
      .filter(s => s.trim())
      .length;
  }
  
  export function averageSentenceLength(text = '') {
  
    const words = countWords(text);
  
    const sentences =
      Math.max(
        countSentences(text),
        1
      );
  
    return Number(
      (words / sentences)
        .toFixed(1)
    );
  
  }
  
  export function countBullets(text=''){
  
      return text
          .split('\n')
          .filter(line=>
  
              line.trim().startsWith('-') ||
  
              line.trim().startsWith('•') ||
  
              /^\d+\./.test(line.trim())
  
          ).length;
  
  }
  
  export function estimateReadTime(text=''){
  
      const words=
          countWords(text);
  
      return Math.max(
          1,
          Math.ceil(words/200)
      );
  
  }
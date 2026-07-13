function clamp(score) {
    return Math.max(0, Math.min(100, Math.round(score)));
  }
  
  export function analyzeVisualStructure(slide = {}) {
  
    const text = slide.text || "";
  
    const wordCount =
      text
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length;
  
    const bulletCount =
      text
        .split("\n")
        .filter(line =>
          /^[-•\d]/.test(line.trim())
        ).length;
  
    const lineCount =
      text
        .split("\n")
        .filter(Boolean)
        .length;
  
    /*
     * Placeholder values.
     * These will become real values
     * once the parser extracts shapes.
     */
  
    const imageCount = 0;
    const chartCount = 0;
    const tableCount = 0;
    const shapeCount = 0;
  
    let visualDensity = 100;
  
    if (wordCount > 75)
      visualDensity -= 15;
  
    if (wordCount > 120)
      visualDensity -= 20;
  
    if (bulletCount > 6)
      visualDensity -= 10;
  
    if (lineCount > 10)
      visualDensity -= 10;
  
    const whitespace =
      clamp(100 - (100 - visualDensity));
  
    return {
  
      wordCount,
  
      bulletCount,
  
      lineCount,
  
      imageCount,
  
      chartCount,
  
      tableCount,
  
      shapeCount,
  
      visualDensity:
        clamp(visualDensity),
  
      whitespace
  
    };
  
  }
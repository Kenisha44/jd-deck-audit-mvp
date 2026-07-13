function clamp(value) {
    return Math.max(
      0,
      Math.min(100, Math.round(value))
    );
  }
  
  export function buildPresentationDNA(slides = []) {
  
    if (!slides.length) {
  
      return {
  
        executiveCommunication: 0,
  
        visualSimplicity: 0,
  
        businessStorytelling: 0,
  
        decisionReadiness: 0,
  
        dataConfidence: 0,
  
        personality: "Unknown"
  
      };
  
    }
  
    const average = key =>
  
      clamp(
  
        slides.reduce(
  
          (sum, slide) =>
  
            sum + (slide.scores?.[key] || 0),
  
          0
  
        ) / slides.length
  
      );
  
    const executiveCommunication =
      average("executiveCommunication");
  
    const visualSimplicity =
      average("visualSimplicity");
  
    const businessStorytelling =
      average("storytelling");
  
    const decisionReadiness =
      average("actionability");
  
    const dataConfidence =
      average("dataStorytelling");
  
    return {
  
      executiveCommunication,
  
      visualSimplicity,
  
      businessStorytelling,
  
      decisionReadiness,
  
      dataConfidence,
  
      personality:
        determinePersonality({
  
          executiveCommunication,
  
          visualSimplicity,
  
          businessStorytelling,
  
          decisionReadiness,
  
          dataConfidence
  
        })
  
    };
  
  }
  
  function determinePersonality(dna){
  
    if(
  
      dna.executiveCommunication>90 &&
  
      dna.decisionReadiness>85
  
    ){
  
      return "Executive Ready";
  
    }
  
    if(
  
      dna.dataConfidence>90
  
    ){
  
      return "Data Driven";
  
    }
  
    if(
  
      dna.businessStorytelling>88
  
    ){
  
      return "Strategic Storyteller";
  
    }
  
    if(
  
      dna.visualSimplicity>90
  
    ){
  
      return "Minimalist Presenter";
  
    }
  
    if(
  
      dna.executiveCommunication<65 &&
  
      dna.decisionReadiness<65
  
    ){
  
      return "Needs Executive Focus";
  
    }
  
    return "Balanced";
  
  }
import {
    analyzeDeck
  } from './analyzeDeck.js';
  
  const sampleSlides = [
    {
      number: 1,
      title:
        'Revenue increased 34% year over year',
  
      text:
        `Revenue increased 34%.
  
  • Europe grew 20%.
  • APAC grew 42%.
  • Enterprise renewals drove growth.
  
  Recommendation: invest in enterprise expansion.`
    },
  
    {
      number: 2,
      title:
        'Campaign Performance',
  
      text:
        `The campaign was executed across several different channels and was supported by a number of stakeholders. The work was completed and results were reviewed by the team.`
    }
  ];
  
  console.dir(
    analyzeDeck(sampleSlides),
    {
      depth: null
    }
  );
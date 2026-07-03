import fs from "fs";
import AdmZip from "adm-zip";

import { decodeXmlText } from "./textHelpers.js";

export function extractSlides(filePath) {
  try {
    const zip = new AdmZip(filePath);

    const slideEntries = zip
      .getEntries()
      .filter(entry =>
        /^ppt\/slides\/slide\d+\.xml$/i.test(entry.entryName)
      )
      .sort((a, b) => {
        const aNum = Number(
          a.entryName.match(/slide(\d+)\.xml/i)?.[1] || 0
        );

        const bNum = Number(
          b.entryName.match(/slide(\d+)\.xml/i)?.[1] || 0
        );

        return aNum - bNum;
      });

    return slideEntries.map((entry, index) => {

      const xml = entry.getData().toString("utf8");

      const matches = [
        ...xml.matchAll(/<a:t[^>]*>(.*?)<\/a:t>/g)
      ].map(match => decodeXmlText(match[1]));

      const text = matches
        .filter(Boolean)
        .join(" ")
        .trim();

      const title =
        matches.find(x => x.length > 5 && x.length < 80) ||
        `Slide ${index + 1}`;

      return {
        number: index + 1,
        title,
        text
      };
    });

  } catch (err) {

    console.error("PPT Parse Error:", err.message);

    return [];
  }
}

export function estimateSlideCount(filePath) {

  const slides = extractSlides(filePath);

  return slides.length;
}

export function estimateWordCount(slides = []) {

  return slides.reduce((sum, slide) => {

    return (
      sum +
      slide.text
        .split(/\s+/)
        .filter(Boolean)
        .length
    );

  }, 0);

}

export function estimateAuditTime(slides = []) {

  if (slides.length < 10)
    return "5–10 seconds";

  if (slides.length < 20)
    return "10–20 seconds";

  return "20–30 seconds";
}
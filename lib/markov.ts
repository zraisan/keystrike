"use server";

import { readFileSync, writeFileSync } from "fs";

function prepareData(filePath: string): Object {
  const data = readFileSync(filePath, "utf-8");
  const lines = data.split("\n").filter((line) => line.trim().length > 0);
  const wordCounts = lines.map((line: string) => line.split(" ").length);
  const markovData = lines.map((line, index) => {
    const words = line.split(" ");
    let result: { [key: string]: string } = {};
    for (let i = 0; i < words.length - 1; i++) {
      const firstWord = words[i].replace(/[\/#!$%\^&\*:{}=\-_`~()\s+]/g, "");
      const secondWord = words[i + 1].replace(
        /[\/#!$%\^&\*;:{}=\-_`~()\s+]/g,
        ""
      );
      result[firstWord] = secondWord;
    }
    return result;
  });
  let result: { [key: string]: string[] } = {};
  for (let i = 0; i < markovData.length; i++) {
    for (let [key, value] of Object.entries(markovData[i])) {
      result[key] = result[key] || [];
      if (!result[key].includes(value)) {
        result[key].push(value);
      }
    }
  }
  writeFileSync("lib/markov.json", JSON.stringify(result, null, 2));
  return result;
}

export default async function generateParagraph(
  maxWords: number
): Promise<string> {
  const data = JSON.parse(readFileSync("lib/markov.json", "utf-8"));
  const words = Object.keys(data);
  if (words.length === 0) return "";
  let currentWord = words[Math.floor(Math.random() * words.length)];
  let paragraph = "";
  for (let i = 0; i < maxWords; i++) {
    if (currentWord.length > 0) paragraph += currentWord + " ";
    const nextWords = data[currentWord];
    if (!nextWords) break;
    currentWord = nextWords[Math.floor(Math.random() * nextWords.length)];
  }
  return paragraph.trim();
}

prepareData("lib/para.txt");

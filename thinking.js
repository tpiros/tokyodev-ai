import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const systemInstruction = 'Keep your answers short and concise.';
const prompt = 'What is Star Wars?';

let thoughts = '';
let answer = '';

const response = await genAI.models.generateContentStream({
  model: 'gemini-2.5-flash',
  contents: prompt,
  config: {
    systemInstruction,
    thinkingConfig: {
      thinkBudget: -1,
      includeThoughts: true,
    },
  },
});

for await (const chunk of response) {
  for (const part of chunk.candidates[0].content.parts) {
    if (!part.text) {
      continue;
    } else if (part.thought) {
      if (!thoughts) {
        console.log('Thoughts summary:');
      }
      console.log(part.text);
      thoughts = thoughts + part.text;
    } else {
      if (!answer) {
        console.log('Answer:');
      }
      console.log(part.text);
      answer = answer + part.text;
    }
  }
}

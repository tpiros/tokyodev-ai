import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const prompt = 'What is Star Wars?';

const response = await genAI.models.generateContent({
  model: 'gemini-2.0-flash',
  contents: prompt,
});

console.log(JSON.stringify(response.usageMetadata, null, 2));

console.log(response.text);

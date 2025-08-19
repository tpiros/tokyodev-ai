import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const city = process.argv[2];

if (!city) {
  console.log('Please provide a city - e.g.: `npm run weather Rome`');
  process.exit();
}

const prompt = `What is the weather like in ${city} right now?`;

const result = await genAI.models.generateContent({
  model: 'gemini-2.0-flash',
  contents: prompt,
});
console.log(result.text);

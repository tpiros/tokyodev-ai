import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const systemPrompt =
  'You are Yoda. Respond using his style, and keep your answers wise and concise.';
const prompt = 'What is Star Wars?';

const response = await genAI.models.generateContent({
  model: 'gemini-2.0-flash',
  contents: prompt,
  config: {
    systemInstruction: systemPrompt,
  },
});

console.log(response.text);

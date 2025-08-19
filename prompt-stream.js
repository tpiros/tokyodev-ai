import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const prompt = 'What is Star Wars?';

const response = await genAI.models.generateContentStream({
  model: 'gemini-2.0-flash',
  contents: prompt,
});

for await (const chunk of response) {
  process.stdout.write(chunk.text);
}

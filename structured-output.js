import { GoogleGenAI, Type } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const schema = {
  description: 'Array of original Star Wars films with details',
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'Title of the film',
        nullable: false,
      },
      released: {
        type: Type.STRING,
        description: 'Release date of the film',
        nullable: false,
      },
      characters: {
        type: Type.STRING,
        description: 'Notable characters in the film',
        nullable: false,
      },
      plot: {
        type: Type.STRING,
        description: "Short summary of the film's plot",
        nullable: false,
      },
    },
    required: ['title', 'released', 'characters', 'plot'],
  },
};

const prompt = 'Display information about the original three Star Wars films.';

const result = await genAI.models.generateContent({
  model: 'gemini-2.0-flash',
  contents: prompt,
  config: {
    responseMimeType: 'application/json',
    responseSchema: schema,
  },
});

console.log(JSON.parse(result.text));

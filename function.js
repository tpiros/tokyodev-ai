import { GoogleGenAI } from '@google/genai';
import { getWeather } from './get-weather.js';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const city = process.argv[2];

if (!city) {
  console.log('Please provide a city - e.g.: `npm run weather Rome`');
  process.exit();
}

const weatherLookupFunction = {
  name: 'getWeather',
  description:
    'gets the weather for a city and returns the current weather info using the metric system.',
  parameters: {
    type: 'object',
    properties: {
      city: {
        type: 'string',
        description: 'the city for which the weather is requested',
      },
    },
    required: ['city'],
  },
};

const prompt = `What is the weather like in ${city} right now?`;
const contents = [
  {
    role: 'user',
    parts: [{ text: prompt }],
  },
];

const config = {
  tools: [
    {
      functionDeclarations: [weatherLookupFunction],
    },
  ],
};

const response = await genAI.models.generateContent({
  model: 'gemini-2.0-flash',
  contents: prompt,
  config,
});

console.log(JSON.stringify({ response }, null, 2));

if (response.functionCalls && response.functionCalls.length > 0) {
  const functionCall = response.functionCalls[0];
  console.log(`Function to call: ${functionCall.name}`);
  console.log(`Arguments: ${JSON.stringify(functionCall.args)}`);
  const weatherFunctionResult = await getWeather(functionCall.args.city);
  const functionResponse = {
    name: functionCall.name,
    response: { weatherFunctionResult },
  };

  contents.push({ role: 'model', parts: [{ functionCall }] });
  contents.push({ role: 'model', parts: [{ functionResponse }] });
  const finalResponse = await genAI.models.generateContent({
    model: 'gemini-2.0-flash',
    contents,
    config,
  });
  console.log(finalResponse.text);
} else {
  console.log('No function call found in the response.');
  console.log(response.text);
}

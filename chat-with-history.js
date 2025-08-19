import { GoogleGenAI } from '@google/genai';
import readline from 'node:readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const history = [
  {
    role: 'user',
    parts: [
      {
        text: 'My name is Tamas and I love Star Wars, in particular the Empire Strikes Back.',
      },
    ],
  },
  {
    role: 'model',
    parts: [
      {
        text: 'Thank you.',
      },
    ],
  },
];

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const chat = genAI.chats.create({
  model: 'gemini-2.0-flash',
  history,
});

async function handleUserInput() {
  rl.question('You: ', async (userInput) => {
    if (userInput.toLowerCase() === 'exit') {
      console.log('Goodbye!');
      rl.close();
      return;
    }

    let response = await chat.sendMessageStream({ message: userInput });
    console.log('Model:');

    for await (const chunk of response) {
      const chunkText = chunk.text;
      process.stdout.write(chunkText);
    }

    handleUserInput();
  });
}

console.log(
  "Chatbot initialised. Type your message and press Enter. Type 'exit' to quit."
);
handleUserInput();

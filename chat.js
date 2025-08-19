import { GoogleGenAI } from '@google/genai';
import readline from 'node:readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const chat = genAI.chats.create({
  model: 'gemini-2.0-flash',
  history: [],
});

// Function to handle user input and process responses
async function handleUserInput() {
  rl.question('You: ', async (userInput) => {
    if (userInput.toLowerCase() === 'exit') {
      console.log('Goodbye!');
      rl.close();
      return;
    }

    let response = await chat.sendMessage({ message: userInput });
    console.log('Model:');

    console.log(response.text);

    handleUserInput();
  });
}

console.log(
  "Chatbot initialised. Type your message and press Enter. Type 'exit' to quit."
);
handleUserInput();

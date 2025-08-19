import { GoogleGenAI } from '@google/genai';
import readline from 'node:readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY_FOR_FINE_TUNED_MODEL,
});

const chat = genAI.chats.create({
  model: 'tunedModels/harry-potter-sorting-hat-pbgtbskeu1eq',
});

// Function to handle user input and process responses
async function handleUserInput() {
  rl.question('You: ', async (userInput) => {
    if (userInput.toLowerCase() === 'exit') {
      console.log('Goodbye!');
      rl.close();
      return;
    }

    let result = await chat.sendMessageStream({ message: userInput });
    console.log('Model:');

    for await (const chunk of result) {
      const chunkText = chunk.text;
      process.stdout.write(chunkText);
    }
    console.log('\n');
    handleUserInput();
  });
}

console.log(
  "The Sorting Hat is ready! Oh how exciting! Type your student personality and press Enter. Type 'exit' to quit."
);
handleUserInput();

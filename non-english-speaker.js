import { GoogleGenAI } from '@google/genai';
import wav from 'wav';

async function saveWaveFile(filename, pcmData, channels = 1, rate = 24000, sampleWidth = 2) {
  return new Promise((resolve, reject) => {
    const writer = new wav.FileWriter(filename, {
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });
    writer.on('finish', resolve);
    writer.on('error', reject);
    writer.write(pcmData);
    writer.end();
  });
}

async function generateSingleSpeakerAudio(ai, text, voiceName = 'Kore', language = 'en-US') {
  console.log(`Generating single-speaker audio in ${language}...`);

  const config = {
    temperature: 1,
    responseModalities: ['audio'],
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: {
          voiceName: voiceName,
        },
      },
    },
  };

  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: text,
        },
      ],
    },
  ];

  // Use streaming for better performance
  const response = await ai.models.generateContentStream({
    model: 'gemini-2.5-pro-preview-tts',
    config,
    contents,
  });

  console.log('Audio response received, processing chunks...');

  // Collect all audio chunks
  const audioChunks = [];
  for await (const chunk of response) {
    if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
      const inlineData = chunk.candidates[0].content.parts[0].inlineData;
      const buffer = Buffer.from(inlineData.data || '', 'base64');
      audioChunks.push(buffer);
    }
  }

  // Combine all chunks
  const fullAudioBuffer = Buffer.concat(audioChunks);
  return fullAudioBuffer;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateCombinedMultiLanguageAudio(ai) {
  console.log('Generating combined multi-language audio...');

  // Combined text in multiple languages with pauses
  const combinedText = `
Hello! Welcome to our multilingual text-to-speech demonstration.

¡Hola! Bienvenidos a nuestra demostración de texto a voz en español.

Bonjour! Bienvenue à notre démonstration de synthèse vocale en français.

Ciao! Benvenuti alla nostra dimostrazione di sintesi vocale in italiano.

こんにちは！私たちの多言語テキスト読み上げデモンストレーションへようこそ。

Thank you for listening to our multilingual demonstration!
  `.trim();

  const config = {
    temperature: 1,
    responseModalities: ['audio'],
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: {
          voiceName: 'Kore', // Using one consistent voice for all languages
        },
      },
    },
  };

  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: combinedText,
        },
      ],
    },
  ];

  // Use streaming for better performance
  const response = await ai.models.generateContentStream({
    model: 'gemini-2.5-pro-preview-tts',
    config,
    contents,
  });

  console.log('Processing combined audio chunks...');

  // Collect all audio chunks
  const audioChunks = [];
  for await (const chunk of response) {
    if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
      const inlineData = chunk.candidates[0].content.parts[0].inlineData;
      const buffer = Buffer.from(inlineData.data || '', 'base64');
      audioChunks.push(buffer);
    }
  }

  // Combine all chunks
  const fullAudioBuffer = Buffer.concat(audioChunks);
  return fullAudioBuffer;
}

async function main() {
  try {
    console.log('Starting multilingual audio generation...');

    // Generate one combined audio file with all languages
    const combinedAudioBuffer = await generateCombinedMultiLanguageAudio(ai);

    if (!combinedAudioBuffer || combinedAudioBuffer.length === 0) {
      throw new Error('Failed to generate combined multilingual audio');
    }

    const combinedFilename = 'multilingual-demo.wav';
    await saveWaveFile(combinedFilename, combinedAudioBuffer);
    console.log(`\nSuccessfully saved combined multilingual audio as ${combinedFilename}`);
    console.log('The file contains greetings in English, Spanish, French, Italian, and Japanese!');
  } catch (error) {
    console.error('Error in main process:', error);
    throw error;
  }
}

await main();

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

async function generateTextResponse(ai, prompt) {
  console.log('Step 1: Generating text response with 2.5-flash...');

  const textResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ parts: [{ text: prompt }] }],
  });

  const generatedText = textResponse.text;
  console.log('Generated text:', generatedText);

  return generatedText;
}

async function generateAudioFromText(ai, text) {
  console.log('Step 2: Converting text to audio with TTS model...');

  const audioResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: ['audio'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Rasalgethi' },
        },
      },
    },
  });

  console.log('Audio response metadata:', {
    candidatesCount: audioResponse.candidates?.length,
    hasAudioData: !!audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data,
  });

  return audioResponse;
}

async function main() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    // Step 1: Generate text content using 2.5-flash
    const prompt = 'Explain what Star Wars is in maximum two sentences.';
    const generatedText = await generateTextResponse(ai, prompt);

    if (!generatedText) {
      throw new Error('Failed to generate text response');
    }

    // Step 2: Convert the generated text to audio using TTS model
    const audioResponse = await generateAudioFromText(ai, generatedText);

    // Step 3: Extract and save audio data
    const audioData = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!audioData) {
      throw new Error('Failed to generate audio data');
    }

    const audioBuffer = Buffer.from(audioData, 'base64');
    const fileName = 'single-speaker.wav';

    await saveWaveFile(fileName, audioBuffer);
    console.log(`Audio saved successfully as ${fileName}`);
  } catch (error) {
    console.error('Error in main process:', error);
    throw error;
  }
}

await main();

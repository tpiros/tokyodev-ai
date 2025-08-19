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

async function generateTranscript(ai) {
  console.log('Step 1: Generating podcast transcript...');

  const transcript = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents:
      'Generate a short transcript around 100 words that reads like it was clipped from a podcast by excited Star Wars fans discussing episode IV, V, VI and Legends. The hosts names are Skyhopper and DarkLord. Do not return markdown, only plain text.',
  });

  const transcriptText = transcript.text;
  console.log('Generated transcript:', transcriptText);

  return transcriptText;
}

async function generateMultiSpeakerAudio(ai, transcriptText) {
  console.log('Step 2: Converting transcript to multi-speaker audio...');

  const config = {
    temperature: 1,
    responseModalities: ['audio'],
    speechConfig: {
      multiSpeakerVoiceConfig: {
        speakerVoiceConfigs: [
          {
            speaker: 'Skyhopper',
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Kore',
              },
            },
          },
          {
            speaker: 'DarkLord',
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Puck',
              },
            },
          },
        ],
      },
    },
  };

  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: transcriptText,
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model: 'gemini-2.5-pro-preview-tts',
    config,
    contents,
  });

  console.log('Audio response received, processing chunks...');

  const audioChunks = [];
  for await (const chunk of response) {
    if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
      const inlineData = chunk.candidates[0].content.parts[0].inlineData;
      const buffer = Buffer.from(inlineData.data || '', 'base64');
      audioChunks.push(buffer);
    }
  }

  const fullAudioBuffer = Buffer.concat(audioChunks);
  return { audioData: fullAudioBuffer };
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  try {
    const transcriptText = await generateTranscript(ai);

    if (!transcriptText) {
      throw new Error('Failed to generate transcript');
    }
    const audioResponse = await generateMultiSpeakerAudio(ai, transcriptText);

    if (!audioResponse.audioData || audioResponse.audioData.length === 0) {
      throw new Error('Failed to generate audio data');
    }

    const fileName = 'podcast-star-wars.wav';
    await saveWaveFile(fileName, audioResponse.audioData);
    console.log(`Multi-speaker podcast audio saved successfully as ${fileName}`);
  } catch (error) {
    console.error('Error in main process:', error);
    throw error;
  }
}

await main();

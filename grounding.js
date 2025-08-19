// import { GoogleGenAI } from '@google/genai';
// import { mkdir, writeFile } from 'fs/promises';
// import path from 'path';
// import open from 'open';

// const apiKey = process.env.GEMINI_API_KEY;
// if (!apiKey) {
//   console.error('Error: GEMINI_API_KEY environment variable not set.');
//   process.exit(1);
// }

// const modelName = 'gemini-1.5-flash-latest';
// const prompt =
//   'Who individually won the most gold medals during the Paris olympics in 2024?';

// const config = {
//   tools: [{ googleSearchRetrieval: {} }],
// };

// function escapeHtml(unsafe) {
//   if (!unsafe) return '';
//   return unsafe
//     .replace(/&/g, '&amp;')
//     .replace(/</g, '&lt;')
//     .replace(/>/g, '&gt;')
//     .replace(/"/g, '&quot;')
//     .replace(/'/g, '&#039;');
// }

// async function run() {
//   try {
//     const genAI = new GoogleGenAI({ apiKey });

//     console.log(
//       `Sending request to model (${modelName}) with Google Search enabled...`
//     );
//     const result = await genAI.models.generateContent({
//       model: modelName,
//       contents: prompt,
//       config,
//     });

//     const modelResponseText = result.text;

//     if (modelResponseText) {
//       console.log('\n--- Model Response Text ---');
//       console.log(modelResponseText);
//     } else {
//       console.log('\n--- No text content in response ---');
//     }

//     const groundingMetadata = result?.candidates?.[0]?.groundingMetadata;
//     const searchEntryPoint = groundingMetadata?.searchEntryPoint;
//     const renderedContent = searchEntryPoint?.renderedContent;

//     if (renderedContent) {
//       console.log('\n--- Grounding Metadata Found (Rendered Web Content) ---');

//       try {
//         const combinedHtmlContent = `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Gemini Response & Search Results</title>
//     <style>
//         body { font-family: sans-serif; line-height: 1.6; padding: 20px; max-width: 900px; margin: auto; }
//         h1, h2 { border-bottom: 1px solid #eee; padding-bottom: 8px; margin-top: 30px; }
//         .model-response-text { background-color: #f8f9fa; padding: 15px; border: 1px solid #dee2e6; border-radius: 5px; margin-bottom: 20px; white-space: pre-wrap; /* Preserve whitespace/newlines */ }
//         .rendered-content { margin-top: 20px; }
//         hr { margin: 40px 0; border: 0; border-top: 2px solid #eee; }
//     </style>
// </head>
// <body>
//     <h1>Model's Text Response</h1>
//     <div class="model-response-text">
// ${escapeHtml(modelResponseText) || 'No text response provided.'}
//     </div>

//     <hr>

//     <h2>Grounded Search Results (Rendered Content)</h2>
//     <div class="rendered-content">
//     ${renderedContent}
//     </div>
// </body>
// </html>
// `;

//         const targetDir = path.join(process.cwd(), 'tmp');
//         await mkdir(targetDir, { recursive: true });
//         console.log(`Ensured directory exists: ${targetDir}`);

//         const tempFileName = `gemini-combined-output-${Date.now()}.html`;
//         const tempFilePath = path.join(targetDir, tempFileName);

//         // Write the COMBINED HTML content to the file
//         await writeFile(tempFilePath, combinedHtmlContent, 'utf8');
//         console.log(`Saved combined response to: ${tempFilePath}`);

//         console.log('Opening file in default browser...');
//         await open(tempFilePath);
//       } catch (writeOrOpenError) {
//         console.error(
//           `Error saving or opening temporary file in ./tmp:`,
//           writeOrOpenError
//         );
//       }
//     } else {
//       console.log(
//         '\n--- No grounding metadata found or rendered content missing ---'
//       );
//     }
//   } catch (error) {
//     console.error('\n--- An error occurred during the Gemini API call ---');
//     if (error.response) {
//       console.error(
//         'API Response Error:',
//         JSON.stringify(error.response, null, 2)
//       );
//     } else {
//       console.error('Error:', error);
//     }
//   }
// }

// run();

import { GoogleGenAI, DynamicRetrievalConfigMode } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  let response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: [
      'Who individually won the most gold medals during the Paris olympics in 2024?',
    ],
    config: {
      tools: [
        {
          googleSearchRetrieval: {
            dynamicRetrievalConfig: {
              dynamicThreshold: 0.5,
              mode: DynamicRetrievalConfigMode.MODE_DYNAMIC,
            },
          },
        },
      ],
    },
  });

  console.log(response.text);
}

main();

import { GoogleGenAI } from '@google/genai';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import open from 'open';
import { marked } from 'marked';

// Initialise Generative AI
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const response = await genAI.models.generateContent({
  model: 'gemini-2.0-flash',
  contents: `What is the sum of the first 50 prime numbers?

Generate and run code for the calculation, and make sure you get all 50.`,
  config: {
    tools: [
      {
        codeExecution: {},
      },
    ],
  },
});

console.log(JSON.stringify(response, null, 2));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function displayCodeExecutionResult(
  response,
  codeFilename = 'output.py',
  htmlFilename = 'output.html'
) {
  const parts = response.candidates[0].content.parts;
  let html = `<html>
<head>
  <title>Gemini Code Execution</title>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: system-ui, sans-serif;
      padding: 2rem;
      background: #f4f4f4;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 800px;
      margin: auto;
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    pre {
      background: #f0f0f0;
      padding: 1rem;
      overflow-x: auto;
      border-radius: 6px;
    }
    code {
      font-family: Consolas, Monaco, monospace;
    }
    h2 {
      margin-top: 2rem;
    }
  </style>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <script>hljs.highlightAll();</script>
</head>
<body>
<div class="container">`;

  for (const part of parts) {
    if (part.text) {
      html += `<h2>Explanation</h2>${marked.parse(part.text)}`;
    }

    if (part.executableCode) {
      const code = part.executableCode.code;
      html += `<h2>Generated Code</h2><pre><code class="language-python">${code}</code></pre>`;

      const fullCodePath = join(__dirname, codeFilename);
      writeFileSync(fullCodePath, code);
      console.log(`Code saved to ${fullCodePath}`);
    }

    if (part.codeExecutionResult) {
      html += `<h2>Execution Output</h2><pre><code>${part.codeExecutionResult.output}</code></pre>`;
    }
  }

  html += `</div></body></html>`;

  const fullHtmlPath = join(__dirname, htmlFilename);
  writeFileSync(fullHtmlPath, html);
  console.log(`HTML saved to ${fullHtmlPath}`);

  await open(fullHtmlPath);
}

await displayCodeExecutionResult(response);

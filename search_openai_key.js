const fs = require('fs');
const readline = require('readline');

async function run() {
  const fileStream = fs.createReadStream('C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\83f85976-10e8-4858-8ff4-f4b435de2981\\.system_generated\\logs\\transcript_full.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  console.log('Searching transcript for OpenAI patterns...');
  let count = 0;
  for await (const line of rl) {
    if (line.toLowerCase().includes('openai') && (line.includes('sk-') || line.toLowerCase().includes('key'))) {
      count++;
      if (count < 50) {
        console.log(`Match ${count}:`);
        // Find index of openai
        const idx = line.toLowerCase().indexOf('openai');
        console.log(line.substring(Math.max(0, idx - 100), Math.min(line.length, idx + 200)));
      }
    }
  }
  console.log('Search complete. Total matches:', count);
}

run().catch(console.error);

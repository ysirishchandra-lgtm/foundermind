const fs = require('fs');
const readline = require('readline');

async function run() {
  const fileStream = fs.createReadStream('C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\83f85976-10e8-4858-8ff4-f4b435de2981\\.system_generated\\logs\\transcript_full.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  console.log('Searching transcript...');
  for await (const line of rl) {
    if (line.includes('OPENAI_API_KEY') && line.includes('sk-')) {
      console.log('FOUND OPENAI_API_KEY with sk- in transcript line!');
      // print around
      const index = line.indexOf('sk-');
      console.log(line.substring(index - 50, index + 100));
    }
    if (line.includes('sk-proj-') || line.includes('sk-')) {
      const idx = line.indexOf('sk-');
      console.log('Found sk- at index:', idx, line.substring(idx - 30, idx + 80));
    }
  }
  console.log('Search complete.');
}

run().catch(console.error);

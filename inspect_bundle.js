const fs = require('fs');

async function run() {
  console.log('Downloading bundle...');
  const res = await fetch('https://foundermind.vercel.app/assets/index-BO5g_5hd.js');
  const code = await res.text();
  console.log('Bundle length:', code.length);

  // Search for the api request function:
  const index = code.indexOf('/api');
  if (index !== -1) {
    console.log('Found "/api" at index:', index);
    const context = code.substring(index - 100, index + 300);
    console.log('Context:\n', context);
  } else {
    console.log('"/api" not found');
  }

  // Let's search for "http://" or "https://" to see what base URLs are in the bundle
  const urls = [];
  const regex = /https?:\/\/[a-zA-Z0-9.-]+(:\d+)?/g;
  let match;
  while ((match = regex.exec(code)) !== null) {
    urls.push(match[0]);
  }
  console.log('Unique URLs in bundle:', [...new Set(urls)]);
}

run().catch(console.error);

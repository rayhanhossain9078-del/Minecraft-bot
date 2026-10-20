'mineflayer');
const { GoogleGenAI } = require('@google/genai');
const http = require('http');

// Render Uptime Server
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('GeminiBot is running 24/7!\n');
}).listen(port);

// Gemini API Setup
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const bot = mineflayer.createBot({
  host: 'Smp2O.aternos.me',
  port: 26849,
  username: 'GeminiBot',
  version: false
});

bot.on('spawn', () => {
  console.log('GeminiBot connected!');
  // (

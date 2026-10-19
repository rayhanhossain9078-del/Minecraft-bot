const mineflayer = require('mineflayer');
const { GoogleGenAI } = require('@google/genai');
const http = require('http');

// Render-কে সন্তুষ্ট রাখতে একটি ছোট HTTP ওয়েব সার্ভার
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('GeminiBot is running 24/7!\n');
}).listen(port, () => {
  console.log(`Web server listening on port ${port}`);
});

// Google AI Studio API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Aternos সার্ভার কনফিগারেশন
const bot = mineflayer.createBot({
  host: 'Smp2O.aternos.me',
  port: 26849,
  username: 'GeminiBot',
  version: false
});

// Anti-AFK মোড
bot.on('spawn', () => {
  console.log('GeminiBot successfully joined Smp2O.aternos.me!');
  setInterval(() => {
    bot.swingArm('right');
  }, 15000);
});

// ইন-গেম এআই চ্যাট হ্যান্ডলার
bot.on('chat', async (username, message) => {
  if (username === bot.username) return;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a Minecraft player named GeminiBot in Aternos server Smp2O.aternos.me. A player named ${username} said: "${message}". Reply concisely and naturally for Minecraft chat.`,
    });

    if (response.text) {
      bot.chat(response.text);
    }
  } catch (err) {
    console.error('Gemini AI Response Error:', err);
  }
});

// অটো রিকানেক্ট লজিক
bot.on('end', () => {
  console.log('Bot disconnected. Reconnecting in 10 seconds...');
  setTimeout(() => process.exit(1), 10000);
});

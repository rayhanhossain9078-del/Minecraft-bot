const mineflayer = require('mineflayer');
const { GoogleGenAI } = require('@google/genai');

// Google AI Studio API Key (Render Host Environmental Variable থেকে লোড হবে)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Aternos সার্ভার কনফিগারেশন
const bot = mineflayer.createBot({
  host: 'Smp2O.aternos.me',
  port: 26849,
  username: 'GeminiBot',
  version: false // অটোমেটিক ভার্সন ডিটেক্ট করবে
});

// অ্যান্টি-এএফকে (Anti-AFK) ফাংশন যাতে Aternos সার্ভার অফ না হয়ে যায়
bot.on('spawn', () => {
  console.log('GeminiBot successfully joined Smp2O.aternos.me!');
  setInterval(() => {
    bot.swingArm('right');
  }, 15000); // প্রতি ১৫ সেকেন্ডে হাত নাড়াবে
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

// অটো রিকানেক্ট (যদি সার্ভার রিস্টার্ট হয়)
bot.on('end', () => {
  console.log('Bot disconnected. Attempting reconnect in 15 seconds...');
  setTimeout(() => process.exit(1), 15000);
});

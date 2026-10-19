const mineflayer = require('mineflayer');
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
  // Anti-AFK swing arm
  setInterval(() => {
    if (!bot.isSleeping) {
      bot.swingArm('right');
    }
  }, 12000);
});

// ১. অটো রিস্পন (মরে গেলে সাথে সাথে আবার বেঁচে উঠবে)
bot.on('death', () => {
  console.log('GeminiBot died! Respawning...');
  setTimeout(() => {
    bot.respawn();
  }, 1000);
});

// ২. অটো স্লিপ (রাত হলে ১০ ব্লকের মধ্যে বিছানা থাকলে ঘুমাবে)
setInterval(async () => {
  // রাত বা ঝড়-বৃষ্টি হলে এবং বট আগে থেকে না ঘুমালে
  if ((bot.time.isNight || bot.isRaining) && !bot.isSleeping) {
    const bed = bot.findBlock({
      matching: block => bot.isABed(block),
      maxDistance: 10
    });

    if (bed) {
      try {
        await bot.sleep(bed);
        console.log('GeminiBot is now sleeping 😴');
      } catch (err) {
        console.log(`Failed to sleep: ${err.message}`);
      }
    }
  }
}, 5000); // প্রতি ৫ সেকেন্ডে চেক করবে

// ৩. গ্রাইন্ডিং (আশেপাশের শত্রু মবকে আক্রমণ করা)
setInterval(() => {
  if (!bot.entity || bot.isSleeping) return;

  const target = bot.nearestEntity(entity => {
    return entity.type === 'mob' && 
           entity.mobType !== 'Armor Stand' &&
           bot.entity.position.distanceTo(entity.position) < 10;
  });

  if (target) {
    bot.lookAt(target.position.offset(0, target.height, 0));
    bot.attack(target);
  }
}, 1500);

// ৪. ইন-গেম এআই চ্যাট হ্যান্ডলার
bot.on('chat', async (username, message) => {
  if (username === bot.username || !message) return;

  console.log(`[Chat] ${username}: ${message}`);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are GeminiBot, a natural Minecraft player on Aternos server Smp2O.aternos.me. ${username} said: "${message}". Reply short and naturally in Bengali or English under 100 characters for Minecraft chat.`,
    });

    const reply = response.text ? response.text.trim().replace(/\n/g, ' ') : null;

    if (reply) {
      console.log(`[Gemini Reply]: ${reply}`);
      bot.chat(reply);
    }
  } catch (err) {
    console.error('Gemini Error:', err.message);
  }
});

bot.on('end', () => {
  console.log('Disconnected. Restarting process...');
  setTimeout(() => process.exit(1), 5000);
});

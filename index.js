const mineflayer = require('mineflayer');
const { GoogleGenAI } = require('@google/genai');
const http = require('http');

// Web Health Server for Uptime Monitoring
const PORT = process.env.PORT || 10000;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Player Client Status: Active\n');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[System] Health monitor bound on port ${PORT}`);
});

// Gemini AI Setup
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Bot Options
const botOptions = {
  host: 'Smp2O.aternos.me',
  port: 26849,
  username: 'Alex_Player', // Kono "Bot" name nei
  version: false
};

let bot = null;

function createPlayer() {
  bot = mineflayer.createBot(botOptions);

  bot.on('spawn', () => {
    console.log(`[Game] ${bot.username} joined Smp2O.aternos.me`);
    
    // Auto Sleep Check on Spawn / Night
    checkAndSleep();
  });

  // Humanlike Anti-AFK (Movement & Look variations)
  setInterval(() => {
    if (!bot || !bot.entity) return;
    
    // Random arm swing
    bot.swingArm('right');
    
    // Small random rotation
    const yaw = (Math.random() - 0.5) * 0.5;
    const pitch = (Math.random() - 0.5) * 0.2;
    bot.look(bot.entity.yaw + yaw, bot.entity.pitch + pitch, true);

    // Occasional Sneak Action
    if (Math.random() > 0.7) {
      bot.setControlState('sneak', true);
      setTimeout(() => {
        if (bot) bot.setControlState('sneak', false);
      }, 800);
    }
  }, 12000);

  // Auto Respawn
  bot.on('death', () => {
    console.log('[Game] Player died. Respawning...');
    setTimeout(() => {
      if (bot) bot.respawn();
    }, 2000);
  });

  // Auto Sleep Logic
  bot.on('time', () => {
    if (!bot) return;
    if (bot.time.timeOfDay >= 12541 && bot.time.timeOfDay <= 23458) {
      checkAndSleep();
    }
  });
// AI Chat Bot Logic
    bot.on('chat', async (username, message) => {
        if (username === bot.username) return;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: message,
            });

            if (response.text) {
                bot.chat(response.text);
            }
        } catch (error) {
            console.error("[AI Error]:", error.message);
        }
    });
  async function checkAndSleep() {
    if (!bot || !bot.entity || bot.isSleeping) return;
    const bed = bot.findBlock({
      matching: block => bot.isABed(block),
      maxDistance: 5
    });
    if (bed) {
      try {
        await bot.sleep(bed);
        console.log('[Game] Sleeping in bed...');
      } catch (err) {
        // Bed in use or monsters nearby
      }
    }
  }

  // Combat / Grinding Logic
  setInterval(() => {
    if (!bot || !bot.entity || bot.isSleeping) return;

    // Retain target if health is safe (> 6)
    if (bot.health < 6) return;

    const target = bot.nearestEntity(entity => {
      return entity.type === 'mob' &&
             entity.mobType !== 'Armor Stand' &&
             bot.entity.position.distanceTo(entity.position) < 8;
    });

    if (target) {
      bot.lookAt(target.position.offset(0, target.height * 0.85, 0));
      bot.attack(target);
    }
  }, 1800);

  // Natural Humanlike Chat Response
  bot.on('chat', async (username, message) => {
    if (username === bot.username || !message) return;

    console.log(`[Chat] ${username}: ${message}`);

    // Natural Response Delay (Simulating Typing Speed)
    const delay = Math.floor(Math.random() * 2000) + 1500;

    setTimeout(async () => {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `You are a friendly regular Minecraft player named Alex playing on a survival server Smp2O.aternos.me. Player ${username} said: "${message}". Reply naturally as a human gamer in short Bengali or English under 80 characters. Never say you are an AI, bot, or automated program.`,
        });

        const reply = response.text ? response.text.trim().replace(/\n/g, ' ') : null;

        if (reply && bot) {
          console.log(`[Alex Chat Reply]: ${reply}`);
          bot.chat(reply);
        }
      } catch (err) {
        console.error('[AI Error]:', err.message);
      }
    }, delay);
  });

  // Error & Reconnection handling
  bot.on('error', (err) => {
    console.log('[Client Error]:', err.message);
  });

  bot.on('end', () => {
    console.log('[Client Disconnected] Reconnecting in 10s...');
    setTimeout(() => {
      process.exit(1); // Triggers Koyeb / Render auto-restart container
    }, 10000);
  });
}

createPlayer();

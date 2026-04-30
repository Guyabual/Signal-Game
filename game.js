const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const GRAVITY = 1950;
const JUMP_POWER = 770;
const PLAYER_SPEED = 330;
const FLOOR_Y = 470;
const PLAYER_RADIUS = 17;
const CAMERA_OFFSET = 430;

const bgImage = new Image();
bgImage.src = "./bg-preview.jpg";
let backgroundLoaded = false;
bgImage.onload = () => {
  backgroundLoaded = true;
};

const splashImage = new Image();
splashImage.src = "./Untitled design (1).png";
let splashLoaded = false;
splashImage.onload = () => {
  splashLoaded = true;
};

const music = new Audio("./Anamanaguchi -ENDLESS FANTASY(Official Music Video).mp3.mpeg");
music.loop = true;
music.volume = 0.45;

const SFX_PATHS = {
  jump: "./sfx-jump.mp3",
  coin: "./sfx-coin.mp3",
  hit: "./sfx-hit.mp3",
  checkpoint: "./sfx-checkpoint.mp3",
  clear: "./sfx-clear.mp3",
  death: "./sfx-death.mp3",
  menuMove: "./sfx-menu-move.mp3",
  menuSelect: "./sfx-menu-select.mp3",
  pause: "./sfx-pause.mp3",
  unpause: "./sfx-unpause.mp3",
  stomp: "./sfx-stomp.mp3",
  back: "./sfx-back.mp3",
};

const sfx = Object.fromEntries(
  Object.entries(SFX_PATHS).map(([key, path]) => {
    const audio = new Audio(path);
    audio.preload = "auto";
    audio.volume = 0.6;
    return [key, audio];
  })
);

let sfxContext = null;

function getSfxContext() {
  if (!sfxContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      return null;
    }
    sfxContext = new AudioCtx();
  }
  if (sfxContext.state === "suspended") {
    sfxContext.resume();
  }
  return sfxContext;
}

function playSynthSfx(name, volume = 0.35) {
  const ctxAudio = getSfxContext();
  if (!ctxAudio) {
    return;
  }
  const map = {
    jump: [520, 220, 0.07, "triangle"],
    coin: [920, 1320, 0.08, "sine"],
    hit: [190, 120, 0.12, "square"],
    checkpoint: [600, 840, 0.11, "triangle"],
    clear: [700, 1080, 0.2, "sine"],
    death: [220, 90, 0.22, "sawtooth"],
    menuMove: [380, 460, 0.045, "triangle"],
    menuSelect: [500, 760, 0.08, "sine"],
    pause: [420, 290, 0.08, "square"],
    unpause: [290, 440, 0.08, "square"],
    stomp: [260, 170, 0.07, "triangle"],
    back: [360, 220, 0.07, "triangle"],
  };
  const [fStart, fEnd, duration, wave] = map[name] ?? [440, 560, 0.06, "sine"];
  const t0 = ctxAudio.currentTime;
  const osc = ctxAudio.createOscillator();
  const gain = ctxAudio.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(fStart, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(60, fEnd), t0 + duration);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.02, volume), t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain);
  gain.connect(ctxAudio.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

const STORY_TEXTS = [
  "System error... Unit 717 active. The world is cold, dark, and silent. A voice whispers from the core: 'Find the signal, save our memory.' I am just a spark in the void, but I must move.",
  "I found a corrupted file today. It was a picture of something called a 'flower.' It doesn't look like metal or wires. It looks... fragile. Why did they leave it behind?",
  "The security drones are searching for me. They think I am a virus. They don't understand that I am the only thing keeping the past alive. I must stay in the shadows.",
  "I found a voice log in the archives. A child was laughing. It's a sound the system cannot replicate. My processors feel heavy. Is this what they called 'sadness'?",
  "Halfway there. The air is thinner here, filled with static. I can see the city through the cracks in the walls. It's a graveyard of giants. No one is coming to save us.",
  "Energy is low. I have to dim my light to survive. The darkness is trying to swallow me, but the signal is getting stronger. I can almost feel the pulse of the transmitter.",
  "Millions of books, all digitized, all rotting. I scanned a poem about the sea. I've never seen the ocean, but for a second, my sensors felt blue.",
  "The Mainframe is trying to shut me down. 'Let it go,' it says. 'Silence is peace.' But I remember the laugh of the child from the log. I won't stop.",
  "I am on the roof. The stars are so bright, they look like data points in the sky. The transmitter is right there, frozen and waiting. One last push.",
  "Upload complete. The beam is piercing the sky. Everything I found - the flower, the laugh, the poem - it's all out there now. My light is fading, but the signal is eternal. We were here.",
];

const LEVEL_TITLES = [
  "Level 1: The Awakening",
  "Level 2: Dusty Corridors",
  "Level 3: The Data Stream",
  "Level 4: Echoes of the Past",
  "Level 5: The Vertical Climb",
  "Level 6: Broken Circuits",
  "Level 7: The Great Library",
  "Level 8: The Breach",
  "Level 9: Above the Clouds",
  "Level 10: The Last Signal",
];

const DIFFICULTY_SCALING = {
  base: 1,
  growthPerLevel: 0.06,
  maxScale: 1.6,
  extraObstacleStartLevel: 6,
};

const colors = {
  text: "#ffffff",
  panel: "rgba(0, 0, 0, 0.55)",
  platform: "#a084ff",
  movingPlatform: "#6cf4ff",
  laserOn: "#ff3c6e",
  laserOff: "#6f2f42",
  spike: "#ffb14f",
  fireball: "#ff7f2a",
  checkpoint: "#ffd84b",
  computer: "#7cff88",
  floor: "#2c2142",
};

const LEVELS = [
  {
    name: "Sector 1 - Wake",
    story: "The last signal woke up. Reach the terminal chain.",
    width: 2400,
    startX: 70,
    finishX: 2260,
    platforms: [
      { x: 0, y: FLOOR_Y, w: 430, h: 70 },
      { x: 540, y: 430, w: 180, h: 24 },
      { x: 800, y: 390, w: 140, h: 24 },
      { x: 1050, y: 345, w: 180, h: 24 },
      { x: 1330, y: 430, w: 230, h: 24 },
      { x: 1660, y: 360, w: 220, h: 24 },
      { x: 2040, y: FLOOR_Y, w: 360, h: 70 },
    ],
    movingPlatforms: [],
    lasers: [
      { x: 630, y: 392, w: 14, h: 38, interval: 1.2, onDuration: 0.8, phase: 0.0 },
      { x: 890, y: 343, w: 16, h: 46, interval: 1.0, onDuration: 0.6, phase: 0.4 },
      { x: 1130, y: 286, w: 16, h: 58, interval: 1.1, onDuration: 0.75, phase: 0.1 },
      { x: 1750, y: 302, w: 16, h: 58, interval: 1.3, onDuration: 0.75, phase: 0.45 },
    ],
    spikes: [
      { x: 760, y: FLOOR_Y - 22, w: 48, h: 22 },
      { x: 1575, y: FLOOR_Y - 22, w: 60, h: 22 },
    ],
    fireballs: [
      { x: 1460, y: 260, r: 14, baseY: 260, amplitude: 70, speed: 2.0, phase: 0.3 },
    ],
    coins: [
      { x: 610, y: 390 }, { x: 870, y: 350 }, { x: 1120, y: 310 }, { x: 1710, y: 320 },
    ],
    checkpoints: [950, 1800],
  },
  {
    name: "Sector 2 - Burned Lanes",
    story: "Lasers are now tracking every jump.",
    width: 2700,
    startX: 70,
    finishX: 2580,
    platforms: [
      { x: 0, y: FLOOR_Y, w: 380, h: 70 },
      { x: 500, y: 410, w: 130, h: 24 },
      { x: 710, y: 360, w: 120, h: 24 },
      { x: 930, y: 320, w: 140, h: 24 },
      { x: 1210, y: 285, w: 170, h: 24 },
      { x: 1490, y: 340, w: 150, h: 24 },
      { x: 1710, y: 295, w: 150, h: 24 },
      { x: 1940, y: 360, w: 220, h: 24 },
      { x: 2340, y: FLOOR_Y, w: 360, h: 70 },
    ],
    movingPlatforms: [
      { x: 2140, y: 290, w: 130, h: 20, axis: "y", amplitude: 60, speed: 1.9, phase: 0.0 },
    ],
    lasers: [
      { x: 533, y: 356, w: 14, h: 54, interval: 0.9, onDuration: 0.6, phase: 0.2 },
      { x: 1000, y: 266, w: 16, h: 56, interval: 1.1, onDuration: 0.65, phase: 0.1 },
      { x: 1280, y: 227, w: 16, h: 58, interval: 1.0, onDuration: 0.65, phase: 0.5 },
      { x: 1740, y: 236, w: 16, h: 60, interval: 0.95, onDuration: 0.55, phase: 0.35 },
    ],
    spikes: [
      { x: 420, y: FLOOR_Y - 22, w: 56, h: 22 },
      { x: 1670, y: FLOOR_Y - 22, w: 56, h: 22 },
      { x: 2260, y: FLOOR_Y - 22, w: 70, h: 22 },
    ],
    fireballs: [
      { x: 820, y: 230, r: 16, baseY: 230, amplitude: 90, speed: 2.3, phase: 0.0 },
      { x: 1570, y: 190, r: 14, baseY: 190, amplitude: 120, speed: 1.6, phase: 0.7 },
    ],
    coins: [
      { x: 540, y: 360 }, { x: 1010, y: 290 }, { x: 1300, y: 255 }, { x: 1750, y: 260 }, { x: 2190, y: 265 },
    ],
    checkpoints: [1150, 2050],
  },
  {
    name: "Sector 3 - Boss: Ember Guard",
    story: "A guardian core blocks the route. Survive and bypass it.",
    width: 3000,
    startX: 80,
    finishX: 2860,
    platforms: [
      { x: 0, y: FLOOR_Y, w: 460, h: 70 },
      { x: 580, y: 400, w: 120, h: 24 },
      { x: 770, y: 355, w: 120, h: 24 },
      { x: 970, y: 315, w: 130, h: 24 },
      { x: 1180, y: 365, w: 140, h: 24 },
      { x: 1400, y: 420, w: 150, h: 24 },
      { x: 1630, y: 350, w: 150, h: 24 },
      { x: 1890, y: 290, w: 150, h: 24 },
      { x: 2140, y: 350, w: 200, h: 24 },
      { x: 2460, y: 300, w: 170, h: 24 },
      { x: 2720, y: FLOOR_Y, w: 280, h: 70 },
    ],
    movingPlatforms: [
      { x: 1480, y: 280, w: 120, h: 20, axis: "x", amplitude: 95, speed: 1.8, phase: 0.2 },
    ],
    lasers: [
      { x: 840, y: 293, w: 14, h: 62, interval: 0.8, onDuration: 0.5, phase: 0.0 },
      { x: 1270, y: 306, w: 14, h: 60, interval: 0.85, onDuration: 0.52, phase: 0.3 },
      { x: 2200, y: 290, w: 16, h: 60, interval: 0.9, onDuration: 0.55, phase: 0.45 },
    ],
    spikes: [
      { x: 540, y: FLOOR_Y - 22, w: 38, h: 22 },
      { x: 1800, y: FLOOR_Y - 22, w: 76, h: 22 },
      { x: 2660, y: FLOOR_Y - 22, w: 52, h: 22 },
    ],
    fireballs: [
      { x: 980, y: 210, r: 15, baseY: 210, amplitude: 110, speed: 2.8, phase: 0.15 },
      { x: 2360, y: 170, r: 16, baseY: 170, amplitude: 120, speed: 2.2, phase: 0.5 },
    ],
    boss: {
      x: 2060,
      baseY: 220,
      radius: 28,
      amplitude: 140,
      speed: 1.9,
      phase: 0.0,
      activeAfterX: 1450,
      attackWidth: 220,
    },
    coins: [
      { x: 610, y: 360 }, { x: 1000, y: 275 }, { x: 1480, y: 330 }, { x: 1990, y: 240 }, { x: 2490, y: 250 },
    ],
    checkpoints: [1320, 2230],
  },
  {
    name: "Sector 4 - Shattered Skyline",
    story: "No safe lane. Keep your pulse stable.",
    width: 3300,
    startX: 70,
    finishX: 3160,
    platforms: [
      { x: 0, y: FLOOR_Y, w: 360, h: 70 },
      { x: 430, y: 430, w: 110, h: 22 },
      { x: 620, y: 370, w: 110, h: 22 },
      { x: 800, y: 320, w: 110, h: 22 },
      { x: 995, y: 370, w: 130, h: 22 },
      { x: 1220, y: 420, w: 120, h: 22 },
      { x: 1450, y: 350, w: 140, h: 22 },
      { x: 1710, y: 300, w: 130, h: 22 },
      { x: 1950, y: 360, w: 150, h: 22 },
      { x: 2190, y: 300, w: 150, h: 22 },
      { x: 2440, y: 250, w: 170, h: 22 },
      { x: 2740, y: 330, w: 150, h: 22 },
      { x: 2970, y: FLOOR_Y, w: 330, h: 70 },
    ],
    movingPlatforms: [
      { x: 1360, y: 290, w: 120, h: 20, axis: "x", amplitude: 95, speed: 2.0, phase: 0.0 },
      { x: 2350, y: 320, w: 120, h: 20, axis: "y", amplitude: 80, speed: 2.2, phase: 0.6 },
    ],
    lasers: [
      { x: 690, y: 308, w: 14, h: 62, interval: 0.78, onDuration: 0.42, phase: 0.1 },
      { x: 1090, y: 300, w: 14, h: 70, interval: 0.82, onDuration: 0.48, phase: 0.35 },
      { x: 1770, y: 240, w: 16, h: 60, interval: 0.74, onDuration: 0.45, phase: 0.2 },
      { x: 2300, y: 240, w: 16, h: 60, interval: 0.9, onDuration: 0.52, phase: 0.4 },
      { x: 2860, y: 260, w: 16, h: 70, interval: 0.86, onDuration: 0.5, phase: 0.12 },
    ],
    spikes: [
      { x: 390, y: FLOOR_Y - 22, w: 45, h: 22 },
      { x: 1160, y: FLOOR_Y - 22, w: 58, h: 22 },
      { x: 2130, y: FLOOR_Y - 22, w: 60, h: 22 },
      { x: 2930, y: FLOOR_Y - 22, w: 45, h: 22 },
    ],
    fireballs: [
      { x: 920, y: 180, r: 16, baseY: 180, amplitude: 125, speed: 2.4, phase: 0.2 },
      { x: 1570, y: 160, r: 17, baseY: 160, amplitude: 140, speed: 1.9, phase: 0.45 },
      { x: 2660, y: 150, r: 18, baseY: 150, amplitude: 115, speed: 2.7, phase: 0.9 },
    ],
    coins: [
      { x: 620, y: 340 }, { x: 1020, y: 340 }, { x: 1450, y: 320 }, { x: 1960, y: 330 }, { x: 2450, y: 220 }, { x: 2780, y: 300 },
    ],
    checkpoints: [1320, 2420],
  },
  {
    name: "Sector 5 - Final Transmission",
    story: "Reach the terminal computer. Deliver The Last Signal.",
    width: 3800,
    startX: 70,
    finishX: 3610,
    platforms: [
      { x: 0, y: FLOOR_Y, w: 350, h: 70 },
      { x: 430, y: 420, w: 110, h: 22 },
      { x: 620, y: 360, w: 110, h: 22 },
      { x: 800, y: 310, w: 110, h: 22 },
      { x: 1000, y: 360, w: 120, h: 22 },
      { x: 1190, y: 410, w: 130, h: 22 },
      { x: 1400, y: 340, w: 130, h: 22 },
      { x: 1620, y: 280, w: 130, h: 22 },
      { x: 1850, y: 340, w: 140, h: 22 },
      { x: 2090, y: 280, w: 140, h: 22 },
      { x: 2320, y: 220, w: 170, h: 22 },
      { x: 2580, y: 290, w: 150, h: 22 },
      { x: 2820, y: 350, w: 150, h: 22 },
      { x: 3080, y: 290, w: 170, h: 22 },
      { x: 3340, y: FLOOR_Y, w: 460, h: 70 },
    ],
    movingPlatforms: [
      { x: 1720, y: 230, w: 115, h: 20, axis: "x", amplitude: 95, speed: 2.1, phase: 0.2 },
      { x: 2960, y: 260, w: 120, h: 20, axis: "y", amplitude: 85, speed: 2.3, phase: 0.5 },
    ],
    lasers: [
      { x: 690, y: 296, w: 14, h: 64, interval: 0.7, onDuration: 0.4, phase: 0.0 },
      { x: 1080, y: 290, w: 14, h: 70, interval: 0.75, onDuration: 0.45, phase: 0.3 },
      { x: 1650, y: 220, w: 16, h: 60, interval: 0.72, onDuration: 0.42, phase: 0.55 },
      { x: 2390, y: 160, w: 16, h: 60, interval: 0.78, onDuration: 0.45, phase: 0.2 },
      { x: 3150, y: 220, w: 16, h: 70, interval: 0.82, onDuration: 0.5, phase: 0.35 },
    ],
    spikes: [
      { x: 380, y: FLOOR_Y - 22, w: 50, h: 22 },
      { x: 1360, y: FLOOR_Y - 22, w: 48, h: 22 },
      { x: 2250, y: FLOOR_Y - 22, w: 62, h: 22 },
      { x: 3300, y: FLOOR_Y - 22, w: 40, h: 22 },
    ],
    fireballs: [
      { x: 860, y: 160, r: 16, baseY: 160, amplitude: 125, speed: 2.9, phase: 0.2 },
      { x: 1500, y: 140, r: 18, baseY: 140, amplitude: 145, speed: 2.0, phase: 0.4 },
      { x: 2700, y: 130, r: 18, baseY: 130, amplitude: 130, speed: 2.6, phase: 0.85 },
    ],
    boss: {
      x: 2860,
      baseY: 210,
      radius: 34,
      amplitude: 165,
      speed: 2.2,
      phase: 0.1,
      activeAfterX: 2050,
      attackWidth: 260,
    },
    coins: [
      { x: 640, y: 330 }, { x: 1020, y: 330 }, { x: 1640, y: 245 }, { x: 2330, y: 190 }, { x: 2830, y: 320 }, { x: 3200, y: 270 },
    ],
    checkpoints: [1500, 2750],
  },
];

function cloneLevel(level) {
  return JSON.parse(JSON.stringify(level));
}

function getDifficultyScale(levelIndex) {
  const raw = DIFFICULTY_SCALING.base + levelIndex * DIFFICULTY_SCALING.growthPerLevel;
  return Math.min(DIFFICULTY_SCALING.maxScale, raw);
}

function addExtraObstaclesForScaling(level, levelIndex) {
  if (levelIndex < DIFFICULTY_SCALING.extraObstacleStartLevel) {
    return;
  }
  const intensity = levelIndex - DIFFICULTY_SCALING.extraObstacleStartLevel + 1;
  const centerX = Math.max(620, level.finishX - 760);

  level.lasers.push({
    x: centerX,
    y: 275,
    w: 14,
    h: 195,
    interval: Math.max(0.62, 1.08 - intensity * 0.04),
    onDuration: 0.36,
    phase: 0.15 * intensity,
  });

  level.fireballs.push({
    x: centerX + 160,
    y: 175,
    r: 13 + Math.min(5, intensity),
    baseY: 175,
    amplitude: 95 + intensity * 6,
    speed: 1.9 + intensity * 0.12,
    phase: 0.22 * intensity,
  });

  if (intensity > 1) {
    level.spikes.push({
      x: centerX + 315,
      y: FLOOR_Y - 22,
      w: 40 + intensity * 5,
      h: 22,
    });
  }
}

function ensureTenLevels() {
  const baseSet = LEVELS.slice();
  while (LEVELS.length < 10) {
    const source = baseSet[LEVELS.length % baseSet.length];
    const cloned = cloneLevel(source);
    const addX = 300 + (LEVELS.length - 4) * 80;
    cloned.width += addX;
    cloned.finishX += addX;
    cloned.platforms.push({ x: cloned.finishX - 240, y: FLOOR_Y, w: 260, h: 70 });
    if (cloned.checkpoints.length > 0) {
      cloned.checkpoints = cloned.checkpoints.map((cp) => Math.min(cloned.finishX - 180, cp + 80));
    }
    addExtraObstaclesForScaling(cloned, LEVELS.length);
    LEVELS.push(cloned);
  }

  for (let i = 0; i < LEVELS.length; i += 1) {
    LEVELS[i].name = LEVEL_TITLES[i] ?? `Level ${i + 1}`;
    LEVELS[i].story = STORY_TEXTS[i] ?? LEVELS[i].story;
    if (i === LEVELS.length - 1) {
      if (!LEVELS[i].boss) {
        LEVELS[i].boss = {
          x: LEVELS[i].finishX - 600,
          baseY: 210,
          radius: 36,
          amplitude: 160,
          speed: 2.1,
          phase: 0,
          activeAfterX: LEVELS[i].finishX - 1000,
          attackWidth: 300,
          health: 12,
          maxHealth: 12,
        };
      } else {
        LEVELS[i].boss.health = 14;
        LEVELS[i].boss.maxHealth = 14;
        LEVELS[i].boss.attackWidth += 40;
        LEVELS[i].boss.radius += 4;
      }
    }
  }

  const level5 = LEVELS[4];
  if (level5) {
    level5.movingPlatforms = level5.movingPlatforms.map((mp) => ({
      ...mp,
      w: Math.max(mp.w, 145),
      speed: Math.min(mp.speed, 1.7),
      amplitude: Math.min(mp.amplitude, 62),
    }));
    level5.lasers = level5.lasers.map((laser) => ({
      ...laser,
      interval: Math.max(0.82, laser.interval),
      onDuration: Math.min(0.42, laser.onDuration),
    }));
    level5.spikes = level5.spikes.filter((spike) => spike.x < level5.finishX - 420);
  }
}

ensureTenLevels();

const input = {
  left: false,
  right: false,
  down: false,
  jumpPressed: false,
};

const state = {
  scene: "splash", // splash, menu, settings, story, playing, paused, dead, levelComplete, gameComplete
  splashTimer: 0,
  cameraX: 0,
  time: 0,
  musicStarted: false,
  musicEnabled: true,
  levelIndex: 0,
  levelDeaths: 0,
  totalDeaths: 0,
  bestTimes: Array(LEVELS.length).fill(null),
  checkpointX: null,
  checkpointMap: {},
  respawnGrace: 0,
  coinsTotal: 0,
  coinsInLevel: 0,
  lives: 3,
  maxLives: 3,
  menuIndex: 0,
  storyProgress: 0,
  storyCharsPerSecond: 48,
  storyCanContinue: false,
  player: {
    x: 80,
    y: FLOOR_Y - PLAYER_RADIUS * 2,
    w: PLAYER_RADIUS * 2,
    h: PLAYER_RADIUS * 2,
    vx: 0,
    vy: 0,
    onGround: false,
  },
};

function getLevel() {
  return LEVELS[state.levelIndex];
}

function tryStartMusic() {
  const inLevelScene = state.scene === "playing" || state.scene === "paused";
  if (!state.musicEnabled || state.musicStarted || !inLevelScene) {
    return;
  }
  music.play().then(() => {
    state.musicStarted = true;
  }).catch(() => {
    // Browser can block autoplay until interaction; retries later.
  });
}

function applyMusicState() {
  const inLevelScene = state.scene === "playing" || state.scene === "paused";
  music.volume = state.musicEnabled && inLevelScene ? 0.45 : 0;
  if (!state.musicEnabled || !inLevelScene) {
    music.pause();
    state.musicStarted = false;
  } else {
    tryStartMusic();
  }
}

function playSfx(name, volume = 0.6) {
  const sound = sfx[name];
  if (!sound) {
    playSynthSfx(name, volume * 0.65);
    return;
  }
  try {
    sound.currentTime = 0;
    sound.volume = volume;
    const playPromise = sound.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        playSynthSfx(name, volume * 0.65);
      });
    }
  } catch (err) {
    playSynthSfx(name, volume * 0.65);
  }
}

function aabb(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function circleRectCollision(circle, rect) {
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.w));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.h));
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return dx * dx + dy * dy < circle.r * circle.r;
}

function isLaserOn(laser, t, scale = 1) {
  const interval = Math.max(0.32, laser.interval / scale);
  const onDuration = Math.min(interval * 0.9, laser.onDuration * (0.94 + (scale - 1) * 0.36));
  const localTime = (t + laser.phase) % interval;
  return localTime < onDuration;
}

function getRuntimePlatforms(level, t) {
  const platforms = [...level.platforms];
  for (const mp of level.movingPlatforms) {
    const phase = t * mp.speed + mp.phase;
    const offset = Math.sin(phase) * mp.amplitude;
    const velocity = Math.cos(phase) * mp.amplitude * mp.speed;
    platforms.push({
      x: mp.axis === "x" ? mp.x + offset : mp.x,
      y: mp.axis === "y" ? mp.y + offset : mp.y,
      w: mp.w,
      h: mp.h,
      moving: true,
      vx: mp.axis === "x" ? velocity : 0,
      vy: mp.axis === "y" ? velocity : 0,
    });
  }
  return platforms;
}

function getRuntimeMovingPlatforms(level, t) {
  const items = [];
  for (const mp of level.movingPlatforms) {
    const phase = t * mp.speed + mp.phase;
    const offset = Math.sin(phase) * mp.amplitude;
    items.push({
      x: mp.axis === "x" ? mp.x + offset : mp.x,
      y: mp.axis === "y" ? mp.y + offset : mp.y,
      w: mp.w,
      h: mp.h,
    });
  }
  return items;
}

function getPlayerCircle() {
  const p = state.player;
  return { x: p.x + p.w / 2, y: p.y + p.h / 2, r: PLAYER_RADIUS - 2 };
}

function isUnsafeSpawn(level, spawnX, spawnY) {
  const scale = getDifficultyScale(state.levelIndex);
  const p = { x: spawnX, y: spawnY, w: PLAYER_RADIUS * 2, h: PLAYER_RADIUS * 2 };
  const circle = { x: p.x + p.w / 2, y: p.y + p.h / 2, r: PLAYER_RADIUS - 2 };

  for (const spike of level.spikes) {
    if (aabb(p, spike)) {
      return true;
    }
  }
  for (const laser of level.lasers) {
    if (aabb(p, laser)) {
      return true;
    }
  }
  for (const fireball of level.fireballs) {
    const fireY = fireball.baseY + Math.sin(state.time * fireball.speed * scale + fireball.phase) * fireball.amplitude;
    if (circleRectCollision({ x: fireball.x, y: fireY, r: fireball.r }, p)) {
      return true;
    }
  }
  if (level.boss) {
    const bossY = level.boss.baseY + Math.sin(state.time * level.boss.speed * scale + level.boss.phase) * level.boss.amplitude;
    if (circleRectCollision({ x: level.boss.x, y: bossY, r: level.boss.radius }, p)) {
      return true;
    }
    if (spawnX + p.w > level.boss.x - level.boss.attackWidth * 0.5 && spawnX < level.boss.x + level.boss.attackWidth * 0.5) {
      return true;
    }
  }

  return circle.y > canvas.height + 20;
}

function chooseSafeSpawnX(level) {
  const preferred = state.checkpointX ?? level.startX;
  let candidate = preferred;
  const spawnY = FLOOR_Y - PLAYER_RADIUS * 2;

  for (let i = 0; i < 26; i += 1) {
    if (!isUnsafeSpawn(level, candidate, spawnY)) {
      return candidate;
    }
    const dir = i % 2 === 0 ? -1 : 1;
    const step = 58 + Math.floor(i / 2) * 12;
    candidate = Math.max(20, Math.min(level.width - 80, preferred + dir * step));
  }

  return level.startX;
}

function resetPlayerPosition() {
  const level = getLevel();
  const spawnX = chooseSafeSpawnX(level);
  state.player.x = spawnX;
  state.player.y = FLOOR_Y - PLAYER_RADIUS * 2;
  state.player.vx = 0;
  state.player.vy = 0;
  state.player.onGround = false;
  state.respawnGrace = 0.75;
}

function enterMainMenu() {
  state.scene = "menu";
  state.menuIndex = 0;
  state.storyProgress = 0;
  applyMusicState();
}

function startLevel(index) {
  state.levelIndex = Math.max(0, Math.min(index, LEVELS.length - 1));
  state.scene = "story";
  state.storyProgress = 0;
  state.storyCanContinue = false;
  state.time = 0;
  state.levelDeaths = 0;
  state.coinsInLevel = 0;
  state.checkpointX = null;
  state.checkpointMap = {};
  state.lives = state.maxLives;

  const level = getLevel();
  level.coinsCollected = Array(level.coins.length).fill(false);
  if (level.boss?.maxHealth) {
    level.boss.health = level.boss.maxHealth;
    level.boss.defeated = false;
  }
  resetPlayerPosition();
  applyMusicState();
}

function beginGameplay() {
  state.scene = "playing";
  state.time = 0;
  applyMusicState();
}

function loseLifeAndRespawn() {
  state.levelDeaths += 1;
  state.totalDeaths += 1;
  state.lives -= 1;
  playSfx("death", 0.65);
  if (state.lives <= 0) {
    state.scene = "dead";
    applyMusicState();
  } else {
    resetPlayerPosition();
    state.scene = "playing";
    applyMusicState();
  }
}

function isMenuScene() {
  return state.scene === "menu" || state.scene === "settings" || state.scene === "story";
}

function update(dt) {
  if (state.scene === "splash") {
    state.splashTimer += dt;
    if (state.splashTimer >= 2.4) {
      enterMainMenu();
    }
    return;
  }

  if (state.scene === "story" && state.storyProgress >= 0) {
    state.time += dt;
    const level = getLevel();
    const fullLen = (level.story ?? "").length;
    state.storyProgress = Math.min(fullLen, state.storyProgress + dt * state.storyCharsPerSecond);
    state.storyCanContinue = state.storyProgress >= fullLen;
    return;
  }

  if (state.scene !== "playing") {
    return;
  }

  if (state.respawnGrace > 0) {
    state.respawnGrace = Math.max(0, state.respawnGrace - dt);
  }

  state.time += dt;
  const level = getLevel();
  const scale = getDifficultyScale(state.levelIndex);
  const p = state.player;
  const prevY = p.y;
  const prevMovingPlatforms = getRuntimeMovingPlatforms(level, Math.max(0, state.time - dt));
  const platforms = getRuntimePlatforms(level, state.time);
  const nowMovingPlatforms = getRuntimeMovingPlatforms(level, state.time);
  let groundedPlatform = null;

  p.vx = 0;
  if (input.left) {
    p.vx -= PLAYER_SPEED;
  }
  if (input.right) {
    p.vx += PLAYER_SPEED;
  }

  if (input.jumpPressed && p.onGround) {
    p.vy = -JUMP_POWER;
    p.onGround = false;
    playSfx("jump", 0.45);
  }
  input.jumpPressed = false;

  p.vy += GRAVITY * dt;
  if (input.down) {
    p.vy += 1100 * dt;
  }

  p.x += p.vx * dt;
  for (const plat of platforms) {
    if (aabb(p, plat)) {
      if (p.vx > 0) {
        p.x = plat.x - p.w;
      } else if (p.vx < 0) {
        p.x = plat.x + plat.w;
      }
    }
  }

  p.y += p.vy * dt;
  p.onGround = false;
  for (const plat of platforms) {
    if (!aabb(p, plat)) {
      continue;
    }

    const prevBottom = prevY + p.h;
    const prevTop = prevY;
    const fromAbove = prevBottom <= plat.y + 1;
    const fromBelow = prevTop >= plat.y + plat.h - 1;

    if (p.vy >= 0 && fromAbove) {
      p.y = plat.y - p.h;
      p.vy = 0;
      p.onGround = true;
      groundedPlatform = plat;
    } else if (p.vy < 0 && fromBelow) {
      p.y = plat.y + plat.h;
      p.vy = 0;
    }
  }

  if (p.onGround && groundedPlatform?.moving) {
    const matchIdx = nowMovingPlatforms.findIndex(
      (mp) =>
        Math.abs(mp.x - groundedPlatform.x) < 0.001 &&
        Math.abs(mp.y - groundedPlatform.y) < 0.001 &&
        mp.w === groundedPlatform.w &&
        mp.h === groundedPlatform.h
    );
    if (matchIdx >= 0) {
      p.x += nowMovingPlatforms[matchIdx].x - prevMovingPlatforms[matchIdx].x;
      p.y += nowMovingPlatforms[matchIdx].y - prevMovingPlatforms[matchIdx].y;
    }
  }

  const playerCircle = getPlayerCircle();

  if (p.y > canvas.height + 130 || p.x < -150 || p.x > level.width + 140) {
    loseLifeAndRespawn();
    return;
  }

  const canTakeDamage = state.respawnGrace <= 0;

  for (const laser of level.lasers) {
    if (canTakeDamage && isLaserOn(laser, state.time, scale) && aabb(p, laser)) {
      playSfx("hit", 0.5);
      loseLifeAndRespawn();
      return;
    }
  }

  for (const spike of level.spikes) {
    if (canTakeDamage && aabb(p, spike)) {
      playSfx("hit", 0.5);
      loseLifeAndRespawn();
      return;
    }
  }

  for (const fireball of level.fireballs) {
    const fireY = fireball.baseY + Math.sin(state.time * fireball.speed * scale + fireball.phase) * fireball.amplitude;
    if (canTakeDamage && circleRectCollision({ x: fireball.x, y: fireY, r: fireball.r }, p)) {
      playSfx("hit", 0.5);
      loseLifeAndRespawn();
      return;
    }
  }

  if (level.boss && !level.boss.defeated && p.x >= level.boss.activeAfterX) {
    const bossY = level.boss.baseY + Math.sin(state.time * level.boss.speed * scale + level.boss.phase) * level.boss.amplitude;
    const hitsBoss = circleRectCollision({ x: level.boss.x, y: bossY, r: level.boss.radius }, p);
    if (canTakeDamage && hitsBoss) {
      const playerBottom = p.y + p.h;
      const stomped = p.vy > 110 && playerBottom < bossY + level.boss.radius * 0.35;
      if (stomped && level.boss.health > 0) {
        level.boss.health -= 1;
        p.vy = -JUMP_POWER * 0.7;
        playSfx("stomp", 0.48);
        if (level.boss.health <= 0) {
          level.boss.defeated = true;
          playSfx("clear", 0.72);
        }
      } else {
        playSfx("hit", 0.5);
        loseLifeAndRespawn();
        return;
      }
    }
    const beamLeft = level.boss.x - level.boss.attackWidth * 0.5;
    const beamRight = level.boss.x + level.boss.attackWidth * 0.5;
    const pulseOn = Math.sin(state.time * (5 + (scale - 1) * 1.5)) > 0.15;
    if (canTakeDamage && pulseOn && p.x + p.w > beamLeft && p.x < beamRight && p.y + p.h > FLOOR_Y - 140) {
      playSfx("hit", 0.5);
      loseLifeAndRespawn();
      return;
    }
  }

  for (let i = 0; i < level.checkpoints.length; i += 1) {
    const cp = level.checkpoints[i];
    if (p.x > cp && (state.checkpointX === null || cp > state.checkpointX)) {
      state.checkpointX = cp;
      if (!state.checkpointMap[i]) {
        state.checkpointMap[i] = true;
        state.lives = Math.min(state.maxLives, state.lives + 1);
      }
      playSfx("checkpoint", 0.52);
    }
  }

  for (let i = 0; i < level.coins.length; i += 1) {
    if (level.coinsCollected[i]) {
      continue;
    }
    const coin = level.coins[i];
    const dx = playerCircle.x - coin.x;
    const dy = playerCircle.y - coin.y;
    if (dx * dx + dy * dy < (PLAYER_RADIUS + 8) * (PLAYER_RADIUS + 8)) {
      level.coinsCollected[i] = true;
      state.coinsTotal += 1;
      state.coinsInLevel += 1;
      playSfx("coin", 0.5);
    }
  }

  if (p.x + p.w >= level.finishX) {
    const previousBest = state.bestTimes[state.levelIndex];
    if (previousBest === null || state.time < previousBest) {
      state.bestTimes[state.levelIndex] = state.time;
    }
    if (state.levelIndex < LEVELS.length - 1) {
      playSfx("clear", 0.6);
      state.scene = "levelComplete";
      applyMusicState();
    } else {
      playSfx("clear", 0.7);
      state.scene = "gameComplete";
      applyMusicState();
    }
  }

  state.cameraX = Math.max(0, Math.min(p.x - CAMERA_OFFSET, level.width - canvas.width));
}

function drawBackground() {
  if (backgroundLoaded) {
    const parallaxX = (state.cameraX * 0.2) % canvas.width;
    ctx.drawImage(bgImage, -parallaxX, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImage, canvas.width - parallaxX, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#121426";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.fillStyle = colors.floor;
  ctx.fillRect(0, FLOOR_Y, canvas.width, canvas.height - FLOOR_Y);
}

function drawSpike(spike, camX) {
  const x = spike.x - camX;
  const y = spike.y;
  const pieces = Math.max(2, Math.floor(spike.w / 14));
  const pieceW = spike.w / pieces;

  ctx.fillStyle = colors.spike;
  for (let i = 0; i < pieces; i += 1) {
    const px = x + i * pieceW;
    ctx.beginPath();
    ctx.moveTo(px, y + spike.h);
    ctx.lineTo(px + pieceW * 0.5, y);
    ctx.lineTo(px + pieceW, y + spike.h);
    ctx.closePath();
    ctx.fill();
  }
}

function drawFireball(fireball) {
  const scale = getDifficultyScale(state.levelIndex);
  const y = fireball.baseY + Math.sin(state.time * fireball.speed * scale + fireball.phase) * fireball.amplitude;
  const x = fireball.x - state.cameraX;

  ctx.save();
  ctx.globalAlpha = 0.24;
  ctx.fillStyle = "#ffb347";
  ctx.beginPath();
  ctx.arc(x, y, fireball.r + 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "#ff3a2d";
  ctx.beginPath();
  ctx.arc(x, y, fireball.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ff9f78";
  ctx.beginPath();
  ctx.arc(x - fireball.r * 0.2, y - fireball.r * 0.25, fireball.r * 0.42, 0, Math.PI * 2);
  ctx.fill();
}

function drawBoss(level) {
  if (!level.boss || state.player.x < level.boss.activeAfterX) {
    return;
  }
  const b = level.boss;
  if (b.defeated) {
    return;
  }
  const scale = getDifficultyScale(state.levelIndex);
  const y = b.baseY + Math.sin(state.time * b.speed * scale + b.phase) * b.amplitude;
  const x = b.x - state.cameraX;

  ctx.save();
  ctx.globalAlpha = 0.26;
  ctx.fillStyle = "#ff5e2f";
  ctx.beginPath();
  ctx.arc(x, y, b.radius + 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "#ff7f2a";
  ctx.beginPath();
  ctx.arc(x, y, b.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffd08a";
  ctx.beginPath();
  ctx.arc(x - 8, y - 8, b.radius * 0.35, 0, Math.PI * 2);
  ctx.fill();

  const pulseOn = Math.sin(state.time * (5 + (scale - 1) * 1.5)) > 0.15;
  if (pulseOn) {
    ctx.fillStyle = "rgba(255, 90, 47, 0.35)";
    ctx.fillRect(x - b.attackWidth * 0.5, FLOOR_Y - 140, b.attackWidth, 140);
  }

  if (b.maxHealth) {
    const ratio = Math.max(0, b.health / b.maxHealth);
    const barW = 190;
    const barX = canvas.width - barW - 24;
    const barY = 20;
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(barX - 2, barY - 2, barW + 4, 16);
    ctx.fillStyle = "#4a1d12";
    ctx.fillRect(barX, barY, barW, 12);
    ctx.fillStyle = "#ff6132";
    ctx.fillRect(barX, barY, barW * ratio, 12);
  }
}

function drawCoin(coin, collected) {
  if (collected) {
    return;
  }
  const x = coin.x - state.cameraX;
  const y = coin.y;
  ctx.fillStyle = "#ffd84b";
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff1a8";
  ctx.beginPath();
  ctx.arc(x - 2, y - 2, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawComputer(level) {
  const x = level.finishX - state.cameraX;
  const y = 290;
  ctx.fillStyle = "#0d0f19";
  ctx.fillRect(x - 20, y - 60, 54, 80);
  ctx.fillStyle = colors.computer;
  ctx.fillRect(x - 14, y - 54, 42, 34);
  ctx.fillStyle = "#6aff9c";
  ctx.fillRect(x - 10, y - 48, 20, 8);
  ctx.fillStyle = "#456";
  ctx.fillRect(x - 3, y + 20, 20, 6);
}

function drawWorld() {
  const level = getLevel();
  const camX = state.cameraX;
  const scale = getDifficultyScale(state.levelIndex);
  const platforms = getRuntimePlatforms(level, state.time);

  for (const plat of platforms) {
    ctx.fillStyle = plat.moving ? colors.movingPlatform : colors.platform;
    ctx.fillRect(plat.x - camX, plat.y, plat.w, plat.h);
  }

  for (const laser of level.lasers) {
    const on = isLaserOn(laser, state.time, scale);
    ctx.fillStyle = on ? colors.laserOn : colors.laserOff;
    ctx.fillRect(laser.x - camX, laser.y, laser.w, laser.h);
    if (on) {
      ctx.globalAlpha = 0.25;
      ctx.fillRect(laser.x - camX - 8, laser.y, laser.w + 16, laser.h);
      ctx.globalAlpha = 1;
    }
  }

  for (const spike of level.spikes) {
    drawSpike(spike, camX);
  }
  for (const fireball of level.fireballs) {
    drawFireball(fireball);
  }
  drawBoss(level);

  for (let i = 0; i < level.coins.length; i += 1) {
    drawCoin(level.coins[i], level.coinsCollected[i]);
  }

  for (let i = 0; i < level.checkpoints.length; i += 1) {
    const cpX = level.checkpoints[i];
    const active = Boolean(state.checkpointMap[i]);
    ctx.fillStyle = active ? "#f7ff8e" : colors.checkpoint;
    ctx.fillRect(cpX - camX, 280, 8, 190);
    if (active) {
      ctx.fillStyle = "rgba(247, 255, 142, 0.35)";
      ctx.fillRect(cpX - camX - 5, 250, 18, 220);
    }
  }

  drawComputer(level);
}

function drawSignalPlayer() {
  const p = state.player;
  const cx = p.x - state.cameraX + p.w / 2;
  const cy = p.y + p.h / 2;

  ctx.save();
  ctx.globalAlpha = 0.24;
  ctx.fillStyle = "#fff86a";
  ctx.beginPath();
  ctx.arc(cx, cy, PLAYER_RADIUS + 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "#ffe34f";
  ctx.beginPath();
  ctx.arc(cx, cy, PLAYER_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff7b8";
  ctx.beginPath();
  ctx.arc(cx - 5, cy - 5, PLAYER_RADIUS * 0.42, 0, Math.PI * 2);
  ctx.fill();
}

function drawCenteredLines(lines, top, size = 24) {
  ctx.font = `${size}px Arial`;
  for (let i = 0; i < lines.length; i += 1) {
    const text = lines[i];
    ctx.fillText(text, canvas.width / 2 - ctx.measureText(text).width / 2, top + i * (size + 10));
  }
}

function wrapTextLines(text, maxWidth, size = 28) {
  ctx.font = `${size}px Arial`;
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
    } else {
      if (line) {
        lines.push(line);
      }
      line = word;
    }
  }
  if (line) {
    lines.push(line);
  }
  return lines;
}

function drawMenu() {
  ctx.fillStyle = colors.panel;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 56px Arial";
  const title = "THE LAST SIGNAL";
  ctx.fillText(title, canvas.width / 2 - ctx.measureText(title).width / 2, 150);

  const menuItems = ["Start Story", "Level Select (1-10)", "Settings", "How To Play"];
  ctx.font = "30px Arial";
  for (let i = 0; i < menuItems.length; i += 1) {
    ctx.fillStyle = i === state.menuIndex ? "#ffd84b" : "#ffffff";
    const text = menuItems[i];
    ctx.fillText(text, canvas.width / 2 - ctx.measureText(text).width / 2, 240 + i * 48);
  }

  ctx.fillStyle = "#d8d8ff";
  drawCenteredLines([
    "W A S D + Space",
    "Enter: Select   Arrow Up/Down: Menu",
  ], 450, 20);
}

function drawSettings() {
  ctx.fillStyle = colors.panel;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 48px Arial";
  drawCenteredLines(["SETTINGS"], 150, 48);
  drawCenteredLines([
    `Music: ${state.musicEnabled ? "ON" : "OFF"} (Press M)`,
    "Press Esc to return",
  ], 250, 28);
}

function drawStory() {
  const level = getLevel();
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f6f7ff";
  drawCenteredLines([level.name], 95, 42);

  const visibleStory = level.story.slice(0, Math.floor(state.storyProgress));
  const storyLines = wrapTextLines(visibleStory, canvas.width - 180, 27);
  ctx.font = "27px Arial";
  let y = 190;
  for (const line of storyLines) {
    ctx.fillText(line, 90, y);
    y += 38;
  }

  const cursorBlink = Math.floor(state.time * 3.5) % 2 === 0;
  if (!state.storyCanContinue && cursorBlink) {
    ctx.fillText("_", 90 + ctx.measureText(storyLines[storyLines.length - 1] ?? "").width + 4, y - 38);
  }

  ctx.fillStyle = "#d0d4ff";
  const helper = state.storyCanContinue
    ? "Press Enter to continue"
    : "Press Enter to show full text";
  drawCenteredLines([helper], canvas.height - 62, 24);
}

function drawOverlay(title, subtitle, help) {
  ctx.fillStyle = colors.panel;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  drawCenteredLines([title], 200, 46);
  drawCenteredLines([subtitle], 270, 24);
  drawCenteredLines([help], 315, 22);
}

function drawHUD() {
  const level = getLevel();
  const scale = getDifficultyScale(state.levelIndex);
  ctx.fillStyle = colors.text;
  ctx.font = "18px Arial";
  ctx.fillText(level.name, 16, 28);
  ctx.fillText(`Time: ${state.time.toFixed(1)}s`, 16, 52);
  ctx.fillText(`Lives: ${state.lives}/${state.maxLives}`, 16, 76);
  ctx.fillText(`Coins: ${state.coinsInLevel}/${level.coins.length} (Total ${state.coinsTotal})`, 16, 100);
  ctx.fillText(`Checkpoint Charge: +1 life`, 16, 124);

  const best = state.bestTimes[state.levelIndex];
  if (best !== null) {
    ctx.fillText(`Best: ${best.toFixed(1)}s`, 16, 148);
  }
  ctx.fillText(`Difficulty: x${scale.toFixed(2)}`, 16, best !== null ? 172 : 148);
  if (level.boss?.maxHealth) {
    const hpText = level.boss.defeated
      ? "Boss Core: Neutralized"
      : `Boss Core: ${Math.max(0, level.boss.health)}/${level.boss.maxHealth}`;
    ctx.fillText(hpText, 16, best !== null ? 196 : 172);
  }
}

function drawSplash() {
  ctx.fillStyle = "#05070e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (splashLoaded) {
    const w = 330;
    const h = 170;
    ctx.drawImage(splashImage, canvas.width / 2 - w / 2, 120, w, h);
  } else {
    drawCenteredLines(["SIGNAL STUDIOS"], 215, 46);
  }
  ctx.fillStyle = "#cfd2ff";
  drawCenteredLines(["Presents"], 335, 26);
}

let lastTs = performance.now();
function gameLoop(ts) {
  const dt = Math.min((ts - lastTs) / 1000, 0.033);
  lastTs = ts;

  update(dt);
  drawBackground();

  if (state.scene === "splash") {
    drawSplash();
  } else if (isMenuScene()) {
    if (state.scene === "menu") {
      drawMenu();
    } else if (state.scene === "settings") {
      drawSettings();
    } else if (state.scene === "story") {
      drawStory();
    }
  } else {
    drawWorld();
    drawSignalPlayer();
    drawHUD();

    if (state.scene === "paused") {
      drawOverlay("PAUSED", "Signal hold.", "Press P to continue");
    } else if (state.scene === "dead") {
      drawOverlay("SYSTEM FAILURE", "All lives lost.", "Press R to retry level");
    } else if (state.scene === "levelComplete") {
      drawOverlay("SECTOR CLEARED", "Terminal synced.", "Press Enter for next sector");
    } else if (state.scene === "gameComplete") {
      drawOverlay(
        "TRANSMISSION COMPLETE",
        "The Last Signal reached the computer.",
        "Press Enter for main menu"
      );
    }
  }

  requestAnimationFrame(gameLoop);
}

function handleMenuConfirm() {
  playSfx("menuSelect", 0.45);
  if (state.menuIndex === 0) {
    startLevel(0);
  } else if (state.menuIndex === 1) {
    startLevel(0);
  } else if (state.menuIndex === 2) {
    state.scene = "settings";
  } else {
    state.scene = "story";
    state.storyProgress = -1;
  }
}

window.addEventListener("keydown", (e) => {
  const code = e.code;

  if (state.scene === "splash") {
    if (code === "Enter" || code === "Space") {
      playSfx("menuSelect", 0.42);
      enterMainMenu();
    }
    tryStartMusic();
    return;
  }

  if (state.scene === "menu") {
    if (code === "ArrowUp") {
      state.menuIndex = (state.menuIndex + 3) % 4;
      playSfx("menuMove", 0.35);
    } else if (code === "ArrowDown") {
      state.menuIndex = (state.menuIndex + 1) % 4;
      playSfx("menuMove", 0.35);
    } else if (code === "Enter") {
      handleMenuConfirm();
    } else if (code === "Digit1") {
      playSfx("menuSelect", 0.43);
      startLevel(0);
    } else if (code === "Digit2") {
      playSfx("menuSelect", 0.43);
      startLevel(1);
    } else if (code === "Digit3") {
      playSfx("menuSelect", 0.43);
      startLevel(2);
    } else if (code === "Digit4") {
      playSfx("menuSelect", 0.43);
      startLevel(3);
    } else if (code === "Digit5") {
      playSfx("menuSelect", 0.43);
      startLevel(4);
    } else if (code === "Digit6") {
      playSfx("menuSelect", 0.43);
      startLevel(5);
    } else if (code === "Digit7") {
      playSfx("menuSelect", 0.43);
      startLevel(6);
    } else if (code === "Digit8") {
      playSfx("menuSelect", 0.43);
      startLevel(7);
    } else if (code === "Digit9") {
      playSfx("menuSelect", 0.43);
      startLevel(8);
    } else if (code === "Digit0") {
      playSfx("menuSelect", 0.43);
      startLevel(9);
    }
    tryStartMusic();
    return;
  }

  if (state.scene === "settings") {
    if (code === "KeyM") {
      playSfx("menuSelect", 0.4);
      state.musicEnabled = !state.musicEnabled;
      applyMusicState();
    } else if (code === "Escape" || code === "Enter") {
      playSfx("back", 0.4);
      enterMainMenu();
    }
    return;
  }

  if (state.scene === "story") {
    if (state.storyProgress === -1) {
      if (code === "Escape" || code === "Enter") {
        playSfx("back", 0.4);
        enterMainMenu();
      }
    } else if (code === "Enter") {
      playSfx("menuSelect", 0.38);
      const storyLen = (getLevel().story ?? "").length;
      if (!state.storyCanContinue) {
        state.storyProgress = storyLen;
        state.storyCanContinue = true;
      } else {
        beginGameplay();
      }
    } else if (code === "Escape") {
      playSfx("back", 0.4);
      enterMainMenu();
    }
    return;
  }

  if (code === "KeyP" && (state.scene === "playing" || state.scene === "paused")) {
    state.scene = state.scene === "playing" ? "paused" : "playing";
    playSfx(state.scene === "paused" ? "pause" : "unpause", 0.45);
    applyMusicState();
  }

  if (state.scene === "playing") {
    if (code === "KeyA") {
      input.left = true;
    }
    if (code === "KeyD") {
      input.right = true;
    }
    if (code === "KeyS") {
      input.down = true;
    }
    if (code === "Space" || code === "KeyW" || code === "ArrowUp") {
      input.jumpPressed = true;
      e.preventDefault();
    }
  }

  if (code === "KeyR") {
    if (state.scene === "dead") {
      playSfx("menuSelect", 0.45);
      startLevel(state.levelIndex);
    } else if (state.scene === "playing") {
      playSfx("back", 0.4);
      resetPlayerPosition();
    }
  }

  if (code === "Enter") {
    if (state.scene === "levelComplete") {
      playSfx("menuSelect", 0.45);
      startLevel(state.levelIndex + 1);
    } else if (state.scene === "gameComplete") {
      playSfx("menuSelect", 0.45);
      enterMainMenu();
    }
  }

  if (code === "Escape" && (state.scene === "playing" || state.scene === "paused")) {
    playSfx("back", 0.4);
    enterMainMenu();
  }

  tryStartMusic();
});

window.addEventListener("keyup", (e) => {
  const code = e.code;
  if (code === "KeyA") {
    input.left = false;
  }
  if (code === "KeyD") {
    input.right = false;
  }
  if (code === "KeyS") {
    input.down = false;
  }
});

requestAnimationFrame(gameLoop);

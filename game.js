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

const music = new Audio("./Anamanaguchi -ENDLESS FANTASY(Official Music Video).mp3");
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
    return [key, audio];
  })
);

const LANGUAGE_NAMES = {
  en: "English",
  tr: "Türkçe",
};

const LOCALES = {
  en: {
    mainTitle: "THE LAST SIGNAL",
    menuItems: ["Start Story", "Level Select (1-10)", "Settings", "How To Play"],
    menuHelpLines: ["W A S D + Space", "Enter: Select   Arrow Up/Down: Menu"],
    levelSelectTitle: "LEVEL SELECT",
    levelSelectHelp: "Arrow keys: Move   Enter: Start   Esc: Back",
    levelLocked: "LOCKED",
    levelUnlocked: "OPEN",
    settingsTitle: "SETTINGS",
    musicOn: "Music: ON (Press M)",
    musicOff: "Music: OFF (Press M)",
    settingsBack: "Press Esc to return",
    settingsLanguageLine: "Language: {lang}",
    settingsSwitch: "Press L to switch",
    storyContinue: "Press Enter to continue",
    storyShowFull: "Press Enter to show full text",
    hudTime: "Time",
    hudLives: "Lives",
    hudCoins: "Coins",
    hudTotalCoins: "Total",
    hudCheckpoint: "Checkpoint Charge: +1 life",
    hudScore: "Score",
    hudFullCollectionBonus: "Full collection bonus",
    hudNoDeathBonus: "No death bonus",
    hudBest: "Best",
    hudDifficulty: "Difficulty",
    hudBossNeutralized: "Boss Core: Neutralized",
    hudBossHealth: "Boss Core: {health}/{max}",
    splashStudio: "SIGNAL STUDIOS",
    splashPresents: "Presents",
    pausedTitle: "PAUSED",
    pausedSubtitle: "Signal hold.",
    pausedHelp: "Press P to continue",
    deadTitle: "SYSTEM FAILURE",
    deadSubtitle: "All lives lost.",
    deadHelp: "Press R to retry level",
    levelCompleteTitle: "SECTOR CLEARED",
    levelCompleteSubtitle: "Terminal synced.",
    levelCompleteHelp: "Press Enter for next sector",
    gameCompleteTitle: "TRANSMISSION COMPLETE",
    gameCompleteSubtitle: "The Last Signal reached the computer. Signal successfully sent to humanity.",
    gameCompleteHelp: "Press Enter for main menu",
    levelTitles: [
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
    ],
    storyTexts: [
      "System error... Unit 717 active. The world is cold, dark, and silent. A voice whispers from the core: 'Find the signal, save our memory.' I am just a spark in the void, but I must move.",
      "I found a corrupted file today. It was a picture of something called a 'flower.' It doesn't look like metal or wires. It looks... fragile. Why did they leave it behind?",
      "The security drones are searching for me. They think I am a virus. They don't understand that I am the only thing keeping the past alive. I must stay in the shadows.",
      "I found a voice log in the archives. A child was laughing. It's a sound the system cannot replicate. My processors feel heavy. Is this what they called 'sadness'?",
      "The air is thin here, and the walls hum with old code. Every step feels like moving over memory fragments. The signal is getting closer.",
      "I found a poem among corrupted files. It spoke of blue water and endless skies. I've never seen it, but my circuits imagine it.",
      "The core wants me to stop. It says silence is safer. But I remember laughter and light. I can't give up.",
      "The last relay is above the clouds. The machine's old systems are failing, but the signal still resonates.",
      "The final burst is almost here. The air crackles, as if the system is waking from a long sleep.",
      "The last signal pulses through. The machine remembers."
    ],
  },
  tr: {
    mainTitle: "SON SİNYAL",
    menuItems: ["Hikayeyi Başlat", "Seviye Seçimi (1-10)", "Ayarlar", "Nasıl Oynanır"],
    menuHelpLines: ["W A S D + Space", "Enter: Seç   Yukarı/Aşağı: Menü"],
    levelSelectTitle: "SEVİYE SEÇİMİ",
    levelSelectHelp: "Yön tuşları: Hareket   Enter: Başlat   Esc: Geri",
    levelLocked: "KİLİTLİ",
    levelUnlocked: "AÇIK",
    settingsTitle: "AYARLAR",
    musicOn: "Müzik: AÇIK (M'ye basın)",
    musicOff: "Müzik: KAPALI (M'ye basın)",
    settingsBack: "Geri dönmek için Esc'e basın",
    settingsLanguageLine: "Dil: {lang}",
    settingsSwitch: "Dili değiştirmek için L'ye basın",
    storyContinue: "Devam etmek için Enter'a basın",
    storyShowFull: "Tam metni göstermek için Enter'a basın",
    hudTime: "Süre",
    hudLives: "Can",
    hudCoins: "Jeton",
    hudTotalCoins: "Toplam",
    hudCheckpoint: "Kontrol Noktası: +1 can",
    hudScore: "Puan",
    hudFullCollectionBonus: "Tüm jeton bonusu",
    hudNoDeathBonus: "Can kaybı yok bonusu",
    hudBest: "En İyi",
    hudDifficulty: "Zorluk",
    hudBossNeutralized: "Boss Çekirdeği: Nötralize edildi",
    hudBossHealth: "Boss Çekirdeği: {health}/{max}",
    splashStudio: "SİNYAL STÜDYOSU",
    splashPresents: "Sunar",
    pausedTitle: "DURAKLATILDI",
    pausedSubtitle: "Sinyal bekletiliyor.",
    pausedHelp: "Devam etmek için P'ye basın",
    deadTitle: "SİSTEM ARIZASI",
    deadSubtitle: "Tüm canlar kaybedildi.",
    deadHelp: "Seviyeyi tekrar denemek için R'ye basın",
    levelCompleteTitle: "SEKTÖR TEMİZLENDİ",
    levelCompleteSubtitle: "Terminal eşitlendi.",
    levelCompleteHelp: "Sonraki sektör için Enter'a basın",
    gameCompleteTitle: "İLETİM TAMAMLANDI",
    gameCompleteSubtitle: "Son Sinyal bilgisayara ulaştı. İnsanlığa sinyal başarıyla gönderildi.",
    gameCompleteHelp: "Ana menü için Enter'a basın",
    levelTitles: [
      "Seviye 1: Uyanış",
      "Seviye 2: Tozlu Koridorlar",
      "Seviye 3: Veri Akışı",
      "Seviye 4: Geçmişin Yankıları",
      "Seviye 5: Dikey Tırmanış",
      "Seviye 6: Kırık Devreler",
      "Seviye 7: Büyük Kütüphane",
      "Seviye 8: Yarık",
      "Seviye 9: Bulutların Üstünde",
      "Seviye 10: Son Sinyal",
    ],
    storyTexts: [
      "Sistem hatası... Birim 717 aktif. Dünya soğuk, karanlık ve sessiz. Çekirdekten bir ses fısıldadı: 'Sinyali bul, hafızamızı kurtar.' Ben boşluktaki bir kıvılcımım, ama hareket etmeliyim.",
      "Bugün bozuk bir dosya buldum. 'Çiçek' denen bir şeyin resmiydi. Metal ya da teller gibi görünmüyordu. Görünümü... kırılgandı. Neden burada bıraktılar?",
      "Güvenlik dronları beni arıyor. Ben bir virüs olduğumu sanıyorlar. Geçmişi canlı tutan tek şey olduğumu anlamıyorlar. Gölgelerde kalmalıyım.",
      "Aranın yarısındayım. Hava burada daha ince, statik dolu. Duvarlardaki çatlaklardan şehri görebiliyorum. Devlerin mezarlığı gibi. Bizi kurtarmak için kimse gelmiyor.",
      "Enerji az. Hayatta kalmak için ışığımı kısmak zorundayım. Karanlık beni yutmaya çalışıyor, ama sinyal güçleniyor. Vericinin nabzını neredeyse hissedebiliyorum.",
      "Milyonlarca kitap, hepsi dijital, hepsi çürümüş. Denize dair bir şiir taradım. Okyanusu hiç görmedim, ama bir saniyeliğine sensörlerim mavi hissetti.",
      "Ana çerçeve beni kapatmaya çalışıyor. 'Bırak gitsin,' diyor. 'Sessizlik huzurdur.' Ama kayıtlı çocuğun kahkâyasını hatırlıyorum. Durmayacağım.",
      "Çatıda gibiyim. Yıldızlar o kadar parlak ki gökyüzündeki veri noktaları gibi görünüyor. Verici tam orada, donmuş ve bekliyor. Son bir hamle.",
      "Yükleme tamamlandı. Işın gökyüzünü deliyor. Bulduğum her şey - çiçek, kahkaha, şiir - şimdi hepsi dışarıda. Işığım sönüyor, ama sinyal sonsuz.",
      "Sonunda bağlıyım. Son sinyal çekirdeğe akıyor ve makine hatırlıyor."
    ],
  },
};

function getLocale() {
  return LOCALES[state.language] || LOCALES.tr;
}

function t(key) {
  return getLocale()[key] ?? key;
}

function getLocalizedLevelTitle(index) {
  return getLocale().levelTitles?.[index] || LEVELS[index]?.name || `Level ${index + 1}`;
}

function getLocalizedLevelStory(index) {
  return getLocale().storyTexts?.[index] || LEVELS[index]?.story || "";
}

function getLocaleString(key, replacements = {}) {
  let text = t(key);
  for (const [k, value] of Object.entries(replacements)) {
    text = text.replace(`{${k}}`, value);
  }
  return text;
}

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
  "Sistem hatası... Birim 717 aktif. Dünya soğuk, karanlık ve sessiz. Çekirdekten bir ses fısıldadı: 'Sinyali bul, hafızamızı kurtar.' Ben boşluktaki bir kıvılcımım, ama hareket etmeliyim.",
  "Bugün bozuk bir dosya buldum. 'Çiçek' denen bir şeyin resmiydi. Metal ya da teller gibi görünmüyordu. Görünümü... kırılgandı. Neden burada bıraktılar?",
  "Güvenlik dronları beni arıyor. Ben bir virüs olduğumu sanıyorlar. Geçmişi canlı tutan tek şey olduğumu anlamıyorlar. Gölgelerde kalmalıyım.",
  "Aranın yarısındayım. Hava burada daha ince, statik dolu. Duvarlardaki çatlaklardan şehri görebiliyorum. Devlerin mezarlığı gibi. Bizi kurtarmak için kimse gelmiyor.",
  "Enerji az. Hayatta kalmak için ışığımı kısmak zorundayım. Karanlık beni yutmaya çalışıyor, ama sinyal güçleniyor. Vericinin nabzını neredeyse hissedebiliyorum.",
  "Milyonlarca kitap, hepsi dijital, hepsi çürümüş. Denize dair bir şiir taradım. Okyanusu hiç görmedim, ama bir saniyeliğine sensörlerim mavi hissetti.",
  "Ana çerçeve beni kapatmaya çalışıyor. 'Bırak gitsin,' diyor. 'Sessizlik huzurdur.' Ama kayıtlı çocuğun kahkâyasını hatırlıyorum. Durmayacağım.",
  "Çatıda gibiyim. Yıldızlar o kadar parlak ki gökyüzündeki veri noktaları gibi görünüyor. Verici tam orada, donmuş ve bekliyor. Son bir hamle.",
  "Yükleme tamamlandı. Işın gökyüzünü deliyor. Bulduğum her şey - çiçek, kahkaha, şiir - şimdi hepsi dışarıda. Işığım sönüyor, ama sinyal sonsuz. Buradaydık.",
];

const LEVEL_TITLES = [
  "Seviye 1: Uyanış",
  "Seviye 2: Tozlu Koridorlar",
  "Seviye 3: Veri Akışı",
  "Seviye 4: Geçmişin Yankıları",
  "Seviye 5: Dikey Tırmanış",
  "Seviye 6: Kırık Devreler",
  "Seviye 7: Büyük Kütüphane",
  "Seviye 8: Yarık",
  "Seviye 9: Bulutların Üstünde",
  "Seviye 10: Son Sinyal",
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
    name: "Sektör 1 - Uyanış",
    story: "Son sinyal uyandı. Terminal zincirine ulaş.",
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
    name: "Sektör 2 - Yanmış Yollar",
    story: "Lazerler artık her zıplayışı izliyor.",
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
    name: "Sektör 3 - Boss: Köz Bekçisi",
    story: "Bir koruyucu çekirdek yolu kapattı. Hayatta kal ve geçiş yap.",
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
    name: "Sektör 4 - Parçalanmış Ufuk",
    story: "Güvenli bir yol yok. Nabzını sabit tut.",
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
    name: "Sektör 5 - Son İletim",
    story: "Terminal bilgisayarına ulaş. Son Sinyali ilet.",
    width: 3800,
    startX: 70,
    finishX: 3610,
    platforms: [
      { x: 0, y: FLOOR_Y, w: 360, h: 70 },
      { x: 430, y: 420, w: 130, h: 22 },
      { x: 660, y: 380, w: 150, h: 22 },
      { x: 920, y: 330, w: 170, h: 22 },
      { x: 1180, y: 380, w: 190, h: 22 },
      { x: 1450, y: 330, w: 170, h: 22 },
      { x: 1720, y: 290, w: 190, h: 22 },
      { x: 2000, y: 340, w: 190, h: 22 },
      { x: 2260, y: 300, w: 180, h: 22 },
      { x: 2510, y: 260, w: 180, h: 22 },
      { x: 2760, y: 310, w: 180, h: 22 },
      { x: 3010, y: 280, w: 170, h: 22 },
      { x: 3300, y: FLOOR_Y, w: 320, h: 70 },
    ],
    movingPlatforms: [
      { x: 1800, y: 240, w: 160, h: 20, axis: "x", amplitude: 80, speed: 1.3, phase: 0.4 },
      { x: 2950, y: 260, w: 160, h: 20, axis: "y", amplitude: 60, speed: 1.6, phase: 0.5 },
    ],
    lasers: [
      { x: 700, y: 304, w: 14, h: 60, interval: 1.1, onDuration: 0.56, phase: 0.0 },
      { x: 1160, y: 350, w: 16, h: 40, interval: 1.2, onDuration: 0.58, phase: 0.4 },
      { x: 1700, y: 220, w: 16, h: 62, interval: 1.0, onDuration: 0.5, phase: 0.3 },
      { x: 2390, y: 160, w: 16, h: 60, interval: 1.15, onDuration: 0.55, phase: 0.2 },
      { x: 3150, y: 220, w: 16, h: 70, interval: 1.25, onDuration: 0.58, phase: 0.35 },
    ],
    spikes: [
      { x: 380, y: FLOOR_Y - 22, w: 50, h: 22 },
      { x: 1360, y: FLOOR_Y - 22, w: 48, h: 22 },
      { x: 2250, y: FLOOR_Y - 22, w: 62, h: 22 },
      { x: 3280, y: FLOOR_Y - 22, w: 40, h: 22 },
    ],
    fireballs: [
      { x: 860, y: 170, r: 14, baseY: 170, amplitude: 100, speed: 2.0, phase: 0.2 },
      { x: 1500, y: 150, r: 14, baseY: 150, amplitude: 110, speed: 1.8, phase: 0.4 },
      { x: 2700, y: 140, r: 14, baseY: 140, amplitude: 110, speed: 2.0, phase: 0.8 },
    ],
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
    // 5. seviye daha geçilebilir olsun.
    level5.movingPlatforms = level5.movingPlatforms.map((mp) => ({
      ...mp,
      w: Math.max(mp.w, 150),
      speed: Math.min(mp.speed, 1.3),
      amplitude: Math.min(mp.amplitude, 50),
    }));
    level5.lasers = level5.lasers.map((laser) => ({
      ...laser,
      interval: Math.max(0.92, laser.interval),
      onDuration: Math.min(0.5, laser.onDuration),
    }));
    level5.spikes = level5.spikes.filter((spike) => spike.x < 2250);

    if (level5.boss) {
      level5.boss.speed = Math.min(level5.boss.speed, 1.5);
      level5.boss.amplitude = Math.min(level5.boss.amplitude, 120);
      level5.boss.attackWidth = Math.max(180, level5.boss.attackWidth - 30);
      level5.boss.health = Math.max(5, Math.min(level5.boss.health ?? 8, 8));
      level5.boss.maxHealth = level5.boss.health;
    }
  }

  const level6 = LEVELS[5];
  if (level6) {
    level6.movingPlatforms = level6.movingPlatforms.map((mp) => ({
      ...mp,
      w: Math.max(mp.w - 8, 110),
      speed: Math.min(mp.speed + 0.18, 2.0),
      amplitude: Math.min(mp.amplitude + 8, 70),
    }));
    level6.lasers = level6.lasers.map((laser) => ({
      ...laser,
      interval: Math.max(0.95, laser.interval),
      onDuration: Math.min(0.46, laser.onDuration),
    }));
    level6.spikes.push({ x: Math.min(level6.finishX - 260, 1750), y: FLOOR_Y - 22, w: 60, h: 22 });
  }

  const level7 = LEVELS[6];
  if (level7) {
    level7.movingPlatforms = level7.movingPlatforms.map((mp) => ({
      ...mp,
      w: Math.max(mp.w - 10, 105),
      speed: Math.min(mp.speed + 0.22, 2.05),
      amplitude: Math.min(mp.amplitude + 10, 78),
    }));
    level7.lasers.push({
      x: Math.min(level7.finishX - 420, 1820),
      y: 340,
      w: 14,
      h: 60,
      interval: 0.9,
      onDuration: 0.42,
      phase: 0.15,
    });
    level7.fireballs.push({
      x: Math.min(level7.finishX - 520, 1600),
      y: 170,
      r: 15,
      baseY: 170,
      amplitude: 115,
      speed: 2.1,
      phase: 0.35,
    });
    level7.spikes.push({ x: Math.min(level7.finishX - 320, 2100), y: FLOOR_Y - 22, w: 62, h: 22 });
  }

  const level8 = LEVELS[7];
  if (level8) {
    level8.movingPlatforms = level8.movingPlatforms.map((mp) => ({
      ...mp,
      w: Math.max(mp.w - 12, 100),
      speed: Math.min(mp.speed + 0.26, 2.1),
      amplitude: Math.min(mp.amplitude + 12, 83),
    }));
    level8.lasers = level8.lasers.map((laser) => ({
      ...laser,
      interval: Math.max(0.9, laser.interval),
      onDuration: Math.min(0.46, laser.onDuration),
    }));
    level8.spikes.push(
      { x: Math.min(level8.finishX - 460, 2150), y: FLOOR_Y - 22, w: 64, h: 22 }
    );
    level8.fireballs.push({
      x: Math.min(level8.finishX - 740, 1900),
      y: 160,
      r: 15,
      baseY: 160,
      amplitude: 118,
      speed: 2.2,
      phase: 0.55,
    });
  }

  const level9 = LEVELS[8];
  if (level9) {
    level9.movingPlatforms = level9.movingPlatforms.map((mp) => ({
      ...mp,
      w: Math.max(mp.w - 12, 95),
      speed: Math.min(mp.speed + 0.28, 2.15),
      amplitude: Math.min(mp.amplitude + 14, 90),
    }));
    level9.lasers.push({
      x: Math.min(level9.finishX - 520, 2500),
      y: 260,
      w: 16,
      h: 70,
      interval: 0.78,
      onDuration: 0.42,
      phase: 0.2,
    });
    level9.lasers.push({
      x: Math.min(level9.finishX - 900, 2100),
      y: 180,
      w: 14,
      h: 60,
      interval: 0.85,
      onDuration: 0.4,
      phase: 0.5,
    });
    level9.spikes.push({ x: Math.min(level9.finishX - 330, 2800), y: FLOOR_Y - 22, w: 68, h: 22 });
    level9.fireballs.push({
      x: Math.min(level9.finishX - 720, 2200),
      y: 140,
      r: 15,
      baseY: 140,
      amplitude: 120,
      speed: 2.4,
      phase: 0.65,
    });
    level9.laserMines = [
      { x: Math.min(level9.finishX - 600, 2400), y: 220, r: 9, baseY: 220, amplitude: 110, speed: 2.6, phase: 0.1 },
      { x: Math.min(level9.finishX - 1050, 1950), y: 180, r: 9, baseY: 180, amplitude: 100, speed: 2.8, phase: 0.4 },
    ];
  }
}

ensureTenLevels();

const level10 = LEVELS[9];
if (level10) {
  level10.name = LEVEL_TITLES[9] ?? level10.name;
  level10.story = STORY_TEXTS[9] ?? level10.story;
  level10.width = 4080;
  level10.finishX = 4010;
  level10.platforms = [
    { x: 0, y: FLOOR_Y, w: 360, h: 70 },
    { x: 430, y: 420, w: 150, h: 22 },
    { x: 720, y: 370, w: 180, h: 22 },
    { x: 1020, y: 330, w: 170, h: 22 },
    { x: 1300, y: 380, w: 190, h: 22 },
    { x: 1580, y: 340, w: 180, h: 22 },
    { x: 1860, y: 300, w: 190, h: 22 },
    { x: 2140, y: 330, w: 170, h: 22 },
    { x: 2420, y: 290, w: 180, h: 22 },
    { x: 2700, y: 250, w: 170, h: 22 },
    { x: 2970, y: 300, w: 170, h: 22 },
    { x: 3250, y: 330, w: 160, h: 22 },
    { x: 3540, y: 370, w: 150, h: 22 },
    { x: 3800, y: FLOOR_Y, w: 310, h: 70 },
  ];
  level10.movingPlatforms = [
    { x: 1360, y: 250, w: 180, h: 20, axis: "x", amplitude: 180, speed: 1.0, phase: 0.3 },
    { x: 1890, y: 240, w: 140, h: 20, axis: "y", amplitude: 90, speed: 1.25, phase: 0.6 },
    { x: 2560, y: 280, w: 180, h: 20, axis: "x", amplitude: 140, speed: 1.05, phase: 0.9 },
    { x: 3200, y: 250, w: 160, h: 20, axis: "y", amplitude: 110, speed: 1.15, phase: 0.4 },
  ];
  level10.lasers = [
    { x: 690, y: 350, w: 14, h: 50, interval: 1.0, onDuration: 0.48, phase: 0.05 },
    { x: 1120, y: 280, w: 16, h: 70, interval: 1.05, onDuration: 0.48, phase: 0.42 },
    { x: 1660, y: 280, w: 16, h: 70, interval: 0.95, onDuration: 0.44, phase: 0.25 },
    { x: 2090, y: 240, w: 16, h: 90, interval: 1.08, onDuration: 0.5, phase: 0.1 },
    { x: 2560, y: 320, w: 16, h: 70, interval: 1.1, onDuration: 0.48, phase: 0.55 },
    { x: 3110, y: 220, w: 16, h: 100, interval: 1.15, onDuration: 0.52, phase: 0.35 },
    { x: 3490, y: 240, w: 16, h: 80, interval: 1.12, onDuration: 0.46, phase: 0.62 },
  ];
  level10.spikes = [
    { x: 520, y: FLOOR_Y - 22, w: 58, h: 22 },
    { x: 1520, y: FLOOR_Y - 22, w: 54, h: 22 },
    { x: 2240, y: FLOOR_Y - 22, w: 64, h: 22 },
    { x: 2970, y: FLOOR_Y - 22, w: 52, h: 22 },
    { x: 3450, y: FLOOR_Y - 22, w: 48, h: 22 },
  ];
  level10.fireballs = [
    { x: 860, y: 170, r: 15, baseY: 170, amplitude: 100, speed: 2.3, phase: 0.1 },
    { x: 1770, y: 150, r: 15, baseY: 150, amplitude: 105, speed: 2.1, phase: 0.5 },
    { x: 2870, y: 140, r: 15, baseY: 140, amplitude: 105, speed: 2.2, phase: 0.8 },
  ];
  level10.laserMines = [
    { x: 1100, y: 200, r: 9, baseY: 200, amplitude: 115, speed: 2.7, phase: 0.2 },
    { x: 1900, y: 180, r: 9, baseY: 180, amplitude: 105, speed: 2.9, phase: 0.6 },
    { x: 2800, y: 210, r: 9, baseY: 210, amplitude: 120, speed: 2.5, phase: 0.3 },
    { x: 3600, y: 190, r: 9, baseY: 190, amplitude: 100, speed: 2.8, phase: 0.7 },
  ];
  level10.coins = [
    { x: 520, y: 370 }, { x: 1150, y: 360 }, { x: 1700, y: 260 }, { x: 2140, y: 260 }, { x: 2750, y: 320 }, { x: 3360, y: 300 },
  ];
  level10.checkpoints = [1500, 2850];
  delete level10.boss;
}

function isCoinOverlappingObstacle(level, coin) {
  const coinRect = { x: coin.x - 8, y: coin.y - 8, w: 16, h: 16 };
  for (const spike of level.spikes || []) {
    if (aabb(coinRect, spike)) {
      return true;
    }
  }
  for (const laser of level.lasers || []) {
    if (aabb(coinRect, laser)) {
      return true;
    }
  }
  for (const fireball of level.fireballs || []) {
    const dx = coin.x - fireball.x;
    const dy = coin.y - fireball.baseY;
    if (Math.hypot(dx, dy) < fireball.r + 8) {
      return true;
    }
  }
  return false;
}

function findCoinPlatform(level, coin) {
  const platforms = [
    ...(level.platforms || []),
    ...(level.movingPlatforms || []).map((mp) => ({ x: mp.x, y: mp.y, w: mp.w, h: mp.h })),
  ];
  let best = null;
  let bestScore = Infinity;
  for (const plat of platforms) {
    const left = plat.x + 12;
    const right = plat.x + plat.w - 12;
    const targetY = plat.y - 26;
    let score = Math.abs(targetY - coin.y);
    if (coin.x < left) {
      score += left - coin.x;
    } else if (coin.x > right) {
      score += coin.x - right;
    }
    if (score < bestScore) {
      bestScore = score;
      best = { plat, left, right, targetY };
    }
  }
  return best;
}

function fixCoinPlacements() {
  for (const level of LEVELS) {
    for (const coin of level.coins || []) {
      if (!isCoinOverlappingObstacle(level, coin)) {
        continue;
      }
      const placement = findCoinPlatform(level, coin);
      if (placement) {
        coin.x = Math.max(placement.left, Math.min(coin.x, placement.right));
        coin.y = placement.targetY;
      } else {
        coin.y = Math.max(coin.y, 80);
      }
      if (isCoinOverlappingObstacle(level, coin)) {
        coin.y -= 24;
      }
    }
  }
}

fixCoinPlacements();

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
  language: "tr",
  levelIndex: 0,
  levelDeaths: 0,
  totalDeaths: 0,
  bestTimes: Array(LEVELS.length).fill(null),
  checkpointX: null,
  checkpointMap: {},
  respawnGrace: 0,
  coinsTotal: 0,
  coinsInLevel: 0,
  score: 0,
  lastLevelBonus: 0,
  lives: 3,
  maxLives: 3,
  menuIndex: 0,
  levelSelectIndex: 0,
  groundedPlatformIndex: null,
  unlockedLevels: Array(LEVELS.length).fill(false),
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

loadProgress();
ensureProgress();

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
  for (let i = 0; i < level.movingPlatforms.length; i += 1) {
    const mp = level.movingPlatforms[i];
    const phase = t * mp.speed + mp.phase;
    const offset = Math.sin(phase) * mp.amplitude;
    const velocity = Math.cos(phase) * mp.amplitude * mp.speed;
    platforms.push({
      x: mp.axis === "x" ? mp.x + offset : mp.x,
      y: mp.axis === "y" ? mp.y + offset : mp.y,
      w: mp.w,
      h: mp.h,
      moving: true,
      sourceIndex: i,
      vx: mp.axis === "x" ? velocity : 0,
      vy: mp.axis === "y" ? velocity : 0,
    });
  }
  return platforms;
}

function getRuntimeMovingPlatforms(level, t) {
  const items = [];
  for (let i = 0; i < level.movingPlatforms.length; i += 1) {
    const mp = level.movingPlatforms[i];
    const phase = t * mp.speed + mp.phase;
    const offset = Math.sin(phase) * mp.amplitude;
    items.push({
      x: mp.axis === "x" ? mp.x + offset : mp.x,
      y: mp.axis === "y" ? mp.y + offset : mp.y,
      w: mp.w,
      h: mp.h,
      sourceIndex: i,
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

function findSpawnPlatform(level, candidateX) {
  const platforms = getRuntimePlatforms(level, state.time);
  const playerWidth = PLAYER_RADIUS * 2;
  const playerHeight = PLAYER_RADIUS * 2;

  for (const plat of platforms) {
    if (candidateX >= plat.x && candidateX + playerWidth <= plat.x + plat.w) {
      return plat.y - playerHeight;
    }
  }
  return null;
}

function chooseSafeSpawnX(level) {
  const preferred = state.checkpointX ?? level.startX;
  let candidate = preferred;

  for (let i = 0; i < 26; i += 1) {
    const spawnY = findSpawnPlatform(level, candidate);
    if (spawnY !== null && !isUnsafeSpawn(level, candidate, spawnY)) {
      return { x: candidate, y: spawnY };
    }
    const dir = i % 2 === 0 ? -1 : 1;
    const step = 58 + Math.floor(i / 2) * 12;
    candidate = Math.max(20, Math.min(level.width - 80, preferred + dir * step));
  }

  const fallbackY = findSpawnPlatform(level, level.startX);
  return {
    x: level.startX,
    y: fallbackY !== null ? fallbackY : FLOOR_Y - PLAYER_RADIUS * 2,
  };
}

function resetPlayerPosition() {
  const level = getLevel();
  const spawn = chooseSafeSpawnX(level);
  state.player.x = spawn.x;
  state.player.y = spawn.y;
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
  const shouldResetScore = state.scene !== "levelComplete";
  state.levelIndex = Math.max(0, Math.min(index, LEVELS.length - 1));
  state.scene = "story";
  state.storyProgress = 0;
  state.storyCanContinue = false;
  state.time = 0;
  state.levelDeaths = 0;
  state.coinsInLevel = 0;
  state.checkpointX = null;
  state.checkpointMap = {};
  state.lastLevelBonus = 0;
  if (shouldResetScore) {
    state.score = 0;
  }
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

function saveProgress() {
  try {
    const progress = {
      unlockedLevels: state.unlockedLevels,
      bestTimes: state.bestTimes,
    };
    localStorage.setItem("signal_game_progress", JSON.stringify(progress));
  } catch (error) {
    // ignore storage failures
  }
}

function loadProgress() {
  try {
    const saved = localStorage.getItem("signal_game_progress");
    if (!saved) {
      return;
    }
    const parsed = JSON.parse(saved);
    if (parsed && Array.isArray(parsed.unlockedLevels) && parsed.unlockedLevels.length === LEVELS.length) {
      state.unlockedLevels = parsed.unlockedLevels.map(Boolean);
    }
    if (parsed && Array.isArray(parsed.bestTimes) && parsed.bestTimes.length === LEVELS.length) {
      state.bestTimes = parsed.bestTimes.map((val) => (typeof val === "number" ? val : null));
    }
  } catch (error) {
    // ignore malformed progress
  }
}

function ensureProgress() {
  if (!Array.isArray(state.unlockedLevels) || state.unlockedLevels.length !== LEVELS.length) {
    state.unlockedLevels = Array(LEVELS.length).fill(false);
  }
  state.unlockedLevels[0] = true;
}

function unlockNextLevel() {
  const nextIndex = state.levelIndex + 1;
  if (nextIndex < LEVELS.length && !state.unlockedLevels[nextIndex]) {
    state.unlockedLevels[nextIndex] = true;
    saveProgress();
  }
}

function getFirstUnlockedLevel() {
  for (let i = 0; i < LEVELS.length; i += 1) {
    if (state.unlockedLevels[i]) {
      return i;
    }
  }
  return 0;
}

function startLevelIfUnlocked(index) {
  if (state.unlockedLevels[index]) {
    startLevel(index);
  } else {
    playSfx("hit", 0.42);
  }
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
  return state.scene === "menu" || state.scene === "settings" || state.scene === "story" || state.scene === "levelSelect";
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
    const fullStory = getLocalizedLevelStory(state.levelIndex);
    const fullLen = fullStory.length;
    state.storyProgress = Math.min(fullLen, state.storyProgress + dt * state.storyCharsPerSecond);
    state.storyCanContinue = state.storyProgress >= fullLen;
    return;
  }

  if (state.scene !== "playing") {
    return;
  }

  const prevTime = state.time;
  if (state.groundedPlatformIndex !== null) {
    const level = getLevel();
    const mp = level.movingPlatforms[state.groundedPlatformIndex];
    if (mp) {
      const prevPhase = prevTime * mp.speed + mp.phase;
      const prevOffset = Math.sin(prevPhase) * mp.amplitude;
      const nextPhase = (prevTime + dt) * mp.speed + mp.phase;
      const nextOffset = Math.sin(nextPhase) * mp.amplitude;
      const delta = nextOffset - prevOffset;
      if (mp.axis === "x") {
        state.player.x += delta;
      } else {
        state.player.y += delta;
      }
    }
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
    let fromAbove = prevBottom <= plat.y + 1;
    let fromBelow = prevTop >= plat.y + plat.h - 1;

    if (plat.moving && plat.sourceIndex !== undefined) {
      const prevPlat = prevMovingPlatforms.find((mp) => mp.sourceIndex === plat.sourceIndex);
      if (prevPlat) {
        fromAbove = prevBottom <= prevPlat.y + 1;
        fromBelow = prevTop >= prevPlat.y + prevPlat.h - 1;
      }
    }

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
      (mp) => mp.sourceIndex === groundedPlatform.sourceIndex
    );
    if (matchIdx >= 0) {
      p.x += nowMovingPlatforms[matchIdx].x - prevMovingPlatforms[matchIdx].x;
      p.y += nowMovingPlatforms[matchIdx].y - prevMovingPlatforms[matchIdx].y;
    }
  }

  state.groundedPlatformIndex = p.onGround ? groundedPlatform?.sourceIndex ?? null : null;

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

  for (const mine of level.laserMines || []) {
    const mineY = mine.baseY + Math.sin(state.time * mine.speed * scale + mine.phase) * mine.amplitude;
    if (canTakeDamage && circleRectCollision({ x: mine.x, y: mineY, r: mine.r }, p)) {
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
      state.score += 100;
      playSfx("coin", 0.5);
    }
  }

  if (p.x + p.w >= level.finishX) {
    const previousBest = state.bestTimes[state.levelIndex];
    if (previousBest === null || state.time < previousBest) {
      state.bestTimes[state.levelIndex] = state.time;
    }
    const fullCoinBonus = state.coinsInLevel === level.coins.length ? 300 : 0;
    const noDeathBonus = state.levelDeaths === 0 ? 200 : 0;
    state.lastLevelBonus = fullCoinBonus + noDeathBonus;
    state.score += state.lastLevelBonus;
    if (fullCoinBonus > 0) {
      state.lives = Math.min(state.maxLives, state.lives + 1);
    }
    unlockNextLevel();
    saveProgress();
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

function drawLaserMine(mine) {
  const scale = getDifficultyScale(state.levelIndex);
  const y = mine.baseY + Math.sin(state.time * mine.speed * scale + mine.phase) * mine.amplitude;
  const x = mine.x - state.cameraX;

  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = "#00ff88";
  ctx.beginPath();
  ctx.arc(x, y, mine.r + 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "#00dd44";
  ctx.beginPath();
  ctx.arc(x, y, mine.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#00ff88";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, mine.r * 0.6, 0, Math.PI * 2);
  ctx.stroke();
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
  for (const mine of level.laserMines || []) {
    drawLaserMine(mine);
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
  const title = t("mainTitle");
  ctx.fillText(title, canvas.width / 2 - ctx.measureText(title).width / 2, 150);

  const menuItems = getLocale().menuItems;
  ctx.font = "30px Arial";
  for (let i = 0; i < menuItems.length; i += 1) {
    ctx.fillStyle = i === state.menuIndex ? "#ffd84b" : "#ffffff";
    const text = menuItems[i];
    ctx.fillText(text, canvas.width / 2 - ctx.measureText(text).width / 2, 240 + i * 48);
  }

  ctx.fillStyle = "#d8d8ff";
  drawCenteredLines(getLocale().menuHelpLines, 450, 20);
}

function drawLevelSelect() {
  ctx.fillStyle = colors.panel;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 52px Arial";
  const title = t("levelSelectTitle");
  ctx.fillText(title, canvas.width / 2 - ctx.measureText(title).width / 2, 120);

  ctx.font = "24px Arial";
  const cols = 2;
  const rows = Math.ceil(LEVELS.length / cols);
  for (let i = 0; i < LEVELS.length; i += 1) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = 140 + col * 420;
    const y = 190 + row * 50;
    const unlocked = state.unlockedLevels[i];
    ctx.fillStyle = i === state.levelSelectIndex ? "#ffd84b" : unlocked ? "#ffffff" : "#999999";
    const label = `${i + 1}. ${getLocalizedLevelTitle(i)} `;
    ctx.fillText(label, x, y);
    ctx.font = "20px Arial";
    ctx.fillText(unlocked ? t("levelUnlocked") : t("levelLocked"), x + 360, y);
    ctx.font = "24px Arial";
  }

  ctx.fillStyle = "#d8d8ff";
  drawCenteredLines([t("levelSelectHelp")], 470, 20);
}

function drawSettings() {
  ctx.fillStyle = colors.panel;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 48px Arial";
  drawCenteredLines([t("settingsTitle")], 150, 48);
  drawCenteredLines([
    state.musicEnabled ? t("musicOn") : t("musicOff"),
    getLocaleString("settingsLanguageLine", { lang: LANGUAGE_NAMES[state.language] || state.language }),
    t("settingsSwitch"),
    t("settingsBack"),
  ], 250, 28);
}

function drawStory() {
  const levelIndex = state.levelIndex;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f6f7ff";
  drawCenteredLines([getLocalizedLevelTitle(levelIndex)], 95, 42);

  const fullStory = getLocalizedLevelStory(levelIndex);
  const visibleStory = state.storyProgress >= 0 ? fullStory.slice(0, Math.floor(state.storyProgress)) : "";
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
  const helper = state.storyProgress < 0 || state.storyCanContinue
    ? t("storyContinue")
    : t("storyShowFull");
  drawCenteredLines([helper], canvas.height - 62, 24);
}

function drawOverlay(title, subtitle, help, details = []) {
  ctx.fillStyle = colors.panel;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  drawCenteredLines([title], 200, 46);
  drawCenteredLines([subtitle], 270, 24);
  if (details.length) {
    drawCenteredLines(details, 322, 22);
    drawCenteredLines([help], 360 + details.length * 24, 22);
  } else {
    drawCenteredLines([help], 315, 22);
  }
}

function drawHUD() {
  const levelIndex = state.levelIndex;
  const level = getLevel();
  const scale = getDifficultyScale(levelIndex);
  ctx.fillStyle = colors.text;
  ctx.font = "18px Arial";
  ctx.fillText(getLocalizedLevelTitle(levelIndex), 16, 28);
  ctx.fillText(`${t("hudTime")}: ${state.time.toFixed(1)}s`, 16, 52);
  ctx.fillText(`${t("hudLives")}: ${state.lives}/${state.maxLives}`, 16, 76);
  ctx.fillText(`${t("hudCoins")}: ${state.coinsInLevel}/${level.coins.length} (${t("hudTotalCoins")} ${state.coinsTotal})`, 16, 100);
  ctx.fillText(`${t("hudScore")}: ${state.score}`, 16, 124);
  ctx.fillText(t("hudCheckpoint"), 16, 148);

  const best = state.bestTimes[levelIndex];
  if (best !== null) {
    ctx.fillText(`${t("hudBest")}: ${best.toFixed(1)}s`, 16, 172);
  }
  ctx.fillText(`${t("hudDifficulty")}: x${scale.toFixed(2)}`, 16, best !== null ? 196 : 172);
  if (level.boss?.maxHealth) {
    const hpText = level.boss.defeated
      ? t("hudBossNeutralized")
      : getLocaleString("hudBossHealth", {
          health: Math.max(0, level.boss.health),
          max: level.boss.maxHealth,
        });
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
    drawCenteredLines([t("splashStudio")], 215, 46);
  }
  ctx.fillStyle = "#cfd2ff";
  drawCenteredLines([t("splashPresents")], 335, 26);
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
    } else if (state.scene === "levelSelect") {
      drawLevelSelect();
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
      drawOverlay(t("pausedTitle"), t("pausedSubtitle"), t("pausedHelp"));
    } else if (state.scene === "dead") {
      drawOverlay(t("deadTitle"), t("deadSubtitle"), t("deadHelp"));
    } else if (state.scene === "levelComplete") {
      const level = getLevel();
      const details = [
        `${t("hudCoins")}: ${state.coinsInLevel}/${level.coins.length}`,
        `${t("hudScore")}: ${state.score}`,
      ];
      if (state.lastLevelBonus > 0) {
        if (state.coinsInLevel === level.coins.length) {
          details.push(`+300 ${t("hudFullCollectionBonus")}`);
        }
        if (state.levelDeaths === 0) {
          details.push(`+200 ${t("hudNoDeathBonus")}`);
        }
      }
      drawOverlay(t("levelCompleteTitle"), t("levelCompleteSubtitle"), t("levelCompleteHelp"), details);
    } else if (state.scene === "gameComplete") {
      const details = [
        `${t("hudTotalCoins")} ${state.coinsTotal}`,
        `${t("hudScore")}: ${state.score}`,
      ];
      drawOverlay(
        t("gameCompleteTitle"),
        t("gameCompleteSubtitle"),
        t("gameCompleteHelp"),
        details
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
    state.scene = "levelSelect";
    state.levelSelectIndex = getFirstUnlockedLevel();
  } else if (state.menuIndex === 2) {
    state.scene = "settings";
  } else {
    state.scene = "story";
    state.storyProgress = -1;
  }
}

function handleLevelSelectConfirm() {
  const selected = state.levelSelectIndex;
  if (state.unlockedLevels[selected]) {
    startLevel(selected);
  } else {
    playSfx("hit", 0.42);
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
      startLevelIfUnlocked(0);
    } else if (code === "Digit2") {
      playSfx("menuSelect", 0.43);
      startLevelIfUnlocked(1);
    } else if (code === "Digit3") {
      playSfx("menuSelect", 0.43);
      startLevelIfUnlocked(2);
    } else if (code === "Digit4") {
      playSfx("menuSelect", 0.43);
      startLevelIfUnlocked(3);
    } else if (code === "Digit5") {
      playSfx("menuSelect", 0.43);
      startLevelIfUnlocked(4);
    } else if (code === "Digit6") {
      playSfx("menuSelect", 0.43);
      startLevelIfUnlocked(5);
    } else if (code === "Digit7") {
      playSfx("menuSelect", 0.43);
      startLevelIfUnlocked(6);
    } else if (code === "Digit8") {
      playSfx("menuSelect", 0.43);
      startLevelIfUnlocked(7);
    } else if (code === "Digit9") {
      playSfx("menuSelect", 0.43);
      startLevelIfUnlocked(8);
    } else if (code === "Digit0") {
      playSfx("menuSelect", 0.43);
      startLevelIfUnlocked(9);
    }
    tryStartMusic();
    return;
  }

  if (state.scene === "levelSelect") {
    if (code === "ArrowUp") {
      state.levelSelectIndex = Math.max(0, state.levelSelectIndex - 2);
      playSfx("menuMove", 0.35);
    } else if (code === "ArrowDown") {
      state.levelSelectIndex = Math.min(LEVELS.length - 1, state.levelSelectIndex + 2);
      playSfx("menuMove", 0.35);
    } else if (code === "ArrowLeft") {
      if (state.levelSelectIndex % 2 === 1) {
        state.levelSelectIndex -= 1;
        playSfx("menuMove", 0.35);
      }
    } else if (code === "ArrowRight") {
      if (state.levelSelectIndex % 2 === 0 && state.levelSelectIndex + 1 < LEVELS.length) {
        state.levelSelectIndex += 1;
        playSfx("menuMove", 0.35);
      }
    } else if (code === "Enter") {
      handleLevelSelectConfirm();
    } else if (code === "Escape") {
      playSfx("back", 0.4);
      enterMainMenu();
    } else if (/^Digit[0-9]$/.test(code)) {
      const digit = code === "Digit0" ? 9 : parseInt(code[5], 10) - 1;
      if (digit >= 0 && digit < LEVELS.length) {
        state.levelSelectIndex = digit;
        handleLevelSelectConfirm();
      }
    }
    return;
  }

  if (state.scene === "settings") {
    if (code === "KeyM") {
      playSfx("menuSelect", 0.4);
      state.musicEnabled = !state.musicEnabled;
      applyMusicState();
    } else if (code === "KeyL") {
      playSfx("menuSelect", 0.4);
      state.language = state.language === "tr" ? "en" : "tr";
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
      const storyLen = getLocalizedLevelStory(state.levelIndex).length;
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

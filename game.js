// Asset paths — loaded from /assets folder
const ASSETS = {
  "chris_idle": "assets/chris_idle.png",
  "chris_windup": "assets/chris_windup.png",
  "chris_release": "assets/chris_release.png",
  "chris_portrait": "assets/chris_portrait.png",
  "breeze_idle": "assets/breeze_idle.png",
  "breeze_windup": "assets/breeze_windup.png",
  "breeze_release": "assets/breeze_release.png",
  "breeze_portrait": "assets/breeze_portrait.png",
  "magic_idle": "assets/magic_idle.png",
  "magic_windup": "assets/magic_windup.png",
  "magic_release": "assets/magic_release.png",
  "magic_portrait": "assets/magic_portrait.png"
};

const CHARACTERS = [
  {
    key: 'chris',
    portraitKey: 'chris_portrait',
    name: 'CHRIS',
    tagline: 'The Real One',
    color: 0xff6b1a,
    colorCss: '#ff6b1a',
    stats: { shot: 85, speed: 75, style: 99 },
    desc: 'No nickname needed. Just Chris. The streets already know.'
  },
  {
    key: 'breeze',
    portraitKey: 'breeze_portrait',
    name: 'BREEZE',
    tagline: 'Coastal Cool',
    color: 0x1ac8d4,
    colorCss: '#1ac8d4',
    stats: { shot: 80, speed: 90, style: 85 },
    desc: 'Cool as a sea breeze. By the time you turn around, he\'s gone.'
  },
  {
    key: 'magic',
    portraitKey: 'magic_portrait',
    name: 'MAGIC',
    tagline: 'The Closer',
    color: 0xe63946,
    colorCss: '#e63946',
    stats: { shot: 99, speed: 80, style: 80 },
    desc: 'Wears 23. Spins the rock, sinks the shot. Pure magic.'
  }
];

// ----------------------------------------------------------------------------
// BOOT SCENE — preload all assets
// ----------------------------------------------------------------------------
class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    const w = this.scale.width, h = this.scale.height;
    const barBg = this.add.rectangle(w/2, h/2, 360, 6, 0x222230);
    const bar = this.add.rectangle(w/2 - 180, h/2, 0, 6, 0xff6b1a).setOrigin(0, 0.5);
    const label = this.add.text(w/2, h/2 - 30, 'LOADING STREET SHOT', {
      fontFamily: 'Bungee', fontSize: '18px', color: '#ffffff'
    }).setOrigin(0.5);
    this.load.on('progress', v => { bar.width = 360 * v; });

    // Load every embedded asset
    for (const key in ASSETS) {
      this.load.image(key, ASSETS[key]);
    }
  }

  create() {
    this.scene.start('Select');
  }
}

// ----------------------------------------------------------------------------
// CHARACTER SELECT SCENE
// ----------------------------------------------------------------------------
class SelectScene extends Phaser.Scene {
  constructor() { super('Select'); }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // ---- Background atmosphere ----
    const courtG = this.add.graphics();
    courtG.lineStyle(2, 0xffffff, 0.04);
    for (let i = 0; i < 10; i++) {
      const y = H * 0.7 + i * 30;
      courtG.lineBetween(0, y, W, y);
    }
    courtG.lineStyle(3, 0xff6b1a, 0.15);
    courtG.strokeCircle(W/2, H + 200, 380);

    // Animated glow blobs behind characters
    this.glows = [];
    for (let i = 0; i < 3; i++) {
      const g = this.add.circle(0, 0, 120, CHARACTERS[i].color, 0.18);
      g.setBlendMode(Phaser.BlendModes.ADD);
      this.glows.push(g);
    }

    // ---- Header ----
    const title = this.add.text(W/2, 50, 'STREET SHOT', {
      fontFamily: 'Bungee', fontSize: '42px', color: '#ffffff'
    }).setOrigin(0.5);
    title.setShadow(0, 4, '#ff6b1a', 12, false, true);

    const subtitle = this.add.text(W/2, 88, '— SELECT YOUR BALLER —', {
      fontFamily: 'Rubik', fontSize: '12px', color: '#888899',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    subtitle.setLetterSpacing(3);

    // ---- Character cards — STACKED VERTICALLY for portrait ----
    const cardW = 460;
    const cardH = 200;
    const gap = 16;
    const totalH = cardH * 3 + gap * 2;
    const startY = 130;
    const cardX = W / 2;

    this.cards = [];
    this.selectedIdx = 1; // default middle (Breeze)

    CHARACTERS.forEach((char, i) => {
      const y = startY + i * (cardH + gap) + cardH/2;
      const card = this.createCard(cardX, y, cardW, cardH, char, i);
      this.cards.push(card);
      this.glows[i].setPosition(cardX - cardW/2 + 90, y);
    });

    // ---- Start button ----
    this.startBtn = this.createStartButton(W/2, H - 50);

    // ---- Keyboard ----
    this.input.keyboard.on('keydown-UP',    () => this.selectIndex(this.selectedIdx - 1));
    this.input.keyboard.on('keydown-DOWN',  () => this.selectIndex(this.selectedIdx + 1));
    this.input.keyboard.on('keydown-LEFT',  () => this.selectIndex(this.selectedIdx - 1));
    this.input.keyboard.on('keydown-RIGHT', () => this.selectIndex(this.selectedIdx + 1));
    this.input.keyboard.on('keydown-ENTER', () => this.confirmSelection());
    this.input.keyboard.on('keydown-SPACE', () => this.confirmSelection());

    this.selectIndex(this.selectedIdx);

    // Entry animation
    this.cards.forEach((card, i) => {
      card.container.x = cardX + 600;
      card.container.alpha = 0;
      this.tweens.add({
        targets: card.container,
        x: cardX, alpha: 1,
        duration: 600, ease: 'Back.easeOut',
        delay: 150 + i * 100
      });
    });
  }

  createCard(x, y, w, h, char, idx) {
    const container = this.add.container(x, y);

    // Background panel
    const bg = this.add.graphics();
    const drawBg = (selected) => {
      bg.clear();
      if (selected) {
        bg.fillStyle(char.color, 0.15);
        bg.fillRoundedRect(-w/2 - 6, -h/2 - 6, w + 12, h + 12, 14);
      }
      bg.fillStyle(0x14141f, 0.95);
      bg.fillRoundedRect(-w/2, -h/2, w, h, 12);
      bg.lineStyle(selected ? 3 : 1.5, char.color, selected ? 1 : 0.4);
      bg.strokeRoundedRect(-w/2, -h/2, w, h, 12);
      // Left accent stripe
      bg.fillStyle(char.color, selected ? 1 : 0.5);
      bg.fillRoundedRect(-w/2, -h/2, 5, h, { tl: 12, tr: 0, bl: 12, br: 0 });
    };
    drawBg(false);
    container.add(bg);

    // Character image — left side of card
    const img = this.add.image(-w/2 + 90, 0, char.portraitKey);
    const imgScale = (h * 0.9) / img.height;
    img.setScale(imgScale);
    container.add(img);

    // Number badge
    const badge = this.add.graphics();
    badge.fillStyle(char.color, 1);
    badge.fillCircle(-w/2 + 24, -h/2 + 24, 16);
    container.add(badge);
    const badgeText = this.add.text(-w/2 + 24, -h/2 + 24, String(idx + 1), {
      fontFamily: 'Bungee', fontSize: '16px', color: '#000000'
    }).setOrigin(0.5);
    container.add(badgeText);

    // Name + tagline (right side)
    const textX = -w/2 + 190;
    const name = this.add.text(textX, -h/2 + 22, char.name, {
      fontFamily: 'Bungee', fontSize: '34px', color: '#ffffff'
    }).setOrigin(0, 0);
    container.add(name);

    const tagline = this.add.text(textX, -h/2 + 60, char.tagline.toUpperCase(), {
      fontFamily: 'Rubik', fontSize: '11px', color: char.colorCss,
      fontStyle: 'bold'
    }).setOrigin(0, 0);
    tagline.setLetterSpacing(3);
    container.add(tagline);

    // Stat bars (right side, below name)
    const statY = -h/2 + 90;
    const statKeys = ['shot', 'speed', 'style'];
    statKeys.forEach((key, i) => {
      const sy = statY + i * 24;
      const label = this.add.text(textX, sy, key.toUpperCase(), {
        fontFamily: 'Rubik', fontSize: '10px', color: '#888899',
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);
      label.setLetterSpacing(1.5);
      container.add(label);

      const trackW = 150;
      const trackX = textX + 50;
      const track = this.add.rectangle(trackX, sy, trackW, 6, 0x2a2a3a).setOrigin(0, 0.5);
      container.add(track);
      const fill = this.add.rectangle(trackX, sy, trackW * (char.stats[key] / 100), 6, char.color).setOrigin(0, 0.5);
      container.add(fill);

      const val = this.add.text(textX + 215, sy, char.stats[key], {
        fontFamily: 'Bungee', fontSize: '12px', color: '#ffffff'
      }).setOrigin(1, 0.5);
      container.add(val);
    });

    container.setSize(w, h);
    container.setInteractive(new Phaser.Geom.Rectangle(-w/2, -h/2, w, h), Phaser.Geom.Rectangle.Contains);
    container.on('pointerdown', () => {
      if (this.selectedIdx === idx) this.confirmSelection();
      else this.selectIndex(idx);
    });

    return { container, bg, img, drawBg, char, idx };
  }

  createStartButton(x, y) {
    const container = this.add.container(x, y);
    const w = 260, h = 60;

    const bg = this.add.graphics();
    const drawBg = (hover) => {
      bg.clear();
      bg.fillStyle(0xff6b1a, hover ? 1 : 0.9);
      bg.fillRoundedRect(-w/2, -h/2, w, h, 8);
      bg.lineStyle(2, 0xffffff, hover ? 0.8 : 0.3);
      bg.strokeRoundedRect(-w/2, -h/2, w, h, 8);
    };
    drawBg(false);
    container.add(bg);

    const label = this.add.text(0, 0, 'TAKE THE COURT  ▶', {
      fontFamily: 'Bungee', fontSize: '22px', color: '#0a0a0f'
    }).setOrigin(0.5);
    container.add(label);

    container.setSize(w, h);
    container.setInteractive(new Phaser.Geom.Rectangle(-w/2, -h/2, w, h), Phaser.Geom.Rectangle.Contains);
    container.on('pointerover', () => {
      drawBg(true);
      this.tweens.add({ targets: container, scale: 1.05, duration: 120, ease: 'Quad.easeOut' });
    });
    container.on('pointerout', () => {
      drawBg(false);
      this.tweens.add({ targets: container, scale: 1, duration: 120, ease: 'Quad.easeOut' });
    });
    container.on('pointerdown', () => this.confirmSelection());

    // Pulsing glow
    this.tweens.add({
      targets: container, scale: { from: 1, to: 1.03 },
      duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    return container;
  }

  selectIndex(idx) {
    idx = Phaser.Math.Wrap(idx, 0, CHARACTERS.length);
    this.selectedIdx = idx;
    this.cards.forEach((card, i) => {
      const selected = i === idx;
      card.drawBg(selected);
      this.tweens.add({
        targets: card.container,
        scale: selected ? 1.06 : 1,
        duration: 220,
        ease: 'Quad.easeOut'
      });
      // Pulse glow on selected
      this.tweens.add({
        targets: this.glows[i],
        alpha: selected ? 0.35 : 0.12,
        scale: selected ? 1.2 : 1,
        duration: 300
      });
    });

    // Tiny bounce on the selected character image
    const card = this.cards[idx];
    this.tweens.add({
      targets: card.img,
      y: { from: -50, to: -40 },
      duration: 400,
      ease: 'Bounce.easeOut'
    });
  }

  confirmSelection() {
    const char = CHARACTERS[this.selectedIdx];
    // Flash and transition
    const W = this.scale.width, H = this.scale.height;
    const flash = this.add.rectangle(W/2, H/2, W, H, 0xffffff, 0).setDepth(100);
    this.tweens.add({
      targets: flash, alpha: 0.4, duration: 100, yoyo: true,
      onComplete: () => {
        this.scene.start('Court', { character: char });
      }
    });
  }

  update(_, dt) {
    // Subtle floating motion on the glows
    const t = this.time.now / 1000;
    this.glows.forEach((g, i) => {
      g.y += Math.sin(t * 1.5 + i) * 0.15;
    });
  }
}


// ============================================================================
// COURT SCENE — PORTRAIT MODE (540x960) — back view, hoop far away
// ============================================================================
//
// Vertical layout (top to bottom):
//   y=0-60     HUD bar (score/time/streak)
//   y=80-360   Court receding into distance + hoop in upper-center
//   y=360-740  Open space (ball trajectory area)
//   y=740-920  Player in foreground, scaled large
//   y=920-960  Instruction text / power meter
//
// "Zoomed out" feel: player relatively small at bottom, hoop in distance,
// LOTS of open vertical space so the ball arcs nicely on screen.
//
class CourtScene extends Phaser.Scene {
  constructor() { super('Court'); }

  init(data) {
    this.character = data.character;
    this.state = 'AIMING';
    this.score = 0;
    this.shotsTaken = 0;
    this.shotsMade = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.timeLeft = 60;
    this.aimT = 0;
    this.aimX = 0;
    this.power = 0;
    this.powerDir = 1;
    this.scoredThisShot = false;
    this.dragStart = null;
    this.dragActive = false;
  }

  create() {
    const W = this.scale.width, H = this.scale.height;
    const char = this.character;
    this.W = W; this.H = H;

    // ====================================================================
    // ARENA BACKGROUND — bleachers, crowd, lights (drawn BEFORE the floor)
    // ====================================================================
    const cx = W / 2;
    const horizonY = 260;  // where floor meets bleachers (just below the distant hoop)

    // --- Sky / arena ceiling: deep navy with a subtle vignette ---
    const skyG = this.add.graphics();
    skyG.fillGradientStyle(0x0d0d1a, 0x0d0d1a, 0x1a1a30, 0x1a1a30, 1);
    skyG.fillRect(0, 0, W, horizonY);

    // --- Stadium lights: three spot beams streaming down from top ---
    const lights = this.add.graphics();
    const lightPositions = [W * 0.2, W * 0.5, W * 0.8];
    lightPositions.forEach(lx => {
      // Light fixture
      lights.fillStyle(0x222233, 1);
      lights.fillRect(lx - 18, 60, 36, 8);
      lights.fillStyle(0xfff4b0, 1);
      lights.fillRect(lx - 14, 64, 28, 4);
      // Light cone — soft additive triangle going down
      lights.fillStyle(0xfff4b0, 0.04);
      lights.beginPath();
      lights.moveTo(lx, 68);
      lights.lineTo(lx - 80, horizonY);
      lights.lineTo(lx + 80, horizonY);
      lights.closePath();
      lights.fillPath();
    });
    // Save lights for blinking animation
    this.stadiumLights = lights;

    // --- Bleachers: tiered seats on left/right + far end ---
    // Far bleachers (across the back wall, behind the hoop area)
    const bleachersG = this.add.graphics();
    // Back wall structure
    bleachersG.fillStyle(0x1a1a2a, 1);
    bleachersG.fillRect(0, 90, W, horizonY - 90);
    // Bleacher tiers (horizontal bands receding upward = closer)
    for (let row = 0; row < 6; row++) {
      const y = 100 + row * 26;
      const shade = 0x1a1a2a + row * 0x040406;
      bleachersG.fillStyle(shade, 1);
      bleachersG.fillRect(0, y, W, 22);
      bleachersG.lineStyle(1, 0x000000, 0.4);
      bleachersG.lineBetween(0, y + 22, W, y + 22);
    }

    // --- Crowd dots: scattered colored pixels representing people ---
    this.crowdDots = [];
    const crowdColors = [0xff4466, 0xffd166, 0x4ade80, 0x60a5fa, 0xa78bfa, 0xfb7185, 0xfacc15];
    for (let row = 0; row < 6; row++) {
      const baseY = 106 + row * 26;
      const density = 45 + row * 8;  // more density in rows closer to camera
      for (let i = 0; i < density; i++) {
        const x = Math.random() * W;
        const y = baseY + Math.random() * 18;
        const c = crowdColors[Math.floor(Math.random() * crowdColors.length)];
        const dot = this.add.rectangle(x, y, 4, 5, c, 0.7);
        this.crowdDots.push({ obj: dot, baseY: y, phase: Math.random() * Math.PI * 2 });
      }
    }

    // --- Side banners (sponsor-style ads on the side rails) ---
    const banners = this.add.graphics();
    // Left side panel — at the floor edge
    banners.fillStyle(0x0a0a0f, 1);
    banners.fillRect(0, 224, 50, 34);
    banners.fillStyle(char.color, 0.85);
    banners.fillRect(4, 228, 42, 26);
    // Right side panel
    banners.fillStyle(0x0a0a0f, 1);
    banners.fillRect(W - 50, 224, 50, 34);
    banners.fillStyle(char.color, 0.85);
    banners.fillRect(W - 46, 228, 42, 26);

    // Banner text — "SS" logo
    this.add.text(25, 241, 'SS', {
      fontFamily: 'Bungee', fontSize: '14px', color: '#0a0a0f'
    }).setOrigin(0.5);
    this.add.text(W - 25, 241, 'SS', {
      fontFamily: 'Bungee', fontSize: '14px', color: '#0a0a0f'
    }).setOrigin(0.5);

    // --- Chain-link fence detail at the back (street court hint) ---
    const fence = this.add.graphics();
    fence.lineStyle(1, 0x444455, 0.35);
    // Diagonal cross-hatch (chain-link pattern), drawn only behind the bleachers
    // (visible across the top dark area)
    for (let i = -W; i < W * 2; i += 18) {
      fence.lineBetween(i, 80, i + 200, 280);
      fence.lineBetween(i, 280, i + 200, 80);
    }

    // ====================================================================
    // PERSPECTIVE COURT — wooden floor with painted lines
    // ====================================================================
    const floorTopY = horizonY;
    const floorBottomY = H;
    const floorTopWidth = 440;        // wider at the far end (court spans more of screen)
    const floorBottomWidth = W * 3.0; // much wider at the near end

    const floor = this.add.graphics();
    // WOODEN COURT FLOOR — warm tan, painted lines, parquet hint
    // Main surface (warm wood color)
    floor.fillStyle(0x7a5a3a, 1);
    floor.beginPath();
    floor.moveTo(cx - floorTopWidth/2, floorTopY);
    floor.lineTo(cx + floorTopWidth/2, floorTopY);
    floor.lineTo(cx + floorBottomWidth/2, floorBottomY);
    floor.lineTo(cx - floorBottomWidth/2, floorBottomY);
    floor.closePath();
    floor.fillPath();

    // Wood plank lines (horizontal bands of slightly different tones)
    const woodTones = [0x8a6a48, 0x6a4a2a, 0x82623c, 0x745432, 0x7e5e38];
    for (let i = 0; i < 14; i++) {
      const t = i / 14;
      const y = Phaser.Math.Linear(floorBottomY, floorTopY, t);
      const w = Phaser.Math.Linear(floorBottomWidth, floorTopWidth, t);
      const tone = woodTones[i % woodTones.length];
      floor.fillStyle(tone, 0.18);
      const stripeH = Phaser.Math.Linear(floorBottomY, floorTopY, (i + 1) / 14) - y;
      floor.fillRect(cx - w/2, y, w, Math.max(1, -stripeH * 0.7));
    }

    // PAINTED COURT LINES
    // 3-point arc — flattened ellipse in perspective
    floor.lineStyle(3, 0xffffff, 0.85);
    floor.strokeEllipse(cx, floorTopY + 130, 620, 140);
    // Free-throw line / key boundaries (a rectangle in perspective near top)
    floor.lineStyle(2.5, 0xffffff, 0.8);
    // The "key" trapezoid: wider at the front (player side), narrower at the back (hoop side)
    const keyTopY = floorTopY + 10;
    const keyBottomY = floorTopY + 160;
    const keyTopW = 130;
    const keyBottomW = 220;
    floor.beginPath();
    floor.moveTo(cx - keyTopW/2, keyTopY);
    floor.lineTo(cx + keyTopW/2, keyTopY);
    floor.lineTo(cx + keyBottomW/2, keyBottomY);
    floor.lineTo(cx - keyBottomW/2, keyBottomY);
    floor.closePath();
    floor.strokePath();
    // Free-throw line itself (horizontal line at bottom of key)
    floor.lineStyle(3, 0xffffff, 0.9);
    floor.lineBetween(cx - keyBottomW/2, keyBottomY, cx + keyBottomW/2, keyBottomY);
    // Key fill — semi-transparent character color
    floor.fillStyle(char.color, 0.08);
    floor.beginPath();
    floor.moveTo(cx - keyTopW/2, keyTopY);
    floor.lineTo(cx + keyTopW/2, keyTopY);
    floor.lineTo(cx + keyBottomW/2, keyBottomY);
    floor.lineTo(cx - keyBottomW/2, keyBottomY);
    floor.closePath();
    floor.fillPath();

    // Side baseline (along the far floor edge)
    floor.lineStyle(2, 0xffffff, 0.5);
    floor.lineBetween(cx - floorTopWidth/2, floorTopY, cx + floorTopWidth/2, floorTopY);

    // ====================================================================
    // HOOP — small, far away, upper area
    // ====================================================================
    this.hoopX = cx;
    this.hoopY = 200;
    const rimRadius = 36;

    // Pole
    const pole = this.add.graphics();
    pole.fillStyle(0x333344, 1);
    pole.fillRect(this.hoopX - 4, this.hoopY - 110, 8, 120);

    // Backboard — sized relative to the rim (~2.5x rim diameter wide, ~1.5x rim diameter tall)
    const bbW = 180, bbH = 108;
    const backboard = this.add.rectangle(this.hoopX, this.hoopY - 50, bbW, bbH, 0xffffff, 0.95);
    backboard.setStrokeStyle(2.5, 0x222233);
    const bbInner = this.add.rectangle(this.hoopX, this.hoopY - 36, 60, 44, 0xffffff, 0);
    bbInner.setStrokeStyle(2, char.color);

    // Rim — ellipse from behind (thicker for bigger rim)
    const rimG = this.add.graphics();
    rimG.lineStyle(6, 0xff6b1a, 1);
    rimG.strokeEllipse(this.hoopX, this.hoopY, rimRadius * 2, rimRadius * 0.55);
    rimG.lineStyle(2, 0xff9a4a, 1);
    rimG.strokeEllipse(this.hoopX, this.hoopY - 2, rimRadius * 2, rimRadius * 0.45);

    // Net
    const net = this.add.graphics();
    net.lineStyle(1.5, 0xffffff, 0.7);
    const netSegs = 9;
    const netH = 32;
    for (let i = 0; i <= netSegs; i++) {
      const t = i / netSegs;
      const topX = this.hoopX - rimRadius + 2 * rimRadius * t;
      const topY = this.hoopY + Math.sin(t * Math.PI) * (rimRadius * 0.27);
      const botShrink = 0.6;
      const bottomX = this.hoopX - rimRadius * botShrink + 2 * rimRadius * botShrink * t;
      const bottomY = this.hoopY + netH;
      net.lineBetween(topX, topY, bottomX, bottomY);
    }
    for (let row = 1; row <= 3; row++) {
      const y = this.hoopY + (row * netH / 4);
      const radAtRow = rimRadius - row * 3;
      net.beginPath();
      net.arc(this.hoopX, y, radAtRow, 0, Math.PI, false);
      net.strokePath();
    }

    // Scoring zone
    this.scoreZone = this.add.zone(this.hoopX, this.hoopY + 6, rimRadius * 1.4, 8);
    this.physics.world.enable(this.scoreZone);
    this.scoreZone.body.setAllowGravity(false);
    this.scoreZone.body.setImmovable(true);

    // Rim physics
    this.rimLeft  = this.physics.add.staticImage(this.hoopX - rimRadius, this.hoopY, null).setVisible(false);
    this.rimLeft.body.setCircle(5);
    this.rimLeft.body.setOffset(-5, -5);
    this.rimRight = this.physics.add.staticImage(this.hoopX + rimRadius, this.hoopY, null).setVisible(false);
    this.rimRight.body.setCircle(5);
    this.rimRight.body.setOffset(-5, -5);
    this.backboardBody = this.physics.add.staticImage(this.hoopX, this.hoopY - 50, null).setVisible(false);
    this.backboardBody.body.setSize(bbW, 10);
    this.backboardBody.body.setOffset(-bbW/2, 42);

    // ====================================================================
    // PLAYER — bottom of screen, with strong perspective scaling
    // ====================================================================
    this.shooterCx = cx;
    this.shooterCy = H - 30;  // feet at bottom (= "near" depth)
    this.shooterMinX = 80;
    this.shooterMaxX = W - 80;
    this.depthT = 0;  // 0 at near edge, 1 at hoop
    this.shooter = this.add.image(this.shooterCx, this.shooterCy, char.key + '_idle');
    this.shooter.setOrigin(0.5, 1);
    this.shooter.setScale(0.40);  // full size at the back of the court (smaller for better proportion)

    // Breathing
    this.tweens.add({
      targets: this.shooter,
      scaleY: { from: 0.40, to: 0.405 },
      duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    // Shadow
    this.shooterShadow = this.add.ellipse(this.shooterCx, H - 10, 100, 14, 0x000000, 0.55)
      .setBlendMode(Phaser.BlendModes.MULTIPLY).setDepth(-1);

    // Ball spawn — at hand height (lower since player is smaller)
    this.ballSpawn = { x: this.shooterCx, y: this.shooterCy - 200 };

    this.createBall();

    this.aimGraphics = this.add.graphics();
    this.dragVisuals = this.add.graphics();

    // ====================================================================
    // HUD — compact for portrait
    // ====================================================================
    const hudBar = this.add.graphics();
    hudBar.fillStyle(0x000000, 0.5);
    hudBar.fillRect(0, 0, W, 60);

    this.add.text(20, 14, 'SCORE', {
      fontFamily: 'Rubik', fontSize: '10px', color: '#888899', fontStyle: 'bold'
    }).setLetterSpacing(2);
    this.scoreText = this.add.text(20, 28, '0', {
      fontFamily: 'Bungee', fontSize: '22px', color: '#ffffff'
    });

    this.add.text(W/2, 14, 'TIME', {
      fontFamily: 'Rubik', fontSize: '10px', color: '#888899', fontStyle: 'bold'
    }).setOrigin(0.5, 0).setLetterSpacing(2);
    this.timerText = this.add.text(W/2, 28, '60', {
      fontFamily: 'Bungee', fontSize: '22px', color: char.colorCss
    }).setOrigin(0.5, 0);

    this.add.text(W - 20, 14, 'STREAK', {
      fontFamily: 'Rubik', fontSize: '10px', color: '#888899', fontStyle: 'bold'
    }).setOrigin(1, 0).setLetterSpacing(2);
    this.streakText = this.add.text(W - 20, 28, '0', {
      fontFamily: 'Bungee', fontSize: '22px', color: '#ffffff'
    }).setOrigin(1, 0);

    // Character name on top — discrete
    this.add.text(W/2, 54, char.name + ' SHOOTING', {
      fontFamily: 'Rubik', fontSize: '9px', color: char.colorCss, fontStyle: 'bold'
    }).setOrigin(0.5).setLetterSpacing(3);

    // Instruction text removed — new touch controls are self-explanatory
    this.powerMeter = this.add.graphics();  // kept for compatibility but unused

    this.feedbackText = this.add.text(this.hoopX, this.hoopY - 80, '', {
      fontFamily: 'Bungee', fontSize: '28px', color: '#ffffff'
    }).setOrigin(0.5).setAlpha(0);

    // ESC corner
    this.exitBtn = this.add.text(W - 14, 78, '✕', {
      fontFamily: 'Rubik', fontSize: '18px', color: '#555566', fontStyle: 'bold'
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    this.exitBtn.on('pointerdown', () => this.scene.start('Select'));

    // ====================================================================
    // TOUCH CONTROLS — virtual joystick (left) + shoot button (right)
    // ====================================================================
    this.createTouchControls();
    // Keep ESC as the only keyboard shortcut (for desktop testing)
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('Select'));

    this.gameTimer = this.time.addEvent({
      delay: 1000, callback: this.tickTimer, callbackScope: this, loop: true
    });
    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  setPose(pose) {
    const key = this.character.key + '_' + pose;
    if (this.textures.exists(key)) this.shooter.setTexture(key);
  }

  createBall() {
    const key = 'ballTex';
    if (!this.textures.exists(key)) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      const r = 18;
      g.fillStyle(0xe66a1a, 1);
      g.fillCircle(r, r, r);
      g.lineStyle(2, 0x222222, 1);
      g.strokeCircle(r, r, r);
      g.lineBetween(0, r, r*2, r);
      g.lineBetween(r, 0, r, r*2);
      g.beginPath();
      g.arc(r, r, r, Math.PI*0.15, Math.PI*0.85, false);
      g.strokePath();
      g.beginPath();
      g.arc(r, r, r, Math.PI*1.15, Math.PI*1.85, false);
      g.strokePath();
      g.fillStyle(0xffffff, 0.25);
      g.fillCircle(r - 5, r - 5, 4);
      g.generateTexture(key, r*2, r*2);
      g.destroy();
    }
    this.ball = this.physics.add.image(this.ballSpawn.x, this.ballSpawn.y, key);
    this.ball.setCircle(18);
    this.ball.setBounce(0.55);
    this.ball.setDrag(15, 0);
    this.ball.body.setAllowGravity(false);
    this.ball.setVisible(false);
    this.ball.setScale(1);
    this.ball.rotation = 0;

    // Score tracking — ball needs to have been ABOVE the rim before scoring
    this.ballHasBeenAboveRim = false;

    this.physics.add.collider(this.ball, this.rimLeft);
    this.physics.add.collider(this.ball, this.rimRight);
    this.physics.add.collider(this.ball, this.backboardBody);
    this.physics.add.overlap(this.ball, this.scoreZone, () => {
      if (this.scoredThisShot) return;
      // Strict scoring rules:
      // 1) Ball must be moving downward
      // 2) Ball must have been above the rim at some point this shot
      // 3) Ball must be horizontally inside the rim (not just brushing edge)
      const isMovingDown = this.ball.body.velocity.y > 30;
      const isHorizontallyInside = Math.abs(this.ball.x - this.hoopX) < 20;
      if (isMovingDown && this.ballHasBeenAboveRim && isHorizontallyInside) {
        this.scoredThisShot = true;
        this.onScore();
      }
    });
  }

  resetBall() {
    if (this.ball) this.ball.destroy();
    this.scoredThisShot = false;
    this.ballHasBeenAboveRim = false;
    this.createBall();
    this.power = 0;
    this.state = 'AIMING';
    this.setPose('idle');
    if (this.aimGuide) this.aimGuide.clear();
    this.drawShootButton(0);
  }

  // ----------------------------------------------------------------------
  // TOUCH CONTROLS — Joystick (left) + Shoot button (right)
  // ----------------------------------------------------------------------
  createTouchControls() {
    const W = this.W, H = this.H;

    // -- Layout: bottom strip ~120px tall, joystick left, shoot right --
    const stripY = H - 95;
    this.controlsStripY = stripY;

    // Subtle background strip for the controls (so it's clear where they are)
    const stripBg = this.add.graphics();
    stripBg.fillStyle(0x000000, 0.35);
    stripBg.fillRect(0, stripY, W, 95);
    stripBg.setDepth(40);

    // ---- LEFT: Virtual joystick ----
    const joyX = 72, joyY = stripY + 47;
    const joyRadius = 38;       // outer ring (max drag)
    const stickRadius = 20;     // inner stick
    this.joyCenter = { x: joyX, y: joyY };
    this.joyRadius = joyRadius;
    this.joyActive = false;
    this.joyVector = { x: 0, y: 0 };   // normalized -1..1
    this.joyPointerId = null;

    // Visual ring
    const joyRing = this.add.graphics();
    joyRing.lineStyle(3, 0xffffff, 0.35);
    joyRing.strokeCircle(joyX, joyY, joyRadius);
    joyRing.lineStyle(1.5, this.character.color, 0.4);
    joyRing.strokeCircle(joyX, joyY, joyRadius - 4);
    joyRing.setDepth(41);
    // Stick (we'll move this when dragged)
    this.joyStick = this.add.graphics();
    this.joyStick.setDepth(42);
    this.drawStick(joyX, joyY);

    // Touch area (invisible, larger than the visible ring for easier finger placement)
    const joyZone = this.add.zone(joyX, joyY, joyRadius * 3, joyRadius * 3);
    joyZone.setInteractive();
    joyZone.setDepth(41);
    joyZone.on('pointerdown', (pointer) => this.onJoyDown(pointer));

    // ---- RIGHT: Shoot button + aim swipe area ----
    const shootX = W - 72, shootY = stripY + 47;
    const shootRadius = 38;
    this.shootCenter = { x: shootX, y: shootY };
    this.shootRadius = shootRadius;
    this.shootActive = false;
    this.shootPointerId = null;
    this.shootStartPos = null;

    // Visual button
    this.shootBtn = this.add.graphics();
    this.shootBtn.setDepth(41);
    this.drawShootButton(0);

    // SHOOT label
    this.shootLabel = this.add.text(shootX, shootY, 'SHOOT', {
      fontFamily: 'Bungee', fontSize: '11px', color: '#ffffff'
    }).setOrigin(0.5).setDepth(42);

    // Touch area for shoot
    const shootZone = this.add.zone(shootX, shootY, shootRadius * 3, shootRadius * 3);
    shootZone.setInteractive();
    shootZone.setDepth(41);
    shootZone.on('pointerdown', (pointer) => this.onShootDown(pointer));

    // Global pointermove and pointerup handlers (handle both joystick and shoot)
    this.input.on('pointermove', (pointer) => {
      if (this.joyActive && pointer.id === this.joyPointerId) this.onJoyMove(pointer);
      if (this.shootActive && pointer.id === this.shootPointerId) this.onShootMove(pointer);
    });
    this.input.on('pointerup', (pointer) => {
      if (this.joyActive && pointer.id === this.joyPointerId) this.onJoyUp(pointer);
      if (this.shootActive && pointer.id === this.shootPointerId) this.onShootUp(pointer);
    });

    // Aim guide visual (drawn while holding shoot)
    this.aimGuide = this.add.graphics();
    this.aimGuide.setDepth(20);
  }

  drawStick(x, y) {
    const g = this.joyStick;
    g.clear();
    g.fillStyle(this.character.color, 0.85);
    g.fillCircle(x, y, 20);
    g.lineStyle(2, 0xffffff, 0.7);
    g.strokeCircle(x, y, 20);
    // Inner dot
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(x, y, 5);
  }

  drawShootButton(power) {
    const g = this.shootBtn;
    const cx = this.shootCenter.x, cy = this.shootCenter.y;
    const r = this.shootRadius;
    g.clear();
    // Outer ring
    g.lineStyle(3, 0xffffff, 0.4);
    g.strokeCircle(cx, cy, r);
    // Fill (color shifts with power)
    let color = 0xff6b1a;
    if (power > 0) {
      if (power < 0.5) color = 0x4ade80;
      else if (power < 0.85) color = 0xfacc15;
      else color = 0xef4444;
    }
    g.fillStyle(color, 0.85);
    g.fillCircle(cx, cy, r - 4);
    // Power arc — fills around the button as power charges
    if (power > 0) {
      g.lineStyle(5, 0xffffff, 0.9);
      g.beginPath();
      g.arc(cx, cy, r + 2, -Math.PI/2, -Math.PI/2 + power * Math.PI * 2, false);
      g.strokePath();
    }
  }

  // ---- JOYSTICK ----
  onJoyDown(pointer) {
    if (this.state === 'GAMEOVER') return;
    this.joyActive = true;
    this.joyPointerId = pointer.id;
    this.onJoyMove(pointer);
  }

  onJoyMove(pointer) {
    const dx = pointer.x - this.joyCenter.x;
    const dy = pointer.y - this.joyCenter.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const capped = Math.min(dist, this.joyRadius);
    const angle = Math.atan2(dy, dx);
    // Visual stick position
    const sx = this.joyCenter.x + Math.cos(angle) * capped;
    const sy = this.joyCenter.y + Math.sin(angle) * capped;
    this.drawStick(sx, sy);
    // Normalized vector for movement
    if (dist > 8) {
      this.joyVector = {
        x: Math.cos(angle) * (capped / this.joyRadius),
        y: Math.sin(angle) * (capped / this.joyRadius)
      };
    } else {
      this.joyVector = { x: 0, y: 0 };
    }
  }

  onJoyUp(pointer) {
    this.joyActive = false;
    this.joyPointerId = null;
    this.joyVector = { x: 0, y: 0 };
    this.drawStick(this.joyCenter.x, this.joyCenter.y);
  }

  // ---- SHOOT BUTTON ----
  onShootDown(pointer) {
    if (this.state === 'GAMEOVER') return;
    if (this.state !== 'AIMING') return;  // only start a new shot when aiming
    this.shootActive = true;
    this.shootPointerId = pointer.id;
    this.shootStartPos = { x: pointer.x, y: pointer.y };
    this.power = 0;
    this.state = 'CHARGING';
    this.setPose('windup');
    this.aimX = 0;  // start centered
  }

  onShootMove(pointer) {
    // Drag direction on the shoot side adjusts horizontal aim
    if (!this.shootActive) return;
    const dx = pointer.x - this.shootStartPos.x;
    // Map horizontal drag to aim offset (-1..+1)
    // Drag LEFT  = -1 (shoot left of hoop)
    // Drag RIGHT = +1 (shoot right of hoop)
    // Use a small range so it's sensitive
    this.aimX = Phaser.Math.Clamp(dx / 80, -1, 1);
  }

  onShootUp(pointer) {
    if (!this.shootActive) return;
    this.shootActive = false;
    this.shootPointerId = null;
    if (this.state === 'CHARGING') {
      this.lockedAimX = this.aimX;
      this.launchBall();
    }
  }

  launchBall() {
    this.state = 'FLYING';
    if (this.aimGuide) this.aimGuide.clear();
    this.setPose('release');

    const aimSpread = 150;
    const targetX = this.hoopX + this.lockedAimX * aimSpread;
    // AIM SLIGHTLY ABOVE THE RIM so the ball falls DOWN through it (= scores)
    const targetY = this.hoopY - 30;

    // Account for player's current depth — when closer to hoop, less power needed
    // depthT: 0 = far from hoop (back of court), 1 = right under hoop
    const depthT = this.depthT || 0;

    // FlightTime scales with distance — close shots are very fast (soft layup),
    // far shots take longer (full strength jumper).
    // Also still scaled a bit by the held-power, but distance dominates.
    const baseFlightTime = Phaser.Math.Linear(0.60, 0.25, depthT);  // 0.60s far, 0.25s under hoop
    const flightTime = baseFlightTime - 0.08 * this.power;

    const g = this.physics.world.gravity.y;
    const dx = targetX - this.ballSpawn.x;
    const dy = targetY - this.ballSpawn.y;
    const vx = dx / flightTime;
    const vy = (dy - 0.5 * g * flightTime * flightTime) / flightTime;
    // Smaller power-based deviation so shots feel more controlled
    const powerFudge = (this.power - 0.60) * 0.10;
    const finalVx = vx * (1 + powerFudge);
    const finalVy = vy * (1 + powerFudge);

    this.ball.setPosition(this.ballSpawn.x, this.ballSpawn.y);
    this.ball.setVisible(true);
    this.ball.body.setAllowGravity(true);
    this.ball.setVelocity(finalVx, finalVy);
    this.ball.setAngularVelocity(720);

    this.shotsTaken += 1;

    this.time.delayedCall(380, () => {
      if (this.state === 'FLYING') this.setPose('idle');
    });
    this.time.delayedCall(2500, () => {
      if (this.state === 'FLYING') {
        if (!this.scoredThisShot) this.onMiss();
        this.resetBall();
      }
    });
  }

  onScore() {
    this.shotsMade += 1;
    this.streak += 1;
    if (this.streak > this.bestStreak) this.bestStreak = this.streak;
    const points = 2 + (this.streak >= 3 ? 1 : 0);
    this.score += points;
    this.scoreText.setText(String(this.score));
    this.streakText.setText(String(this.streak));
    if (this.streak >= 5) this.streakText.setColor('#ff6b1a');
    else if (this.streak >= 3) this.streakText.setColor('#ffd166');
    else this.streakText.setColor('#ffffff');

    let msg = 'SWISH!';
    if (this.streak >= 5) msg = 'ON FIRE!';
    else if (this.streak >= 3) msg = 'HEATING UP!';
    else msg = '+' + points;
    this.showFeedback(msg, '#1ac8d4');
    this.cameras.main.shake(160, 0.005);
    this.spawnBurst(this.hoopX, this.hoopY + 16, this.character.color);

    // ---- CROWD WAVE: stagger jump animation across the crowd ----
    if (this.crowdDots) {
      this.crowdDots.forEach((d, i) => {
        this.tweens.add({
          targets: d.obj,
          y: d.baseY - 12,
          duration: 200,
          yoyo: true,
          delay: i * 4,
          ease: 'Sine.easeOut'
        });
      });
    }

    this.time.delayedCall(700, () => {
      if (this.state === 'FLYING') this.resetBall();
    });
  }

  onMiss() {
    this.streak = 0;
    this.streakText.setText('0');
    this.streakText.setColor('#ffffff');
    this.showFeedback('MISS', '#ff4466');
  }

  showFeedback(text, color) {
    this.feedbackText.setText(text);
    this.feedbackText.setColor(color);
    this.feedbackText.setAlpha(1);
    this.feedbackText.setScale(0.6);
    this.feedbackText.y = this.hoopY - 80;
    this.tweens.add({ targets: this.feedbackText, scale: 1, duration: 200, ease: 'Back.easeOut' });
    this.tweens.add({
      targets: this.feedbackText, alpha: 0, y: this.hoopY - 110,
      duration: 800, delay: 400, ease: 'Quad.easeIn'
    });
  }

  spawnBurst(x, y, color) {
    for (let i = 0; i < 12; i++) {
      const p = this.add.circle(x, y, Phaser.Math.Between(2, 4), color);
      const angle = Math.random() * Math.PI * 2;
      const speed = Phaser.Math.Between(60, 180);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0, duration: 600, ease: 'Quad.easeOut',
        onComplete: () => p.destroy()
      });
    }
  }

  tickTimer() {
    this.timeLeft -= 1;
    this.timerText.setText(String(this.timeLeft));
    if (this.timeLeft <= 10) {
      this.timerText.setColor('#ff4466');
      this.tweens.add({ targets: this.timerText, scale: 1.2, duration: 100, yoyo: true });
    }
    if (this.timeLeft <= 0) {
      this.gameTimer.remove();
      this.endGame();
    }
  }

  endGame() {
    this.state = 'GAMEOVER';
    if (this.ball) this.ball.body.setAllowGravity(true);
    const overlay = this.add.rectangle(this.W/2, this.H/2, this.W, this.H, 0x000000, 0).setDepth(50);
    this.tweens.add({ targets: overlay, alpha: 0.7, duration: 400 });
    const accuracy = this.shotsTaken > 0 ? Math.round(this.shotsMade / this.shotsTaken * 100) : 0;
    const char = this.character;

    const title = this.add.text(this.W/2, this.H/2 - 180, 'GAME OVER', {
      fontFamily: 'Bungee', fontSize: '42px', color: '#ffffff'
    }).setOrigin(0.5).setDepth(51).setAlpha(0);
    title.setShadow(0, 4, char.colorCss, 16, false, true);

    const lines = [
      ['FINAL SCORE',    String(this.score)],
      ['SHOTS MADE',     this.shotsMade + ' / ' + this.shotsTaken],
      ['ACCURACY',       accuracy + '%'],
      ['BEST STREAK',    String(this.bestStreak)]
    ];
    const statTexts = [];
    lines.forEach((pair, i) => {
      const y = this.H/2 - 80 + i * 44;
      const l = this.add.text(this.W/2 - 100, y, pair[0], {
        fontFamily: 'Rubik', fontSize: '13px', color: '#888899', fontStyle: 'bold'
      }).setOrigin(0, 0.5).setDepth(51).setAlpha(0).setLetterSpacing(2);
      const v = this.add.text(this.W/2 + 100, y, pair[1], {
        fontFamily: 'Bungee', fontSize: '20px', color: char.colorCss
      }).setOrigin(1, 0.5).setDepth(51).setAlpha(0);
      statTexts.push(l, v);
    });
    const btn = this.add.text(this.W/2, this.H/2 + 130, '▶ PLAY AGAIN', {
      fontFamily: 'Bungee', fontSize: '20px', color: '#0a0a0f',
      backgroundColor: char.colorCss, padding: { x: 22, y: 11 }
    }).setOrigin(0.5).setDepth(51).setAlpha(0).setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => this.scene.restart({ character: this.character }));
    const back = this.add.text(this.W/2, this.H/2 + 185, 'change character', {
      fontFamily: 'Rubik', fontSize: '12px', color: '#888899', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(51).setAlpha(0).setLetterSpacing(2)
      .setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this.scene.start('Select'));

    this.tweens.add({ targets: title, alpha: 1, y: this.H/2 - 170, duration: 500, ease: 'Back.easeOut', delay: 300 });
    statTexts.forEach((t, i) => {
      this.tweens.add({ targets: t, alpha: 1, duration: 300, delay: 600 + i * 60 });
    });
    this.tweens.add({ targets: btn,  alpha: 1, duration: 400, delay: 1000 });
    this.tweens.add({ targets: back, alpha: 1, duration: 400, delay: 1200 });
  }

  update(_, dt) {
    if (this.state === 'GAMEOVER') return;
    const dts = dt / 1000;
    const t = this.time.now / 1000;

    // ---- LIVING ARENA: animate crowd ----
    if (this.crowdDots) {
      for (let i = 0; i < this.crowdDots.length; i++) {
        const d = this.crowdDots[i];
        d.obj.y = d.baseY + Math.sin(t * 2 + d.phase) * 1.2;
      }
    }

    // ---- PLAYER MOVEMENT — joystick (X and Y) ----
    // Player can move freely on the court, all the way up to (and under) the hoop.
    // Strong perspective scaling fakes a "zoom" effect as you approach the hoop.
    if (this.state === 'AIMING' || this.state === 'CHARGING') {
      const speedX = 220;
      const speedY = 160;
      const moveX = this.joyVector.x * speedX * dts;
      const moveY = this.joyVector.y * speedY * dts;

      // Define the movement range
      // - back of court (near camera): shooterCy = H - 30  (full size, 0.55 scale)
      // - under the hoop (far from camera): shooterCy = hoopY + 70  (tiny, 0.18 scale)
      const nearY = this.H - 30;
      const farY  = this.hoopY + 70;

      const newX = Phaser.Math.Clamp(this.shooterCx + moveX, this.shooterMinX, this.shooterMaxX);
      const newY = Phaser.Math.Clamp(this.shooterCy + moveY, farY, nearY);
      this.shooterCx = newX;
      this.shooterCy = newY;

      // depthT: 0 at the near edge, 1 at the hoop
      const depthT = Phaser.Math.Clamp((nearY - this.shooterCy) / (nearY - farY), 0, 1);
      this.depthT = depthT;

      // Player scales DRAMATICALLY with depth — gives a strong "zoom"-ish feel.
      // At the back: smaller default (0.40). Right at the hoop: tiny (0.14).
      const playerScale = Phaser.Math.Linear(0.40, 0.14, depthT);

      this.shooter.x = this.shooterCx;
      this.shooter.y = this.shooterCy;
      this.shooter.setScale(playerScale);

      this.shooterShadow.x = this.shooterCx;
      this.shooterShadow.y = this.shooterCy + 18 * (1 - depthT * 0.7);
      this.shooterShadow.setScale(Phaser.Math.Linear(1, 0.3, depthT));

      // Ball spawn follows player, scaled to roughly hand-height
      this.ballSpawn.x = this.shooterCx;
      this.ballSpawn.y = this.shooterCy - 200 * playerScale / 0.40;

      // ---- DRIBBLE: while moving, show a bouncing ball next to the player ----
      const isMoving = Math.abs(this.joyVector.x) > 0.1 || Math.abs(this.joyVector.y) > 0.1;
      if (isMoving) {
        if (!this.dribbleBall) {
          // Create the dribble ball on demand (re-uses the ball texture)
          this.dribbleBall = this.add.image(this.shooterCx, this.shooterCy - 80, 'ballTex');
          this.dribbleBall.setDepth(5);
        }
        // Bounce: ball oscillates between hand-height and ground
        const bounceCycle = (this.time.now / 1000) * 4;   // 4 bounces per second
        const bounceT = Math.abs(Math.sin(bounceCycle));   // 0..1
        const handY = this.shooterCy - 110 * playerScale / 0.40;
        const groundY = this.shooterCy - 5;
        this.dribbleBall.x = this.shooterCx + 35 * playerScale / 0.40;  // beside the player
        this.dribbleBall.y = Phaser.Math.Linear(groundY, handY, bounceT);
        this.dribbleBall.setScale(0.5 * playerScale / 0.40);
        this.dribbleBall.setVisible(true);
        // Hide the held ball on the sprite by hiding nothing — sprite includes it.
        // But we DO want a slight player vertical bob for "running" feel
        this.shooter.y = this.shooterCy - Math.abs(Math.sin(bounceCycle * 2)) * 2 * playerScale / 0.40;
      } else if (this.dribbleBall) {
        this.dribbleBall.setVisible(false);
      }
    } else if (this.dribbleBall) {
      // Hide dribble ball when not aiming (during flight, gameover, etc.)
      this.dribbleBall.setVisible(false);
    }

    // ---- POWER CHARGING ----
    if (this.state === 'CHARGING') {
      // Power ramps up as you hold the shoot button
      this.power = Math.min(this.power + dts * 0.9, 1);
      this.drawShootButton(this.power);
      this.drawAimGuide();
    } else {
      this.drawShootButton(0);
    }

    // ---- BALL SCALE in flight (perspective) ----
    if (this.state === 'FLYING' && this.ball && this.ball.active && this.ball.visible) {
      if (this.ball.y < this.hoopY - 20) {
        this.ballHasBeenAboveRim = true;
      }
      const yProgress = Phaser.Math.Clamp(
        (this.ballSpawn.y - this.ball.y) / (this.ballSpawn.y - this.hoopY),
        0, 1
      );
      const scale = 1 - yProgress * 0.45;
      this.ball.setScale(scale);
    }
  }

  drawAimGuide() {
    // Draw a trajectory preview from player to where the shot would land
    const g = this.aimGuide;
    g.clear();
    const color = this.character.color;

    // Compute target X based on aimX
    const aimSpread = 150;
    const targetX = this.hoopX + this.aimX * aimSpread;
    const targetY = this.hoopY - 30;

    const x0 = this.ballSpawn.x;
    const y0 = this.ballSpawn.y;
    const peak = Phaser.Math.Linear(y0 - 100, this.hoopY - 60, 0.6);

    // Trajectory dots — more solid the higher the power
    const opacity = 0.3 + this.power * 0.5;
    g.fillStyle(color, opacity);
    for (let i = 1; i < 28; i++) {
      const t = i / 28;
      const cx = (x0 + targetX) / 2;
      const cy = peak;
      const x = (1-t)*(1-t)*x0 + 2*(1-t)*t*cx + t*t*targetX;
      const y = (1-t)*(1-t)*y0 + 2*(1-t)*t*cy + t*t*targetY;
      const sz = 2.5 - i * 0.07;
      if (sz <= 0) break;
      g.fillCircle(x, y, sz);
    }
    // Target reticle on the hoop
    g.lineStyle(2, color, 0.6 + this.power * 0.4);
    g.strokeCircle(targetX, targetY, 14);
    g.lineBetween(targetX - 6, targetY, targetX + 6, targetY);
    g.lineBetween(targetX, targetY - 6, targetX, targetY + 6);
  }
}


// ----------------------------------------------------------------------------
// GAME CONFIG
// ----------------------------------------------------------------------------
const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 540,
  height: 960,
  backgroundColor: '#0a0a0f',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1400 },
      debug: false
    }
  },
  scene: [BootScene, SelectScene, CourtScene],
  render: { pixelArt: false, antialias: true }
};

new Phaser.Game(config);

# Street Shot 2.0

Arcade basketball game built with [Phaser 3](https://phaser.io/). Mobile-first, portrait orientation, touch controls.

## Play

Open `index.html` in a browser, or deploy and visit the URL.

### Controls

- **Left joystick** — move your player freely on the court (8 directions)
- **Right SHOOT button** — hold to charge power, drag horizontally to aim, release to shoot
- The two can be used simultaneously: move and shoot in one flowing motion

## Characters

Three ballers to pick from:

- **Chris** — The Real One. Street hustler in a hoodie.
- **Breeze** — Coastal Cool. Surfer-style flow.
- **Magic** — The Closer. Wears #23, sinks the shot.

## Tech

- Phaser 3.80 (loaded from CDN)
- Pure HTML/CSS/JS — no build step
- 540×960 portrait canvas, scaled to fit any device
- Touch + keyboard input (ESC to exit current scene)

## Project structure

```
streetshot-2/
├── index.html        # entry point
├── game.js           # all game logic
├── assets/
│   ├── chris_idle.png       # gameplay sprites (back view)
│   ├── chris_windup.png
│   ├── chris_release.png
│   ├── chris_portrait.png   # character-select portrait (front view)
│   ├── breeze_*.png
│   └── magic_*.png
└── README.md
```

## Deploy

Deployed via Vercel from the GitHub repo. Any push to `main` triggers a redeploy.

## Credits

Game design & direction: Jocke
Code: built collaboratively with Claude (Anthropic)
Character art: generated with ChatGPT (DALL·E 3)

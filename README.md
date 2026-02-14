# 🧩 Jigsaw Puzzle

An advanced, customizable online jigsaw puzzle web app. Upload your own images and solve puzzles at various difficulty levels.

## Features

- **Custom Image Upload** — Upload any JPG, PNG, GIF, or WebP image, or use sample images
- **Drag & Drop** — Drag to upload and drag puzzle pieces on the canvas
- **Multiple Difficulty Levels** — Easy (3×3), Medium (5×4), Hard (8×6), Expert (12×9)
- **Smart Snapping** — Pieces snap into place when dropped near the correct position
- **Image Preview** — Toggle a ghost overlay of the original image as a guide
- **Timer & Move Counter** — Track your time and number of moves
- **Completion Detection** — Celebration screen when the puzzle is solved
- **Touch Support** — Works on mobile and tablet devices
- **Dark Theme** — Beautiful dark gradient UI

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint
npm run lint
```

## How to Play

1. **Upload an image** or select a sample image
2. **Choose a difficulty** level
3. Click **Start Puzzle**
4. **Drag pieces** to their correct positions — they'll snap when close enough
5. Use **Preview** to see a ghost of the original image
6. Use **Shuffle** to re-scatter unplaced pieces

## Tech Stack

- React 19 + Vite
- HTML5 Canvas for rendering
- Vitest for testing

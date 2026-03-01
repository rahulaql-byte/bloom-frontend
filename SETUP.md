# 🌸 Bloom - Setup Guide

A quiet, meditative landing page experience inspired by fog, memory, and quiet discovery.

## 📋 Prerequisites

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- A code editor (VS Code recommended)

## 🚀 Quick Start

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run the Development Server
```bash
npm run dev
```

The app will start on **http://localhost:5173/** (or the port shown in terminal)

### Step 3: Open in Browser
Open the URL shown in your terminal. Move your cursor around to reveal the experience! 🌿

## 🎨 Features

- **Fog reveal** - Move your cursor to clear the fog and reveal the blooming tree
- **Dynamic text** - Text sharpens and brightens as you approach it
- **Floating particles** - Particle system with parallax depth
- **Ambient audio** - Toggle sound with the button in the top right
- **Smooth animations** - All effects use smooth interpolation

## 📁 Project Structure

```
bloom/
├── components/
│   └── ParticleCanvas.tsx    # Particle system
├── hooks/
│   └── useSmoothMouse.ts     # Smooth cursor tracking
├── App.tsx                    # Main app component
├── index.tsx                  # Entry point
├── index.html                 # HTML template
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript config
└── package.json               # Dependencies
```

## 🎯 Color Palette

**Core fog base:**
- Paper mist: `#f2efe9`
- Warm ash: `#e6e1d8`
- Stone haze: `#d9d4cc`

**Light warmth:**
- Morning ivory: `#f6f1e7`
- Soft apricot: `#f0e3d1`
- Komorebi gold: `#e8dcc3`

**Cool balance:**
- Dawn blue-grey: `#d7dde2`
- Rain mist blue: `#cfd6dc`

## 🛠️ Available Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 💡 Tips

- The experience is best viewed in full screen
- Works best with a mouse (limited touch support currently)
- The fog effect is GPU-intensive - may impact older devices

## 🌱 Philosophy

Bloom is intentionally:
- Slow and atmospheric
- Counter-intuitive by modern UX standards
- Emotion-first, not function-first
- Inspired by Japanese/Indian spiritual rituals
- About presence, not productivity

Enjoy the quiet. 🙏

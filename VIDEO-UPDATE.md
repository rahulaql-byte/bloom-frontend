# Video Integration Update 🎥

## What Changed

Your new background video has been integrated with the fog reveal effect!

### Key Updates:

1. **New Video Source**
   - Location: `public/background-video.mp4`
   - Your uploaded video is now the background that gets revealed

2. **Blending Mode Adjustments**
   - Changed from `mix-blend-overlay` to `mix-blend-soft-light`
   - Reduced opacity to `60%` (from 80%) for better fog coherence
   - Removed blur effect for clearer reveal
   - Adjusted saturation to `90%` and contrast to `110%` for subtlety

3. **How It Works**
   - Video plays continuously underneath the fog
   - When you move your cursor, the fog mask reveals the video in that area
   - The reveal follows your cursor with smooth interpolation
   - As you move away, fog returns to cover the video again

### The Effect:
- Video appears **through the fog** as you move your cursor
- Blending makes it feel **integrated** with the fog, not just underneath
- Creates a dreamlike, ethereal reveal experience
- Maintains the meditative, ritualistic feel of Bloom

### File Structure:
```
bloom/
├── public/
│   └── background-video.mp4    ← Your video here
├── App.tsx                      ← Updated video reference
└── ... other files
```

The video will now blend beautifully with your fog aesthetic! 🌿✨

# Fog Color Code Block 🎨

Here's the exact code that controls all the fog colors and opacities. You can experiment with this directly in `App.tsx`:

## Location in App.tsx:
Look for the `FogLayers` component (around line 11-23)

## The Code:

```typescript
const FogLayers: React.FC = () => (
  <>
    {/* Core fog base: Paper mist → Warm ash → Stone haze */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#f2efe9]/90 via-[#e6e1d8]/85 to-[#d9d4cc]/90 animate-drift-slow" />
    
    {/* Light warmth: Morning ivory → Soft apricot → Komorebi gold */}
    <div className="absolute inset-0 bg-gradient-to-tl from-[#f6f1e7]/40 via-[#f0e3d1]/35 to-[#e8dcc3]/40 mix-blend-soft-light animate-drift-medium" />
    
    {/* Cool balance: Dawn blue-grey → Rain mist blue */}
    <div className="absolute inset-0 bg-gradient-to-tr from-[#d7dde2]/35 via-transparent to-[#cfd6dc]/25 mix-blend-overlay animate-drift-fast" />
    
    {/* Additional dense fog layer for complete coverage */}
    <div className="absolute inset-0 bg-[#e6e1d8]/70 animate-drift-slower" />
  </>
);
```

---

## What You Can Experiment With:

### 1. Colors (the hex codes):
- **Core fog**: `#f2efe9`, `#e6e1d8`, `#d9d4cc`
- **Light warmth**: `#f6f1e7`, `#f0e3d1`, `#e8dcc3`
- **Cool balance**: `#d7dde2`, `#cfd6dc`
- **Dense layer**: `#e6e1d8`

### 2. Opacities (the `/XX` numbers):
- **Core fog**: `/90`, `/85`, `/90`
- **Light warmth**: `/40`, `/35`, `/40`
- **Cool balance**: `/35`, `/25`
- **Dense layer**: `/70`

### 3. Blend Modes:
- **Light warmth**: `mix-blend-soft-light`
- **Cool balance**: `mix-blend-overlay`
- Try: `multiply`, `screen`, `overlay`, `hard-light`, `color-dodge`, `color-burn`

### 4. Gradient Directions:
- `bg-gradient-to-br` = bottom-right
- `bg-gradient-to-tl` = top-left
- `bg-gradient-to-tr` = top-right
- Try: `to-b`, `to-t`, `to-l`, `to-r`, `to-bl`, etc.

---

## Tips for Experimenting:

1. **Change one thing at a time** so you can see what each layer does
2. **Save the file** - Vite will auto-reload the browser
3. **Lower opacity** if fog is too thick
4. **Higher opacity** if video bleeds through too much
5. **Try removing a layer** by commenting it out with `{/* */}`

---

## Quick Experiments to Try:

**Warmer fog:**
```typescript
from-[#fff5e6]/90 via-[#ffe8d0]/85 to-[#ffd9ba]/90
```

**Cooler fog:**
```typescript
from-[#e8eef5]/90 via-[#dce4ed]/85 to-[#d0dae6]/90
```

**More transparent (video shows through more):**
```typescript
// Change all /90 to /70, all /85 to /65, etc.
```

**More opaque (video completely hidden):**
```typescript
// Change all /90 to /95, add more dense layers
```

Have fun experimenting! 🌫️✨

// ============================================
// GARDEN.TSX - CHANGES NEEDED FOR AI FLOWERS
// ============================================

// CHANGE #1: Update flowerData state type (around line 18)
// ----------------------------------------------------------

// FROM:
const [flowerData, setFlowerData] = useState<{
  emotion: 'tenderness' | 'contentment' | 'growth' | 'warmth' | 'tranquility';
  poem: string;
  transcript?: string;
} | null>(null);

// TO:
const [flowerData, setFlowerData] = useState<{
  emotion: 'tenderness' | 'contentment' | 'growth' | 'warmth' | 'tranquility';
  poem: string;
  transcript?: string;
  flowerImage?: string;  // ADD THIS LINE!
} | null>(null);


// CHANGE #2: Include flowerImage from backend response (around line 64)
// ----------------------------------------------------------------------

// FROM:
setFlowerData({
  emotion: result.emotion,
  poem: result.poem,
  transcript: result.transcript,
});

// TO:
setFlowerData({
  emotion: result.emotion,
  poem: result.poem,
  transcript: result.transcript,
  flowerImage: result.flower_image,  // ADD THIS LINE!
});


// CHANGE #3: Pass flowerImage to FlowerPage component (around line 400)
// ---------------------------------------------------------------------

// FROM:
<FlowerPage
  emotion={flowerData.emotion}
  poem={flowerData.poem}
  transcript={flowerData.transcript}
  onReturn={handleReturnToGarden}
/>

// TO:
<FlowerPage
  emotion={flowerData.emotion}
  poem={flowerData.poem}
  transcript={flowerData.transcript}
  flowerImage={flowerData.flowerImage}  // ADD THIS LINE!
  onReturn={handleReturnToGarden}
/>


// ============================================
// THAT'S IT! Just 3 small changes!
// ============================================

// After these changes:
// 1. Backend generates AI flower
// 2. Frontend receives it in response
// 3. FlowerPage displays it as background
// 4. Poem overlays on top of flower
// ============================================

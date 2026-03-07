// FLOWER PAGE - POSITIONING FIX
// Update your FlowerPage.tsx component to position flower higher

// FIND THIS SECTION (your current flower image display):
<img 
  src={flowerData.flower_image} 
  alt="Generated flower"
  style={{
    width: '300px',  // or whatever your current width is
    height: 'auto',
    // ... your current styles
  }}
/>

// REPLACE WITH THIS (positions flower higher with stem):
<div className="flower-container" style={{
  position: 'absolute',
  top: '20%',  // ← Higher placement (was probably 50% center)
  left: '50%',
  transform: 'translateX(-50%)',
  width: '400px',
  height: '600px',  // ← Taller to show stem
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  zIndex: 1,
}}>
  <img 
    src={flowerData.flower_image} 
    alt="Generated flower"
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'contain',  // ← Shows full flower + stem
      objectPosition: 'top center',  // ← Aligns flower at top
    }}
  />
</div>

// POEM TEXT - Position below flower
<div className="poem-text" style={{
  position: 'absolute',
  top: '60%',  // ← Below flower
  left: '50%',
  transform: 'translateX(-50%)',
  textAlign: 'center',
  color: '#d4a574',
  fontSize: '1.1rem',
  lineHeight: '1.8',
  maxWidth: '600px',
  padding: '0 2rem',
  zIndex: 2,
}}>
  {flowerData.poem.split('\n').map((line, i) => (
    <p key={i} style={{ margin: '0.5rem 0' }}>{line}</p>
  ))}
</div>

// CSS EXPLANATION:
// - top: 20% → Flower appears in upper portion of screen
// - height: 600px → Tall enough to show full stem
// - objectFit: contain → Shows entire flower including stem
// - objectPosition: top center → Flower positioned at top of container
// - Poem at 60% → Positioned below flower

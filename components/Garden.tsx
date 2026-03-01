// ============================================
// COMPLETE GARDEN.TSX FIXES
// ============================================

// FIX #1: Update BACKEND_URL (Line 43)
// -------------------------------------

// CHANGE FROM:
const BACKEND_URL = 'http://localhost:5000/api/analyze-voice';

// CHANGE TO:
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL 
  ? `${import.meta.env.VITE_BACKEND_URL}/api/analyze-voice`
  : 'https://bloom-backend-production-2d21.up.railway.app/api/analyze-voice';


// FIX #2: Add handleReturnToGarden function (around line 100, after other handlers)
// ---------------------------------------------------------------------------------

const handleReturnToGarden = () => {
  setShowFlowerPage(false);
  setFlowerData(null);
};


// FIX #3: Update FlowerPage rendering (Line 404-411)
// ---------------------------------------------------

// CHANGE FROM:
{showFlowerPage && flowerData && (
  <FlowerPage
    emotion={flowerData.emotion}
    poem={flowerData.poem}
    transcript={flowerData.transcript}
    onClose={handleCloseFlowerPage}
  />
)}

// CHANGE TO:
{showFlowerPage && flowerData && (
  <FlowerPage
    emotion={flowerData.emotion}
    poem={flowerData.poem}
    transcript={flowerData.transcript}
    flowerImage={flowerData.flowerImage}
    onReturn={handleReturnToGarden}
  />
)}


// ============================================
// SUMMARY OF CHANGES:
// ============================================
// 1. Fixed BACKEND_URL to use Railway
// 2. Added handleReturnToGarden function
// 3. Added flowerImage prop to FlowerPage
// 4. Changed onClose to onReturn
// ============================================

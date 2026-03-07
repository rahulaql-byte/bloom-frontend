import React from 'react';

interface FlowerPageProps {
  flowerData?: {
    flower_image: string;
    poem: string;
    emotion: string;
    transcript: string;
  };
}

export default function FlowerPage({ flowerData }: FlowerPageProps) {
  // LOADING STATE - Show while waiting for data
  if (!flowerData) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(180deg, #b8c8d8 0%, #d8c4c8 40%, #e8d4c8 70%, #e8d0c4 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#d4a574',
        fontSize: '1.2rem',
      }}>
        Loading your flower...
      </div>
    );
  }

  // ERROR STATE - Show if image is missing
  if (!flowerData.flower_image) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(180deg, #b8c8d8 0%, #d8c4c8 40%, #e8d4c8 70%, #e8d0c4 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        color: '#d4a574',
        fontSize: '1.2rem',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <p>Error generating flower image</p>
        <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '1rem' }}>
          {flowerData.poem || 'Please try recording again'}
        </p>
      </div>
    );
  }

  // MAIN RENDER - Show flower when data is ready
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(180deg, #b8c8d8 0%, #d8c4c8 40%, #e8d4c8 70%, #e8d0c4 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      
      {/* Flower Container - Positioned Higher */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '400px',
        height: '600px',
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
            objectFit: 'contain',
            objectPosition: 'top center',
          }}
          onError={(e) => {
            console.error('Flower image failed to load:', flowerData.flower_image);
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* Poem Text - Below Flower */}
      <div style={{
        position: 'absolute',
        top: '60%',
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
        {flowerData.poem?.split('\n').map((line, i) => (
          <p key={i} style={{ margin: '0.5rem 0' }}>{line}</p>
        ))}
      </div>

      {/* Emotion Label */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#d4a574',
        fontSize: '0.9rem',
        opacity: 0.7,
        textTransform: 'capitalize',
        zIndex: 3,
      }}>
        {flowerData.emotion}
      </div>

    </div>
  );
}

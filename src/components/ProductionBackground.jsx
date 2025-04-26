import React from 'react';

const ProductionBackground = () => (
  <div style={{
    position: 'fixed',
    top: 0, left: 0, width: '100vw', height: '100vh',
    zIndex: 0,
    pointerEvents: 'none',
    opacity: 0.10,
    overflow: 'hidden',
    background:
      'repeating-linear-gradient(135deg, #ff980033 0px, #ff980033 8px, transparent 8px, transparent 32px, #2196f333 32px, #2196f333 40px, transparent 40px, transparent 64px)',
    backgroundSize: '120px 120px',
    animation: 'moveStripes 12s linear infinite',
  }}>
    <style>
      {`
        @keyframes moveStripes {
          0% { background-position: 0 0; }
          100% { background-position: 120px 120px; }
        }
      `}
    </style>
  </div>
);

export default ProductionBackground; 
// estatecrm/src/components/common/LoadingSpinner.jsx

import React from 'react';

const LoadingSpinner = () => {
  return (
    <>
      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
      `}</style>
      
      <div className="flex items-center justify-center space-x-1">
        <div 
          className="w-1.5 h-8 bg-black rounded-full"
          style={{
            animation: 'wave 1.2s ease-in-out infinite',
            animationDelay: '0s'
          }}
        />
        <div 
          className="w-1.5 h-8 bg-black rounded-full"
          style={{
            animation: 'wave 1.2s ease-in-out infinite',
            animationDelay: '0.15s'
          }}
        />
        <div 
          className="w-1.5 h-8 bg-black rounded-full"
          style={{
            animation: 'wave 1.2s ease-in-out infinite',
            animationDelay: '0.3s'
          }}
        />
      </div>
    </>
  );
};

export default LoadingSpinner;
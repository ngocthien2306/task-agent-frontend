import React, { useEffect, useState } from 'react';

export const Message = () => {
  const [animationState, setAnimationState] = useState(0);
  
  useEffect(() => {
    // Start animation sequence after component mounts
    const timer = setTimeout(() => {
      setAnimationState(1);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="fixed top-16 left-0 right-0 z-20 flex justify-center items-center pointer-events-none">
      <div 
        className={`transform transition-all duration-1000 ease-in-out ${
          animationState === 0 
            ? 'scale-0 opacity-0' 
            : 'scale-100 opacity-100'
        }`}
      >
        <div className="relative px-8 py-4 rounded-lg backdrop-blur-md bg-pink-500 bg-opacity-70 shadow-lg overflow-hidden">
          {/* Decorative flower elements */}
          <div className="absolute -left-4 -top-4 text-pink-200 text-4xl">✿</div>
          <div className="absolute -right-4 -top-4 text-pink-200 text-4xl">✿</div>
          <div className="absolute -left-4 -bottom-4 text-pink-200 text-4xl">✿</div>
          <div className="absolute -right-4 -bottom-4 text-pink-200 text-4xl">✿</div>
          
          {/* English Message */}
          <h2 className="text-white font-bold text-2xl md:text-3xl text-center mb-1 drop-shadow-lg">
            AI Digital Task Management
          </h2>
          
          
          {/* Sparkle animations */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i}
                className="absolute animate-ping text-yellow-200"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${1 + Math.random() * 3}s`,
                  fontSize: `${8 + Math.random() * 12}px`,
                  opacity: 0.7
                }}
              >
                ✦
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
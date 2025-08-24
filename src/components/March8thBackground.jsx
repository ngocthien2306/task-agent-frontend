import React, { useState, useEffect } from 'react';

export const March8thBackground = () => {
  const [showSpecial, setShowSpecial] = useState(false);

  useEffect(() => {
    // Check if today is March 8th
    const today = new Date();
    const isMarch8 = today.getMonth() === 2 && today.getDate() === 8;
    
    // Show special background if it's March 8th
    // For demo purposes, you can set this to true to test it
    setShowSpecial(isMarch8);
    
    // Add the CSS for the animated background
    if (isMarch8) {
      const style = document.createElement('style');
      style.textContent = `
        .march8-background {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
          z-index: -1;
        }
        
        .march8-flower {
          position: absolute;
          width: 20px;
          height: 20px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,10.5A1.5,1.5 0 0,1 13.5,12A1.5,1.5 0 0,1 12,13.5A1.5,1.5 0 0,1 10.5,12A1.5,1.5 0 0,1 12,10.5Z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-size: contain;
          transform-origin: center center;
          animation: fall linear infinite;
          opacity: 0.7;
        }
        
        @keyframes fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0.3;
          }
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);
  
  // Generate random flowers
  const createFlowers = () => {
    const flowers = [];
    const count = 50;
    
    for (let i = 0; i < count; i++) {
      const size = Math.random() * 20 + 10;
      const left = Math.random() * 100;
      const animationDuration = Math.random() * 10 + 10;
      const delay = Math.random() * 10;
      
      flowers.push(
        <div
          key={i}
          className="march8-flower"
          style={{
            left: `${left}%`,
            width: `${size}px`,
            height: `${size}px`,
            animation: `fall ${animationDuration}s linear ${delay}s infinite`,
            filter: `hue-rotate(${Math.random() * 60}deg)`
          }}
        />
      );
    }
    
    return flowers;
  };
  
  if (!showSpecial) return null;
  
  return (
    <div className="march8-background">
      {createFlowers()}
      <div className="fixed bottom-4 left-4 bg-white bg-opacity-80 p-2 rounded-lg shadow-lg text-pink-600 font-bold text-sm">
        Happy International Women's Day! 💐
      </div>
    </div>
  );
};

export default March8thBackground;
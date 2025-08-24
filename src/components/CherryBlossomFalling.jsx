import { useRef, useState, useEffect } from "react";

// Cherry Blossom Petal component - giữ nguyên thiết kế ban đầu
const CherryBlossomPetal = ({ style }) => {
  return (
    <div
      className="absolute pointer-events-none"
      style={style}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7.5,0C7.5,0,6,2.5,6,5s1,5,1.5,5s1-2.5,1-5S7.5,0,7.5,0z"
          fill="#FFD7E6"
        />
        <path
          d="M7.5,15C7.5,15,6,12.5,6,10s1-5,1.5-5s1,2.5,1,5S7.5,15,7.5,15z"
          fill="#FFD7E6"
        />
        <path
          d="M15,7.5C15,7.5,12.5,6,10,6S5,7,5,7.5s2.5,1,5,1S15,7.5,15,7.5z"
          fill="#FFD7E6"
        />
        <path
          d="M0,7.5C0,7.5,2.5,6,5,6s5,1,5,1.5s-2.5,1-5,1S0,7.5,0,7.5z"
          fill="#FFD7E6"
        />
        <circle cx="7.5" cy="7.5" r="1.5" fill="#FFBAD2" />
      </svg>
    </div>
  );
};

// Cherry Blossom Animation Component
export const CherryBlossomFalling = () => {
  const [petals, setPetals] = useState([]);
  const animationRef = useRef(null);
  const lastPetalTime = useRef(0);

  // Create petal with random position and animation properties
  const createPetal = () => {
    const id = Date.now() + Math.random();
    const size = Math.random() * 10 + 10; // 10-20px
    const startPositionX = Math.random() * window.innerWidth;
    const duration = Math.random() * 10 + 10; // 10-20s
    const delay = Math.random() * 5; // 0-5s

    const rotation = Math.random() * 360;
    const rotationSpeed = Math.random() * 2 - 1; // -1 to 1

    return {
      id,
      size,
      startPositionX,
      duration,
      delay,
      rotation,
      rotationSpeed,
      startTime: Date.now(),
    };
  };

  // Update petals animation
  const animatePetals = () => {
    const currentTime = Date.now();
    
    // Add new petal every 100ms
    if (currentTime - lastPetalTime.current > 100) {
      setPetals(prev => [...prev, createPetal()]);
      lastPetalTime.current = currentTime;
    }
    
    // Update petal positions and remove old ones
    setPetals(currentPetals => 
      currentPetals
        .filter(petal => {
          const elapsedTime = (currentTime - petal.startTime) / 1000;
          return elapsedTime < (petal.duration + petal.delay);
        })
        .map(petal => {
          const elapsedTime = (currentTime - petal.startTime) / 1000;
          return {
            ...petal,
            currentTime: elapsedTime,
          };
        })
    );

    animationRef.current = requestAnimationFrame(animatePetals);
  };

  // Start/stop animation on mount/unmount
  useEffect(() => {
    // Initialize with some petals
    const initialPetals = Array.from({ length: 30 }, createPetal);
    setPetals(initialPetals);
    lastPetalTime.current = Date.now();

    // Start animation
    animationRef.current = requestAnimationFrame(animatePetals);

    // Cleanup on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {petals.map(petal => {
        if (petal.currentTime === undefined || petal.currentTime < petal.delay) {
          return null;
        }
        
        const activeTime = petal.currentTime - petal.delay;
        const progress = Math.min(activeTime / petal.duration, 1);
        
        // Calculate position
        const topPosition = progress * window.innerHeight * 1.2 - 20; // Extra 20% to ensure petals go off-screen
        
        // Calculate horizontal movement (swaying)
        const swayAmount = 50; // How far to sway in pixels
        const swayFrequency = 2; // How many complete sways during fall
        const horizontalOffset = Math.sin(progress * Math.PI * 2 * swayFrequency) * swayAmount;
        
        // Calculate rotation
        const currentRotation = petal.rotation + (activeTime * petal.rotationSpeed * 360);
        
        const style = {
          top: `${topPosition}px`,
          left: `${petal.startPositionX + horizontalOffset}px`,
          transform: `rotate(${currentRotation}deg) scale(${petal.size / 15})`,
          opacity: Math.min(1, 3 * (1 - progress)), // Fade out near the end
          transition: 'transform 0.1s ease'
        };
        
        return <CherryBlossomPetal key={petal.id} style={style} />;
      })}
    </div>
  );
};
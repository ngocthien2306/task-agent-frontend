import { useEffect, useState } from "react";

export const FloatingShapes = () => {
  const [shapes, setShapes] = useState([]);

  useEffect(() => {
    const createShapes = () => {
      const newShapes = [];
      for (let i = 0; i < 15; i++) {
        newShapes.push({
          id: i,
          size: Math.random() * 60 + 20,
          x: Math.random() * 100,
          y: Math.random() * 100,
          duration: Math.random() * 20 + 10,
          delay: Math.random() * 10,
          type: Math.random() > 0.5 ? 'circle' : 'polygon',
          opacity: Math.random() * 0.3 + 0.1,
        });
      }
      setShapes(newShapes);
    };

    createShapes();
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className={`absolute ${
            shape.type === 'circle' 
              ? 'rounded-full bg-gradient-to-br from-pink-300 to-purple-400' 
              : 'bg-gradient-to-br from-blue-300 to-indigo-400 transform rotate-45'
          }`}
          style={{
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            opacity: shape.opacity,
            animation: `float ${shape.duration}s ease-in-out infinite ${shape.delay}s alternate`,
          }}
        />
      ))}
      
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
          100% {
            transform: translateY(0px) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
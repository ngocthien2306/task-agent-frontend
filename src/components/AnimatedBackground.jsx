import { useEffect, useRef } from "react";

export const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Particles array
    const particles = [];
    const particleCount = 80;

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.hue = Math.random() * 60 + 300; // Purple to pink range
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        // Slowly change hue for color animation
        this.hue += 0.1;
        if (this.hue > 360) this.hue = 0;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        
        // Create gradient for each particle
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 2
        );
        gradient.addColorStop(0, `hsl(${this.hue}, 80%, 70%)`);
        gradient.addColorStop(1, `hsl(${this.hue}, 60%, 40%)`);
        
        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    const animate = () => {
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "rgba(139, 69, 199, 0.8)"); // Purple
      gradient.addColorStop(0.3, "rgba(236, 72, 153, 0.6)"); // Pink
      gradient.addColorStop(0.6, "rgba(59, 130, 246, 0.8)"); // Blue
      gradient.addColorStop(1, "rgba(99, 102, 241, 0.9)"); // Indigo
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw connections between close particles
      particles.forEach((particle, index) => {
        for (let i = index + 1; i < particles.length; i++) {
          const otherParticle = particles[i];
          const distance = Math.sqrt(
            (particle.x - otherParticle.x) ** 2 + 
            (particle.y - otherParticle.y) ** 2
          );

          if (distance < 100) {
            ctx.save();
            ctx.globalAlpha = (100 - distance) / 100 * 0.2;
            ctx.strokeStyle = `hsl(${(particle.hue + otherParticle.hue) / 2}, 70%, 60%)`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
            ctx.restore();
          }
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
      style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
    />
  );
};
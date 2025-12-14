'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  decay: number;
  size: number;
}

interface Firework {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  color: string;
  exploded: boolean;
  particles: Particle[];
}

const COLORS = ['#D4A942', '#FFD700', '#FF6B6B', '#4ECDC4', '#FF69B4', '#87CEEB', '#98FB98'];

export function FireworksAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fireworksRef = useRef<Firework[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const createFirework = () => {
      const x = Math.random() * canvas.width;
      const targetY = Math.random() * (canvas.height * 0.5) + 50;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];

      fireworksRef.current.push({
        x,
        y: canvas.height,
        targetY,
        vy: -8 - Math.random() * 4,
        color,
        exploded: false,
        particles: [],
      });
    };

    const createParticles = (firework: Firework) => {
      const particleCount = 80 + Math.floor(Math.random() * 40);

      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.2;
        const velocity = 2 + Math.random() * 4;

        firework.particles.push({
          x: firework.x,
          y: firework.y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          color: firework.color,
          alpha: 1,
          decay: 0.015 + Math.random() * 0.01,
          size: 2 + Math.random() * 2,
        });
      }
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(145, 0, 10, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      fireworksRef.current = fireworksRef.current.filter((firework) => {
        if (!firework.exploded) {
          // Draw rising firework
          ctx.beginPath();
          ctx.arc(firework.x, firework.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = firework.color;
          ctx.fill();

          // Trail
          ctx.beginPath();
          ctx.moveTo(firework.x, firework.y);
          ctx.lineTo(firework.x, firework.y + 20);
          ctx.strokeStyle = firework.color;
          ctx.lineWidth = 2;
          ctx.stroke();

          firework.y += firework.vy;
          firework.vy += 0.1; // Gravity

          if (firework.y <= firework.targetY || firework.vy >= 0) {
            firework.exploded = true;
            createParticles(firework);
          }

          return true;
        } else {
          // Update and draw particles
          firework.particles = firework.particles.filter((particle) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.05; // Gravity
            particle.vx *= 0.99; // Friction
            particle.alpha -= particle.decay;

            if (particle.alpha <= 0) return false;

            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * particle.alpha, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.alpha;
            ctx.fill();
            ctx.globalAlpha = 1;

            return true;
          });

          return firework.particles.length > 0;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Launch fireworks periodically
    const launchInterval = setInterval(() => {
      if (fireworksRef.current.length < 5) {
        createFirework();
      }
    }, 800);

    // Initial burst
    setTimeout(() => createFirework(), 100);
    setTimeout(() => createFirework(), 300);
    setTimeout(() => createFirework(), 500);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      clearInterval(launchInterval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
}

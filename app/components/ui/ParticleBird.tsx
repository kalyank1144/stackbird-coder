import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export function ParticleBird() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle system
    const particles: Particle[] = [];
    const maxParticles = 200;
    let time = 0;

    // Bird shape points (simplified bird silhouette)
    const getBirdPoint = (t: number): { x: number; y: number } => {
      const centerX = canvas.offsetWidth / 2;
      const centerY = canvas.offsetHeight / 2;
      const scale = 150;

      // Parametric equations for bird shape
      const angle = t * Math.PI * 2;
      const r = scale * (1 + 0.3 * Math.sin(3 * angle));
      
      // Create flowing bird shape
      const x = centerX + r * Math.cos(angle) + Math.sin(time * 0.001 + t * 2) * 30;
      const y = centerY + r * Math.sin(angle) * 0.6 + Math.cos(time * 0.001 + t * 3) * 20;

      return { x, y };
    };

    // Create particles along bird path
    const createParticle = () => {
      const t = Math.random();
      const point = getBirdPoint(t);
      
      particles.push({
        x: point.x,
        y: point.y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: 0,
        maxLife: 100 + Math.random() * 100,
      });
    };

    // Animation loop
    const animate = () => {
      time++;

      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(26, 26, 31, 0.1)';
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Add new particles
      for (let i = 0; i < 3; i++) {
        if (particles.length < maxParticles) {
          createParticle();
        }
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        // Remove dead particles
        if (p.life > p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        // Calculate opacity based on life
        const lifeRatio = 1 - p.life / p.maxLife;
        const opacity = lifeRatio * 0.8;

        // Color gradient from purple to blue
        const colorRatio = (p.y / canvas.offsetHeight);
        const r = Math.floor(139 + (59 - 139) * colorRatio);
        const g = Math.floor(92 + (130 - 92) * colorRatio);
        const b = Math.floor(246);

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2 * lifeRatio, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.fill();

        // Draw glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 10 * lifeRatio);
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity * 0.5})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10 * lifeRatio, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw connecting lines between nearby particles
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 50) {
            const opacity = (1 - dist / 50) * 0.3;
            ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{
        background: 'transparent',
      }}
    />
  );
}

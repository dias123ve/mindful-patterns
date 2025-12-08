import { useEffect, useRef } from "react";

const RisingPathAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let startTime: number;

    const duration = 5000; // 5 seconds
    const width = canvas.width;
    const height = canvas.height;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min((elapsed % duration) / duration, 1);

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Create gradient
      const gradient = ctx.createLinearGradient(0, height, width, 0);
      gradient.addColorStop(0, "hsl(180, 60%, 50%)"); // Teal
      gradient.addColorStop(0.5, "hsl(200, 70%, 55%)"); // Blue
      gradient.addColorStop(1, "hsl(270, 60%, 60%)"); // Violet

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Draw the path
      ctx.beginPath();

      const points: { x: number; y: number }[] = [];
      const numPoints = 60;

      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const x = t * width * 0.8 + width * 0.1;
        
        // Base Y position (going upward)
        const baseY = height * 0.85 - t * height * 0.7;
        
        // Calculate chaos factor - high at start, low at end
        // Also affected by animation progress (more smooth as animation progresses)
        const animationSmoothing = Math.min(progress * 2, 1);
        const positionSmoothing = t;
        const smoothFactor = Math.max(animationSmoothing, positionSmoothing);
        const chaosFactor = (1 - smoothFactor) * 30;
        
        // Add chaos waves
        const wave1 = Math.sin(t * 10 + elapsed * 0.003) * chaosFactor;
        const wave2 = Math.cos(t * 15 + elapsed * 0.005) * chaosFactor * 0.5;
        const wave3 = Math.sin(t * 20 + elapsed * 0.007) * chaosFactor * 0.3;
        
        const y = baseY + wave1 + wave2 + wave3;
        
        points.push({ x, y });
      }

      // Draw smooth curve through points
      if (points.length > 0) {
        ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length - 2; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        
        // Last curve
        if (points.length > 2) {
          const last = points[points.length - 1];
          const secondLast = points[points.length - 2];
          ctx.quadraticCurveTo(secondLast.x, secondLast.y, last.x, last.y);
        }
      }

      ctx.stroke();

      // Draw glowing end point
      const endPoint = points[points.length - 1];
      if (endPoint) {
        // Outer glow
        const glowGradient = ctx.createRadialGradient(
          endPoint.x, endPoint.y, 0,
          endPoint.x, endPoint.y, 20
        );
        glowGradient.addColorStop(0, "hsla(270, 60%, 70%, 0.8)");
        glowGradient.addColorStop(0.5, "hsla(270, 60%, 60%, 0.3)");
        glowGradient.addColorStop(1, "hsla(270, 60%, 50%, 0)");
        
        ctx.beginPath();
        ctx.fillStyle = glowGradient;
        ctx.arc(endPoint.x, endPoint.y, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner bright point
        ctx.beginPath();
        ctx.fillStyle = "hsl(270, 70%, 80%)";
        ctx.arc(endPoint.x, endPoint.y, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <canvas
        ref={canvasRef}
        width={400}
        height={225}
        className="w-full h-full"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none" />
    </div>
  );
};

export default RisingPathAnimation;
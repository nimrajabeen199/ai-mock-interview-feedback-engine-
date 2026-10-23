import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  color?: string;
  barCount?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isActive,
  color = '#6366f1',
  barCount = 24,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        let barHeight = 4;
        if (isActive) {
          // Dynamic harmonic wave simulation
          const sinValue = Math.sin(phase + i * 0.35);
          const cosValue = Math.cos(phase * 1.5 + i * 0.2);
          const normalized = Math.max(0.1, (sinValue + cosValue + 2) / 4);
          barHeight = Math.max(4, normalized * (height * 0.85));
        } else {
          barHeight = 4;
        }

        const x = i * (barWidth + 2);
        const y = (height - barHeight) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isActive) {
          gradient.addColorStop(0, color);
          gradient.addColorStop(1, '#a855f7');
        } else {
          gradient.addColorStop(0, '#475569');
          gradient.addColorStop(1, '#334155');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      }

      if (isActive) {
        phase += 0.12;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, color, barCount]);

  return (
    <canvas
      ref={canvasRef}
      width={180}
      height={36}
      className="w-full max-w-[200px] h-9 pointer-events-none"
    />
  );
};

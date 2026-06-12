"use client";

import { useRef, useEffect, useState } from "react";

interface RouletteWheelProps {
  isSpinning: boolean;
  onSpinComplete?: () => void;
}

const COLORS = [
  "#00205B", // Navy (IMD primary)
  "#1E3A8A", // Blue-900
  "#1E40AF", // Blue-800
  "#1D4ED8", // Blue-700
  "#2563EB", // Blue-600
  "#3B82F6", // Blue-500
  "#0F6E56", // Teal (IMD secondary)
  "#0D9488", // Teal-600
];

const SEGMENTS = 12;

export function RouletteWheel({ isSpinning, onSpinComplete }: RouletteWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef<number | null>(null);
  const spinStartRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw wheel
    const segmentAngle = (2 * Math.PI) / SEGMENTS;

    for (let i = 0; i < SEGMENTS; i++) {
      const startAngle = rotation + i * segmentAngle;
      const endAngle = startAngle + segmentAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#00205B";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw pointer
    ctx.beginPath();
    ctx.moveTo(centerX + radius + 5, centerY);
    ctx.lineTo(centerX + radius - 25, centerY - 15);
    ctx.lineTo(centerX + radius - 25, centerY + 15);
    ctx.closePath();
    ctx.fillStyle = "#00205B";
    ctx.fill();

    // Draw outer ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#00205B";
    ctx.lineWidth = 4;
    ctx.stroke();
  }, [rotation]);

  useEffect(() => {
    if (isSpinning) {
      spinStartRef.current = performance.now();
      const duration = 4000; // 4 seconds
      const totalRotations = 5 + Math.random() * 3; // 5-8 full rotations
      const targetRotation = rotation + totalRotations * 2 * Math.PI;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - spinStartRef.current;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out cubic)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentRotation =
          rotation + (targetRotation - rotation) * easeOut;

        setRotation(currentRotation);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          onSpinComplete?.();
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSpinning]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="mx-auto"
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-[#00205B] font-bold text-lg">
          {isSpinning ? "..." : "SPIN"}
        </span>
      </div>
    </div>
  );
}

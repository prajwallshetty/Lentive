'use client';

import React, { useRef, useEffect, useCallback } from 'react';

interface DotGridBackgroundProps {
  dotColor?: string;
  glowColor?: string;
  dotSize?: number;
  gap?: number;
  glowRadius?: number;
}

export default function DotGridBackground({
  dotColor = 'rgba(255, 255, 255, 0.08)',
  glowColor = 'rgba(129, 140, 248, 0.75)', // Indigo glow color
  dotSize = 0.75,
  gap = 12,
  glowRadius = 160,
}: DotGridBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const rAFRef = useRef<number | null>(null);
  const mouseState = useRef<{ x: number; y: number; alpha: number; lastMoveTime: number } | null>(null);

  const updateMask = useCallback(() => {
    const glowEl = glowRef.current;
    if (!glowEl) return;

    const state = mouseState.current;
    if (!state || state.alpha <= 0.01) {
      glowEl.style.maskImage = 'none';
      glowEl.style.webkitMaskImage = 'none';
      glowEl.style.opacity = '0';
      return;
    }

    const alpha = Math.min(state.alpha, 1);
    const mask = `radial-gradient(circle ${glowRadius}px at ${state.x}px ${state.y}px, rgba(0,0,0,${alpha}) 0%, rgba(0,0,0,${alpha * 0.75}) 25%, rgba(0,0,0,${alpha * 0.35}) 55%, transparent 100%)`;
    
    glowEl.style.opacity = '1';
    glowEl.style.maskImage = mask;
    glowEl.style.webkitMaskImage = mask;
  }, [glowRadius]);

  const tick = useCallback(() => {
    const state = mouseState.current;
    if (!state) {
      rAFRef.current = null;
      return;
    }

    const elapsed = performance.now() - state.lastMoveTime;
    if (elapsed > 0) {
      // Decay over 800ms
      state.alpha = 1 - Math.min(elapsed / 800, 1);
    }

    updateMask();

    if (state.alpha > 0.01) {
      rAFRef.current = requestAnimationFrame(tick);
    } else {
      mouseState.current = null;
      rAFRef.current = null;
      updateMask();
    }
  }, [updateMask]);

  const startTick = useCallback(() => {
    if (rAFRef.current === null) {
      rAFRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      return;
    }

    mouseState.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      alpha: 1,
      lastMoveTime: performance.now(),
    };
    startTick();
  }, [startTick]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rAFRef.current !== null) {
        cancelAnimationFrame(rAFRef.current);
      }
    };
  }, [handleMouseMove]);

  const dotPattern = `radial-gradient(circle, ${dotColor} ${dotSize}px, transparent ${dotSize}px)`;
  const glowPattern = `radial-gradient(circle, ${glowColor} ${dotSize * 1.5}px, transparent ${dotSize * 1.5}px)`;

  const style: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backgroundImage: dotPattern,
    backgroundSize: `${gap}px ${gap}px`,
    backgroundPosition: `${gap / 2}px ${gap / 2}px`,
    pointerEvents: 'none',
  };

  const glowStyle: React.CSSProperties = {
    ...style,
    backgroundImage: glowPattern,
    maskImage: 'none',
    WebkitMaskImage: 'none',
    opacity: 0,
    transition: 'opacity 0.15s ease',
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <div style={style} />
      <div ref={glowRef} style={glowStyle} />
    </div>
  );
}

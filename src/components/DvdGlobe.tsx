"use client";

import React, { useEffect, useRef } from "react";

export default function DvdGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const logo = logoRef.current;
    if (!container || !logo) return;

    let animId: number;
    // Initial position
    let x = 20;
    let y = 20;
    // Speed in px per millisecond (~1.6 - 1.8 px per frame at 60fps)
    let vx = 0.12;
    let vy = 0.093;
    let lastTime = performance.now();

    const update = (now: number) => {
      const dt = Math.min(now - lastTime, 50); // Cap dt to prevent huge jumps on tab switch
      lastTime = now;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const logoWidth = 100;
      const logoHeight = 61;

      x += vx * dt;
      y += vy * dt;

      // Check left/right bounds
      if (x <= 0) {
        x = 0;
        vx = Math.abs(vx);
      } else if (x + logoWidth >= containerWidth) {
        x = Math.max(0, containerWidth - logoWidth);
        vx = -Math.abs(vx);
      }

      const allowedHeight = Math.max(100, containerHeight - 160);

      // Check top/bottom bounds
      if (y <= 0) {
        y = 0;
        vy = Math.abs(vy);
      } else if (y + logoHeight >= allowedHeight) {
        y = Math.max(0, allowedHeight - logoHeight);
        vy = -Math.abs(vy);
      }

      if (logo) {
        logo.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
    >
      <img
        ref={logoRef}
        src="/assets/misc/globe-brand.svg"
        alt="Globe Brand"
        width={100}
        height={61}
        className="w-[100px] h-[61px] object-contain absolute top-0 left-0 will-change-transform opacity-90"
        style={{ transform: "translate3d(20px, 20px, 0)" }}
      />
    </div>
  );
}

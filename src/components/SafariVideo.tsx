"use client";

import React, { useRef, useEffect, useCallback } from "react";

interface SafariVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src?: string;
  className?: string;
}

export default function SafariVideo({
  src,
  className,
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  preload = "auto",
  ...props
}: SafariVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Sync DOM property muted state and explicitly trigger play on mount/src change for WebKit/iOS Safari
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    el.defaultMuted = true;
    el.muted = true;
    el.setAttribute("playsinline", "true");
    el.setAttribute("webkit-playsinline", "true");

    if (autoPlay) {
      const playPromise = el.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // Autoplay blocked by Low Power Mode or iOS interaction policy
        });
      }
    }
  }, [src, autoPlay]);

  const setVideoRef = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (el) {
      el.defaultMuted = true;
      el.muted = true;
      el.setAttribute("playsinline", "true");
      el.setAttribute("webkit-playsinline", "true");
      if (autoPlay) {
        el.play().catch(() => {});
      }
    }
  }, [autoPlay]);

  return (
    <video
      ref={setVideoRef}
      src={src}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      playsInline={playsInline}
      preload={preload}
      className={className}
      {...props}
    />
  );
}

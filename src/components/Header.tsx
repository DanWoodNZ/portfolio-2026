"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AtSign, Globe } from "lucide-react";
import { useViewMode } from "@/context/ViewModeContext";

const CarouselIcon = ({ className }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="1.5" y="2" width="2.5" height="10" rx="0.8" fill="currentColor" />
    <rect x="5.75" y="2" width="2.5" height="10" rx="0.8" fill="currentColor" />
    <rect x="10" y="2" width="2.5" height="10" rx="0.8" fill="currentColor" />
  </svg>
);

const GridDotsIcon = ({ className }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="2.5" cy="2.5" r="1.2" fill="currentColor" />
    <circle cx="7" cy="2.5" r="1.2" fill="currentColor" />
    <circle cx="11.5" cy="2.5" r="1.2" fill="currentColor" />
    <circle cx="2.5" cy="7" r="1.2" fill="currentColor" />
    <circle cx="7" cy="7" r="1.2" fill="currentColor" />
    <circle cx="11.5" cy="7" r="1.2" fill="currentColor" />
    <circle cx="2.5" cy="11.5" r="1.2" fill="currentColor" />
    <circle cx="7" cy="11.5" r="1.2" fill="currentColor" />
    <circle cx="11.5" cy="11.5" r="1.2" fill="currentColor" />
  </svg>
);

export default function Header() {
  const pathname = usePathname();
  const { viewMode, setViewMode } = useViewMode();
  const [timeStr, setTimeStr] = useState<string>("10:31:00 AM NYC");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "America/New_York",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      const formatter = new Intl.DateTimeFormat("en-US", options);
      setTimeStr(`${formatter.format(now)} NYC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-4 md:px-6 pt-4 flex flex-wrap items-center justify-between gap-4 text-mono-small tracking-[-0.04em] uppercase text-white/80">
      {/* Subtle, even top-to-bottom black fade and matching background blur */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none" />
      {/* Left Brand / Status */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href="/"
          className="hover:text-white font-medium transition-colors text-white shrink-0"
        >
          DAN WOOD
        </Link>
        <div className="hidden md:flex items-center gap-2">
          <span className="text-[#E5FE8D]">•</span>
          <span className="text-white">LEAD PRODUCT DESIGNER</span>
          <AtSign size={12} strokeWidth={2} className="text-[#E5FE8D] shrink-0" />
          <span className="text-white">CURRENT</span>
        </div>
      </div>

      {/* Center Segmented Controller (Homepage only, Desktop >= 1200px) */}
      {pathname === "/" && (
        <div className="hidden max-[1199px]:hidden min-[1200px]:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
          <div className="bg-[#0a0a0a] border border-white/12 rounded-full p-1 flex items-center gap-1 shadow-2xl backdrop-blur-md">
            <button
              onClick={() => setViewMode("carousel")}
              className={`rounded-full px-4 py-1.5 flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase transition-all duration-200 ${viewMode === "carousel"
                  ? "bg-[#1D1D1D] text-white shadow-md"
                  : "text-white/50 hover:text-white"
                }`}
            >
              <CarouselIcon className={viewMode === "carousel" ? "text-[#E5FE8D]" : "text-white/40"} />
              <span>CAROUSEL</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-full px-4 py-1.5 flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase transition-all duration-200 ${viewMode === "grid"
                  ? "bg-[#1D1D1D] text-white shadow-md"
                  : "text-white/50 hover:text-white"
                }`}
            >
              <GridDotsIcon className={viewMode === "grid" ? "text-white" : "text-white/40"} />
              <span>GRID</span>
            </button>
          </div>
        </div>
      )}

      {/* Right Time & Social Icons */}
      <div className="flex items-center gap-3 ml-auto">
        <div className="hidden md:flex items-center gap-1.5 text-white mr-2 font-mono">
          <Globe size={12} strokeWidth={2} className="text-[#E5FE8D] shrink-0" />
          <span>{timeStr}</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <a
            href="https://dribbble.com/danrobertwood"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Dribbble"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-[8px] bg-transparent backdrop-blur-md border border-white/12 flex items-center justify-center hover:bg-[#1D1D1D] hover:border-[#1D1D1D] hover:scale-105 transition-all"
          >
            <img
              src="/assets/icons/icon-dribble-dark.svg"
              alt="Dribbble"
              className="w-3 h-3"
            />
          </a>
          <a
            href="https://www.instagram.com/danrobertwood"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-[8px] bg-transparent backdrop-blur-md border border-white/12 flex items-center justify-center hover:bg-[#1D1D1D] hover:border-[#1D1D1D] hover:scale-105 transition-all"
          >
            <img
              src="/assets/icons/icon-instagram-dark.svg"
              alt="Instagram"
              className="w-3 h-3"
            />
          </a>
          <a
            href="https://www.linkedin.com/in/danrobertwood/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-[8px] bg-transparent backdrop-blur-md border border-white/12 flex items-center justify-center hover:bg-[#1D1D1D] hover:border-[#1D1D1D] hover:scale-105 transition-all"
          >
            <img
              src="/assets/icons/icon-linkedin-dark.svg"
              alt="LinkedIn"
              className="w-3 h-3"
            />
          </a>
          <a
            href="https://open.spotify.com/user/1241863181?si=36e3331fcb214a63&nd=1&dlsi=49dfbfdb6593400d"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Spotify"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-[8px] bg-transparent backdrop-blur-md border border-white/12 flex items-center justify-center hover:bg-[#1D1D1D] hover:border-[#1D1D1D] hover:scale-105 transition-all"
          >
            <img
              src="/assets/icons/icon-spotify.svg"
              alt="Spotify"
              className="w-3 h-3"
            />
          </a>
          <a
            href="mailto:danrobertwood@gmail.com"
            aria-label="Email"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-[8px] bg-transparent backdrop-blur-md border border-white/12 flex items-center justify-center hover:bg-[#1D1D1D] hover:border-[#1D1D1D] hover:scale-105 transition-all"
          >
            <img
              src="/assets/icons/icon-mail-dark.svg"
              alt="Email"
              className="w-3 h-3"
            />
          </a>
        </div>
      </div>
    </header>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { X, Maximize, ChevronLeft, ChevronRight } from "lucide-react";
import { getVisualFeedItems } from "@/lib/cms";
import SafariVideo from "@/components/SafariVideo";

export interface FeedItem {
  id: string;
  title: string;
  aspectRatio: string;
  src?: string;
  order_index?: number;
}

const FALLBACK_FEED_DATA: FeedItem[] = [
  { id: "feed-1", title: "VISUAL EXPLORATION 01", aspectRatio: "aspect-[4/5]", src: "/assets/misc/placeholder.jpg", order_index: 1 },
  { id: "feed-2", title: "SYSTEM STUDY 02", aspectRatio: "aspect-[16/10]", src: "/assets/misc/placeholder.jpg", order_index: 2 },
  { id: "feed-3", title: "INTERFACE PROTOTYPE 03", aspectRatio: "aspect-[1/1]", src: "/assets/misc/placeholder.jpg", order_index: 3 },
  { id: "feed-4", title: "DESIGN TOKEN 04", aspectRatio: "aspect-[3/4]", src: "/assets/misc/placeholder.jpg", order_index: 4 },
  { id: "feed-5", title: "COMPONENT ARCHITECTURE 05", aspectRatio: "aspect-[4/3]", src: "/assets/misc/placeholder.jpg", order_index: 5 },
  { id: "feed-6", title: "MOBILE INTERACTION 06", aspectRatio: "aspect-[9/16]", src: "/assets/misc/placeholder.jpg", order_index: 6 },
  { id: "feed-7", title: "TYPOGRAPHIC SCALE 07", aspectRatio: "aspect-[1/1]", src: "/assets/misc/placeholder.jpg", order_index: 7 },
  { id: "feed-8", title: "MOTION PROTOTYPE 08", aspectRatio: "aspect-[16/9]", src: "/assets/misc/placeholder.jpg", order_index: 8 },
  { id: "feed-9", title: "ICONOGRAPHY SYSTEM 09", aspectRatio: "aspect-[4/5]", src: "/assets/misc/placeholder.jpg", order_index: 9 },
  { id: "feed-10", title: "SPATIAL INTERFACE 10", aspectRatio: "aspect-[16/10]", src: "/assets/misc/placeholder.jpg", order_index: 10 },
  { id: "feed-11", title: "SYSTEM ARCHIVE 11", aspectRatio: "aspect-[3/4]", src: "/assets/misc/placeholder.jpg", order_index: 11 },
  { id: "feed-12", title: "BRAND GUIDELINES 12", aspectRatio: "aspect-[1/1]", src: "/assets/misc/placeholder.jpg", order_index: 12 },
];

const isVideo = (src?: string) => {
  if (!src) return false;
  const lower = src.toLowerCase();
  return (
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".mov") ||
    lower.startsWith("data:video/")
  );
};

export default function MasonryFeed({ className }: { className?: string } = {}) {
  const [feedItems, setFeedItems] = useState<FeedItem[]>(FALLBACK_FEED_DATA);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHoveringBackdrop, setIsHoveringBackdrop] = useState(false);

  const loadFeed = async () => {
    const items = await getVisualFeedItems();
    if (items && items.length > 0) {
      const sorted = [...items].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
      setFeedItems(sorted);
    }
  };

  useEffect(() => {
    const initFetch = async () => {
      await loadFeed();
    };
    initFetch();
    const handleUpdate = () => {
      loadFeed();
    };
    window.addEventListener("visual-feed-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("storage-update", handleUpdate);

    let bc1: BroadcastChannel | null = null;
    let bc2: BroadcastChannel | null = null;
    try {
      bc1 = new BroadcastChannel("cms_channel");
      bc1.onmessage = () => loadFeed();
      bc2 = new BroadcastChannel("portfolio-sync");
      bc2.onmessage = () => loadFeed();
    } catch (e) {
      // BroadcastChannel not supported
    }

    return () => {
      window.removeEventListener("visual-feed-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("storage-update", handleUpdate);
      bc1?.close();
      bc2?.close();
    };
  }, []);

  const currentItem = selectedIndex !== null ? feedItems[selectedIndex] : null;

  const goNext = () => {
    setSelectedIndex((prev) =>
      prev !== null ? (prev + 1) % feedItems.length : null
    );
  };

  const goPrev = () => {
    setSelectedIndex((prev) =>
      prev !== null ? (prev - 1 + feedItems.length) % feedItems.length : null
    );
  };

  // Track mouse coordinates for floating close button
  useEffect(() => {
    if (selectedIndex === null) return;
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [selectedIndex]);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedIndex]);

  // Keyboard navigation: Escape to close, Left/Right arrows to loop infinitely
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowRight") {
        setSelectedIndex((prev) =>
          prev !== null ? (prev + 1) % feedItems.length : null
        );
      }
      if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) =>
          prev !== null ? (prev - 1 + feedItems.length) % feedItems.length : null
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, feedItems.length]);

  const col1 = feedItems.filter((_, i) => i % 3 === 0);
  const col2 = feedItems.filter((_, i) => i % 3 === 1);
  const col3 = feedItems.filter((_, i) => i % 3 === 2);

  const renderCard = (item: FeedItem) => {
    const idx = feedItems.findIndex((f) => f.id === item.id);
    return (
      <div
        key={item.id}
        onClick={() => {
          setSelectedIndex(idx);
          setIsHoveringBackdrop(false);
        }}
        className="group block w-full rounded-[12px] border border-white/12 overflow-hidden relative cursor-pointer shadow-lg bg-[#141414] h-auto"
      >
        {isVideo(item.src) ? (
          <SafariVideo
            src={item.src}
            className="w-full h-auto block transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <img
            src={item.src || "/assets/misc/placeholder.jpg"}
            alt={item.title}
            className="w-full h-auto block transition-transform duration-700 ease-out group-hover:scale-105"
          />
        )}
        {/* Maximize Icon on hover in bottom right corner without dark overlay */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          <div className="w-8 h-8 rounded-[6px] bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white shadow-md">
            <Maximize size={14} strokeWidth={2} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className={className || "w-full px-2"}>
      {/* Mobile 1-Column Grid */}
      <div className="flex flex-col gap-2 md:hidden">
        {feedItems.map((item) => renderCard(item))}
      </div>

      {/* Tablet 2-Column Grid */}
      <div className="hidden md:grid lg:hidden grid-cols-2 gap-2">
        <div className="flex flex-col gap-2">
          {feedItems.filter((_, i) => i % 2 === 0).map((item) => renderCard(item))}
        </div>
        <div className="flex flex-col gap-2">
          {feedItems.filter((_, i) => i % 2 === 1).map((item) => renderCard(item))}
        </div>
      </div>

      {/* Desktop 3-Column Masonry Grid */}
      <div className="hidden lg:grid grid-cols-3 gap-2">
        <div className="flex flex-col gap-2">
          {col1.map((item) => renderCard(item))}
        </div>
        <div className="flex flex-col gap-2">
          {col2.map((item) => renderCard(item))}
        </div>
        <div className="flex flex-col gap-2">
          {col3.map((item) => renderCard(item))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300">
          {/* Backdrop with subtle fade and blur */}
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-none"
            onClick={() => setSelectedIndex(null)}
            onMouseEnter={() => setIsHoveringBackdrop(true)}
            onMouseMove={() => {
              if (!isHoveringBackdrop) setIsHoveringBackdrop(true);
            }}
          />

          {/* Custom Floating Close Icon when hovering outside the image area */}
          {isHoveringBackdrop && (
            <div
              className="pointer-events-none fixed z-50 w-12 h-12 rounded-full bg-[#1D1D1D] flex items-center justify-center text-white shadow-2xl transition-transform duration-75 ease-out -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
            >
              <X size={20} strokeWidth={2} />
            </div>
          )}

          {/* Left Navigation Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            onMouseEnter={() => setIsHoveringBackdrop(false)}
            onMouseLeave={() => setIsHoveringBackdrop(true)}
            className="fixed left-4 md:left-8 z-50 w-12 h-12 rounded-full bg-[#1D1D1D] flex items-center justify-center text-white hover:scale-105 transition-all shadow-2xl cursor-pointer"
            aria-label="Previous"
          >
            <ChevronLeft size={24} strokeWidth={2} />
          </button>

          {/* Right Navigation Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            onMouseEnter={() => setIsHoveringBackdrop(false)}
            onMouseLeave={() => setIsHoveringBackdrop(true)}
            className="fixed right-4 md:right-8 z-50 w-12 h-12 rounded-full bg-[#1D1D1D] flex items-center justify-center text-white hover:scale-105 transition-all shadow-2xl cursor-pointer"
            aria-label="Next"
          >
            <ChevronRight size={24} strokeWidth={2} />
          </button>

          {/* Lightbox Content Container */}
          <div
            className="relative z-10 w-full max-w-4xl flex flex-col items-center justify-center p-4 md:p-8 cursor-default animate-in zoom-in-95 duration-300"
            onMouseEnter={() => setIsHoveringBackdrop(false)}
            onMouseLeave={() => setIsHoveringBackdrop(true)}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Container */}
            <div
              className="relative flex items-center justify-center max-w-full max-h-[85vh]"
            >
              {isVideo(currentItem.src) ? (
                <SafariVideo
                  src={currentItem.src}
                  onClick={(e) => {
                    e.stopPropagation();
                    const v = e.currentTarget;
                    if (v.paused) v.play();
                    else v.pause();
                  }}
                  className="max-w-full max-h-[85vh] w-auto h-auto object-contain block mx-auto rounded-[8px] border border-white/[0.06] cursor-pointer"
                />
              ) : (
                <img
                  src={currentItem.src || "/assets/misc/placeholder.jpg"}
                  alt={currentItem.title}
                  className="max-w-full max-h-[85vh] w-auto h-auto object-contain block mx-auto rounded-[8px] border border-white/[0.06]"
                />
              )}
            </div>

            {/* Caption below item */}
            <div className="w-full text-center">
              <span className="text-mono-small text-white/40 mt-3 block uppercase tracking-wider">
                {currentItem.title}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

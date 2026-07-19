"use client";

import React from "react";

const FEED_ITEMS = [
  { type: "text", src: "/assets/misc/feed-text-01.svg" },
  { type: "icon", src: "/assets/misc/feed-icon-01.svg" },
  { type: "text", src: "/assets/misc/feed-text-02.svg" },
  { type: "icon", src: "/assets/misc/feed-icon-02.svg" },
  { type: "text", src: "/assets/misc/feed-text-03.svg" },
  { type: "icon", src: "/assets/misc/feed-icon-03.svg" },
  { type: "text", src: "/assets/misc/feed-text-04.svg" },
  { type: "icon", src: "/assets/misc/feed-icon-04.svg" },
  { type: "text", src: "/assets/misc/feed-text-05.svg" },
  { type: "icon", src: "/assets/misc/feed-icon-05.svg" },
  { type: "text", src: "/assets/misc/feed-text-06.svg" },
  { type: "icon", src: "/assets/misc/feed-icon-06.svg" },
  { type: "text", src: "/assets/misc/feed-text-07.svg" },
  { type: "icon", src: "/assets/misc/feed-icon-07.svg" },
  { type: "text", src: "/assets/misc/feed-text-08.svg" },
  { type: "icon", src: "/assets/misc/feed-icon-08.svg" },
];

export default function Marquee() {
  return (
    <div className="relative w-full overflow-hidden py-10 my-12 bg-black select-none">
      {/* Edge Gradient Fades */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-r from-black to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-l from-black to-transparent z-10" />

      {/* Infinite Scroller */}
      <div className="flex w-max animate-[marquee_70s_linear_infinite] items-center gap-12 md:gap-16">
        {FEED_ITEMS.map((item, i) => (
          <img
            key={i}
            src={item.src}
            alt="Visual Feed"
            className={
              item.type === "icon"
                ? "h-[56px] w-auto shrink-0 object-contain"
                : "h-[42px] w-auto shrink-0 object-contain"
            }
          />
        ))}
        {/* Repeat once for seamless looping */}
        {FEED_ITEMS.map((item, i) => (
          <img
            key={`repeat-${i}`}
            src={item.src}
            alt="Visual Feed"
            className={
              item.type === "icon"
                ? "h-[56px] w-auto shrink-0 object-contain"
                : "h-[42px] w-auto shrink-0 object-contain"
            }
          />
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

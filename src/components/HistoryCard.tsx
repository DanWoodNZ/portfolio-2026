"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { getHistoryPhotos, HistoryPhotoItem } from "@/lib/cms";
import { INITIAL_HISTORY_PHOTOS } from "@/data/projects";

export default function HistoryCard() {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHoveringBackdrop, setIsHoveringBackdrop] = useState(true);
  const [photos, setPhotos] = useState<HistoryPhotoItem[]>(INITIAL_HISTORY_PHOTOS);

  useEffect(() => {
    const fetchPhotos = async () => {
      const live = await getHistoryPhotos();
      if (live && live.length > 0) {
        setPhotos(live);
      }
    };
    fetchPhotos();
    window.addEventListener("history-updated", fetchPhotos);
    window.addEventListener("storage-update", fetchPhotos);
    window.addEventListener("storage", fetchPhotos);
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("cms_channel");
      bc.onmessage = () => fetchPhotos();
    } catch (e) {}
    return () => {
      window.removeEventListener("history-updated", fetchPhotos);
      window.removeEventListener("storage-update", fetchPhotos);
      window.removeEventListener("storage", fetchPhotos);
      if (bc) bc.close();
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    if (isLightboxOpen) {
      window.addEventListener("mousemove", handleMouseMove);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isLightboxOpen]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isLightboxOpen]);

  const STACK_STYLES = [
    { outer: "top-0 left-0 animate-float-1 z-10", inner: "group-hover/stack:-translate-x-1 group-hover/stack:-translate-y-1 group-hover/stack:-rotate-8" },
    { outer: "top-1 left-14 animate-float-2 z-20", inner: "group-hover/stack:translate-x-1.5 group-hover/stack:-translate-y-0.5 group-hover/stack:rotate-8" },
    { outer: "top-10 left-3 animate-float-3 z-30", inner: "group-hover/stack:-translate-x-0.5 group-hover/stack:translate-y-1.5 group-hover/stack:-rotate-4" },
    { outer: "top-12 left-16 animate-float-4 z-40", inner: "group-hover/stack:translate-x-2 group-hover/stack:translate-y-1 group-hover/stack:rotate-4" },
  ];

  return (
    <>
      <div className="col-span-full lg:col-span-1 bg-black border border-white/12 rounded-[12px] p-6 flex flex-col justify-between h-auto lg:h-[calc((100svh-88px)/2)] lg:min-h-[360px] overflow-hidden group/card">
        {/* Top-Left Polaroid Stack Area */}
        <div
          className="relative w-full h-[140px] md:h-[160px] flex items-start justify-start cursor-pointer group/stack pt-1 pl-1"
          onClick={() => setIsLightboxOpen(true)}
        >
          {!isLightboxOpen &&
            photos.slice(0, 4).map((photo, idx) => {
              const style = STACK_STYLES[idx % STACK_STYLES.length];
              return (
                <div key={photo.id || idx} className={`absolute ${style.outer}`}>
                  <motion.div
                    layoutId={`polaroid-${idx}`}
                    transition={{ type: "spring", stiffness: 320, damping: 26, mass: 1 }}
                    className={`w-[80px] h-[80px] rounded-[8px] bg-white p-1 shadow-xl overflow-hidden transition-all duration-300 ease-out group-hover/stack:scale-105 group-hover/stack:z-50 ${style.inner}`}
                  >
                    <img
                      src={photo.src}
                      alt={photo.alt || "History photo"}
                      className="w-full h-full object-cover rounded-[4px]"
                    />
                  </motion.div>
                </div>
              );
            })}
        </div>

        {/* Bottom Text Area (Space in-between fills automatically via justify-between) */}
        <div className="space-y-2 mt-auto pt-4">
          <h2 className="text-body-small font-medium text-white leading-snug">
            A little background
          </h2>
          <p className="text-[15px] md:text-[16px] text-white/50 leading-[24px]">
            My path to design was a little unconventional. I have degrees in film and software engineering, and spent time making movies and running a creative agency before pivoting into product design. I’m a dual citizen of 🇳🇿 New Zealand and the 🇺🇸 US and have spent most of my life between both. Today, I live in Hoboken with my wife Paige, our daughter Elva, and our dog Archie. Outside of work, i'm into photography, film & enjoy the occasional round of tennis.
          </p>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12">
            {/* Backdrop with subtle fade and blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-none"
              onClick={() => setIsLightboxOpen(false)}
              onMouseEnter={() => setIsHoveringBackdrop(true)}
              onMouseMove={() => {
                if (!isHoveringBackdrop) setIsHoveringBackdrop(true);
              }}
            />

            {/* Custom Floating Close Icon following cursor when hovering outside */}
            {isHoveringBackdrop && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="pointer-events-none fixed z-50 w-12 h-12 rounded-full bg-[#1D1D1D] flex items-center justify-center text-white shadow-2xl transition-transform duration-75 ease-out -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
              >
                <X size={20} strokeWidth={2} />
              </motion.div>
            )}

            {/* Lightbox 4-Photo Polaroid Grid Container (normal cursor when inside) */}
            <div
              className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 p-6 md:p-8 cursor-default"
              onMouseEnter={() => setIsHoveringBackdrop(false)}
              onMouseLeave={() => setIsHoveringBackdrop(true)}
              onClick={(e) => e.stopPropagation()}
            >
              {photos.map((photo, idx) => {
                const rotations = ["rotate-[-2deg]", "rotate-[2deg]", "rotate-[1deg]", "rotate-[-1deg]"];
                const rot = rotations[idx % rotations.length];
                return (
                  <div key={photo.id || idx}>
                    <motion.div
                      layoutId={`polaroid-${idx}`}
                      transition={{ type: "spring", stiffness: 320, damping: 26, mass: 1 }}
                      className={`bg-white p-1.5 md:p-2 rounded-[12px] shadow-2xl transition-transform duration-300 hover:scale-[1.02] ${rot} hover:rotate-0`}
                    >
                      <img
                        src={photo.src}
                        alt={photo.alt || "History photo"}
                        className="w-full aspect-[4/3] object-cover rounded-[6px]"
                      />
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          title="Back to top"
          className="fixed bottom-6 right-6 z-40 w-10 h-10 sm:w-11 sm:h-11 rounded-[8px] bg-[#141414]/90 backdrop-blur-md border border-white/12 flex items-center justify-center hover:bg-[#1D1D1D] hover:border-[#1D1D1D] hover:scale-105 transition-all text-white shadow-2xl cursor-pointer"
        >
          <ArrowUp size={16} strokeWidth={2} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";

interface ScrollFadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function ScrollFadeIn({ children, className = "", delay = 0 }: ScrollFadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

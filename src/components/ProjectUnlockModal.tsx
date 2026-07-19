"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, X, ArrowRight, AlertCircle } from "lucide-react";
import { CMSProject, setProjectUnlocked } from "@/lib/cms";

interface ProjectUnlockModalProps {
  project: CMSProject | null;
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess: (project: CMSProject) => void;
}

export default function ProjectUnlockModal({
  project,
  isOpen,
  onClose,
  onUnlockSuccess,
}: ProjectUnlockModalProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setError(null);
      setIsShaking(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = project.password || "";

    if (password === correctPassword || (!correctPassword && password === "")) {
      setProjectUnlocked(project.slug);
      setError(null);
      onUnlockSuccess(project);
    } else {
      setError("Incorrect password. Please verify and try again.");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      inputRef.current?.select();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop with dark glassmorphism */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={
              isShaking
                ? {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  x: [0, -10, 10, -10, 10, -5, 5, 0],
                }
                : { opacity: 1, scale: 1, y: 0, x: 0 }
            }
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: isShaking ? 0.4 : 0.25, ease: "easeOut" }}
            className="relative w-full max-w-[440px] bg-[#0E0E0E] rounded-[24px] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden text-white"
          >
            {/* Subtle top glow bar */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#E5FE8D] to-transparent opacity-70" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.12] flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer"
              title="Close"
            >
              <X size={16} />
            </button>


            {/* Project Title & Note */}
            <div className="mb-6">
              <h3 className="text-[22px] sm:text-[24px] font-medium text-white tracking-tight leading-snug mb-2 font-sans">
                {project.title}
              </h3>
              <p className="text-[14px] text-white/60 leading-relaxed font-sans">
                This project contains sensitive info. Please reach out if you're interested in viewing.
              </p>
            </div>

            {/* Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Enter password..."
                    className="w-full bg-[#161616] border border-white/15 focus:border-[#E5FE8D] rounded-[12px] px-4 py-3 sm:py-3.5 pr-12 text-white placeholder-white/30 text-[14px] sm:text-[15px] font-mono outline-none transition-all shadow-inner focus:shadow-[0_0_15px_rgba(229,254,141,0.1)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors cursor-pointer p-1"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-center gap-2 text-[13px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-[10px] p-3 font-sans"
                  >
                    <AlertCircle size={16} className="shrink-0 text-red-400" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  className="w-full sm:flex-1 bg-[#E5FE8D] hover:bg-[#d8f276] text-black font-mono text-[13px] font-medium uppercase tracking-wider py-3 sm:py-3.5 px-6 rounded-[12px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(229,254,141,0.2)] hover:shadow-[0_6px_25px_rgba(229,254,141,0.3)]"
                >
                  <span>Unlock
                  </span>
                  <ArrowRight size={16} strokeWidth={2} />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

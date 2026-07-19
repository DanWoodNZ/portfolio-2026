"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useViewMode } from "@/context/ViewModeContext";
import CarouselView from "@/components/CarouselView";
import Marquee from "@/components/Marquee";
import MasonryFeed from "@/components/MasonryFeed";
import Footer from "@/components/Footer";
import DvdGlobe from "@/components/DvdGlobe";
import ProjectGrid from "@/components/ProjectGrid";
import CareerFeed from "@/components/CareerFeed";
import HistoryCard from "@/components/HistoryCard";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import { CMSProject } from "@/lib/cms";
import { CareerItem } from "@/data/projects";

interface HomeContentProps {
  projects: CMSProject[];
  career: CareerItem[];
  education: CareerItem[];
}

export default function HomeContent({ projects, career, education }: HomeContentProps) {
  const { viewMode } = useViewMode();

  return (
    <>
      <AnimatePresence mode="wait">
        {viewMode === "carousel" ? (
          <motion.div
            key="carousel-view"
            initial={{ opacity: 0, filter: "blur(10px)", scale: 0.98 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)", scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <CarouselView projects={projects} career={career} education={education} />
          </motion.div>
        ) : (
          <motion.main
            key="grid-view"
            initial={{ opacity: 0, filter: "blur(10px)", scale: 0.98 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)", scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 w-full px-2 pt-2"
          >
            {/* Single Grid Container for all 3 Rows: 3 cols at lg (desktop >=1024px), 2 cols at sm (tablet), 1 col on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {/* Card 1: About Bio */}
              <motion.div
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="bg-black border border-white/12 rounded-[12px] p-6 flex flex-col justify-between h-[360px] sm:h-[340px] lg:h-[calc((100svh-88px)/2)] lg:min-h-[360px] relative overflow-hidden group"
              >
                <DvdGlobe />

                {/* Bio Text */}
                <div className="space-y-2 relative z-10 mt-auto pt-16">
                  <p className="text-[15px] md:text-[16px] text-white/50 leading-[24px] font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    Today, I lead design on the growth team at{" "}
                    <a
                      href="https://current.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white underline decoration-white/30 underline-offset-4 hover:text-[#E5FE8D] transition-colors"
                    >
                      Current
                    </a>
                    , where I focus on moving metrics like onboarding and direct
                    deposit intake for millions of working americans. Lately,
                    I&apos;ve also been busy with an internal re-brand, vibe coding
                    internal apps, and speeding up our design system to play nice
                    with AI tooling.
                  </p>
                </div>
              </motion.div>

              {/* Project Cards (All projects use identical style and layout, limited to 5, connected to live Supabase/CMS) */}
              <ProjectGrid initialProjects={projects} />

              {/* Row 3: Career Table (2 cols on desktop) & History (1 col on desktop) */}
              <ScrollFadeIn className="col-span-1 sm:col-span-2 lg:col-span-2">
                <CareerFeed initialCareer={career} initialEducation={education} />
              </ScrollFadeIn>

              {/* Right History Card with Interactive Floating Polaroid Stack */}
              <ScrollFadeIn delay={0.15} className="h-full">
                <HistoryCard />
              </ScrollFadeIn>
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      {/* Marquee Section */}
      <Marquee />

      {/* Visual Feed Dynamic Masonry Grid */}
      <MasonryFeed className={viewMode === "carousel" ? "w-full px-[80px]" : "w-full px-2"} />

      <Footer />
    </>
  );
}

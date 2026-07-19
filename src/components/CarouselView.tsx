"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useAnimationFrame, AnimatePresence } from "framer-motion";
import { Lock, GraduationCap, AtSign } from "lucide-react";
import { CMSProject, isVideoUrl, getHistoryPhotos, HistoryPhotoItem, getProjects, isProjectUnlocked } from "@/lib/cms";
import { CareerItem, INITIAL_HISTORY_PHOTOS } from "@/data/projects";
import ProjectUnlockModal from "@/components/ProjectUnlockModal";
import ScrollFadeIn from "@/components/ScrollFadeIn";

interface CarouselViewProps {
  projects: CMSProject[];
  career: CareerItem[];
  education: CareerItem[];
}

export default function CarouselView({ projects, career, education }: CarouselViewProps) {
  const sortProjs = (list: CMSProject[]) =>
    [...list].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  const router = useRouter();
  const [projectsList, setProjectsList] = useState<CMSProject[]>(() => sortProjs(projects));
  const [unlockModalProject, setUnlockModalProject] = useState<CMSProject | null>(null);
  const [photos, setPhotos] = useState<HistoryPhotoItem[]>(INITIAL_HISTORY_PHOTOS);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredTitle, setHoveredTitle] = useState<{ title: string; is_locked?: boolean } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const x = useMotionValue(0);
  const hasDragged = useRef(false);
  const pointerStartX = useRef(0);
  const pointerStartY = useRef(0);

  useEffect(() => {
    const fetchPhotos = async () => {
      const live = await getHistoryPhotos();
      if (live && live.length > 0) {
        setPhotos(live);
      }
    };
    fetchPhotos();
  }, []);

  // Fetch live Supabase projects and listen for realtime/admin updates
  useEffect(() => {
    const fetchLiveProjects = async () => {
      const live = await getProjects();
      if (live && live.length > 0) {
        setProjectsList(sortProjs(live));
      }
    };
    fetchLiveProjects();
    window.addEventListener("projects-updated", fetchLiveProjects);
    window.addEventListener("project-unlocked", fetchLiveProjects);
    window.addEventListener("storage-update", fetchLiveProjects);
    window.addEventListener("storage", fetchLiveProjects);
    let bc1: BroadcastChannel | null = null;
    let bc2: BroadcastChannel | null = null;
    try {
      bc1 = new BroadcastChannel("cms_channel");
      bc1.onmessage = () => fetchLiveProjects();
      bc2 = new BroadcastChannel("portfolio-sync");
      bc2.onmessage = () => fetchLiveProjects();
    } catch (e) {
      // BroadcastChannel not supported
    }
    return () => {
      window.removeEventListener("projects-updated", fetchLiveProjects);
      window.removeEventListener("project-unlocked", fetchLiveProjects);
      window.removeEventListener("storage-update", fetchLiveProjects);
      window.removeEventListener("storage", fetchLiveProjects);
      bc1?.close();
      bc2?.close();
    };
  }, []);

  // Sort projects and duplicate 8 times for seamless infinite scrolling and dragging in both directions
  const loopedProjects = React.useMemo(() => {
    const base = projectsList.length > 0 ? projectsList : sortProjs(projects);
    return [...base, ...base, ...base, ...base, ...base, ...base, ...base, ...base];
  }, [projectsList, projects]);

  const loopWidth = projectsList.length * 770;

  useEffect(() => {
    if (loopWidth > 0 && x.get() === 0) {
      x.set(-loopWidth * 3);
    }
  }, [loopWidth, x]);

  useAnimationFrame((_, delta) => {
    if (loopWidth > 0) {
      const currentX = x.get();
      if (currentX <= -loopWidth * 5) {
        x.set(currentX + loopWidth);
      } else if (currentX >= -loopWidth) {
        x.set(currentX - loopWidth);
      } else if (!isDragging) {
        x.set(currentX - 0.7 * (delta / 16));
      }
    }
  });

  const p0 = photos[0] || INITIAL_HISTORY_PHOTOS[0];
  const p1 = photos[1] || INITIAL_HISTORY_PHOTOS[1] || p0;
  const p2 = photos[2] || INITIAL_HISTORY_PHOTOS[2] || p0;
  const p3 = photos[3] || INITIAL_HISTORY_PHOTOS[3] || p1;

  return (
    <div
      onMouseMove={(e) => {
        setMousePos({ x: e.clientX, y: e.clientY });
      }}
      className="w-full relative overflow-x-hidden pt-24 sm:pt-32 md:pt-40 pb-24 font-sans select-none"
    >
      {/* Floating Hover Project Title Cursor Badge */}
      <AnimatePresence>
        {hoveredTitle && (
          <div
            style={{
              position: "fixed",
              left: mousePos.x + 14,
              top: mousePos.y + 14,
              pointerEvents: "none",
              zIndex: 9999,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="px-4 py-2 rounded-full bg-black/90 border border-white/20 text-white font-mono text-[12px] font-medium tracking-wide uppercase shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md whitespace-nowrap flex items-center gap-1.5"
            >
              {hoveredTitle.is_locked && (
                <Lock size={13} className="text-[#E5FE8D] shrink-0" />
              )}
              <span>{hoveredTitle.title}</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Header for Carousel View - Animates first */}
      <motion.div
        initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[1400px] mx-auto px-6 md:px-12 text-center mb-20 md:mb-32"
      >
        <h1 className="text-center flex flex-col items-center justify-center max-w-[1100px] mx-auto select-none font-sans">
          {/* First line: "Dan is a product designer" */}
          <div className="flex flex-wrap items-baseline justify-center gap-x-3 sm:gap-x-4 md:gap-x-5 leading-[0.95]">
            <span
              style={{ fontFamily: "var(--font-manrope), var(--font-sans)" }}
              className="font-[800] text-[44px] sm:text-[64px] md:text-[78px] lg:text-[88px] tracking-tight text-white"
            >
              Dan is a
            </span>
            <span
              style={{ fontFamily: "var(--font-unifraktur), serif" }}
              className="font-normal text-[50px] sm:text-[72px] md:text-[88px] lg:text-[98px] tracking-normal text-white"
            >
              product designer
            </span>
          </div>
          {/* Second line: "based in New York." */}
          <div className="flex flex-wrap items-baseline justify-center gap-x-3 sm:gap-x-4 md:gap-x-5 leading-[0.95] mt-2 sm:mt-3 md:mt-4">
            <span
              style={{ fontFamily: "var(--font-pinyon), cursive" }}
              className="font-normal text-[46px] sm:text-[68px] md:text-[84px] lg:text-[94px] text-white tracking-normal"
            >
              based in
            </span>
            <span
              style={{ fontFamily: "'Sfizia Bold', var(--font-manrope), sans-serif" }}
              className="font-bold text-[46px] sm:text-[66px] md:text-[80px] lg:text-[90px] text-white tracking-tight"
            >
              New York.
            </span>
          </div>
        </h1>
      </motion.div>

      {/* Tilted Infinite Projects Scroller - Animates one at a time sliding/fading from right after text */}
      <div className="w-full py-10 my-8 mb-16 md:mb-24 cursor-grab active:cursor-grabbing overflow-visible select-none">
        <motion.div
          style={{ x }}
          drag="x"
          onDragStart={() => {
            hasDragged.current = true;
            setIsDragging(true);
          }}
          onDragEnd={() => {
            setIsDragging(false);
            setTimeout(() => {
              hasDragged.current = false;
            }, 150);
          }}
          onPointerDown={(e) => {
            pointerStartX.current = e.clientX;
            pointerStartY.current = e.clientY;
            hasDragged.current = false;
            setIsDragging(true);
          }}
          onPointerUp={() => setIsDragging(false)}
          onPointerLeave={() => setIsDragging(false)}
          className="flex items-center pl-[80px]"
        >
          {loopedProjects.map((project, idx) => {
            const baseCount = projectsList.length || projects.length || 1;
            const posInLoop = idx % baseCount;
            return (
              <div
                key={`${project.slug}-${idx}`}
                onMouseEnter={() => {
                  setHoveredTitle({ title: project.title, is_locked: project.is_locked });
                }}
                onMouseLeave={() => {
                  setHoveredTitle(null);
                }}
                className="w-[750px] shrink-0 mr-[20px] py-6"
                style={{ transform: "rotate(-8deg)" }}
              >
                <motion.div
                  initial={{ opacity: 0, x: 120, filter: "blur(14px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  transition={{
                    duration: 0.9,
                    delay: 0.3 + posInLoop * 0.16,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="w-full"
                >
                <Link
                  href={`/projects/${project.slug}`}
                  draggable={false}
                  onClick={(e) => {
                    const dist = Math.hypot(
                      e.clientX - pointerStartX.current,
                      e.clientY - pointerStartY.current
                    );
                    if (hasDragged.current || dist > 6) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    if (project.is_locked && !isProjectUnlocked(project.slug)) {
                      e.preventDefault();
                      setUnlockModalProject(project);
                    }
                  }}
                  className="block w-full rounded-[20px] overflow-hidden bg-[#121212] border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-transform duration-300 hover:scale-[1.02] relative aspect-[4/3]"
                >
                  {isVideoUrl(project.thumbnail) ? (
                    <video
                      src={project.thumbnail}
                      autoPlay
                      loop
                      muted
                      playsInline
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      className="w-full h-full object-cover pointer-events-none block select-none"
                    />
                  ) : (
                    <img
                      src={project.thumbnail || "/assets/misc/placeholder.jpg"}
                      alt={project.title}
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      className="w-full h-full object-cover pointer-events-none block select-none"
                    />
                  )}
                </Link>
              </motion.div>
            </div>
          );
        })}
        </motion.div>
      </div>

      {/* Split Bio & History Section */}
      <div className="w-full px-[80px] max-w-[1400px] mx-auto mt-40 md:mt-48 mb-32 space-y-40">
        {/* Top Row: Work + Photos */}
        <ScrollFadeIn className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-[560px]">
            <span className="text-[#E5FE8D] font-mono text-[13px] uppercase tracking-widest block mb-4">
              WORK
            </span>
            <p className="text-[15px] md:text-[16px] leading-[24px] text-white font-sans mb-6">
              Today, I lead design on the growth team at{" "}
              <a
                href="https://current.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-white/30 underline-offset-4 hover:text-[#E5FE8D] transition-colors"
              >
                Current
              </a>
              , where I focus on making things like onboarding and direct deposits intuitive for millions of working americans.
            </p>
            <p className="text-[15px] md:text-[16px] leading-[24px] text-white font-sans">
              Lately, I&apos;ve also been busy with an internal rebrand, vibe coding internal apps, and sprucing up our design system to play nicely with AI tooling.
            </p>
          </div>

          <div className="relative flex items-center justify-center lg:justify-end min-h-[320px] sm:min-h-[380px] pt-4">
            <div className="w-[280px] sm:w-[340px] aspect-[4/3] rounded-[16px] overflow-hidden bg-black border-4 border-white shadow-2xl transform rotate-[-6deg] absolute left-4 sm:left-12 top-0 z-10">
              <img src={p0.src} alt={p0.alt} className="w-full h-full object-cover" />
            </div>
            <div className="w-[280px] sm:w-[340px] aspect-[4/3] rounded-[16px] overflow-hidden bg-black border-4 border-white shadow-2xl transform rotate-[5deg] relative z-20 mt-16 ml-24 sm:ml-36">
              <img src={p1.src} alt={p1.alt} className="w-full h-full object-cover" />
            </div>
          </div>
        </ScrollFadeIn>

        {/* Bottom Row: Photos + Life */}
        <ScrollFadeIn delay={0.15} className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative flex items-center justify-center lg:justify-start min-h-[320px] sm:min-h-[380px] order-2 lg:order-1 pt-4">
            <div className="w-[280px] sm:w-[340px] aspect-[4/3] rounded-[16px] overflow-hidden bg-black border-4 border-white shadow-2xl transform rotate-[6deg] absolute left-4 sm:left-8 top-0 z-10">
              <img src={p2.src} alt={p2.alt} className="w-full h-full object-cover" />
            </div>
            <div className="w-[280px] sm:w-[340px] aspect-[4/3] rounded-[16px] overflow-hidden bg-black border-4 border-white shadow-2xl transform rotate-[-5deg] relative z-20 mt-16 ml-24 sm:ml-36">
              <img src={p3.src} alt={p3.alt} className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="max-w-[560px] order-1 lg:order-2">
            <span className="text-[#E5FE8D] font-mono text-[13px] uppercase tracking-widest block mb-4">
              LIFE
            </span>
            <p className="text-[15px] md:text-[16px] leading-[24px] text-white font-sans mb-6">
              My path to design was a little unconventional. I have degrees in film and software engineering, and spent time making movies and running a creative agency before pivoting into product design.
            </p>
            <p className="text-[15px] md:text-[16px] leading-[24px] text-white font-sans">
              I&apos;m a dual citizen of New Zealand and the US and have spent most of my life between both. Today, I live in Hoboken with my wife Paige, our daughter Elva, and our dog Archie. Outside of work, i&apos;m into photography, film & enjoy the occasional round of tennis.
            </p>
          </div>
        </ScrollFadeIn>
      </div>

      {/* Split Career & Education Columns */}
      <div className="w-full px-[80px] max-w-[1400px] mx-auto mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Background Column */}
          <ScrollFadeIn>
            <span className="text-[#E5FE8D] font-mono text-[13px] uppercase tracking-widest block mb-4">
              BACKGROUND
            </span>
            <div className="bg-black border border-white/12 rounded-[16px] p-6 sm:p-8 space-y-5 shadow-xl">
              {career.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex items-center justify-between gap-4 font-mono text-[13px] sm:text-[14px] pb-4 border-b border-white/10 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <AtSign size={14} strokeWidth={2} className="text-[#E5FE8D] shrink-0" />
                    <span className="text-white font-medium truncate">{item.company}</span>
                  </div>
                  <div className="flex items-center justify-end gap-6 shrink-0 text-right">
                    <span className="text-white/60 text-[12px] sm:text-[13px]">{item.role}</span>
                    <span className="text-white font-medium min-w-[90px]">{item.year}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollFadeIn>

          {/* Education Column */}
          <ScrollFadeIn delay={0.15}>
            <span className="text-[#E5FE8D] font-mono text-[13px] uppercase tracking-widest block mb-4">
              EDUCATION
            </span>
            <div className="bg-black border border-white/12 rounded-[16px] p-6 sm:p-8 space-y-5 shadow-xl">
              {education.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex items-center justify-between gap-4 font-mono text-[13px] sm:text-[14px] pb-4 border-b border-white/10 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <GraduationCap size={14} strokeWidth={2} className="text-[#E5FE8D] shrink-0" />
                    <span className="text-white font-medium truncate">{item.company}</span>
                  </div>
                  <div className="flex items-center justify-end gap-6 shrink-0 text-right">
                    <span className="text-white/60 text-[12px] sm:text-[13px]">{item.role}</span>
                    <span className="text-white font-medium min-w-[50px]">{item.year}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollFadeIn>
        </div>
      </div>

      <ProjectUnlockModal
        project={unlockModalProject}
        isOpen={!!unlockModalProject}
        onClose={() => setUnlockModalProject(null)}
        onUnlockSuccess={(proj) => {
          setUnlockModalProject(null);
          router.push(`/projects/${proj.slug}`);
        }}
      />
    </div>
  );
}

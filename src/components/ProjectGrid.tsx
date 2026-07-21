"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowUpRight, Lock } from "lucide-react";
import { getProjects, CMSProject, isVideoUrl, isProjectUnlocked } from "@/lib/cms";
import ProjectUnlockModal from "@/components/ProjectUnlockModal";
import SafariVideo from "@/components/SafariVideo";

interface ProjectGridProps {
  initialProjects: CMSProject[];
}

export default function ProjectGrid({ initialProjects }: ProjectGridProps) {
  const router = useRouter();
  const sortProjs = (list: CMSProject[]) =>
    [...list].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  const [projects, setProjects] = useState<CMSProject[]>(() => sortProjs(initialProjects));
  const [unlockModalProject, setUnlockModalProject] = useState<CMSProject | null>(null);

  useEffect(() => {
    // Fetch live data on client mount to catch any updates made in /admin
    const fetchLive = async () => {
      const live = await getProjects();
      if (live && live.length > 0) {
        setProjects(sortProjs(live));
      }
    };
    fetchLive();
    window.addEventListener("projects-updated", fetchLive);
    window.addEventListener("project-unlocked", fetchLive);
    window.addEventListener("storage-update", fetchLive);
    window.addEventListener("storage", fetchLive);
    let bc1: BroadcastChannel | null = null;
    let bc2: BroadcastChannel | null = null;
    try {
      bc1 = new BroadcastChannel("cms_channel");
      bc1.onmessage = () => fetchLive();
      bc2 = new BroadcastChannel("portfolio-sync");
      bc2.onmessage = () => fetchLive();
    } catch (e) {}
    return () => {
      window.removeEventListener("projects-updated", fetchLive);
      window.removeEventListener("project-unlocked", fetchLive);
      window.removeEventListener("storage-update", fetchLive);
      window.removeEventListener("storage", fetchLive);
      bc1?.close();
      bc2?.close();
    };
  }, []);

  return (
    <>
      {sortProjs(projects).slice(0, 5).map((project, idx) => (
        <motion.div
          key={project.slug || project.id}
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.65, delay: (idx + 1) * 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="h-auto md:h-[340px] lg:h-[calc((100svh-88px)/2)] lg:min-h-[360px]"
        >
          <Link
            href={`/projects/${project.slug}`}
            onClick={(e) => {
              if (project.is_locked && !isProjectUnlocked(project.slug)) {
                e.preventDefault();
                setUnlockModalProject(project);
              }
            }}
            className="group rounded-[12px] bg-black overflow-hidden relative flex flex-col md:block h-full transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.05)] border border-white/10 md:border-0"
          >
            {/* Project Thumbnail Image or Video */}
            <div className="w-full aspect-[4/3] md:aspect-auto md:absolute md:inset-0 bg-[#121212] overflow-hidden relative shrink-0 rounded-b-[12px] md:rounded-b-none border-b border-white/10 md:border-b-0">
              {isVideoUrl(project.thumbnail) ? (
                <SafariVideo
                  src={project.thumbnail}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              ) : (
                <img
                  src={project.thumbnail || "/assets/misc/placeholder.jpg"}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              )}
            </div>

            {/* Info Block: Normal below thumbnail on mobile, sliding overlay with subtle bottom fade on desktop */}
            <div className="p-4 sm:p-5 md:p-6 flex flex-col justify-end bg-black md:bg-transparent md:bg-gradient-to-t md:from-black/85 md:via-black/40 md:to-transparent md:absolute md:inset-x-0 md:bottom-0 md:transform md:translate-y-full md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-200 ease-out md:pt-16 z-10">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col gap-1 min-w-0">
                  {project.is_locked && (
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Lock size={12} className="text-[#E5FE8D] shrink-0" />
                      <span className="text-[10px] sm:text-[11px] font-mono text-[#E5FE8D] uppercase tracking-wider font-semibold">
                        Locked
                      </span>
                    </div>
                  )}
                  <span className="font-medium text-white truncate text-[14px] sm:text-[15px]">{project.title}</span>
                </div>
                <div className="w-10 h-10 rounded-[8px] text-white flex items-center justify-center shrink-0 shadow-lg group-hover:bg-[#252525] group-hover:scale-105 transition-all duration-200">
                  <ArrowUpRight className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}

      <ProjectUnlockModal
        project={unlockModalProject}
        isOpen={!!unlockModalProject}
        onClose={() => setUnlockModalProject(null)}
        onUnlockSuccess={(proj) => {
          setUnlockModalProject(null);
          router.push(`/projects/${proj.slug}`);
        }}
      />
    </>
  );
}

"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ArrowUpRight, Lock } from "lucide-react";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import { getProjectBySlug, getProjects, CMSProject, isVideoUrl, isProjectUnlocked } from "@/lib/cms";
import ProjectUnlockModal from "@/components/ProjectUnlockModal";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [project, setProject] = useState<CMSProject | null>(null);
  const [nextProject, setNextProject] = useState<CMSProject | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [unlockModalProject, setUnlockModalProject] = useState<CMSProject | null>(null);

  useEffect(() => {
    if (project) {
      setIsUnlocked(!project.is_locked || isProjectUnlocked(project.slug));
    }
    const handleUnlockEvent = () => {
      if (project) {
        setIsUnlocked(!project.is_locked || isProjectUnlocked(project.slug));
      }
    };
    window.addEventListener("project-unlocked", handleUnlockEvent);
    return () => window.removeEventListener("project-unlocked", handleUnlockEvent);
  }, [project]);

  useEffect(() => {
    const fetchProj = async () => {
      setLoading(true);
      const [proj, allProjects] = await Promise.all([
        getProjectBySlug(resolvedParams.slug),
        getProjects(),
      ]);
      setProject(proj);
      if (allProjects && allProjects.length > 0 && proj) {
        const idx = allProjects.findIndex((p) => p.slug === resolvedParams.slug);
        if (idx !== -1) {
          const nextIdx = (idx + 1) % allProjects.length;
          setNextProject(allProjects[nextIdx]);
        } else {
          setNextProject(allProjects[0]);
        }
      }
      if (proj && proj.sections) {
        const imagePromises: Promise<void>[] = [];
        proj.sections.slice(0, 3).forEach((sec) => {
          if (sec.image1?.src && !isVideoUrl(sec.image1.src)) {
            imagePromises.push(
              new Promise((resolve) => {
                const img = new Image();
                img.src = sec.image1.src;
                img.onload = () => resolve();
                img.onerror = () => resolve();
              })
            );
          }
          if (sec.image2?.src && !isVideoUrl(sec.image2.src)) {
            imagePromises.push(
              new Promise((resolve) => {
                const img = new Image();
                img.src = sec.image2.src;
                img.onload = () => resolve();
                img.onerror = () => resolve();
              })
            );
          }
        });
        await Promise.race([
          Promise.all(imagePromises),
          new Promise((resolve) => setTimeout(resolve, 1500)),
        ]);
      }
      setLoading(false);
    };
    fetchProj();
    window.addEventListener("projects-updated", fetchProj);
    window.addEventListener("storage-update", fetchProj);
    window.addEventListener("storage", fetchProj);
    let bc1: BroadcastChannel | null = null;
    let bc2: BroadcastChannel | null = null;
    try {
      bc1 = new BroadcastChannel("cms_channel");
      bc1.onmessage = () => fetchProj();
      bc2 = new BroadcastChannel("portfolio-sync");
      bc2.onmessage = () => fetchProj();
    } catch (e) {}
    return () => {
      window.removeEventListener("projects-updated", fetchProj);
      window.removeEventListener("storage-update", fetchProj);
      window.removeEventListener("storage", fetchProj);
      bc1?.close();
      bc2?.close();
    };
  }, [resolvedParams.slug]);

  if (loading) {
    return <div className="min-h-[calc(100vh-80px)] w-full bg-black" />;
  }

  if (!project) {
    return (
      <div className="flex-1 flex flex-col bg-black text-white">
        <main className="flex-1 w-full max-w-[940px] mx-auto px-2 sm:px-4 md:px-6 flex flex-col items-center justify-center text-center py-24">
          <h1 className="text-h1 font-medium mb-4">Project Not Found</h1>
          <p className="text-body text-white/60 mb-8">This project could not be found in the database.</p>
          <Link href="/" className="px-6 py-3 rounded-[10px] bg-[#E5FE8D] text-black font-mono text-mono-small font-medium">RETURN HOME</Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (project.is_locked && !isUnlocked) {
    return (
      <div className="flex-1 flex flex-col bg-black text-white min-h-screen">
        <div className="p-4 sm:p-6 max-w-[1400px] mx-auto w-full">
          <Link href="/" className="inline-flex items-center gap-2 text-[13px] text-white/60 hover:text-white transition-colors font-mono">
            <ArrowLeft size={16} /> RETURN TO PORTFOLIO
          </Link>
        </div>
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <ProjectUnlockModal
            project={project}
            isOpen={true}
            onClose={() => router.push("/")}
            onUnlockSuccess={() => setIsUnlocked(true)}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-black text-white">
      <main className="flex-1 w-full max-w-[1000px] mx-auto px-2 sm:px-4 md:px-6 pt-10 md:pt-14">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[12px] font-mono font-medium text-white hover:opacity-80 transition-opacity uppercase tracking-widest"
          >
            <ArrowLeft size={14} strokeWidth={2} className="text-white shrink-0" />
            <span>BACK</span>
          </Link>
        </motion.div>

        {/* Hero Section */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="max-w-[720px]"
          >
            {project.role && (
              <span className="text-mono-small font-mono text-[#E5FE8D] uppercase tracking-wider mb-2.5 block font-semibold">
                {project.role}
              </span>
            )}
            <h1 className="text-[32px] md:text-[38px] font-medium text-white mb-3 tracking-tight font-sans">
              {project.title}
            </h1>
            <p className="text-[15px] md:text-[16px] text-white/60 leading-[24px] font-sans">
              {project.description}
            </p>
          </motion.div>
        </div>

        {/* Highlights Row (0 to 3 checkmark boxes) */}
        {project.highlights && project.highlights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16"
          >
            {project.highlights.map((h, idx) => (
              <div
                key={h.id || idx}
                className="bg-[#0a0a0a] border border-[#222222] rounded-[12px] p-4 flex items-start gap-3 text-[13px] text-white/80 font-sans shadow-md"
              >
                <Check
                  size={14}
                  strokeWidth={2.5}
                  className="text-[#E5FE8D] shrink-0 mt-0.5"
                />
                <span className="leading-snug">{h.text}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Full-Width Project Thumbnail Banner (Below Hero & Highlights, Above Template Sections) */}
        {project.thumbnail && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
            className="w-full mb-16 md:mb-24"
          >
            <div className="w-full rounded-[12px] overflow-hidden bg-[#121212] border border-white/12 shadow-2xl relative">
              {isVideoUrl(project.thumbnail) ? (
                <video
                  src={project.thumbnail}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto block"
                />
              ) : (
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="w-full h-auto block"
                />
              )}
            </div>
          </motion.div>
        )}

        {/* Rest of sections and content below project thumbnail */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease: "easeOut" }}
          className="space-y-16 md:space-y-24"
        >
            {project.sections?.map((sec) => {
              if (sec.hidden) return null;

              if (sec.type === "full-width-image" && sec.image1) {
                return (
                  <div key={sec.id} className="w-full">
                    {sec.image1.src ? (
                      <div className="w-full rounded-[12px] overflow-hidden group relative">
                        {isVideoUrl(sec.image1.src) ? (
                          <video
                            src={sec.image1.src}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-auto block"
                          />
                        ) : (
                          <img
                            src={sec.image1.src}
                            alt={sec.image1.caption || "Full width image"}
                            className="w-full h-auto block"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="w-full aspect-[16/9] rounded-[12px] border border-dashed border-white/15 bg-white/[0.02] relative overflow-hidden group flex items-center justify-center">
                        <span className="text-mono-small text-white/30 uppercase">
                          {sec.image1.caption} [FULL WIDTH PLACEHOLDER]
                        </span>
                      </div>
                    )}
                    {!sec.image1.hideCaption && sec.image1.caption && (
                      <span className="text-mono-small text-white/40 mt-3 block uppercase tracking-wider">
                        {sec.image1.caption}
                      </span>
                    )}
                  </div>
                );
              }

              if (sec.type === "description") {
                return (
                  <div key={sec.id} className="w-full py-8 md:py-12">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 items-start">
                      <div className="md:col-span-4">
                        {sec.title && (
                          <h3 className="text-[20px] md:text-[24px] font-medium text-white tracking-tight leading-snug">
                            {sec.title}
                          </h3>
                        )}
                      </div>
                      <div className="md:col-span-8">
                        <p className="text-[15px] md:text-[16px] text-white/70 leading-[24px] whitespace-pre-wrap font-sans">
                          {sec.content || "No description text provided..."}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }

              if (sec.type === "two-column-image" && sec.image1 && sec.image2) {
                return (
                  <div key={sec.id} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
                    {/* Column 1 */}
                    <div className="space-y-4">
                      {sec.image1?.src ? (
                        <div className="w-full rounded-[12px] overflow-hidden bg-[#121212] relative group">
                          {isVideoUrl(sec.image1.src) ? (
                            <video
                              src={sec.image1.src}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full h-auto block"
                            />
                          ) : (
                            <img
                              src={sec.image1.src}
                              alt={sec.image1.caption || "Column 1 image"}
                              className="w-full h-auto block"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="w-full aspect-[4/3] rounded-[12px] border border-dashed border-white/15 bg-white/[0.02] flex items-center justify-center">
                          <span className="text-mono-small text-white/30 uppercase">COLUMN 1 IMAGE</span>
                        </div>
                      )}
                      {!sec.image1?.hideCaption && sec.image1?.caption && (
                        <span className="text-mono-small text-white/40 block uppercase tracking-wider">
                          {sec.image1.caption}
                        </span>
                      )}
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-4">
                      {sec.image2?.src ? (
                        <div className="w-full rounded-[12px] overflow-hidden bg-[#121212] relative group">
                          {isVideoUrl(sec.image2.src) ? (
                            <video
                              src={sec.image2.src}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full h-auto block"
                            />
                          ) : (
                            <img
                              src={sec.image2.src}
                              alt={sec.image2.caption || "Column 2 image"}
                              className="w-full h-auto block"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="w-full aspect-[4/3] rounded-[12px] border border-dashed border-white/15 bg-white/[0.02] flex items-center justify-center">
                          <span className="text-mono-small text-white/30 uppercase">COLUMN 2 IMAGE</span>
                        </div>
                      )}
                      {!sec.image2?.hideCaption && sec.image2?.caption && (
                        <span className="text-mono-small text-white/40 block uppercase tracking-wider">
                          {sec.image2.caption}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })}

          {/* Next Up Section */}
          {nextProject && (
            <div className="mt-24 md:mt-32 pt-12 mb-16">
              <span className="text-mono-small font-mono text-white/40 uppercase tracking-widest block mb-6">
                NEXT UP
              </span>
              <Link
                href={`/projects/${nextProject.slug}`}
                onClick={(e) => {
                  if (nextProject.is_locked && !isProjectUnlocked(nextProject.slug)) {
                    e.preventDefault();
                    setUnlockModalProject(nextProject);
                  }
                }}
                className="group block bg-transparent border border-white/12 rounded-[16px] p-5 sm:p-8 hover:bg-[#1D1D1D] hover:border-transparent transition-all duration-300 relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
                    {/* Thumbnail: Full width on mobile, 160px width on tablet/desktop */}
                    <div className="w-full sm:w-[160px] aspect-[16/9] rounded-[8px] overflow-hidden bg-black shrink-0 border border-white/10">
                      {isVideoUrl(nextProject.thumbnail) ? (
                        <video
                          src={nextProject.thumbnail}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <img
                          src={nextProject.thumbnail || "/assets/misc/placeholder.jpg"}
                          alt={nextProject.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                    {/* Info: left aligned below thumbnail on mobile, side-by-side on tablet/desktop */}
                    <div className="text-left">
                      <span className="text-mono-small font-mono text-[#E5FE8D] uppercase tracking-wider block mb-1">
                        {nextProject.role || "PROJECT"}
                      </span>
                      <h3 className="text-[20px] sm:text-[28px] font-medium text-white tracking-tight group-hover:text-[#E5FE8D] transition-colors">
                        {nextProject.title}
                      </h3>
                    </div>
                  </div>
                  {/* Arrow icon: no outline or background, subtle scale and shift on card hover */}
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[8px] flex items-center justify-center group-hover:scale-110 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-white shrink-0 self-end sm:self-center absolute top-5 right-5 sm:relative sm:top-auto sm:right-auto">
                    <ArrowUpRight size={22} strokeWidth={2} />
                  </div>
                </div>
              </Link>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />

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

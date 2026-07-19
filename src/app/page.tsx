import React from "react";
import HomeContent from "@/components/HomeContent";
import { CAREER_HISTORY, EDUCATION_HISTORY } from "@/data/projects";
import { getProjects } from "@/lib/cms";

export default async function HomePage() {
  const projects = await getProjects();

  return (
    <div className="flex-1 flex flex-col bg-black text-white">
      <HomeContent projects={projects} career={CAREER_HISTORY} education={EDUCATION_HISTORY} />
    </div>
  );
}

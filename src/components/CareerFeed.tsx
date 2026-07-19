"use client";

import React, { useState, useEffect } from "react";
import { AtSign, GraduationCap } from "lucide-react";
import { getCareerItems, getEducationItems } from "@/lib/cms";
import { CareerItem } from "@/data/projects";

interface CareerFeedProps {
  initialCareer: CareerItem[];
  initialEducation: CareerItem[];
}

export default function CareerFeed({ initialCareer, initialEducation }: CareerFeedProps) {
  const [career, setCareer] = useState<CareerItem[]>(initialCareer);
  const [education, setEducation] = useState<CareerItem[]>(initialEducation);

  useEffect(() => {
    const fetchLive = async () => {
      const liveCareer = await getCareerItems();
      const liveEdu = await getEducationItems();
      if (liveCareer && liveCareer.length > 0) setCareer(liveCareer);
      if (liveEdu && liveEdu.length > 0) setEducation(liveEdu);
    };
    fetchLive();
    window.addEventListener("career-updated", fetchLive);
    window.addEventListener("storage-update", fetchLive);
    window.addEventListener("storage", fetchLive);
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("cms_channel");
      bc.onmessage = () => fetchLive();
    } catch (e) {}
    return () => {
      window.removeEventListener("career-updated", fetchLive);
      window.removeEventListener("storage-update", fetchLive);
      window.removeEventListener("storage", fetchLive);
      if (bc) bc.close();
    };
  }, []);

  return (
    <div className="col-span-full lg:col-span-2 bg-black border border-white/12 rounded-[12px] p-6 flex flex-col justify-between h-auto lg:h-[calc((100svh-88px)/2)] lg:min-h-[360px] overflow-y-auto">
      <div className="my-4 pt-2">
        {career.map((item, idx) => (
          <div
            key={item.id || idx}
            className="flex items-start sm:items-center justify-between text-mono-small py-3 border-b border-white/12 last:border-0 gap-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 text-left flex-1 min-w-0">
              <div className="flex items-center gap-2 shrink-0">
                <AtSign
                  size={14}
                  strokeWidth={2}
                  className="text-[#E5FE8D] shrink-0"
                />
                <span className="text-white font-medium">
                  {item.company}
                </span>
              </div>
              <div className="text-white/60 pl-[22px] sm:pl-0 sm:truncate">
                {item.role}
              </div>
            </div>
            <div className="text-right text-white/40 shrink-0 font-mono pt-0.5 sm:pt-0">
              {item.year}
            </div>
          </div>
        ))}
      </div>

      <div className="my-4 pt-2">
        {education.map((item, idx) => (
          <div
            key={item.id || idx}
            className="flex items-start sm:items-center justify-between text-mono-small py-3 border-b border-white/12 last:border-0 gap-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 text-left flex-1 min-w-0">
              <div className="flex items-center gap-2 shrink-0">
                <GraduationCap
                  size={14}
                  strokeWidth={2}
                  className="text-[#E5FE8D] shrink-0"
                />
                <span className="text-white font-medium">{item.company}</span>
              </div>
              <div className="text-white/60 pl-[22px] sm:pl-0 sm:truncate">
                {item.role}
              </div>
            </div>
            <div className="text-right text-white/40 shrink-0 font-mono pt-0.5 sm:pt-0">
              {item.year}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

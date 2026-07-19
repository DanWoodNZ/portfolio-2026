"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type ViewMode = "grid" | "carousel";

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const ViewModeContext = createContext<ViewModeContextType>({
  viewMode: "carousel",
  setViewMode: () => {},
});

export const ViewModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [viewMode, setViewModeState] = useState<ViewMode>("carousel");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1200 && viewMode === "carousel") {
        setViewModeState("grid");
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [viewMode]);

  const setViewMode = (mode: ViewMode) => {
    if (mode === "carousel" && typeof window !== "undefined" && window.innerWidth < 1200) {
      return; // Prevent enabling carousel on screens smaller than 1200px
    }
    setViewModeState(mode);
  };

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode }}>
      {children}
    </ViewModeContext.Provider>
  );
};

export const useViewMode = () => useContext(ViewModeContext);

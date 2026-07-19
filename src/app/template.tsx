import React from "react";
import PageTransition from "@/components/PageTransition";
import ScrollToTop from "@/components/ScrollToTop";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <PageTransition>
      {children}
      <ScrollToTop />
    </PageTransition>
  );
}

import React from "react";
import { Copyright } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full px-2 sm:px-4 md:px-6 py-6 mt-12 mb-4 flex items-center justify-center gap-2 text-mono-small uppercase text-white/60">
      <span className="text-white font-medium">DAN WOOD</span>
      <Copyright size={12} strokeWidth={2} className="text-[#E5FE8D] shrink-0" />
      <span className="text-white font-medium">2026</span>
    </footer>
  );
}

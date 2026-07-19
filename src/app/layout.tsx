import type { Metadata } from "next";
import { Inter, Manrope, UnifrakturMaguntia, Pinyon_Script } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const unifraktur = UnifrakturMaguntia({
  variable: "--font-unifraktur",
  subsets: ["latin"],
  weight: ["400"],
});

const pinyonScript = Pinyon_Script({
  variable: "--font-pinyon",
  subsets: ["latin"],
  weight: ["400"],
});

const nudicaMono = localFont({
  src: [
    {
      path: "../../public/assets/fonts/nudicamono-medium-webfont.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/nudicamono-medium-webfont.woff",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-nudica-mono",
});

import Header from "@/components/Header";
import { ViewModeProvider } from "@/context/ViewModeContext";

export const metadata: Metadata = {
  title: "DAN WOOD • LEAD PRODUCT DESIGNER",
  description: "Lead Product Designer based in NYC. Portfolio & case studies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} ${unifraktur.variable} ${pinyonScript.variable} ${nudicaMono.variable} h-full antialiased bg-black text-white`}
    >
      <body className="min-h-full flex flex-col bg-black text-white selection:bg-[#E5FE8D] selection:text-black">
        <ViewModeProvider>
          <Header />
          <div className="flex-1 flex flex-col">{children}</div>
        </ViewModeProvider>
      </body>
    </html>
  );
}


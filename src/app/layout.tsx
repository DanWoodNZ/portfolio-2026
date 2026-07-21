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

const getBaseUrl = (): URL => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL);
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return new URL(`https://${process.env.NEXT_PUBLIC_VERCEL_URL}`);
  }
  if (process.env.CF_PAGES_URL) {
    return new URL(process.env.CF_PAGES_URL);
  }
  return new URL(
    process.env.NODE_ENV === "production"
      ? "https://www.danrwood.com"
      : "http://localhost:3000"
  );
};

export function generateMetadata(): Metadata {
  const baseUrl = getBaseUrl();
  const title = "Dan Wood: Lead Product Designer";
  const description = "Lead Product Designer based in NYC. Portfolio & case studies.";
  const previewImageUrl = new URL("/preview-image.png", baseUrl).toString();

  return {
    metadataBase: baseUrl,
    title,
    description,
    openGraph: {
      title,
      description,
      url: baseUrl.toString(),
      siteName: "Dan Wood Portfolio",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: previewImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [previewImageUrl],
    },
    icons: {
      icon: "/favicon.ico",
    },
  };
}

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


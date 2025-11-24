import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Sidebar from "@/components/Sidebar";
import Breadcrumbs from "@/components/Breadcrumbs";
import ShortcutsGuide from "@/components/ui/ShortcutsGuide";
import RecentTracker from "@/components/ui/RecentTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#667eea",
};

export const metadata: Metadata = {
  title: "MBA Tools - Modern Marketing Analytics Platform",
  description: "A modern, intuitive set of calculators and helpers for everyday media buying with AI-powered insights",
  keywords: "marketing analytics, media buying, marketing tools, ROI calculator, budget planning, SEO tools",
  authors: [{ name: "MBA Tools Team" }],
  other: {
    "format-detection": "telephone=no, email=no, address=no",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white dark:bg-zinc-950`}
      >
        <Providers>
          <div className="flex min-h-screen" suppressHydrationWarning>
            <Sidebar />
            <main className="flex-1 p-8 max-w-6xl mx-auto" suppressHydrationWarning>
              <div className="mb-12" suppressHydrationWarning>
                <Breadcrumbs />
              </div>
              {children}
            </main>
          </div>
        </Providers>
        <ShortcutsGuide />
        <RecentTracker />
      </body>
    </html>
  );
}

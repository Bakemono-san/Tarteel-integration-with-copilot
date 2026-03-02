import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quran Recitation — Tarteel AI",
  description:
    "Practice Quran recitation with real-time Tajweed correction using Tarteel AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.className} antialiased text-gray-900 bg-gradient-to-br from-emerald-50/60 via-white to-sky-50/40 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}

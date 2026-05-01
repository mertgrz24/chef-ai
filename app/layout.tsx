import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Chef-AI — Kişisel AI Şefin",
  description: "Buzdolabını fotoğrafla, tarif gelsin.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ChefAI",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffa51f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.variable}`}>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}

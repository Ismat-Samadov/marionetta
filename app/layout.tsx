import type { Metadata, Viewport } from "next";
import "./globals.css";
import PWAInstall from "@/components/PWAInstall";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0e27",
};

export const metadata: Metadata = {
  title: "Marionetta - Super Mario Game",
  description: "An engaging Super Mario-style platformer game built with Next.js. Play now!",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Marionetta",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PWAInstall />
        {children}
      </body>
    </html>
  );
}

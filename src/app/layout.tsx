import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import FirestoreProvider from "@/components/FirestoreProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smesh Everybody",
  description: "Deine Padel Spiele, Turniere und Americano Runden",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Smesh Everybody",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#050505] text-[#f5f5f7] min-h-screen noise-overlay`}
      >
        {/* Ambient gradient background */}
        <div className="ambient-bg">
          <div className="ambient-orb w-[600px] h-[600px] bg-indigo-500 -top-[200px] -left-[200px] animate-float" />
          <div className="ambient-orb w-[500px] h-[500px] bg-violet-500 top-[40%] -right-[250px] animate-float" style={{ animationDelay: '-3s' }} />
          <div className="ambient-orb w-[400px] h-[400px] bg-blue-500 -bottom-[100px] left-[20%] animate-float" style={{ animationDelay: '-5s' }} />
        </div>

        <main className="relative z-10 max-w-lg mx-auto pb-24 min-h-screen">
          <FirestoreProvider>
            {children}
          </FirestoreProvider>
        </main>
        <BottomNav />
      </body>
    </html>
  );
}

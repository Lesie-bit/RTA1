import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

export const metadata: Metadata = {
  title: "ทะเบียนกฎหมายเมือง | RMS",
  description: "กฎของแมพ วิธีการเล่น และผู้ช่วย AI ตอบคำถามกฎ",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Noto+Sans+Thai:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased"
        style={{ fontFamily: "'Noto Sans Thai', var(--font-body)" }}
      >
        <Nav />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}

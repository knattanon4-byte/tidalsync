import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";

// โหลดฟอนต์ Prompt แบบไม่มีหัว (รองรับไทยและอังกฤษ)
const prompt = Prompt({
  weight: ['300', '400', '500', '600', '700'], 
  subsets: ['latin', 'thai'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "TidalSync",
  description: "Crafting Digital Experiences",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="scroll-smooth">
      <body className={`${prompt.className} antialiased bg-white text-zinc-900`}>
        {children}
      </body>
    </html>
  );
}
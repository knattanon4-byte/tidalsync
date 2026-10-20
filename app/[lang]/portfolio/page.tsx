// ไฟล์: app/[lang]/portfolio/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Globe, ArrowRight, Loader2, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase"; // 🌟 Import Supabase

// 🌟 Dictionary 
const dictionaries = {
  th: {
    nav: { home: "หน้าหลัก", login: "เข้าสู่ระบบ", consult: "จองคิวปรึกษาฟรี" },
    title: "Selected Works",
    subtitle: "A collection of projects we have crafted, developed, and delivered.",
    categoryAll: "ทั้งหมด",
    switchLang: "EN",
    switchLink: "en"
  },
  en: {
    nav: { home: "Home", login: "Login", consult: "Free Consultation" },
    title: "Selected Works",
    subtitle: "A collection of projects we have crafted, developed, and delivered.",
    categoryAll: "All",
    switchLang: "TH",
    switchLink: "th"
  }
};

export default function PortfolioPage() {
  const params = useParams();
  const lang = params.lang === "en" ? "en" : "th";
  const t = dictionaries[lang];

  const [works, setWorks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🌟 ฟังก์ชันดึงผลงานทั้งหมดที่ตั้งสถานะเป็น published
  useEffect(() => {
    const fetchAllWorks = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('status', 'published') 
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setWorks(data);
      }
      setIsLoading(false);
    };

    fetchAllWorks();
  }, []);

  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans pb-24">
      
      {/* ================= Navbar ================= */}
      <nav className="w-full px-6 py-6 flex justify-between items-center z-50">
        <Link href={`/${lang}`} className="flex flex-col items-center hover:opacity-80 transition mt-1">
          <Image src="/tidalsynclogo.png" alt="TidalSync Logo" width={400} height={400} className="object-contain w-14 md:w-16 h-auto" />
        </Link>

        <div className="flex items-center gap-4 md:gap-6 text-sm font-medium text-zinc-900 mt-2">
          <Link href={`/${lang}`} className="hidden md:block hover:text-zinc-500 transition">{t.nav.home}</Link>
          <Link href={`/${lang}/login`} className="hidden md:block hover:text-zinc-500 transition">{t.nav.login}</Link>
          <Link href={`/${lang}/login`} className="px-5 py-2.5 bg-black text-white rounded-full hover:bg-zinc-800 transition text-xs font-bold tracking-wide shadow-md">
            {t.nav.consult}
          </Link>
          <div className="w-px h-4 bg-zinc-200 hidden md:block"></div>
          <Link href={`/${t.switchLink}/portfolio`} className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-black transition bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-200">
            <Globe size={14} /> {t.switchLang}
          </Link>
        </div>
      </nav>

      {/* ================= Header ================= */}
      <section className="max-w-6xl mx-auto px-6 pt-12 md:pt-20 pb-12">
        <div className="mb-16">
          <Link href={`/${lang}`} className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-black transition mb-8">
            ← Back to Home
          </Link>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-4">
            {t.title}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-zinc-500 text-lg">
            {t.subtitle}
          </motion.p>
        </div>

        {/* ================= Portfolio Grid ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          
          {isLoading ? (
             <div className="col-span-1 md:col-span-2 flex justify-center py-20">
                <Loader2 className="animate-spin text-zinc-300" size={32} />
             </div>
          ) : works.length > 0 ? (
             works.map((work) => {
               const coverImg = work.image_urls?.[0] || work.image_url;
               const displayTitle = lang === 'en' && work.title_en ? work.title_en : work.title;

               return (
                  <Link key={work.id} href={`/${lang}/portfolio/${work.id}`} className="group cursor-pointer block">
                    <div className="w-full h-64 md:h-[350px] bg-zinc-50 rounded-3xl flex items-center justify-center border border-zinc-100 group-hover:border-zinc-300 transition duration-300 overflow-hidden relative">
                      {coverImg ? (
                        <img src={coverImg} alt={displayTitle} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      ) : (
                        <ImageIcon className="text-zinc-300" size={48} />
                      )}
                    </div>
                    <div className="flex justify-between items-start mt-6 px-2">
                      <div>
                        <h3 className="font-bold text-xl text-zinc-900 group-hover:text-zinc-600 transition line-clamp-1">{displayTitle || "ไม่มีชื่อ"}</h3>
                        <p className="text-sm text-zinc-400 mt-1.5 uppercase tracking-wider text-[11px] font-bold">{work.category}</p>
                      </div>
                      <div className="w-10 h-10 shrink-0 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-black group-hover:text-white transition duration-300 ml-4">
                         <ArrowRight size={18} className="-rotate-45" />
                      </div>
                    </div>
                  </Link>
               );
             })
          ) : (
             <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center py-20 bg-zinc-50 rounded-3xl border border-zinc-200 border-dashed">
                <ImageIcon size={48} className="text-zinc-300 mb-4" />
                <p className="text-zinc-500 font-bold">ยังไม่มีผลงานที่เผยแพร่</p>
             </div>
          )}

        </div>
      </section>

    </main>
  );
}
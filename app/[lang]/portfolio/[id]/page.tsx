// ไฟล์: app/[lang]/portfolio/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Target, TrendingUp, CheckCircle2, LayoutDashboard, Globe, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase"; // 🌟 Import Supabase

// 🌟 Dictionary แปลคำศัพท์ในหน้าเว็บ
const dict = {
  th: {
    backHome: "ย้อนกลับไปหน้าผลงานรวม",
    labels: { client: "Client", date: "Date", role: "Role" },
    sections: {
      challenge: "โจทย์ของลูกค้า (The Challenge)",
      solution: "สิ่งที่เราส่งมอบ (The Solution)",
      features: "ฟีเจอร์หลัก (Key Features):",
      impact: "ผลลัพธ์ (The Impact)",
      gallery: "ภาพรวมโปรเจค (Gallery)"
    },
    cta: {
      title: "สนใจสร้างผลลัพธ์แบบนี้ให้ธุรกิจคุณ?",
      button: "ปรึกษาเราฟรี (Free Audit)"
    },
    switchLang: "EN",
    switchLink: "en"
  },
  en: {
    backHome: "Back to Portfolio",
    labels: { client: "Client", date: "Date", role: "Role" },
    sections: {
      challenge: "The Challenge",
      solution: "The Solution",
      features: "Key Features:",
      impact: "The Impact",
      gallery: "Project Gallery"
    },
    cta: {
      title: "Want results like this for your business?",
      button: "Get a Free Audit"
    },
    switchLang: "TH",
    switchLink: "th"
  }
};

export default function PortfolioDetail() {
  const params = useParams();
  const lang = params.lang === "en" ? "en" : "th";
  const t = dict[lang];

  const projectId = params.id as string;
  
  // 🌟 State สำหรับเก็บข้อมูลจาก Supabase
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🌟 ดึงข้อมูลโปรเจกต์จาก Supabase
  useEffect(() => {
    const fetchProject = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('id', projectId)
        .single();
        
      if (!error && data) {
        setProject(data);
      }
      setIsLoading(false);
    };

    if (projectId) fetchProject();
  }, [projectId]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" size={32} /></div>;
  }

  // ถ้าเข้าผิด URL หรือไม่มีข้อมูลให้เด้งกลับหน้าแรก
  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 text-zinc-500">
        <h1 className="text-2xl font-bold text-black mb-4">404 - Project Not Found</h1>
        <Link href={`/${lang}/portfolio`} className="underline hover:text-black">Return Home</Link>
      </div>
    );
  }

  // เตรียมรูปภาพ (รูปแรกเป็นหน้าปก รูปที่เหลือเป็นแกลเลอรี่)
  const coverImage = project.image_urls?.[0] || project.image_url;
  const galleryImages = project.image_urls?.slice(1) || [];

  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans pb-24">
      
      {/* ================= Navbar ================= */}
      <nav className="border-b border-zinc-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href={`/${lang}`} className="text-xl font-black tracking-tighter hover:opacity-70 transition">
            TidalSync.
          </Link>
          
          <div className="flex items-center gap-6">
            <Link 
              href={`/${t.switchLink}/portfolio/${projectId}`} 
              className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-black transition bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-200"
            >
              <Globe size={14} /> {t.switchLang}
            </Link>
          </div>
        </div>
      </nav>

      {/* ================= Hero Section ================= */}
      <section className="max-w-6xl mx-auto px-6 pt-12 md:pt-20 pb-12">
        <Link href={`/${lang}/portfolio`} className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-black transition mb-8">
          <ArrowLeft size={16} /> {t.backHome}
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-bold uppercase tracking-widest rounded-full mb-4">
              {project.category}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-4">
              {project.title}
            </h1>
          </div>
          
          <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm shrink-0">
            <div>
              <p className="text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[10px]">{t.labels.client}</p>
              <p className="font-semibold text-zinc-900">{project.client}</p>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {coverImage && (
            <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="w-full h-[40vh] md:h-[70vh] bg-zinc-100 rounded-3xl overflow-hidden relative"
            >
            <img src={coverImage} alt={project.title} className="w-full h-full object-cover" />
            </motion.div>
        )}
      </section>

      {/* ================= Content: Problem, Solution, Impact ================= */}
      <section className="max-w-6xl mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        
        <div className="lg:col-span-7 space-y-12">
          {/* The Challenge */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-500">
                <Target size={20} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">{t.sections.challenge}</h2>
            </div>
            <p className="text-zinc-600 leading-relaxed text-lg whitespace-pre-line">
              {project.challenge || "-"}
            </p>
          </div>
        </div>

        {/* The Impact */}
        <div className="lg:col-span-5">
          <div className="bg-black text-white p-8 md:p-10 rounded-3xl sticky top-28 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-green-400">
                <TrendingUp size={24} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">{t.sections.impact}</h2>
            </div>
            <p className="text-zinc-300 leading-relaxed text-lg mb-8 whitespace-pre-line">
              "{project.result || "-"}"
            </p>
            
            <div className="border-t border-white/10 pt-8 mt-4">
              <p className="text-sm font-bold text-white mb-4">{t.cta.title}</p>
              <Link href={`/${lang}/login`} className="w-full flex items-center justify-center py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition">
                {t.cta.button}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Image Gallery ================= */}
      {galleryImages.length > 0 && (
          <section className="max-w-6xl mx-auto px-6 py-12">
            <h2 className="text-2xl font-bold tracking-tight mb-8">{t.sections.gallery}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {galleryImages.map((img: string, idx: number) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                  className={`w-full bg-zinc-100 rounded-2xl overflow-hidden relative ${idx === 2 ? 'md:col-span-2 h-[40vh] md:h-[60vh]' : 'h-[30vh] md:h-[40vh]'}`}
                >
                  <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition duration-700" />
                </motion.div>
              ))}
            </div>
          </section>
      )}
    </main>
  );
}
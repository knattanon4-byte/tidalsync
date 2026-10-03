"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Globe, Calendar, ExternalLink } from "lucide-react";

// 🌟 Dictionary 
const dictionaries = {
  th: {
    nav: { portfolio: "ผลงาน", login: "เข้าสู่ระบบ", consult: "จองคิวปรึกษาฟรี" },
    heroTitle: "Crafting Digital\nExperiences",
    heroSubtitle: "รับพัฒนาเว็บไซต์และออกแบบระบบด้วย Next.js และ Supabase\nยกระดับความมั่นใจด้วย Automated Testing (Playwright) เพื่อระบบที่เสถียรและปลอดภัยสูงสุด",
    ctaBooking: "จองคิวปรึกษา",
    ctaViewAll: "ดูผลงานทั้งหมด",
    featuresTitle: "The TidalSync Standard",
    features: [
      {
        title: "High Performance",
        desc: "พัฒนาด้วย Next.js และโครงสร้างระดับ Enterprise โหลดไว รองรับ SEO เต็มรูปแบบ และพร้อมรองรับการเติบโตของธุรกิจ"
      },
      {
        title: "Automated Testing",
        desc: "ยกระดับความมั่นใจด้วย Playwright ตรวจสอบระบบอัตโนมัติก่อนส่งมอบ ป้องกันบั๊กกวนใจ เพื่อความเสถียรสูงสุด"
      },
      {
        title: "100% Full Ownership",
        desc: "สร้างบัญชีอีเมลแยกเฉพาะสำหรับโปรเจกต์ของคุณ พร้อมส่งมอบ Source Code, Database และ Server ให้คุณครอบครองสิทธิ์ 100% (No Vendor Lock-in)"
      }
    ],
    worksTitle: "Selected Works",
    worksSeeAll: "ดูทั้งหมด →",
    mockupCategory1: "Web Development",
    mockupCategory2: "UI/UX Design",
    switchLang: "EN",
    switchLink: "/en"
  },
  en: {
    nav: { portfolio: "Portfolio", login: "Login", consult: "Free Consultation" },
    heroTitle: "Crafting Digital\nExperiences",
    heroSubtitle: "Web development and system design with Next.js and Supabase.\nEnsuring maximum reliability and security with Playwright Automated Testing.",
    ctaBooking: "Book Consultation",
    ctaViewAll: "View All Work",
    featuresTitle: "The TidalSync Standard",
    features: [
      {
        title: "High Performance",
        desc: "Built with Next.js for Enterprise-grade performance, blazing fast load times, and technical SEO readiness."
      },
      {
        title: "Automated Testing",
        desc: "Ensuring maximum reliability and zero-bug tolerance with Playwright end-to-end automated testing before delivery."
      },
      {
        title: "100% Full Ownership",
        desc: "We create a dedicated project email and hand over full access to your source code, database, and servers. Absolute zero vendor lock-in."
      }
    ],
    worksTitle: "Selected Works",
    worksSeeAll: "View All →",
    mockupCategory1: "Web Development",
    mockupCategory2: "UI/UX Design",
    switchLang: "TH",
    switchLink: "/th"
  }
};

export default function LandingPage() {
  const params = useParams();
  const currentLang = params.lang as string;
  const lang = currentLang === "en" ? "en" : "th";
  const dict = dictionaries[lang];

  return (
    <main className="min-h-screen bg-white flex flex-col font-sans">
      
      {/* ================= Navbar ================= */}
      <nav className="w-full px-6 py-6 flex justify-between items-start z-50">
        
        {/* Logo ซ้ายบน */}
        <Link href={`/${lang}`} className="flex flex-col items-center hover:opacity-80 transition mt-1">
          <Image 
            src="/tidalsynclogo.png" 
            alt="TidalSync Logo" 
            width={400} 
            height={400} 
            className="object-contain w-14 md:w-16 h-auto" 
          />
        </Link>

        {/* เมนูขวาบน */}
        <div className="flex items-center gap-4 md:gap-6 text-sm font-medium text-zinc-900 mt-2">
          <Link href={`/${lang}/portfolio`} className="hidden md:block hover:text-zinc-500 transition">{dict.nav.portfolio}</Link>
          
          <Link href={`/${lang}/login`} className="hidden md:block hover:text-zinc-500 transition">{dict.nav.login}</Link>
          
          <Link href={`/${lang}/login`} className="px-5 py-2.5 bg-black text-white rounded-full hover:bg-zinc-800 transition text-xs font-bold tracking-wide shadow-md hover:shadow-lg">
            {dict.nav.consult}
          </Link>
          
          <div className="w-px h-4 bg-zinc-200 hidden md:block"></div>

          {/* ปุ่มสลับภาษา */}
          <Link 
            href={dict.switchLink} 
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-black transition bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-200"
          >
            <Globe size={14} /> {dict.switchLang}
          </Link>
        </div>
      </nav>

      {/* ================= Hero Section ================= */}
      <div className="flex flex-col items-center justify-center px-6 text-center pt-8 pb-16">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-10 md:mb-12"
        >
          <Image 
            src="/tidalsynclogo.png" 
            alt="TidalSync Center Logo" 
            width={800} 
            height={800} 
            className="object-contain w-48 md:w-64 lg:w-72 h-auto mb-6 drop-shadow-sm"
            priority
          />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black mb-6 max-w-4xl leading-[1.1] text-zinc-900 tracking-tight whitespace-pre-line"
        >
          {dict.heroTitle}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base md:text-lg text-zinc-500 max-w-2xl leading-relaxed whitespace-pre-line mb-10"
        >
          {dict.heroSubtitle}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
        >
          <Link href={`/${lang}/login`} className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full text-sm font-medium hover:bg-zinc-800 transition w-full sm:w-auto justify-center">
            <Calendar size={16} /> {dict.ctaBooking}
          </Link>
          <Link href={`/${lang}/portfolio`} className="px-6 py-3 bg-white text-zinc-900 rounded-full text-sm font-medium border border-zinc-200 hover:bg-zinc-50 transition w-full sm:w-auto justify-center">
            {dict.ctaViewAll}
          </Link>
        </motion.div>

      </div>

      {/* ================= Core Values / Features Section ================= */}
      <section className="w-full max-w-5xl mx-auto px-6 py-16 border-t border-zinc-100">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900">{dict.featuresTitle}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {dict.features.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-8 bg-zinc-50 rounded-3xl border border-zinc-100 hover:border-zinc-200 transition-colors"
            >
              <h3 className="text-lg font-bold text-zinc-900 mb-3">{feature.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= Selected Works Section ================= */}
      <section className="w-full max-w-5xl mx-auto px-6 py-16 md:py-24 border-t border-zinc-100">
        
        <div className="flex justify-between items-end mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900">{dict.worksTitle}</h2>
          <Link href={`/${lang}/portfolio`} className="text-sm font-medium text-zinc-500 hover:text-black transition">
            {dict.worksSeeAll}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          
          <Link href={`/${lang}/portfolio/n-sight`} className="group cursor-pointer block">
            <div className="w-full h-64 md:h-[320px] bg-[#FAFAFA] rounded-2xl flex items-center justify-center border border-zinc-100 group-hover:border-zinc-300 transition duration-300 overflow-hidden relative">
              <span className="text-zinc-300 text-sm font-medium">Image Mockup</span>
            </div>
            <div className="flex justify-between items-start mt-5">
              <div>
                <h3 className="font-bold text-lg text-zinc-900 group-hover:text-zinc-600 transition">{lang === 'en' ? 'N-SIGHT Web App' : 'N-SIGHT Web App'}</h3>
                <p className="text-sm text-zinc-400 mt-1">{dict.mockupCategory1}</p>
              </div>
              <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:bg-black group-hover:text-white transition duration-300">
                 <ExternalLink size={16} />
              </div>
            </div>
          </Link>

          <Link href={`/${lang}/portfolio/e-commerce`} className="group cursor-pointer block">
            <div className="w-full h-64 md:h-[320px] bg-[#FAFAFA] rounded-2xl flex items-center justify-center border border-zinc-100 group-hover:border-zinc-300 transition duration-300 overflow-hidden relative">
              <span className="text-zinc-300 text-sm font-medium">Image Mockup</span>
            </div>
            <div className="flex justify-between items-start mt-5">
              <div>
                <h3 className="font-bold text-lg text-zinc-900 group-hover:text-zinc-600 transition">{lang === 'en' ? 'E-Commerce Minimal' : 'E-Commerce Minimal'}</h3>
                <p className="text-sm text-zinc-400 mt-1">{dict.mockupCategory2}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-zinc-800 transition duration-300">
                 <ExternalLink size={16} />
              </div>
            </div>
          </Link>

        </div>
      </section>

    </main>
  );
}
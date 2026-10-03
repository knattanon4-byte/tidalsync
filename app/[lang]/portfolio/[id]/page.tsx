"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Target, TrendingUp, CheckCircle2, LayoutDashboard, Globe } from "lucide-react";

// 🌟 Mock Database (แยกข้อมูล 2 ภาษา)
const projectsDB: Record<string, any> = {
  "n-sight": {
    category: "Web Development",
    year: "2026",
    coverImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555421689-491a97ff2040?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop"
    ],
    th: {
      title: "N-SIGHT Web App",
      client: "Tutor Center",
      role: "Full-Stack Development & UI/UX",
      goal: "ต้องการเว็บพอร์ตโฟลิโอที่ดูพรีเมียม เพื่อใช้นำเสนองานลูกค้าระดับองค์กร (B2B)",
      solution: "เราพัฒนาระบบ Web Application ที่ตอบโจทย์การใช้งาน พร้อมระบบหลังบ้านสำหรับแอดมิน เพื่อลดความซ้ำซ้อน",
      impact: "ปิดดีลลูกค้าระดับองค์กรได้ 3 เจ้า มูลค่ารวมกว่า 5 แสนบาท ภายใน 30 วันแรก",
      features: [
        "ระบบ Authentication สมัครสมาชิกและเข้าสู่ระบบ",
        "Real-time Booking Calendar จองคิวแบบเรียลไทม์",
        "Admin Dashboard สำหรับจัดการข้อมูล",
        "Responsive Design รองรับทุกหน้าจอ"
      ]
    },
    en: {
      title: "N-SIGHT Web App",
      client: "Tutor Center",
      role: "Full-Stack Development & UI/UX",
      goal: "Needed a premium portfolio website to pitch to enterprise-level B2B clients.",
      solution: "We developed a tailored Web Application complete with a backend system for admins to reduce redundancy.",
      impact: "Closed 3 enterprise deals worth over 500k THB within the first 30 days.",
      features: [
        "Authentication system (Sign up/Login)",
        "Real-time Booking Calendar",
        "Admin Dashboard for data management",
        "Fully Responsive Design"
      ]
    }
  },
  "e-commerce": {
    category: "UI/UX Design",
    year: "2026",
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555421689-491a97ff2040?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop"
    ],
    th: {
      title: "E-Commerce Minimal",
      client: "Fashion Brand",
      role: "UI/UX Design",
      goal: "คลินิกประสบปัญหาคิวคนไข้ชนกันในช่วงเวลาเร่งด่วน แอดมินต้องรับโทรศัพท์และจดลงสมุดคิว ทำให้เกิดความผิดพลาดบ่อยครั้ง",
      solution: "เราพัฒนาระบบ E-Commerce ที่ตอบโจทย์การใช้งาน พร้อมระบบตระกร้าสินค้าที่ลื่นไหล",
      impact: "ลดภาระงานของแอดมินลงกว่า 50% ทำให้แอดมินมีเวลาดูแลคนไข้หน้าร้านได้ดีขึ้น และเพิ่มยอดจองคิวล่วงหน้า 200%",
      features: [
        "ออกแบบ User Interface (UI) สไตล์มินิมอล",
        "ระบบตระกร้าสินค้าและ Checkout ที่ใช้งานง่าย",
        "รองรับระบบคูปองส่วนลดและโปรโมชั่น"
      ]
    },
    en: {
      title: "E-Commerce Minimal",
      client: "Fashion Brand",
      role: "UI/UX Design",
      goal: "The clinic faced overlapping patient queues during rush hours. Admins had to manually log calls, causing errors.",
      solution: "We developed an E-Commerce system tailored to their needs with a seamless shopping cart experience.",
      impact: "Reduced admin workload by 50%, improving front-desk patient care and increasing advance bookings by 200%.",
      features: [
        "Minimalist User Interface (UI) design",
        "Streamlined Cart and Checkout flow",
        "Coupon and promotion system integration"
      ]
    }
  }
};

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
  const t = dict[lang]; // ตัวแปรสำหรับคำแปล

  const projectId = params.id as string;
  const project = projectsDB[projectId];

  // ถ้าเข้าผิด URL ให้เด้งกลับหน้าแรก
  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 text-zinc-500">
        <h1 className="text-2xl font-bold text-black mb-4">404 - Project Not Found</h1>
        <Link href={`/${lang}`} className="underline hover:text-black">Return Home</Link>
      </div>
    );
  }

  const pData = project[lang]; // ดึงข้อมูลโปรเจคตามภาษา

  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans pb-24">
      
      {/* ================= Navbar ================= */}
      <nav className="border-b border-zinc-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href={`/${lang}`} className="text-xl font-black tracking-tighter hover:opacity-70 transition">
            TidalSync.
          </Link>
          
          <div className="flex items-center gap-6">
            {/* 🌟 นำปุ่มกลับหน้า Admin และเส้นคั่นออกแล้ว เหลือแค่ปุ่มสลับภาษา */}
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
        <Link href={`/${lang}`} className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-black transition mb-8">
          <ArrowLeft size={16} /> {t.backHome}
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-bold uppercase tracking-widest rounded-full mb-4">
              {project.category}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-4">
              {pData.title}
            </h1>
          </div>
          
          <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm shrink-0">
            <div>
              <p className="text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[10px]">{t.labels.client}</p>
              <p className="font-semibold text-zinc-900">{pData.client}</p>
            </div>
            <div>
              <p className="text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[10px]">{t.labels.date}</p>
              <p className="font-semibold text-zinc-900">{project.year}</p>
            </div>
            <div>
              <p className="text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[10px]">{t.labels.role}</p>
              <p className="font-semibold text-zinc-900">{pData.role}</p>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="w-full h-[40vh] md:h-[70vh] bg-zinc-100 rounded-3xl overflow-hidden relative"
        >
          <Image src={project.coverImage} alt={pData.title} fill className="object-cover" />
        </motion.div>
      </section>

      {/* ================= Content: Problem, Solution, Impact ================= */}
      <section className="max-w-6xl mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        
        <div className="lg:col-span-7 space-y-12">
          {/* The Goal */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-500">
                <Target size={20} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">{t.sections.challenge}</h2>
            </div>
            <p className="text-zinc-600 leading-relaxed text-lg">
              {pData.goal}
            </p>
          </div>

          {/* The Solution */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                <LayoutDashboard size={20} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">{t.sections.solution}</h2>
            </div>
            <p className="text-zinc-600 leading-relaxed text-lg mb-6">
              {pData.solution}
            </p>
            
            <h3 className="font-bold text-zinc-900 mb-3">{t.sections.features}</h3>
            <ul className="space-y-3">
              {pData.features.map((feature: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 text-zinc-600">
                  <CheckCircle2 size={20} className="text-black shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
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
            <p className="text-zinc-300 leading-relaxed text-lg mb-8">
              "{pData.impact}"
            </p>
            
            <div className="border-t border-white/10 pt-8 mt-4">
              <p className="text-sm font-bold text-white mb-4">{t.cta.title}</p>
              <Link href={`/${lang}/dashboard/new`} className="w-full flex items-center justify-center py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition">
                {t.cta.button}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Image Gallery ================= */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold tracking-tight mb-8">{t.sections.gallery}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {project.gallery.map((img: string, idx: number) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
              className={`w-full bg-zinc-100 rounded-2xl overflow-hidden relative ${idx === 2 ? 'md:col-span-2 h-[40vh] md:h-[60vh]' : 'h-[30vh] md:h-[40vh]'}`}
            >
              <Image src={img} alt={`Gallery ${idx + 1}`} fill className="object-cover hover:scale-105 transition duration-700" />
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
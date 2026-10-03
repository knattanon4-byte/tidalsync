"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink } from "lucide-react";

const dictionaries = {
  th: {
    title: "ผลงานทั้งหมด",
    subtitle: "รวมโปรเจคที่เราได้ร่วมสร้างสรรค์ พัฒนา และส่งมอบให้กับลูกค้า",
    back: "กลับหน้าหลัก",
    categories: { web: "Web Development", uiux: "UI/UX Design", saas: "SaaS Platform" }
  },
  en: {
    title: "Selected Works",
    subtitle: "A collection of projects we have crafted, developed, and delivered.",
    back: "Back to Home",
    categories: { web: "Web Development", uiux: "UI/UX Design", saas: "SaaS Platform" }
  }
};

export default function PortfolioPage() {
  const params = useParams();
  const lang = params.lang === "en" ? "en" : "th";
  const dict = dictionaries[lang];

  // 🌟 Mockup ข้อมูลผลงาน (บอสสามารถแก้ชื่อโปรเจคตรงนี้ได้เลย)
  const projects = [
    {
      id: "n-sight",
      title: "N-SIGHT Web App",
      category: dict.categories.web,
      link: `/${lang}/portfolio/n-sight` // เตรียมลิงก์เผื่ออนาคตทำหน้ารายละเอียด
    },
    {
      id: "e-commerce",
      title: "E-Commerce Minimal",
      category: dict.categories.uiux,
      link: `/${lang}/portfolio/e-commerce`
    },
    {
      id: "table-reservation",
      title: "Restaurant Reservation SaaS", // ใส่ผลงานระบบจองโต๊ะเข้าไปโชว์ความโปร
      category: dict.categories.saas,
      link: `/${lang}/portfolio/table-reservation`
    }
  ];

  return (
    <main className="min-h-screen bg-white py-12 md:py-20 px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* ปุ่มกลับหน้าหลัก */}
        <Link href={`/${lang}`} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-black transition mb-10 md:mb-16 bg-zinc-50 px-4 py-2 rounded-full border border-zinc-200 shadow-sm w-fit">
          <ArrowLeft size={16} /> {dict.back}
        </Link>

        {/* ส่วนหัว */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 md:mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 mb-4">{dict.title}</h1>
          <p className="text-base md:text-lg text-zinc-500 max-w-2xl">{dict.subtitle}</p>
        </motion.div>

        {/* Grid แสดงผลงาน */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {projects.map((project, index) => (
            <motion.div 
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={project.link} className="group cursor-pointer block">
                {/* กล่องใส่รูปผลงาน */}
                <div className="w-full h-64 md:h-[360px] bg-[#FAFAFA] rounded-3xl flex items-center justify-center border border-zinc-100 group-hover:border-zinc-300 group-hover:shadow-lg transition duration-500 overflow-hidden relative">
                  {/* พื้นที่สำหรับใส่แท็ก <Image /> ในอนาคต */}
                  <span className="text-zinc-300 text-sm font-medium">Image Mockup</span>
                </div>
                
                {/* รายละเอียดใต้รูป */}
                <div className="flex justify-between items-start mt-6 px-2">
                  <div>
                    <h3 className="font-bold text-xl text-zinc-900 group-hover:text-zinc-600 transition">{project.title}</h3>
                    <p className="text-sm text-zinc-500 mt-1.5 font-medium">{project.category}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:bg-black group-hover:text-white transition duration-300">
                     <ExternalLink size={18} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </main>
  );
}
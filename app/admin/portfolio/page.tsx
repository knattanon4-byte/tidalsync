"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Plus, Filter, Eye, EyeOff, Edit, Trash2, Image as ImageIcon, X, Upload, TrendingUp, Target, Images
} from "lucide-react";

export default function AdminPortfolio() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [portfolios, setPortfolios] = useState([
    { 
      id: "e-commerce", // 🌟 เปลี่ยน ID ให้ตรงกับหน้าบ้าน
      title: "ระบบจองคิวคลินิกหมอใจดี", 
      client: "คุณสมชาย", 
      category: "Web Application", 
      status: "published", 
      views: 1250, 
      date: "15 ก.ย. 2026", 
      color: "from-blue-600 to-blue-900",
      imageCount: 4,
      goal: "ต้องการระบบลดความวุ่นวายหน้าร้าน เพราะคิวคนไข้ชนกันบ่อย แอดมินทำงานซ้ำซ้อน",
      impact: "ลดเวลาทำงานแอดมินลง 50% และเพิ่มยอดจองคิวล่วงหน้าได้ถึง 200% ในเดือนแรก" 
    },
    { 
      id: "n-sight", // 🌟 เปลี่ยน ID ให้ตรงกับหน้าบ้าน
      title: "N-SIGHT Portfolio", 
      client: "คุณนัท", 
      category: "Web Design", 
      status: "published", 
      views: 840, 
      date: "10 ก.ย. 2026", 
      color: "from-zinc-800 to-black",
      imageCount: 3,
      goal: "ต้องการเว็บพอร์ตโฟลิโอที่ดูพรีเมียม เพื่อใช้นำเสนองานลูกค้าระดับองค์กร (B2B)",
      impact: "ปิดดีลลูกค้าระดับองค์กรได้ 3 เจ้า มูลค่ารวมกว่า 5 แสนบาท ภายใน 30 วันแรก" 
    },
    { 
      id: "cafe-amazon", 
      title: "Cafe Amazon Re-branding", 
      client: "Cafe Amazon", 
      category: "Branding", 
      status: "draft", 
      views: 0, 
      date: "1 ก.ย. 2026", 
      color: "from-green-500 to-green-800",
      imageCount: 1,
      goal: "ต้องการรีเฟรชแบรนด์ให้ดูทันสมัย เข้าถึงกลุ่มวัยรุ่นนักศึกษามากขึ้น",
      impact: "รอวัดผลแคมเปญหลังเปิดตัวไตรมาสหน้า" 
    },
  ]);

  return (
    <div className="flex-1 p-4 md:p-8 md:px-10 w-full max-w-[1600px] mx-auto space-y-6 h-screen overflow-y-auto">
      
      {/* Topbar */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">จัดการผลงาน (Portfolio) ✨</h1>
          <p className="text-sm text-zinc-500 mt-1">สร้าง Case Study ผลลัพธ์ปังๆ เพื่อปิดการขายบนหน้าเว็บ</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3.5 top-2.5 text-zinc-400" size={16} />
            <input type="text" placeholder="ค้นหาผลงาน..." className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-full text-sm font-medium focus:outline-none focus:border-black transition shadow-sm" />
          </div>
          <button className="flex items-center gap-2 p-2 px-4 bg-white border border-zinc-200 rounded-full text-zinc-700 hover:text-black hover:bg-zinc-50 transition shadow-sm text-sm font-medium">
            <Filter size={14} /> ตัวกรอง
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 p-2 px-4 bg-black text-white rounded-full hover:bg-zinc-800 transition shadow-md text-sm font-medium"
          >
            <Plus size={16} /> สร้าง Case Study
          </button>
        </div>
      </header>

      {/* ================= Portfolio Grid ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {portfolios.map((item) => (
          <motion.div 
            key={item.id}
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden group flex flex-col"
          >
            {/* Cover Image */}
            <div className={`h-56 w-full bg-gradient-to-br ${item.color} relative flex items-center justify-center overflow-hidden`}>
              <ImageIcon size={48} className="text-white/20" />
              
              <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/50 backdrop-blur text-white text-[10px] font-bold rounded-lg flex items-center gap-1.5 border border-white/10 shadow-sm">
                <Images size={12} /> {item.imageCount} รูป
              </div>
              
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 transition shadow-lg">
                  <Edit size={16} />
                </button>
                <button className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition shadow-lg">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="absolute top-3 right-3">
                {item.status === 'published' ? (
                  <span className="px-2.5 py-1 bg-white/90 backdrop-blur text-black text-[10px] font-bold rounded-full shadow-sm flex items-center gap-1.5">
                    <Eye size={12} className="text-green-500" /> เผยแพร่แล้ว
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-black/50 backdrop-blur text-white text-[10px] font-bold rounded-full border border-white/20 flex items-center gap-1.5">
                    <EyeOff size={12} /> แบบร่าง (ซ่อน)
                  </span>
                )}
              </div>
            </div>

            {/* ข้อมูลโปรเจค */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{item.category}</span>
                  <span className="text-[10px] text-zinc-400">{item.date}</span>
                </div>
                <h3 className="font-bold text-lg text-zinc-900 leading-tight mb-1">{item.title}</h3>
                <p className="text-xs text-zinc-500 mb-4 font-medium">ลูกค้า: {item.client}</p>
                
                <div className="space-y-2">
                  <div className="flex gap-2 items-start bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                    <Target size={14} className="text-orange-500 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-zinc-600 leading-relaxed"><span className="font-bold text-zinc-800">โจทย์:</span> {item.goal}</p>
                  </div>
                  <div className="flex gap-2 items-start bg-green-50 p-2.5 rounded-lg border border-green-100">
                    <TrendingUp size={14} className="text-green-600 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-green-800 leading-relaxed"><span className="font-bold">ผลลัพธ์:</span> {item.impact}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 pt-4 border-t border-zinc-100 flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500">
                  <Eye size={14} className="text-zinc-400" /> {item.views.toLocaleString()} Views
                </div>
                {/* 🌟 แก้ไขลิงก์ตรงนี้ เติม /th/ และเพิ่ม target="_blank" */}
                <Link href={`/th/portfolio/${item.id}`} target="_blank" className="text-[11px] font-bold text-blue-600 hover:underline">
                  พรีวิว Case Study &rarr;
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ================= Modal: เพิ่มผลงานใหม่ ================= */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", duration: 0.5 }}
              className="bg-white w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl shadow-2xl relative z-10"
            >
              <div className="flex justify-between items-center p-5 md:p-6 border-b border-zinc-100 shrink-0 bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black text-white rounded-lg"><TrendingUp size={18} /></div>
                  <div>
                      <h3 className="font-bold text-lg leading-tight">สร้าง Case Study ผลงาน</h3>
                      <p className="text-[11px] text-zinc-500 mt-0.5">เปลี่ยนผลงานเป็นเรื่องราวเพื่อสร้างความน่าเชื่อถือ</p>
                  </div>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-full transition"><X size={20} /></button>
              </div>

              <div className="p-6 md:p-8 space-y-8 flex-1 overflow-y-auto">
                {/* เนื้อหา Modal */}
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">แกลเลอรีรูปภาพ (Image Gallery)</label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2 row-span-2 h-48 md:h-full border-2 border-dashed border-zinc-300 rounded-2xl bg-zinc-50 flex flex-col items-center justify-center cursor-pointer hover:border-black transition">
                      <Upload size={18} className="mb-2 text-zinc-400" />
                      <p className="font-bold text-sm text-zinc-700">หน้าปก (Cover)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-6 border-t border-zinc-100 bg-white flex justify-end gap-3 shrink-0">
                <button onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 text-zinc-600 font-medium rounded-full hover:bg-zinc-100 transition text-sm">ยกเลิก</button>
                <button className="px-8 py-2.5 bg-black text-white font-bold rounded-full hover:bg-zinc-800 transition shadow-lg shadow-zinc-200 text-sm">บันทึกผลงาน</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
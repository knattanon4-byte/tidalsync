"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Paperclip, Send, User, CheckCircle2, 
  Info, FileIcon, FileText, Download, ChevronRight, X, Clock, AlertCircle
} from "lucide-react";

// ================= Mock Data (จำลองข้อมูล) =================
const MOCK_PROJECT = {
  id: "PRJ-0001",
  title: "เว็บไซต์บริษัท ABC",
  company: "ABC Corporation",
  status: "inProgress", // pending, inProgress, reviewing, completed
  startDate: "2 ต.ค. 2026",
  dueDate: "30 ต.ค. 2026",
  manager: "Mic (TidalSync)",
  budget: 45000,
};

const MOCK_MESSAGES = [
  { id: 1, sender: "client", text: "สวัสดีครับบอส อยากได้หน้าเว็บโทนสีสว่างๆ ดูคลีนๆ มินิมอลครับ", time: "10:05 น." },
  { id: 2, sender: "admin", text: "รับทราบครับ ทางเราได้ลองขึ้น Design Draft แบบคลีนๆ มาให้เลือก 2 แบบครับ ลองดูเรฟเฟอเรนซ์ด้านล่างนี้นะครับ", time: "10:30 น." },
  { id: 3, sender: "admin", type: "file", fileName: "Draft 01 - โทนสว่าง (Light Theme)", fileType: "design", fileUrl: "#", time: "10:31 น." },
];

const MOCK_FILES = [
  { id: 1, name: "Requirement_ABC.pdf", type: "doc", size: "1.2 MB", date: "2 ต.ค. 26" },
  { id: 2, name: "Quotation_QT-2026-001.pdf", type: "doc", size: "0.8 MB", date: "3 ต.ค. 26" },
  { id: 3, name: "Draft_01_Light_Theme.png", type: "design", size: "4.5 MB", date: "5 ต.ค. 26" },
  { id: 4, name: "Logo_Assets.zip", type: "asset", size: "12 MB", date: "5 ต.ค. 26" },
];
// ==========================================================

export default function ChatProjectWorkspace() {
  const params = useParams();
  const searchParams = useSearchParams();
  const lang = params.lang === "en" ? "en" : "th";
  const projectTitleUrl = searchParams.get('title') || "Project Chat";

  // State
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // ควบคุม Sidebar ขวา
  const [activeTab, setActiveTab] = useState<'overview' | 'files'>('overview');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // เลื่อนแชทลงล่างสุดอัตโนมัติเมื่อมีข้อความใหม่
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    // จำลองส่งข้อความฝั่งลูกค้า
    setMessages([...messages, { 
      id: Date.now(), 
      sender: "client", 
      text: inputText, 
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + " น." 
    }]);
    setInputText("");
  };

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'inProgress': return <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full text-xs font-bold"><div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div> กำลังดำเนินการ</span>;
      case 'reviewing': return <span className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full text-xs font-bold"><Clock size={12}/> รอลูกค้าตรวจงาน</span>;
      case 'completed': return <span className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-xs font-bold"><CheckCircle2 size={12}/> ส่งมอบงานแล้ว</span>;
      default: return <span className="flex items-center gap-1.5 text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full text-xs font-bold"><AlertCircle size={12}/> รอดำเนินการ</span>;
    }
  };

  return (
    <div className="flex h-screen bg-zinc-50 font-sans overflow-hidden">
      
      {/* ==================== 💬 ฝั่งแชท (ซ้าย/หลัก) ==================== */}
      <div className="flex-1 flex flex-col h-full relative z-10 transition-all duration-300">
        
        {/* Header แชท */}
        <header className="h-20 bg-white border-b border-zinc-100 flex items-center justify-between px-6 shrink-0 shadow-[0_4px_24px_rgba(0,0,0,0.02)] z-20">
          <div className="flex items-center gap-4">
            <Link href={`/${lang}/dashboard`} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-500 transition">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="font-bold text-lg text-zinc-900 leading-tight">{projectTitleUrl}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-xs font-medium text-zinc-400">ทีมงานออนไลน์</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden md:flex items-center gap-2 text-sm font-medium text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-200">
                <User size={14}/> Hi, Customer
             </div>
             {/* 🌟 ปุ่มเปิด Sidebar ขวา */}
             <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${isSidebarOpen ? 'bg-black text-white shadow-md' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
             >
                <Info size={16} /> <span className="hidden md:block">ข้อมูลโปรเจกต์</span>
             </button>
          </div>
        </header>

        {/* พื้นที่สนทนา */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-white/50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'client' ? 'items-end' : 'items-start'}`}>
              
              {/* ข้อความแบบ Text ธรรมดา */}
              {!msg.type && (
                <div className={`max-w-[85%] md:max-w-[65%] px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                  msg.sender === 'client' 
                    ? 'bg-black text-white rounded-tr-sm' 
                    : 'bg-white border border-zinc-100 text-zinc-800 rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              )}

              {/* ข้อความแบบแนบไฟล์ (UI ตามรูป) */}
              {msg.type === 'file' && (
                <div className="max-w-[85%] md:max-w-[320px] bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm rounded-tl-sm group cursor-pointer hover:border-black transition">
                  <div className="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-xl mb-3 flex items-center justify-center shrink-0">
                     <FileIcon size={24} className="text-zinc-400" />
                  </div>
                  <h4 className="font-bold text-sm text-zinc-900 leading-tight mb-1">{msg.fileName}</h4>
                  <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-3">TidalSync Team</p>
                  <button className="w-full py-2 bg-zinc-50 text-xs font-bold text-zinc-600 rounded-lg group-hover:bg-black group-hover:text-white transition">
                    ดาวน์โหลดไฟล์
                  </button>
                </div>
              )}

              <span className="text-[10px] font-medium text-zinc-400 mt-1.5 px-1">{msg.time}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* กล่องพิมพ์ข้อความ */}
        <div className="p-4 md:p-6 bg-white border-t border-zinc-100 shrink-0 z-20">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative flex items-center">
            <button type="button" className="absolute left-4 text-zinc-400 hover:text-black transition">
              <Paperclip size={20} />
            </button>
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="พิมพ์ข้อความตอบกลับ..."
              className="w-full pl-12 pr-16 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-[15px] transition"
            />
            <button 
              type="submit" 
              disabled={!inputText.trim()}
              className="absolute right-3 w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center hover:bg-zinc-800 transition disabled:opacity-30 disabled:hover:bg-black"
            >
              <Send size={16} className="-ml-0.5 mt-0.5" />
            </button>
          </form>
        </div>
      </div>

      {/* ==================== ℹ️ แถบ Sidebar ขวา (Project Workspace) ==================== */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop มือถือ */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 z-30 md:hidden"
            />
            
            <motion.div 
              initial={{ x: 400, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed md:static right-0 top-0 h-full w-[340px] md:w-[380px] bg-white border-l border-zinc-200 z-40 flex flex-col shadow-2xl md:shadow-none"
            >
              {/* Header Sidebar */}
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <h2 className="font-bold text-lg">Project Workspace</h2>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-zinc-200 rounded-full text-zinc-500 transition">
                  <X size={18} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex p-2 border-b border-zinc-100">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'overview' ? 'bg-black text-white shadow-md' : 'text-zinc-500 hover:text-black hover:bg-zinc-50'}`}
                >
                  ภาพรวม (Overview)
                </button>
                <button 
                  onClick={() => setActiveTab('files')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'files' ? 'bg-black text-white shadow-md' : 'text-zinc-500 hover:text-black hover:bg-zinc-50'}`}
                >
                  ไฟล์ทั้งหมด (Files)
                </button>
              </div>

              {/* Content Sidebar */}
              <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/30">
                
                {/* 🌟 Tab 1: Overview */}
                {activeTab === 'overview' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{MOCK_PROJECT.id}</p>
                      <h3 className="text-xl font-black text-zinc-900 leading-tight">{MOCK_PROJECT.title}</h3>
                      <p className="text-sm text-zinc-500 mt-1">{MOCK_PROJECT.company}</p>
                    </div>

                    <div className="p-4 bg-white border border-zinc-100 rounded-2xl shadow-sm space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-500">สถานะโปรเจกต์</span>
                        {getStatusDisplay(MOCK_PROJECT.status)}
                      </div>
                      <hr className="border-zinc-50"/>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-500">วันเริ่มงาน</span>
                        <span className="text-sm font-medium text-zinc-900">{MOCK_PROJECT.startDate}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-500">กำหนดส่ง</span>
                        <span className="text-sm font-medium text-zinc-900">{MOCK_PROJECT.dueDate}</span>
                      </div>
                      <hr className="border-zinc-50"/>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-500">ผู้ดูแล (Manager)</span>
                        <span className="text-sm font-medium text-zinc-900 flex items-center gap-1.5"><div className="w-5 h-5 bg-zinc-200 rounded-full flex items-center justify-center"><User size={10}/></div> {MOCK_PROJECT.manager}</span>
                      </div>
                    </div>

                    <button className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl border border-blue-100 transition group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-200/50 rounded-full flex items-center justify-center">
                          <FileText size={16} />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold uppercase tracking-wider">Quotation</p>
                          <p className="text-[10px] opacity-70">ดูใบเสนอราคาและเอกสารสัญญา</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                )}

                {/* 🌟 Tab 2: Files */}
                {activeTab === 'files' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <p className="text-xs text-zinc-500">ไฟล์ทั้งหมดที่แนบในห้องแชทนี้จะถูกรวบรวมไว้ที่นี่</p>
                    
                    <div className="space-y-3">
                      {MOCK_FILES.map((file) => (
                        <div key={file.id} className="group flex items-center justify-between p-3 bg-white border border-zinc-100 rounded-xl hover:border-black transition cursor-pointer shadow-sm">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${file.type === 'design' ? 'bg-purple-50 text-purple-500' : file.type === 'asset' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
                              <FileIcon size={18} />
                            </div>
                            <div className="truncate">
                              <p className="text-sm font-bold text-zinc-900 truncate">{file.name}</p>
                              <p className="text-[10px] font-medium text-zinc-400">{file.size} • {file.date}</p>
                            </div>
                          </div>
                          <button className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-black group-hover:text-white transition shrink-0 ml-2">
                            <Download size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
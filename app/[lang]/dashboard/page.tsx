"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation"; 
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, CircleDashed, Circle, ExternalLink, 
  MessageSquare, ChevronDown, User, LogOut, Plus, Folder, ArrowLeft,
  Wallet, CreditCard, Banknote, FileText, History, Globe, Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase"; 

// 🌟 Dictionary
const dictionaries = {
  th: {
    header: { profile: "โปรไฟล์", logout: "ออกจากระบบ" },
    tabs: { active: "กำลังดำเนินการ", history: "ประวัติ" },
    title: "งานของฉัน",
    subtitle: "เลือกโปรเจคที่ต้องการดูความคืบหน้า หรือประวัติย้อนหลัง",
    newProject: "ขอเสนอราคา / เริ่มโปรเจคใหม่",
    status: { pending: "รอดำเนินการ", reviewing: "กำลังประเมิน", inProgress: "กำลังดำเนินการ", completed: "เสร็จสิ้น" },
    dateInfo: { delivered: "ส่งมอบเมื่อ:", updated: "อัปเดตล่าสุด:" },
    backBtn: "กลับไปหน้ารวม",
    chatBtn: "คุยกับทีมงาน",
    finance: { total: "ยอดเงินทั้งหมด", paid: "ชำระแล้ว", remain: "คงเหลือ" },
    timeline: {
      step1Title: "1. บรีฟงานและชำระมัดจำ", step1Desc: "ได้รับมัดจำเรียบร้อยแล้ว (Completed)",
      docQuotation: "ใบเสนอราคา", viewFull: "ดูรูปเต็ม", depositPaid: "ชำระมัดจำ (50%)",
      step2Title: "2. ออกแบบ UI/UX (Figma)", step2Desc: "ลูกค้ายืนยันแบบเรียบร้อย (Completed)",
      docDesign: "ไฟล์ออกแบบ", viewFigma: "ดูบน Figma",
      step3Title: "3. พัฒนาระบบ (Development)", step3Desc: "กำลังขึ้นโครงสร้าง Frontend หน้า Dashboard",
      step4Title: "4. ทดสอบระบบ (UAT)", step4Desc: "รอการพัฒนาเสร็จสิ้น",
      step5Title: "5. ชำระงวดสุดท้าย & ส่งมอบ", step5Desc: "รอการทดสอบเสร็จสิ้น"
    },
    switchLang: "EN",
    switchLink: "/en/dashboard"
  },
  en: {
    header: { profile: "Profile", logout: "Log Out" },
    tabs: { active: "In Progress", history: "History" },
    title: "My Projects",
    subtitle: "Select a project to view its progress or history",
    newProject: "Request Quote / Start New Project",
    status: { pending: "Pending", reviewing: "Reviewing", inProgress: "In Progress", completed: "Completed" },
    dateInfo: { delivered: "Delivered on:", updated: "Last updated:" },
    backBtn: "Back to Projects",
    chatBtn: "Chat with Team",
    finance: { total: "Total Amount", paid: "Amount Paid", remain: "Remaining Balance" },
    timeline: {
      step1Title: "1. Brief & Deposit", step1Desc: "Deposit received (Completed)",
      docQuotation: "Quotation", viewFull: "View Full", depositPaid: "Deposit Paid (50%)",
      step2Title: "2. UI/UX Design (Figma)", step2Desc: "Design approved by client (Completed)",
      docDesign: "Design File", viewFigma: "View on Figma",
      step3Title: "3. Development", step3Desc: "Building Frontend Dashboard structure",
      step4Title: "4. User Acceptance Testing (UAT)", step4Desc: "Waiting for development to finish",
      step5Title: "5. Final Payment & Delivery", step5Desc: "Waiting for UAT to finish"
    },
    switchLang: "TH",
    switchLink: "/th/dashboard"
  }
};

export default function ClientDashboard() {
  const params = useParams();
  const router = useRouter();
  const currentLang = params.lang as string;
  const lang = currentLang === "en" ? "en" : "th";
  const dict = dictionaries[lang];

  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [isProfileOpen, setIsProfileOpen] = useState(false); 

  // State เก็บข้อมูลโปรเจคที่ดึงมาจาก Database
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("Customer"); // เพิ่ม State สำหรับเก็บชื่อลูกค้าโชว์ที่มุมขวาบน

  // 🌟 ฟังก์ชันดึงข้อมูลจาก Database ที่ปรับปรุงใหม่ 🌟
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // 1. ดึงข้อมูล User ที่ล็อกอินอยู่
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        if (user) {
          // เซ็ตชื่อลูกค้าไปโชว์ที่มุมขวาบน
          if (user.user_metadata?.full_name) {
            setUserName(user.user_metadata.full_name);
          }

          // 2. ดึงเฉพาะโปรเจกต์ของลูกค้าคนนี้เท่านั้น
          const { data, error } = await supabase
            .from('inquiries')
            .select('*')
            .eq('user_id', user.id) // << จุดสำคัญ! กรองด้วย user_id
            .order('created_at', { ascending: false });
            
          if (error) throw error;
          setDbProjects(data || []);
        } else {
          // ถ้าไม่ได้ล็อกอิน ให้เด้งกลับไปหน้า login
          router.push(`/${lang}/login`);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [lang, router]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsProfileOpen(false);
      window.location.href = `/${lang}/login`;
    } catch (error) {
      console.error("Error logging out:", error);
      alert(lang === 'th' ? "เกิดข้อผิดพลาดในการออกจากระบบ" : "Error logging out");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(lang === 'th' ? 'th-TH' : 'en-US', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
      hour12: lang === 'en'
    }).format(date) + (lang === 'th' ? ' น.' : '');
  };

  const activeProjects = dbProjects.filter(p => p.status !== 'completed');
  const historyProjects = dbProjects.filter(p => p.status === 'completed');

  const mockProjectDetails = {
    totalAmount: 50000,
    paidAmount: 25000,
    remainingAmount: 25000,
    quotationRef: "QT-2026-001",
    uiuxLink: "https://figma.com/file/mock-project-link", 
  };

  const getStatusTranslation = (status: string) => {
    switch(status) {
      case 'pending': return dict.status.pending;
      case 'reviewing': return dict.status.reviewing;
      case 'accepted': return dict.status.inProgress;
      case 'completed': return dict.status.completed;
      default: return dict.status.pending;
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900 p-4 md:p-12 overflow-x-hidden relative">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Link href={`/${lang}`} className="hover:opacity-70 transition duration-200">
              <Image src="/tidalsynclogo.png" alt="TidalSync Logo" width={100} height={50} className="object-contain mix-blend-multiply md:w-[120px] h-auto" />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href={dict.switchLink} 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 rounded-full text-[11px] font-bold text-zinc-500 hover:text-black transition shadow-sm"
            >
              <Globe size={14} /> {dict.switchLang}
            </Link>

            <div className="relative z-30">
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 hover:bg-white p-1 md:p-2 md:pr-4 rounded-full transition duration-200 border border-transparent hover:border-zinc-200 hover:shadow-sm cursor-pointer"
              >
                <div className="w-8 h-8 md:w-10 md:h-10 bg-zinc-200 rounded-full border border-zinc-300 overflow-hidden flex items-center justify-center">
                   <User size={18} className="text-zinc-500" />
                </div>
                <span className="text-sm font-medium hidden md:block max-w-[100px] truncate">
                  Hi, {userName} {/* 🌟 เปลี่ยนให้โชว์ชื่อจริงแทนคำว่า Customer */}
                </span>
                <ChevronDown size={16} className={`text-zinc-400 hidden md:block transition duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </div>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl shadow-zinc-200/50 border border-zinc-100 origin-top-right"
                  >
                    <div className="p-2 flex flex-col gap-1">
                      <Link href={`/${lang}/dashboard/profile`} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-zinc-600 hover:text-black hover:bg-zinc-50 rounded-xl transition">
                        <User size={16} /> {dict.header.profile}
                      </Link>
                      <div className="h-px bg-zinc-100 my-1"></div>
                      
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition w-full text-left"
                      >
                        <LogOut size={16} /> {dict.header.logout}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {selectedProject === null ? (
            
            <motion.div key="project-list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }}>
              <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{dict.title}</h1>
                  <p className="text-sm md:text-base text-zinc-500 mt-1 md:mt-2">{dict.subtitle}</p>
                </div>
                
                {/* Tabs */}
                <div className="flex bg-zinc-100 p-1 rounded-full w-full md:w-fit border border-zinc-200/50">
                  <button 
                    onClick={() => setActiveTab('active')}
                    className={`flex-1 md:flex-none px-4 md:px-5 py-2 text-xs md:text-sm font-medium rounded-full transition-all duration-300 ${
                      activeTab === 'active' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black'
                    }`}
                  >
                    {dict.tabs.active}
                  </button>
                  <button 
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 md:flex-none justify-center px-4 md:px-5 py-2 text-xs md:text-sm font-medium rounded-full transition-all duration-300 flex items-center gap-1.5 ${
                      activeTab === 'history' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black'
                    }`}
                  >
                    <History size={14} /> {dict.tabs.history}
                  </button>
                </div>
              </div>

              {/* Project Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                
                {activeTab === 'active' && (
                  <Link href={`/${lang}/dashboard/new`} className="min-h-[160px] md:min-h-[180px] p-6 rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 flex flex-col items-center justify-center gap-3 md:gap-4 text-zinc-500 hover:text-black hover:bg-white hover:border-zinc-300 hover:shadow-sm transition-all group cursor-pointer">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-zinc-100 group-hover:scale-110 transition-transform">
                      <Plus size={20} className="md:w-6 md:h-6" />
                    </div>
                    <span className="font-medium text-sm md:text-base">{dict.newProject}</span>
                  </Link>
                )}

                {/* โหลดข้อมูลจาก Database */}
                {isLoading ? (
                   <div className="min-h-[160px] md:min-h-[180px] p-6 rounded-3xl border border-zinc-100 bg-white flex flex-col items-center justify-center gap-3 text-zinc-400">
                     <Loader2 className="animate-spin w-8 h-8" />
                     <span className="text-sm font-medium">กำลังโหลด...</span>
                   </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {(activeTab === 'active' ? activeProjects : historyProjects).map((proj) => (
                      <motion.div 
                        key={proj.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setSelectedProject(proj)} 
                        className="p-5 md:p-6 bg-white rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all cursor-pointer flex flex-col justify-between min-h-[160px] md:min-h-[180px] group"
                      >
                        <div>
                           <div className="flex justify-between items-start mb-3 md:mb-4">
                             <div className="w-10 h-10 md:w-12 md:h-12 bg-zinc-50 group-hover:bg-black group-hover:text-white transition-colors rounded-full flex items-center justify-center text-zinc-400">
                               <Folder size={18} className="md:w-5 md:h-5" />
                             </div>
                             <span className={`px-2.5 py-1 text-[10px] md:text-xs font-semibold rounded-full ${proj.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                               {getStatusTranslation(proj.status)}
                             </span>
                           </div>
                           <h3 className="font-bold text-base md:text-lg leading-tight text-zinc-800">{proj.project_name}</h3>
                        </div>
                        <p className="text-[11px] md:text-xs text-zinc-400 mt-4">
                          {proj.status === 'completed' ? dict.dateInfo.delivered : dict.dateInfo.updated} {formatDate(proj.created_at)}
                        </p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>

          ) : (

            <motion.div key="project-detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.4 }}>
              
              <button onClick={() => setSelectedProject(null)} className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-zinc-500 hover:text-black transition bg-white px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-zinc-200 hover:shadow-sm w-fit mb-4 md:mb-8">
                <ArrowLeft size={14} className="md:w-4 md:h-4" /> {dict.backBtn}
              </button>

              <div className="bg-white p-5 md:p-10 rounded-3xl shadow-sm border border-zinc-100 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8 border-b border-zinc-100 pb-6 md:pb-8">
                  <div>
                    <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] md:text-xs font-semibold rounded-full mb-2 md:mb-3">
                      {getStatusTranslation(selectedProject.status)}
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold">{selectedProject.project_name}</h2>
                    <p className="text-xs md:text-sm text-zinc-500 mt-1">{dict.dateInfo.updated} {formatDate(selectedProject.created_at)}</p>
                  </div>
                  
                  {/* ลิงก์ปุ่มแชท */}
                  <button 
                    onClick={() => {
                      const chatTitle = selectedProject.company_name ? `${selectedProject.project_name} - ${selectedProject.company_name}` : selectedProject.project_name;
                      router.push(`/${lang}/dashboard/chat/${selectedProject.id}?title=${encodeURIComponent(chatTitle)}`);
                    }}
                    className="w-full md:w-auto flex items-center justify-center gap-2 text-sm font-medium bg-black text-white px-6 py-3 rounded-xl md:rounded-full hover:bg-zinc-800 transition shadow-lg shadow-zinc-200"
                  >
                    <MessageSquare size={16} /> {dict.chatBtn}
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-8 md:mb-12">
                  <div className="col-span-2 md:col-span-1 flex items-center gap-3 md:gap-4 p-4 md:p-5 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                    <div className="p-2 bg-blue-50 text-blue-500 rounded-lg md:rounded-xl"><Wallet size={18} className="md:w-5 md:h-5" /></div>
                    <div>
                      <p className="text-[10px] md:text-[11px] text-zinc-400 font-medium mb-0.5">{dict.finance.total}</p>
                      <h4 className="font-bold text-base md:text-lg leading-none">
                        {selectedProject.budget ? `${selectedProject.budget.toLocaleString()} ฿` : '-'}
                      </h4>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 p-4 md:p-5 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                    <div className="p-2 bg-green-50 text-green-500 rounded-lg md:rounded-xl"><CreditCard size={18} className="md:w-5 md:h-5" /></div>
                    <div>
                      <p className="text-[10px] md:text-[11px] text-zinc-400 font-medium mb-0.5">{dict.finance.paid}</p>
                      <h4 className="font-bold text-base md:text-lg text-green-600 leading-none">0 ฿</h4>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 p-4 md:p-5 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                    <div className="p-2 bg-orange-50 text-orange-500 rounded-lg md:rounded-xl"><Banknote size={18} className="md:w-5 md:h-5" /></div>
                    <div>
                      <p className="text-[10px] md:text-[11px] text-zinc-400 font-medium mb-0.5">{dict.finance.remain}</p>
                      <h4 className="font-bold text-base md:text-lg text-orange-600 leading-none">
                        {selectedProject.budget ? `${selectedProject.budget.toLocaleString()} ฿` : '-'}
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 md:space-y-8 relative before:absolute before:inset-0 before:ml-[1.4rem] md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 before:to-transparent">
                  
                  <MilestoneItem 
                    icon={<CheckCircle2 size={20} className="text-green-500 md:w-6 md:h-6" />} 
                    title={dict.timeline.step1Title}
                    desc={dict.timeline.step1Desc}
                    index={0}
                    content={
                      <div className="space-y-3 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-dashed border-zinc-100">
                        <div className="flex justify-between items-center text-xs md:text-sm">
                          <span className="text-zinc-500 flex items-center gap-1 md:gap-1.5"><FileText size={12} className="md:w-[14px] md:h-[14px]"/> {dict.timeline.docQuotation}</span>
                          <span className="font-medium text-black">{mockProjectDetails.quotationRef}</span>
                        </div>
                        
                        <Link href="#" className="block w-full h-24 md:h-32 relative rounded-xl overflow-hidden border border-zinc-200 group/img">
                          <Image src="/tidalsyncPR.png" alt="Quotation Document" fill className="object-cover opacity-80 group-hover/img:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                            <span className="bg-white/95 text-black text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center gap-1.5 shadow-sm">
                              <ExternalLink size={12} /> {dict.timeline.viewFull}
                            </span>
                          </div>
                        </Link>
                      </div>
                    }
                  />

                  <MilestoneItem 
                    icon={<CheckCircle2 size={20} className="text-green-500 md:w-6 md:h-6" />} 
                    title={dict.timeline.step2Title}
                    desc={dict.timeline.step2Desc}
                    index={1} 
                  />
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: 0.2 }}
                    className="relative flex items-center justify-end md:justify-normal md:odd:flex-row-reverse group z-20 pl-[4rem] md:pl-0"
                  >
                    <div className="absolute left-0 md:static flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full border-4 border-white bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ml-3 md:ml-0"></div>
                    
                    <div className="w-full md:w-[calc(50%-2.5rem)] p-4 md:p-5 rounded-2xl border border-blue-100 bg-blue-50/50 shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-bold text-sm md:text-base text-blue-900">{dict.timeline.step3Title}</h4>
                        <span className="text-[10px] md:text-xs font-bold text-blue-600">60%</span>
                      </div>
                      <p className="text-xs md:text-sm text-blue-700/80">{dict.timeline.step3Desc}</p>
                    </div>
                  </motion.div>

                  <MilestoneItem icon={<Circle size={20} className="text-zinc-300 md:w-6 md:h-6" />} title={dict.timeline.step4Title} desc={dict.timeline.step4Desc} index={3} />
                  <MilestoneItem icon={<CircleDashed size={20} className="text-zinc-300 md:w-6 md:h-6" />} title={dict.timeline.step5Title} desc={dict.timeline.step5Desc} index={4} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function MilestoneItem({ icon, title, desc, content, index }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative flex items-start md:items-center justify-end md:justify-normal md:odd:flex-row-reverse group z-20 pl-[4rem] md:pl-0"
    >
      <div className="absolute left-0 top-3 md:top-auto md:static flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full border-4 border-white bg-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ml-3 md:ml-0">
        {icon}
      </div>
      <div className="w-full md:w-[calc(50%-2.5rem)] p-4 md:p-5 rounded-2xl border border-zinc-100 bg-white shadow-sm hover:border-zinc-300 hover:shadow-md transition-all cursor-default">
        <div>
          <h4 className="font-bold text-sm md:text-base text-zinc-900 leading-tight">{title}</h4>
          <p className="text-[11px] md:text-sm text-zinc-500 mt-1">{desc}</p>
        </div>
        {content && <div>{content}</div>}
      </div>
    </motion.div>
  );
}
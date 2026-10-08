"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, CheckCircle2, Clock, 
  Sparkles, ChevronRight, Bell, Search, FolderKanban, X, BrainCircuit, CalendarCheck, FileSignature, Send, Download, Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const router = useRouter();
  
  // ================= States สำหรับข้อมูล Database =================
  const [stats, setStats] = useState({ pending: 0, active: 0, completed: 0, revenue: 0 });
  const [newRequests, setNewRequests] = useState<any[]>([]);
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ================= States สำหรับ UI/Modals =================
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [quotePrice, setQuotePrice] = useState<string>("50000");
  const [depositPercent, setDepositPercent] = useState<number>(50);
  const [isExporting, setIsExporting] = useState(false);

  const currentDate = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

  // ================= 🌟 ฟังก์ชันดึงข้อมูล 🌟 =================
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. ดึง "คำขอโปรเจกต์ใหม่" จากตาราง inquiries
      const { data: inquiriesData, error: inquiriesError } = await supabase
        .from('inquiries')
        .select(`
          *,
          profiles:user_id (full_name, company_name)
        `)
        .order('created_at', { ascending: false });

      if (inquiriesError) {
        console.error("Error fetching inquiries:", inquiriesError.message);
      }

      // 2. ถ้ามีตาราง projects ก็ดึงมา (สำหรับงานที่กดรับแล้ว)
      const { data: projectsData } = await supabase
        .from('projects')
        .select(`
          *,
          profiles:client_id (full_name, company_name)
        `)
        .order('created_at', { ascending: false });

      // 3. จัดการข้อมูลเอาไปใส่ Stats
      let pending = 0, active = 0, completed = 0, revenue = 0;
      const pendingList: any[] = [];
      const activeList: any[] = [];

      // นับ Inquiries (คำขอใหม่)
      if (inquiriesData) {
        inquiriesData.forEach(req => {
          if (req.status === 'pending') {
            pending++;
            pendingList.push({
               ...req, 
               title: req.project_name, // แปลงให้ชื่อตรงกับโครงสร้างเดิมที่ UI ต้องการ
               type: req.project_type,
               client_id: req.user_id 
            });
          }
        });
      }

      // นับ Projects (งานที่กำลังทำ/เสร็จแล้ว)
      if (projectsData) {
        projectsData.forEach(p => {
          if (p.status === 'inProgress') {
            active++;
            activeList.push(p);
          } else if (p.status === 'completed') {
            completed++;
            revenue += Number(p.budget || 0); 
          }
        });
      }

      setStats({ pending, active, completed, revenue });
      setNewRequests(pendingList.slice(0, 5)); // โชว์ 5 อันล่าสุด
      setActiveProjects(activeList.slice(0, 4));

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const openAiModal = (req: any) => {
    setSelectedReq(req);
    setIsAiModalOpen(true);
  };

  const handleCreateQuotation = () => {
    setIsAiModalOpen(false); 
    const defaultPrice = selectedReq?.budget ? String(selectedReq.budget) : "45000";
    setQuotePrice(defaultPrice);
    
    setTimeout(() => {
      setIsQuotationModalOpen(true); 
    }, 300);
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      window.print(); 
    }, 1000);
  };

  // Helper สำหรับแปลงชื่อลูกค้า
  const getClientName = (proj: any) => {
    if (!proj.profiles) return "คุณลูกค้า";
    return proj.profiles.company_name ? `${proj.profiles.company_name} (คุณ${proj.profiles.full_name})` : `คุณ${proj.profiles.full_name}`;
  };

  return (
    <div className="flex-1 w-full relative print:bg-white print:block h-screen overflow-hidden flex flex-col bg-zinc-50/50">
      
      {/* ================= เวทมนตร์ CSS ================= */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { background-color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          ::-webkit-scrollbar { display: none; }
        }
      `}} />

      <div className="flex-1 p-4 md:p-8 md:px-10 lg:px-12 w-full max-w-7xl mx-auto space-y-8 overflow-y-auto print:hidden">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">สวัสดี, บอส 👑</h1>
            <p className="text-sm text-zinc-500 mt-1">ภาพรวมของ TidalSync ในวันนี้</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3.5 top-2.5 text-zinc-400" size={16} />
              <input type="text" placeholder="ค้นหา..." className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black transition shadow-sm" />
            </div>
            <button className="p-2.5 bg-white border border-zinc-200 rounded-full relative text-zinc-600 hover:text-black transition shadow-sm shrink-0">
              <Bell size={16} />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-black rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* ================= Stats Cards ================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between h-32">
            <div className="w-8 h-8 bg-zinc-100 text-zinc-900 rounded-full flex items-center justify-center"><Clock size={16} /></div>
            <div>
              <p className="text-[11px] md:text-xs text-zinc-500 font-medium mb-1">รอดำเนินการ (Requests)</p>
              <h3 className="text-2xl md:text-3xl font-black leading-none">{stats.pending}</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between h-32">
            <div className="w-8 h-8 bg-zinc-100 text-zinc-900 rounded-full flex items-center justify-center"><FolderKanban size={16} /></div>
            <div>
              <p className="text-[11px] md:text-xs text-zinc-500 font-medium mb-1">กำลังทำ (Active)</p>
              <h3 className="text-2xl md:text-3xl font-black leading-none">{stats.active}</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between h-32">
            <div className="w-8 h-8 bg-zinc-100 text-zinc-900 rounded-full flex items-center justify-center"><CheckCircle2 size={16} /></div>
            <div>
              <p className="text-[11px] md:text-xs text-zinc-500 font-medium mb-1">เสร็จสิ้น (Completed)</p>
              <h3 className="text-2xl md:text-3xl font-black leading-none">{stats.completed}</h3>
            </div>
          </div>
          <div className="bg-black text-white p-5 rounded-2xl shadow-lg flex flex-col justify-between h-32">
            <div className="w-8 h-8 bg-white/20 text-white rounded-full flex items-center justify-center"><FileText size={16} /></div>
            <div>
              <p className="text-[11px] md:text-xs text-zinc-400 font-medium mb-1">รายได้ (THB)</p>
              <h3 className="text-2xl md:text-3xl font-black leading-none">
                {stats.revenue > 0 ? (stats.revenue >= 1000 ? `${(stats.revenue/1000).toFixed(0)}k` : stats.revenue) : '0'}
              </h3>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-zinc-400" size={32} /></div>
        ) : (
          <>
            {/* ================= Section 1: New Requests ================= */}
            <div>
              <div className="flex justify-between items-end mb-4 px-1">
                <h2 className="text-lg font-bold">คำขอโปรเจกต์ใหม่</h2>
                <Link href="#" className="text-xs font-bold text-zinc-500 hover:text-black transition">ดูทั้งหมด</Link>
              </div>

              {newRequests.length === 0 ? (
                <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center text-zinc-400 text-sm shadow-sm">
                  <FolderKanban size={32} className="mx-auto mb-3 opacity-20" />ไม่มีคำขอโปรเจกต์ใหม่ในขณะนี้
                </div>
              ) : (
                <div className="hidden md:block bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50 text-zinc-500 text-xs font-bold border-b border-zinc-200">
                      <tr>
                        <th className="px-6 py-4">ลูกค้า / แบรนด์</th>
                        <th className="px-6 py-4">ประเภทงาน</th>
                        <th className="px-6 py-4">งบประมาณเบื้องต้น</th>
                        <th className="px-6 py-4 text-center">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {newRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-zinc-50/80 transition">
                          <td className="px-6 py-4">
                            <p className="font-bold text-zinc-900">{getClientName(req)}</p>
                          </td>
                          <td className="px-6 py-4 text-zinc-600 font-medium">{req.type || 'ไม่ระบุ'}</td>
                          <td className="px-6 py-4 font-bold">{req.budget ? `${Number(req.budget).toLocaleString()} ฿` : 'รอปรึกษา'}</td>
                          <td className="px-6 py-4 flex items-center justify-center gap-2">
                            <button onClick={() => openAiModal(req)} className="flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition shadow-md">
                              <Sparkles size={14} /> AI สรุปบรีฟ
                            </button>
                            <button onClick={() => router.push(`/admin/chat/${req.client_id}`)} className="p-2 border border-zinc-200 text-zinc-400 hover:text-black hover:bg-zinc-50 rounded-xl transition">
                              <ChevronRight size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ================= Section 2: Active Projects ================= */}
            <div>
              <div className="flex justify-between items-end mb-4 px-1">
                <h2 className="text-lg font-bold">กำลังดำเนินการ</h2>
                <Link href="/admin/projects" className="text-xs font-bold text-zinc-500 hover:text-black transition">ดูทั้งหมด</Link>
              </div>
              
              {activeProjects.length === 0 ? (
                <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center text-zinc-400 text-sm shadow-sm">
                  ไม่มีโปรเจกต์ที่กำลังดำเนินการ
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
                  {activeProjects.map(proj => (
                    <div key={proj.id} onClick={() => router.push(`/admin/chat/${proj.client_id}`)} className="bg-white p-5 md:p-6 rounded-2xl border border-zinc-200 shadow-sm hover:border-black transition cursor-pointer flex flex-col justify-between h-36 md:h-40">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-zinc-900 leading-tight">{proj.title}</h4>
                          <p className="text-xs text-zinc-500 mt-1">{getClientName(proj)}</p>
                        </div>
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-100">
                          {proj.status_label || 'In Progress'}
                        </span>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex justify-between items-center text-[11px] md:text-xs mb-1.5">
                          <span className="text-zinc-500 font-medium">ความคืบหน้า</span>
                          <span className="font-bold">{proj.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-zinc-100 rounded-full h-1.5">
                          <div className="bg-black h-1.5 rounded-full" style={{ width: `${proj.progress || 0}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ================= Modal 1: AI สรุปบรีฟงาน ================= */}
      <AnimatePresence>
        {isAiModalOpen && selectedReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 print:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAiModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", duration: 0.5 }} className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl shadow-2xl relative z-10">
              <div className="flex justify-between items-center p-5 md:p-6 border-b border-zinc-100 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-black text-white rounded-lg"><Sparkles size={18} /></div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">AI สรุปบรีฟงาน</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">วิเคราะห์จากข้อมูลลูกค้า</p>
                  </div>
                </div>
                <button onClick={() => setIsAiModalOpen(false)} className="p-2 bg-zinc-50 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-full transition"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 border-b border-zinc-200 pb-2 mb-4">ข้อมูลเบื้องต้นจากลูกค้า</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><span className="text-zinc-500">ลูกค้า:</span> <span className="font-medium">{getClientName(selectedReq)}</span></div>
                        <div className="flex justify-between"><span className="text-zinc-500">ประเภท:</span> <span className="font-medium">{selectedReq.type || 'ไม่ระบุ'}</span></div>
                        <div className="flex justify-between"><span className="text-zinc-500">งบประเมิน:</span> <span className="font-medium">{selectedReq.budget ? `${Number(selectedReq.budget).toLocaleString()} ฿` : '-'}</span></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 mb-2">รายละเอียดบรีฟ (Raw Brief)</h4>
                      <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-sm text-zinc-700 leading-relaxed italic whitespace-pre-wrap">
                        {selectedReq.brief || selectedReq.description || "ลูกค้ายังไม่ได้ระบุรายละเอียดเพิ่มเติม"}
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200/60 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <h4 className="text-sm font-bold text-black flex items-center gap-2 mb-5">
                      <BrainCircuit size={16} className="text-zinc-500" /> AI Analysis (ทดสอบ)
                    </h4>
                    <div className="space-y-5">
                      <div>
                        <p className="text-[11px] text-zinc-500 font-medium mb-2 uppercase tracking-wider">🔥 Key Features</p>
                        <ul className="text-sm space-y-1.5 font-medium text-zinc-800">
                          <li className="flex gap-2"><CheckCircle2 size={16} className="text-zinc-400 shrink-0" /> วิเคราะห์ความต้องการหลัก</li>
                          <li className="flex gap-2"><CheckCircle2 size={16} className="text-zinc-400 shrink-0" /> ประเมินความยากของโปรเจกต์</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-6 border-t border-zinc-100 bg-zinc-50 shrink-0 flex justify-end gap-3">
                <button onClick={handleCreateQuotation} className="px-6 py-2.5 bg-black text-white font-medium rounded-full hover:bg-zinc-800 transition shadow-lg shadow-zinc-200 text-sm flex items-center gap-2">
                  <FileSignature size={16} /> สร้างใบเสนอราคา
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= Modal 2: ใบเสนอราคา (โชว์เต็มจอตอน Print) ================= */}
      <AnimatePresence>
        {isQuotationModalOpen && selectedReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 print:static print:block print:p-0 print:m-0 print:z-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsQuotationModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm print:hidden" />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", duration: 0.4 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl relative z-10 print:static print:h-auto print:max-h-none print:shadow-none print:w-full print:max-w-full print:rounded-none print:overflow-visible print:p-10"
            >
              <button onClick={() => setIsQuotationModalOpen(false)} className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-black transition print:hidden z-20"><X size={20} /></button>

              <div className="p-8 md:p-12 print:p-0 min-w-[700px] mx-auto text-zinc-900 font-sans flex flex-col justify-between min-h-full">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-1/3">
                      <h1 className="text-3xl font-extrabold mb-4 tracking-tight">ใบเสนอราคา</h1>
                      <div className="text-xs space-y-1 text-zinc-600 print:text-black">
                        <p>TidalSync Studio</p>
                        <p>Bangkok, TH 10510</p>
                        <p className="mt-2"><span className="font-bold">Email:</span> tidalsync@example.com</p>
                      </div>
                    </div>
                    
                    <div className="w-1/3 flex flex-col items-center justify-start">
                      <Image src="/tidalsynclogo.png" alt="TidalSync Logo" width={140} height={60} className="object-contain mix-blend-multiply mb-2" />
                      <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 print:text-black">Graphic & Dev Studio</p>
                    </div>

                    <div className="w-1/3 text-right text-xs">
                      <div className="mb-4 grid grid-cols-2 gap-x-2 gap-y-1 text-left ml-auto w-fit">
                        <p className="font-bold">No.</p><p className="text-right">QT-{String(new Date().getFullYear()).substring(2)}{String(new Date().getMonth()+1).padStart(2, '0')}-001</p>
                        <p className="font-bold">Date:</p><p className="text-right">{currentDate}</p>
                      </div>
                      <h3 className="text-base font-bold">TidalSync Team</h3>
                      <p className="text-zinc-500 print:text-black">Project Manager</p>
                    </div>
                  </div>

                  <div className="border-t-2 border-dotted border-zinc-300 print:border-black w-full my-6"></div>

                  <div className="flex justify-between items-center text-xs font-bold mb-6">
                    <div className="flex items-center gap-2">
                      <span>ชื่อลูกค้า:</span>
                      <input type="text" defaultValue={getClientName(selectedReq)} className="font-normal border-b border-transparent hover:border-zinc-300 focus:border-black outline-none bg-transparent w-48 print:border-none print:outline-none print:p-0 print:m-0" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span>ชื่องาน:</span>
                      <input type="text" defaultValue={selectedReq.title || `โปรเจกต์ ${selectedReq.type}`} className="font-normal border-b border-transparent hover:border-zinc-300 focus:border-black outline-none bg-transparent w-64 text-right print:border-none print:outline-none print:p-0 print:m-0" />
                    </div>
                  </div>

                  <div className="w-full mb-8">
                    <div className="grid grid-cols-12 gap-2 border-y-2 border-black py-2 text-xs font-bold text-center bg-zinc-50/50 print:bg-zinc-100">
                      <div className="col-span-1">ลำดับ</div><div className="col-span-6 text-left">รายละเอียดงาน</div><div className="col-span-1">จำนวน</div><div className="col-span-2">ราคา/หน่วย</div><div className="col-span-2">รวมเป็นเงิน</div>
                    </div>
                    
                    <div className="grid grid-cols-12 gap-2 py-4 text-xs border-b border-zinc-100 print:border-black">
                      <div className="col-span-1 text-center">1</div>
                      <div className="col-span-6 space-y-1">
                        <input type="text" defaultValue={`พัฒนา ${selectedReq.type || 'ระบบ'}`} className="w-full font-bold outline-none border-b border-transparent focus:border-zinc-200 bg-transparent print:border-none print:outline-none print:p-0" />
                        <textarea 
                          rows={3} 
                          defaultValue={selectedReq.brief || selectedReq.description || "- พัฒนาระบบตามที่ตกลง\n- ส่งมอบ Source Code"}
                          className="w-full outline-none resize-none leading-relaxed text-zinc-600 print:text-black bg-transparent print:border-none print:p-0" 
                        />
                      </div>
                      <div className="col-span-1 text-center">1</div>
                      <div className="col-span-2 flex justify-center items-start">
                        <input type="number" value={quotePrice} onChange={(e) => setQuotePrice(e.target.value)} className="w-20 text-center font-medium outline-none border-b border-transparent hover:border-zinc-300 focus:border-black bg-transparent print:border-none print:outline-none print:p-0" />.-
                      </div>
                      <div className="col-span-2 text-center font-medium">{Number(quotePrice).toLocaleString()}.-</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-start text-xs">
                  <div className="w-3/5 space-y-6">
                    <div>
                      <p className="font-bold mb-2">*เงื่อนไขการชำระเงิน</p>
                      <div className="space-y-2 text-zinc-600 print:text-black leading-relaxed">
                        <p className="flex items-center gap-1">
                          - แบ่งชำระงวดแรก 
                          <select value={depositPercent} onChange={(e) => setDepositPercent(Number(e.target.value))} className="border border-zinc-200 rounded px-1 outline-none font-bold text-black print:appearance-none print:border-none print:p-0 cursor-pointer print:hidden">
                            <option value={30}>30%</option><option value={40}>40%</option><option value={50}>50%</option><option value={100}>100%</option>
                          </select> 
                          <span className="hidden print:inline font-bold text-black">{depositPercent}%</span>
                          เป็นจำนวนเงิน <span className="font-bold text-black">{(Number(quotePrice) * (depositPercent/100)).toLocaleString()}.-</span>
                        </p>
                        <p>- หลังจากเสร็จสิ้นงาน ชำระส่วนที่เหลือ {100-depositPercent}% จำนวน {(Number(quotePrice) * ((100-depositPercent)/100)).toLocaleString()}.-</p>
                      </div>
                    </div>
                    <div>
                      <p className="font-bold mb-1">ข้อมูลบัญชีรับโอน</p>
                      <div className="space-y-1 text-zinc-600 print:text-black">
                        <p>- ชื่อบัญชี: นายนนท์ธวัฒน์ กิตติอภิธนวัฒนา</p>
                        <p>- ธนาคารกสิกรไทย เลขที่บัญชี: 012-3-45678-9</p>
                      </div>
                    </div>
                  </div>

                  <div className="w-2/5 flex flex-col items-end h-full justify-between">
                    <div className="w-full max-w-[220px] flex justify-between items-center bg-zinc-100 print:bg-zinc-100 border-t-2 border-black p-2 md:p-3 font-bold text-sm">
                      <span className="text-zinc-900">ยอดรวมสุทธิ</span>
                      <span className="text-base md:text-lg">{Number(quotePrice).toLocaleString()}.-</span>
                    </div>

                    <div className="w-full flex justify-between mt-12 text-center text-zinc-600 print:text-black">
                      <div className="flex flex-col items-center">
                        <div className="w-24 border-b border-zinc-400 print:border-black mb-2 h-10"></div>
                        <p className="font-bold">ผู้ว่าจ้าง</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-24 border-b border-zinc-400 print:border-black mb-2 h-10 flex items-end justify-center pb-1"></div>
                        <p className="font-bold">TidalSync</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>

            <div className="absolute bottom-6 right-6 flex gap-3 print:hidden z-50">
              <button onClick={handleExportPDF} disabled={isExporting} className="px-5 py-2.5 bg-white border border-zinc-200 text-zinc-700 font-medium rounded-full hover:bg-zinc-50 transition text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl">
                {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Export PDF
              </button>
              <button onClick={() => setIsQuotationModalOpen(false)} className="px-6 py-2.5 bg-black text-white font-medium rounded-full hover:bg-zinc-800 transition shadow-xl shadow-zinc-200/50 text-sm flex items-center justify-center gap-2">
                <Send size={16} /> ส่งให้ลูกค้าเซ็น
              </button>
            </div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, CheckCircle2, Clock, 
  ChevronRight, Bell, Search, FolderKanban, Loader2, MessageSquare, Menu, X, LayoutDashboard, Briefcase, Users, Calendar, Image as ImageIcon
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const router = useRouter();
  
  // ================= States =================
  const [stats, setStats] = useState({ pending: 0, active: 0, completed: 0, revenue: 0 });
  
  const [allNewRequests, setAllNewRequests] = useState<any[]>([]);
  const [allActiveProjects, setAllActiveProjects] = useState<any[]>([]);
  const [displayRequests, setDisplayRequests] = useState<any[]>([]);
  const [displayActive, setDisplayActive] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // 🌟 State สำหรับเมนู "เพิ่มเติม" บนมือถือ
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStatusData = (status: string) => {
    const s = String(status || '').trim().toLowerCase();
    
    if (s.includes('รอประเมินราคา') || s === 'pending' || s === 'new' || s === '') 
      return { group: 'pending', text: 'รอประเมินราคา (New)', color: 'bg-zinc-100 text-zinc-700 border-zinc-200', progress: 0 };
    if (s.includes('รอมัดจำ') || s.includes('deposit')) 
      return { group: 'active', text: 'รอมัดจำ', color: 'bg-orange-50 text-orange-600 border-orange-200', progress: 20 };
    if (s.includes('กำลังพัฒนา') || s === 'inprogress' || s.includes('กำลังทำ')) 
      return { group: 'active', text: 'กำลังพัฒนา (In Progress)', color: 'bg-blue-50 text-blue-600 border-blue-200', progress: 50 };
    if (s.includes('uat') || s.includes('แก้ไขงาน')) 
      return { group: 'active', text: 'UAT / แก้ไขงาน', color: 'bg-purple-50 text-purple-600 border-purple-200', progress: 80 };
    if (s.includes('ส่งมอบแล้ว') || s === 'completed' || s.includes('เสร็จ')) 
      return { group: 'completed', text: 'ส่งมอบแล้ว (Completed)', color: 'bg-green-50 text-green-600 border-green-200', progress: 100 };
    
    return { group: 'pending', text: status || 'รอประเมินราคา (New)', color: 'bg-zinc-100 text-zinc-700 border-zinc-200', progress: 0 };
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const { data: inquiriesData } = await supabase
        .from('inquiries')
        .select(`*, profiles:user_id (full_name, company_name)`)
        .order('created_at', { ascending: false });

      const { data: unreadMsgs } = await supabase
        .from('messages')
        .select('id, project_id, text, created_at, type')
        .eq('is_read', false)
        .eq('sender', 'client')
        .order('created_at', { ascending: false });

      let pending = 0, active = 0, completed = 0, revenue = 0;
      const pendingList: any[] = [];
      const activeList: any[] = [];

      if (inquiriesData) {
        const notifList = (unreadMsgs || []).map(msg => {
          const matchedProj = inquiriesData.find(q => q.id === msg.project_id);
          return {
            ...msg,
            clientName: matchedProj?.profiles?.full_name || 'ลูกค้า',
            projectName: matchedProj?.project_name || 'โปรเจกต์',
          };
        });
        
        setUnreadMessages(notifList);
        setUnreadNotifications(notifList.length);

        inquiriesData.forEach(item => {
          const rawStatus = item.status || 'pending';
          const sData = getStatusData(rawStatus);
          
          const standardizedItem = {
            ...item,
            title: item.project_name || 'โปรเจกต์ไม่มีชื่อ',
            type: item.project_type || 'ไม่ระบุ',
            chat_id: item.id, 
            display_status: sData
          };

          if (sData.group === 'pending') {
            pending++;
            pendingList.push(standardizedItem);
          } else if (sData.group === 'active') {
            active++;
            activeList.push(standardizedItem);
          } else if (sData.group === 'completed') {
            completed++;
            revenue += Number(item.budget || 0); 
          }
        });
      }

      setStats({ pending, active, completed, revenue });
      
      setAllNewRequests(pendingList);
      setAllActiveProjects(activeList);
      
      setDisplayRequests(pendingList.slice(0, 5));
      setDisplayActive(activeList.slice(0, 4));

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setDisplayRequests(allNewRequests.slice(0, 5));
      setDisplayActive(allActiveProjects.slice(0, 4));
      return;
    }

    const query = searchQuery.toLowerCase();

    const filterData = (list: any[]) => {
      return list.filter(item => {
        const clientName = item.profiles?.full_name?.toLowerCase() || '';
        const companyName = item.profiles?.company_name?.toLowerCase() || '';
        const projectName = item.title?.toLowerCase() || '';
        
        return clientName.includes(query) || companyName.includes(query) || projectName.includes(query);
      });
    };

    setDisplayRequests(filterData(allNewRequests));
    setDisplayActive(filterData(allActiveProjects));
  }, [searchQuery, allNewRequests, allActiveProjects]);

  const getClientName = (proj: any) => {
    if (!proj.profiles) return "คุณลูกค้า";
    return proj.profiles.company_name ? `${proj.profiles.company_name} (คุณ${proj.profiles.full_name})` : `คุณ${proj.profiles.full_name}`;
  };

  return (
    <div className="flex-1 w-full h-screen overflow-hidden flex flex-col bg-zinc-50/50 relative pb-20 md:pb-0">
      
      <div className="flex-1 p-4 md:p-8 md:px-10 lg:px-12 w-full max-w-7xl mx-auto space-y-8 overflow-y-auto scrollbar-hide">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
          <div className="flex justify-between w-full md:w-auto items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">สวัสดี</h1>
              <p className="text-sm text-zinc-500 mt-1">ภาพรวมของ TidalSync ในวันนี้</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64 hidden md:block">
              <Search className="absolute left-3.5 top-2.5 text-zinc-400" size={16} />
              <input 
                type="text" 
                placeholder="ค้นหาชื่อลูกค้า, โปรเจกต์..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black transition shadow-sm" 
              />
            </div>
            
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`p-2.5 bg-white border rounded-full relative text-zinc-600 transition shadow-sm shrink-0 hidden md:block ${isNotifOpen ? 'border-black text-black bg-zinc-50' : 'border-zinc-200 hover:text-black'}`}
              >
                <Bell size={16} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white flex items-center justify-center text-[9px] font-bold rounded-full border-2 border-white">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 md:-right-4 mt-3 w-[300px] md:w-96 bg-white border border-zinc-200 shadow-xl rounded-2xl overflow-hidden z-50 hidden md:block"
                  >
                    <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
                      <h3 className="font-bold text-zinc-900 text-sm">การแจ้งเตือนใหม่</h3>
                      <span className="text-[10px] font-bold bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full">{unreadNotifications} ข้อความ</span>
                    </div>
                    <div className="max-h-[350px] overflow-y-auto">
                      {unreadMessages.length === 0 ? (
                        <div className="p-8 text-center text-zinc-400 text-sm">
                          <Bell size={24} className="mx-auto mb-2 opacity-20" />
                          ไม่มีการแจ้งเตือนใหม่ในขณะนี้
                        </div>
                      ) : (
                        <div className="divide-y divide-zinc-50">
                          {unreadMessages.map(msg => (
                            <div 
                              key={msg.id} 
                              onClick={() => { setIsNotifOpen(false); router.push(`/admin/chat/${msg.project_id}`); }}
                              className="p-4 hover:bg-zinc-50 transition cursor-pointer flex gap-3 items-start group"
                            >
                              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-600 group-hover:text-white transition">
                                <MessageSquare size={14} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-0.5">
                                  <p className="text-sm font-bold text-zinc-900 truncate pr-2">{msg.clientName}</p>
                                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5"></div>
                                </div>
                                <p className="text-[11px] font-medium text-zinc-500 truncate mb-1">{msg.projectName}</p>
                                <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                                  {msg.type === 'image' ? '[ส่งรูปภาพ]' : msg.type === 'file' ? '[ส่งไฟล์เอกสาร]' : msg.text}
                                </p>
                                <p className="text-[10px] text-zinc-400 mt-2 font-medium">
                                  {new Date(msg.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="relative w-full md:hidden">
              <Search className="absolute left-3.5 top-2.5 text-zinc-400" size={16} />
              <input 
                type="text" 
                placeholder="ค้นหาชื่อลูกค้า, โปรเจกต์..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black transition shadow-sm" 
              />
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
                <Link href="/admin/projects" className="text-xs font-bold text-zinc-500 hover:text-black transition">ดูทั้งหมด</Link>
              </div>

              {displayRequests.length === 0 ? (
                <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center text-zinc-400 text-sm shadow-sm">
                  <FolderKanban size={32} className="mx-auto mb-3 opacity-20" />
                  {searchQuery ? `ไม่พบข้อมูลที่ตรงกับ "${searchQuery}"` : 'ไม่มีคำขอโปรเจกต์ใหม่ในขณะนี้'}
                </div>
              ) : (
                <div className="hidden md:block bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50 text-zinc-500 text-xs font-bold border-b border-zinc-200">
                      <tr>
                        <th className="px-6 py-4">ลูกค้า / แบรนด์</th>
                        <th className="px-6 py-4">ประเภทงาน</th>
                        <th className="px-6 py-4">สถานะล่าสุด</th>
                        <th className="px-6 py-4 text-center">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {displayRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-zinc-50/80 transition">
                          <td className="px-6 py-4">
                            <p className="font-bold text-zinc-900 leading-tight">{getClientName(req)}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">{req.title}</p>
                          </td>
                          <td className="px-6 py-4 text-zinc-600 font-medium">{req.type}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${req.display_status.color}`}>
                              {req.display_status.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 flex items-center justify-center">
                            <button onClick={() => router.push(`/admin/chat/${req.chat_id}`)} className="flex items-center gap-2 px-5 py-2 bg-black text-white rounded-full text-xs font-bold hover:bg-zinc-800 transition shadow-md">
                              <MessageSquare size={14} /> แชทกับลูกค้า
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
              
              {displayActive.length === 0 ? (
                <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center text-zinc-400 text-sm shadow-sm">
                  {searchQuery ? `ไม่พบข้อมูลที่ตรงกับ "${searchQuery}"` : 'ไม่มีโปรเจกต์ที่กำลังดำเนินการ'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
                  {displayActive.map(proj => (
                    <div key={proj.id} onClick={() => router.push(`/admin/chat/${proj.chat_id}`)} className="bg-white p-5 md:p-6 rounded-2xl border border-zinc-200 shadow-sm hover:border-black transition cursor-pointer flex flex-col justify-between h-36 md:h-40">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-zinc-900 leading-tight">{proj.title}</h4>
                          <p className="text-xs text-zinc-500 mt-1">{getClientName(proj)}</p>
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${proj.display_status.color}`}>
                          {proj.display_status.text}
                        </span>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex justify-between items-center text-[11px] md:text-xs mb-1.5">
                          <span className="text-zinc-500 font-medium">ความคืบหน้า</span>
                          <span className="font-bold">{proj.display_status.progress}%</span>
                        </div>
                        <div className="w-full bg-zinc-100 rounded-full h-1.5">
                          <div className="bg-black h-1.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${proj.display_status.progress}%` }}></div>
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

      {/* 🌟 Bottom Navigation Bar (แสดงเฉพาะบนมือถือ md:hidden) 🌟 */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-zinc-200 flex justify-around items-center py-2 px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
        <Link href="/admin" className="flex flex-col items-center gap-1 p-2 text-black transition w-[20%]">
          <LayoutDashboard size={20} strokeWidth={2.5} />
          <span className="text-[10px] font-bold">ภาพรวม</span>
        </Link>
        <Link href="/admin/projects" className="flex flex-col items-center gap-1 p-2 text-zinc-400 hover:text-black transition w-[20%]">
          <FolderKanban size={20} strokeWidth={2.5} />
          <span className="text-[10px] font-bold">โปรเจค</span>
        </Link>
        
        {/* แชท (ยุบรวมจาก "ข้อความ") */}
        <Link href="#" className="flex flex-col items-center gap-1 p-2 text-zinc-400 hover:text-black transition relative w-[20%]">
           <MessageSquare size={20} strokeWidth={2.5} />
           <span className="text-[10px] font-bold">แชท</span>
           {unreadNotifications > 0 && <span className="absolute top-1 right-[25%] w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
        </Link>

        {/* ลูกค้า (ยุบรวมจาก "ฐานข้อมูลลูกค้า") */}
        <Link href="#" className="flex flex-col items-center gap-1 p-2 text-zinc-400 hover:text-black transition w-[20%]">
          <Users size={20} strokeWidth={2.5} />
          <span className="text-[10px] font-bold">ลูกค้า</span>
        </Link>
        
        {/* 🌟 เมนู เพิ่มเติม (More) เอาไว้เก็บเมนูที่เหลือ 🌟 */}
        <button onClick={() => setIsMobileMoreOpen(true)} className="flex flex-col items-center gap-1 p-2 text-zinc-400 hover:text-black transition w-[20%]">
          <Menu size={20} strokeWidth={2.5} />
          <span className="text-[10px] font-bold">เพิ่มเติม</span>
        </button>
      </div>

      {/* 🌟 Bottom Sheet หน้าต่างเมนู "เพิ่มเติม" (โผล่จากขอบล่างเมื่อกดปุ่ม) 🌟 */}
      <AnimatePresence>
        {isMobileMoreOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => setIsMobileMoreOpen(false)} 
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[50]" 
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }} 
              className="md:hidden fixed bottom-0 left-0 w-full bg-white rounded-t-3xl shadow-2xl z-[60] flex flex-col"
            >
              {/* ขีดตรงกลางให้รู้ว่าลากลงได้ */}
              <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mt-4 mb-2"></div>
              
              <div className="p-6 space-y-2">
                {/* เมนู จัดการผลงาน (ที่ซ่อนไว้) */}
                <Link href="#" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-zinc-50 transition font-bold text-zinc-800 border border-zinc-100">
                   <div className="p-3 bg-zinc-100 text-zinc-700 rounded-xl"><ImageIcon size={20} /></div> 
                   จัดการผลงาน
                </Link>
                {/* เมนู ปฏิทินนัดหมาย (ที่ซ่อนไว้) */}
                <Link href="#" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-zinc-50 transition font-bold text-zinc-800 border border-zinc-100">
                   <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Calendar size={20} /></div> 
                   ปฏิทินนัดหมาย
                </Link>
              </div>
              
              <div className="px-6 pt-2 pb-10">
                <button onClick={() => setIsMobileMoreOpen(false)} className="w-full py-4 bg-zinc-100 text-zinc-700 font-bold rounded-2xl hover:bg-zinc-200 transition">
                  ปิด
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
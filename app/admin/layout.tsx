"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { 
  LayoutDashboard, FolderKanban, Briefcase, Calendar, 
  Users, MessageSquare, Loader2, Menu, LogOut, ShieldCheck // 🌟 1. นำเข้าไอคอน ShieldCheck เพิ่ม
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const checkAdminSession = async () => {
      if (pathname === '/admin/login') {
        setIsAuthorized(true);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/admin/login');
      } else {
        setIsAuthorized(true);
      }
    };
    checkAdminSession();
  }, [router, pathname]);

  useEffect(() => {
    if (!isAuthorized || pathname === '/admin/login') return;

    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .eq('sender', 'client');
      setUnreadCount(count || 0);
    };

    fetchUnreadCount();

    const channel = supabase.channel('global-unread-count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchUnreadCount();
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isAuthorized, pathname]);

  // ================= 🌟 2. ฟังก์ชัน Logout 🌟 =================
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // ล้างค่าแล้วเตะกลับไปหน้า Login
      setIsAuthorized(false);
      router.push('/admin/login');
    } catch (error: any) {
      alert("ออกจากระบบไม่สำเร็จ: " + error.message);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="h-screen w-screen flex flex-col justify-center items-center bg-zinc-50">
        <Loader2 className="animate-spin text-black mb-4" size={32} />
        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Checking Secure Access...</p>
      </div>
    );
  }

  if (pathname === "/admin/login") {
    return <>{children}</>; 
  }

  // ================= 🌟 แยกแยะหน้าจอ 🌟 =================
  const isDashboardHome = pathname === '/admin';
  const isChatInbox = pathname.endsWith('/chat/1') || pathname === '/admin/chat'; 
  const isChatRoom = pathname.includes('/admin/chat') && !isChatInbox; 

  return (
    <div className="min-h-screen bg-zinc-100/50 text-zinc-900 flex flex-col md:flex-row font-sans relative print:bg-white print:block">
      
      {/* Mobile Header */}
      {isDashboardHome && (
        <div className="md:hidden bg-black text-white p-4 flex justify-center items-center sticky top-0 z-50 shadow-md print:hidden">
          <Image src="/tidalsynclogo.png" alt="TidalSync" width={100} height={40} className="brightness-0 invert object-contain w-24" />
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-black text-white flex-col h-screen sticky top-0 shrink-0 z-30 print:hidden shadow-xl">
        <div className="p-8 flex items-center justify-center border-b border-white/10 shrink-0">
          <Image src="/tidalsynclogo.png" alt="TidalSync" width={120} height={40} className="brightness-0 invert w-28" />
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link href="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${pathname === '/admin' ? 'bg-white text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}>
            <LayoutDashboard size={18} /> ภาพรวม
          </Link>
          <Link href="/admin/projects" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${pathname.includes('/admin/projects') ? 'bg-white text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}>
            <FolderKanban size={18} /> โปรเจคทั้งหมด
          </Link>
          <Link href="/admin/portfolio" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${pathname.includes('/admin/portfolio') ? 'bg-white text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}>
            <Briefcase size={18} /> จัดการผลงาน
          </Link>
          <Link href="/admin/calendar" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${pathname.includes('/admin/calendar') ? 'bg-white text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}>
            <Calendar size={18} /> ปฏิทินนัดหมาย
          </Link>
          <Link href="/admin/customers" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${pathname.includes('/admin/customers') ? 'bg-white text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}>
            <Users size={18} /> ฐานข้อมูลลูกค้า
          </Link>
          <Link href="/admin/chat/1" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${pathname.includes('/admin/chat') ? 'bg-white text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}>
            <MessageSquare size={18} /> ข้อความ
            {unreadCount > 0 && (
               <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${pathname.includes('/admin/chat') ? 'bg-black text-white' : 'bg-red-500 text-white'}`}>
                 {unreadCount}
               </span>
            )}
          </Link>
          {/* 🌟 เพิ่มเมนูตั้งค่าความปลอดภัยตรงนี้ 🌟 */}
          <Link href="/admin/security" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${pathname.includes('/admin/security') ? 'bg-white text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}>
            <ShieldCheck size={18} /> ความปลอดภัย
          </Link>
        </nav>

        {/* ปุ่ม Logout ด้านล่างสุดของ Sidebar */}
        <div className="p-4 border-t border-white/10 shrink-0">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      <main className={`flex-1 w-full md:w-auto relative flex flex-col ${isChatRoom ? 'pb-0' : 'pb-[70px] md:pb-0'}`}>
        {children}
      </main>

      {!isChatRoom && (
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-zinc-200 flex justify-around items-center py-2 px-2 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] z-40 pb-safe">
          <Link href="/admin" className={`flex flex-col items-center gap-1 p-2 w-[20%] transition ${pathname === '/admin' ? 'text-black' : 'text-zinc-400 hover:text-black'}`}>
            <LayoutDashboard size={20} strokeWidth={2.5} />
            <span className="text-[10px] font-bold">ภาพรวม</span>
          </Link>
          <Link href="/admin/projects" className={`flex flex-col items-center gap-1 p-2 w-[20%] transition ${pathname.includes('/admin/projects') ? 'text-black' : 'text-zinc-400 hover:text-black'}`}>
            <FolderKanban size={20} strokeWidth={2.5} />
            <span className="text-[10px] font-bold">โปรเจค</span>
          </Link>
          <Link href="/admin/chat/1" className={`flex flex-col items-center gap-1 p-2 relative w-[20%] transition ${pathname.includes('/admin/chat') ? 'text-black' : 'text-zinc-400 hover:text-black'}`}>
             <MessageSquare size={20} strokeWidth={2.5} />
             <span className="text-[10px] font-bold">แชท</span>
             {unreadCount > 0 && <span className="absolute top-1 right-[25%] w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
          </Link>
          <Link href="/admin/customers" className={`flex flex-col items-center gap-1 p-2 w-[20%] transition ${pathname.includes('/admin/customers') ? 'text-black' : 'text-zinc-400 hover:text-black'}`}>
            <Users size={20} strokeWidth={2.5} />
            <span className="text-[10px] font-bold">ลูกค้า</span>
          </Link>
          <button onClick={() => setIsMobileMoreOpen(true)} className="flex flex-col items-center gap-1 p-2 text-zinc-400 hover:text-black transition w-[20%]">
            <Menu size={20} strokeWidth={2.5} />
            <span className="text-[10px] font-bold">เพิ่มเติม</span>
          </button>
        </div>
      )}

      {/* Bottom Sheet สำหรับมือถือ */}
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
              <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mt-4 mb-2"></div>
              
              <div className="p-6 space-y-2">
                <Link href="/admin/portfolio" onClick={() => setIsMobileMoreOpen(false)} className={`flex items-center gap-4 p-4 rounded-2xl transition font-bold border ${pathname.includes('/admin/portfolio') ? 'bg-zinc-50 border-black text-black' : 'hover:bg-zinc-50 border-zinc-100 text-zinc-800'}`}>
                   <div className="p-3 bg-zinc-100 text-zinc-700 rounded-xl"><Briefcase size={20} /></div> 
                   จัดการผลงาน
                </Link>
                <Link href="/admin/calendar" onClick={() => setIsMobileMoreOpen(false)} className={`flex items-center gap-4 p-4 rounded-2xl transition font-bold border ${pathname.includes('/admin/calendar') ? 'bg-orange-50 border-orange-500 text-orange-600' : 'hover:bg-zinc-50 border-zinc-100 text-zinc-800'}`}>
                   <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Calendar size={20} /></div> 
                   ปฏิทินนัดหมาย
                </Link>
                {/* 🌟 เพิ่มปุ่มตั้งค่าความปลอดภัยในมือถือ 🌟 */}
                <Link href="/admin/security" onClick={() => setIsMobileMoreOpen(false)} className={`flex items-center gap-4 p-4 rounded-2xl transition font-bold border ${pathname.includes('/admin/security') ? 'bg-blue-50 border-blue-500 text-blue-600' : 'hover:bg-zinc-50 border-zinc-100 text-zinc-800'}`}>
                   <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><ShieldCheck size={20} /></div> 
                   ความปลอดภัย (2FA)
                </Link>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full gap-4 p-4 rounded-2xl transition font-bold border hover:bg-red-50 border-red-100 text-red-500 mt-4"
                >
                   <div className="p-3 bg-red-50 text-red-500 rounded-xl"><LogOut size={20} /></div> 
                   ออกจากระบบ
                </button>
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
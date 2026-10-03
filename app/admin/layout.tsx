// ไฟล์: app/admin/layout.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, FolderKanban, Briefcase, Calendar, 
  Users, MessageSquare, Menu 
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // ตัวเช็กว่าตอนนี้อยู่หน้า URL ไหน

  return (
    <div className="min-h-screen bg-zinc-100/50 text-zinc-900 flex flex-col md:flex-row font-sans relative print:bg-white print:block">
      
      {/* ================= Mobile Header ================= */}
      <div className="md:hidden bg-black text-white p-4 flex justify-between items-center sticky top-0 z-50 print:hidden">
        <Image src="/tidalsynclogo.png" alt="TidalSync" width={100} height={40} className="brightness-0 invert object-contain w-24" />
        <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition">
          <Menu size={20} />
        </button>
      </div>

      {/* ================= Desktop Sidebar ================= */}
      <aside className="hidden md:flex w-64 bg-black text-white flex-col h-screen sticky top-0 shrink-0 z-30 print:hidden">
        <div className="p-8 flex items-center justify-center border-b border-white/10">
          <Image src="/tidalsynclogo.png" alt="TidalSync" width={120} height={40} className="brightness-0 invert w-28" />
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link href="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${pathname === '/admin' ? 'bg-white text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}>
            <LayoutDashboard size={18} /> ภาพรวม
          </Link>
          
          <Link href="/admin/projects" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${pathname === '/admin/projects' ? 'bg-white text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}>
            <FolderKanban size={18} /> โปรเจคทั้งหมด
          </Link>
          
          <Link href="/admin/portfolio" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${pathname === '/admin/portfolio' ? 'bg-white text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}>
            <Briefcase size={18} /> จัดการผลงาน
          </Link>

          <Link href="/admin/calendar" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${pathname === '/admin/calendar' ? 'bg-white text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}>
            <Calendar size={18} /> ปฏิทินนัดหมาย
          </Link>

          <Link href="/admin/customers" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${pathname === '/admin/customers' ? 'bg-white text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}>
            <Users size={18} /> ฐานข้อมูลลูกค้า
          </Link>
          
          {/* แชทเช็กว่า URL มีคำว่า chat หรือไม่ */}
          <Link href="/admin/chat/1" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${pathname.includes('/admin/chat') ? 'bg-white text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}>
            <MessageSquare size={18} /> ข้อความ
            <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${pathname.includes('/admin/chat') ? 'bg-black text-white' : 'bg-white text-black'}`}>3</span>
          </Link>
        </nav>
      </aside>

      {/* ================= เนื้อหาแต่ละหน้า (ดึงมาจาก page.tsx) ================= */}
      {children}

    </div>
  );
}
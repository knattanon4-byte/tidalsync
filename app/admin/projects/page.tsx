"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Plus, Filter, MoreHorizontal, Clock, CheckCircle2, Users, Calendar, X, Briefcase, DollarSign, AlignLeft
} from "lucide-react";

export default function AdminProjects() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [projects] = useState([
    { id: "P01", title: "ระบบจองคิวออนไลน์", client: "คุณสมชาย", status: "in_progress", progress: 60, due: "20 ก.ย. 2026", budget: "50,000", tags: ["Web App", "Next.js"] },
    { id: "P02", title: "แอปพลิเคชัน N-SIGHT", client: "คุณนัท", status: "pending", progress: 0, due: "รอนัดปรึกษา", budget: "รอประเมิน", tags: ["Mobile App"] },
    { id: "P06", title: "ออกแบบเว็บไซต์บริษัท", client: "บจก. อนาคตไกล", status: "pending", progress: 0, due: "รอประเมิน", budget: "รอประเมิน", tags: ["Web Design"] },
    { id: "P03", title: "Math Tutor Platform", client: "Tutor Center", status: "uat", progress: 85, due: "18 ก.ย. 2026", budget: "85,000", tags: ["Web App", "UI/UX"] },
    { id: "P04", title: "ออกแบบโลโก้ร้านกาแฟ", client: "Cafe Amazon", status: "completed", progress: 100, due: "10 ก.ย. 2026", budget: "15,000", tags: ["Branding"] },
    { id: "P05", title: "เว็บไซต์ E-Commerce", client: "Fashion Shop", status: "in_progress", progress: 30, due: "5 ต.ค. 2026", budget: "120,000", tags: ["E-Commerce"] },
  ]);

  return (
    <div className="flex-1 p-4 md:p-8 md:px-10 w-full max-w-[1600px] mx-auto space-y-6 h-screen overflow-hidden flex flex-col">
      
      {/* Topbar */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">กระดานโปรเจค 📋</h1>
          <p className="text-sm text-zinc-500 mt-1">จัดการและติดตามสถานะงานทั้งหมด</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3.5 top-2.5 text-zinc-400" size={16} />
            <input type="text" placeholder="ค้นหาโปรเจค..." className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-full text-sm font-medium focus:outline-none focus:border-black transition shadow-sm" />
          </div>
          <button className="flex items-center gap-2 p-2 px-4 bg-white border border-zinc-200 rounded-full text-zinc-700 hover:text-black hover:bg-zinc-50 transition shadow-sm text-sm font-medium">
            <Filter size={14} /> ตัวกรอง
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 p-2 px-4 bg-black text-white rounded-full hover:bg-zinc-800 transition shadow-md text-sm font-medium"
          >
            <Plus size={16} /> สร้างโปรเจค
          </button>
        </div>
      </header>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 flex gap-4 md:gap-6 snap-x">
        <KanbanColumn title="รอประเมิน (New)" count={projects.filter(p => p.status === "pending").length} color="border-zinc-300 bg-zinc-50/50">
          {projects.filter(p => p.status === "pending").map(p => <ProjectCard key={p.id} project={p} />)}
        </KanbanColumn>
        <KanbanColumn title="กำลังพัฒนา (In Progress)" count={projects.filter(p => p.status === "in_progress").length} color="border-black">
          {projects.filter(p => p.status === "in_progress").map(p => <ProjectCard key={p.id} project={p} />)}
        </KanbanColumn>
        <KanbanColumn title="รอตรวจ / แก้ไข (UAT)" count={projects.filter(p => p.status === "uat").length} color="border-orange-400">
          {projects.filter(p => p.status === "uat").map(p => <ProjectCard key={p.id} project={p} />)}
        </KanbanColumn>
        <KanbanColumn title="เสร็จสิ้น (Completed)" count={projects.filter(p => p.status === "completed").length} color="border-green-500">
          {projects.filter(p => p.status === "completed").map(p => <ProjectCard key={p.id} project={p} />)}
        </KanbanColumn>
      </div>

      {/* ================= Modal: สร้างโปรเจคใหม่ ================= */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", duration: 0.5 }}
              className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative z-10"
            >
              <div className="flex justify-between items-center p-5 md:p-6 border-b border-zinc-100 sticky top-0 bg-white/90 backdrop-blur z-20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black text-white rounded-lg"><Briefcase size={18} /></div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">สร้างโปรเจคใหม่</h3>
                    <p className="text-[11px] text-zinc-500">เพิ่มโปรเจคเข้าสู่ระบบ Kanban</p>
                  </div>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-full transition"><X size={20} /></button>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">ชื่อโปรเจค <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="เช่น ระบบหลังบ้าน E-Commerce" className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">เลือกลูกค้า (Client) <span className="text-red-500">*</span></label>
                    <select className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black transition cursor-pointer">
                      <option value="">-- เลือกลูกค้าจากระบบ CRM --</option>
                      <option value="C01">คุณสมชาย (คลินิกหมอใจดี)</option>
                      <option value="C02">คุณนัท (N-SIGHT)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">ประเภทงาน (Tags)</label>
                    <select className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black transition cursor-pointer">
                      <option value="Web App">Web Application</option>
                      <option value="Web Design">Web Design</option>
                      <option value="Mobile App">Mobile App</option>
                      <option value="Branding">Branding / Logo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Calendar size={12}/> กำหนดส่ง</label>
                    <input type="date" className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1"><DollarSign size={12}/> งบประมาณ (฿)</label>
                    <input type="number" placeholder="50000" className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black transition" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1"><AlignLeft size={12}/> รายละเอียด / บรีฟเบื้องต้น</label>
                  <textarea rows={4} placeholder="รายละเอียดที่ต้องการให้ทีมงานทราบ..." className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black transition resize-none" />
                </div>

              </div>

              <div className="p-5 border-t border-zinc-100 bg-white flex justify-end gap-3 sticky bottom-0">
                <button onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 text-zinc-600 font-medium rounded-full hover:bg-zinc-100 transition text-sm">ยกเลิก</button>
                <button className="px-8 py-2.5 bg-black text-white font-bold rounded-full hover:bg-zinc-800 transition shadow-lg shadow-zinc-200 text-sm">
                  สร้างโปรเจค
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function KanbanColumn({ title, count, color, children }: { title: string, count: number, color: string, children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-w-[300px] w-[300px] md:min-w-[340px] md:w-[340px] bg-zinc-100/50 rounded-2xl shrink-0 snap-start h-full overflow-hidden">
      <div className={`p-4 border-t-4 ${color} bg-white flex justify-between items-center shrink-0 border-b border-zinc-100`}>
        <h3 className="font-bold text-zinc-800 text-sm flex items-center gap-2">
          {title} <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${count > 0 && title.includes('New') ? 'bg-red-500 text-white animate-pulse' : 'bg-zinc-100 text-zinc-500'}`}>{count}</span>
        </h3>
        <button className="text-zinc-400 hover:text-black"><MoreHorizontal size={16} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 scrollbar-hide">
        {children}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: any }) {
  const router = useRouter();

  return (
    <motion.div 
      onClick={() => router.push(`/admin/projects/${project.id}`)}
      whileHover={{ y: -2 }}
      className={`relative bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition cursor-pointer group flex flex-col gap-3 ${project.status === 'pending' ? 'border-zinc-300' : 'border-zinc-200 hover:border-black'}`}
    >
      {project.status === 'pending' && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-md animate-bounce">
          NEW REQUEST
        </span>
      )}

      <div className="flex justify-between items-start">
        <div className="flex flex-wrap gap-1 mb-1">
          {project.tags.map((tag: string, index: number) => (
            <span key={index} className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider ${project.status === 'pending' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
              {tag}
            </span>
          ))}
        </div>
        <span className="text-[10px] font-bold text-zinc-400">#{project.id}</span>
      </div>

      <div>
        <h4 className="font-bold text-zinc-900 leading-tight group-hover:text-blue-600 transition pr-4">{project.title}</h4>
        <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1.5"><Users size={12}/> {project.client}</p>
      </div>

      <div className="pt-2 border-t border-zinc-100">
        <div className="flex justify-between items-center text-[10px] mb-1.5 font-medium">
          <span className={`flex items-center gap-1 ${project.status === 'pending' ? 'text-orange-500 font-bold' : 'text-zinc-500'}`}>
            {project.status === 'pending' ? <Calendar size={12}/> : <Clock size={12}/>} 
            {project.due}
          </span>
          <span className="text-black font-bold">{project.progress}%</span>
        </div>
        <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-1.5 rounded-full ${project.progress === 100 ? 'bg-green-500' : project.progress === 0 ? 'bg-zinc-300' : 'bg-black'}`} 
            style={{ width: project.progress === 0 ? '100%' : `${project.progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <span className="text-xs font-bold text-zinc-800">{project.budget} {project.budget !== 'รอประเมิน' && '฿'}</span>
        {project.progress === 100 && <CheckCircle2 size={16} className="text-green-500" />}
      </div>
    </motion.div>
  );
}
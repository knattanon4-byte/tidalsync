"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Plus, Filter, MoreHorizontal, Clock, CheckCircle2, Users, Calendar, X, Briefcase, DollarSign, AlignLeft, Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminProjects() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // ================= States สำหรับข้อมูล Database =================
  const [projects, setProjects] = useState<any[]>([]);
  const [clientList, setClientList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // ================= State ฟอร์มสร้างโปรเจกต์ =================
  const [newProject, setNewProject] = useState({
    title: "",
    client_id: "",
    type: "Web Application",
    budget: "",
    due_date: "",
    description: "",
    status: "pending",
    progress: 0
  });

  // ================= ดึงข้อมูลจาก Database =================
  const fetchClients = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('id, full_name, company_name');
      if (data && !error) setClientList(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      // 🌟 แก้ไข: ดึงข้อมูลจากตาราง inquiries (ตารางหลักที่เก็บคำขอโปรเจกต์)
      const { data, error } = await supabase
        .from('inquiries')
        .select(`
          *,
          profiles:user_id (full_name, company_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchProjects();
  }, []);

  // Helper สำหรับแปลงชื่อลูกค้า
  const getClientName = (proj: any) => {
    if (!proj.profiles) return "คุณลูกค้า";
    return proj.profiles.company_name ? `${proj.profiles.company_name} (คุณ${proj.profiles.full_name})` : `คุณ${proj.profiles.full_name}`;
  };

  // ================= ฟังก์ชันสร้างโปรเจกต์ =================
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      // 🌟 แก้ไข: บันทึกข้อมูลลงตาราง inquiries และจับคู่คอลัมน์ให้ถูกต้อง
      const { error } = await supabase
        .from('inquiries')
        .insert([{
          project_name: newProject.title,
          user_id: newProject.client_id, // ใช้ user_id ตามตาราง inquiries
          project_type: newProject.type,
          budget: newProject.budget ? Number(newProject.budget) : 0,
          brief: newProject.description, // ใช้ brief ตามหน้าแชท
          status: newProject.status,
          progress: newProject.progress,
          due_date: newProject.due_date
        }]);

      if (error) throw error;
      
      setIsAddModalOpen(false);
      setNewProject({ title: "", client_id: "", type: "Web Application", budget: "", due_date: "", description: "", status: "pending", progress: 0 });
      fetchProjects(); // โหลดข้อมูลใหม่ให้ขึ้นบนบอร์ดทันที

    } catch (error: any) {
      alert("สร้างโปรเจกต์ไม่สำเร็จ: " + error.message);
    } finally {
      setIsCreating(false);
    }
  };

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
        {isLoading ? (
          <div className="w-full flex justify-center items-center"><Loader2 className="animate-spin text-zinc-400" size={32}/></div>
        ) : (
          <>
            <KanbanColumn title="รอประเมิน (New)" count={projects.filter(p => !p.status || p.status === "pending").length} color="border-zinc-300 bg-zinc-50/50">
              {projects.filter(p => !p.status || p.status === "pending").map(p => <ProjectCard key={p.id} project={p} getClientName={getClientName} />)}
            </KanbanColumn>
            <KanbanColumn title="กำลังพัฒนา (In Progress)" count={projects.filter(p => p.status === "inProgress").length} color="border-black">
              {projects.filter(p => p.status === "inProgress").map(p => <ProjectCard key={p.id} project={p} getClientName={getClientName} />)}
            </KanbanColumn>
            <KanbanColumn title="รอตรวจ / แก้ไข (UAT)" count={projects.filter(p => p.status === "uat").length} color="border-orange-400">
              {projects.filter(p => p.status === "uat").map(p => <ProjectCard key={p.id} project={p} getClientName={getClientName} />)}
            </KanbanColumn>
            <KanbanColumn title="เสร็จสิ้น (Completed)" count={projects.filter(p => p.status === "completed").length} color="border-green-500">
              {projects.filter(p => p.status === "completed").map(p => <ProjectCard key={p.id} project={p} getClientName={getClientName} />)}
            </KanbanColumn>
          </>
        )}
      </div>

      {/* ================= Modal: สร้างโปรเจคใหม่ ================= */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", duration: 0.5 }}
              className="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl relative z-10"
            >
              <div className="flex justify-between items-center p-5 md:p-6 border-b border-zinc-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black text-white rounded-lg"><Briefcase size={18} /></div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">สร้างโปรเจคใหม่</h3>
                    <p className="text-[11px] text-zinc-500">เพิ่มโปรเจคเข้าสู่ระบบ Kanban</p>
                  </div>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-full transition"><X size={20} /></button>
              </div>

              <form onSubmit={handleCreateProject} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">ชื่อโปรเจค <span className="text-red-500">*</span></label>
                    <input type="text" required value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} placeholder="เช่น ระบบหลังบ้าน E-Commerce" className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">เลือกลูกค้า (Client) <span className="text-red-500">*</span></label>
                    <select required value={newProject.client_id} onChange={e => setNewProject({...newProject, client_id: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black transition cursor-pointer">
                      <option value="" disabled>-- เลือกลูกค้าจากระบบ CRM --</option>
                      {clientList.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.company_name ? `${client.company_name} (คุณ${client.full_name})` : `คุณ${client.full_name}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">ประเภทงาน</label>
                    <select value={newProject.type} onChange={e => setNewProject({...newProject, type: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black transition cursor-pointer">
                      <option value="Web Application">Web Application</option>
                      <option value="Web Design">Web Design</option>
                      <option value="Mobile App">Mobile App</option>
                      <option value="Branding">Branding / Logo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Calendar size={12}/> กำหนดส่ง (ถ้ามี)</label>
                    <input type="date" value={newProject.due_date} onChange={e => setNewProject({...newProject, due_date: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1"><DollarSign size={12}/> งบประมาณ (฿)</label>
                    <input type="number" value={newProject.budget} onChange={e => setNewProject({...newProject, budget: e.target.value})} placeholder="50000" className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black transition" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1"><AlignLeft size={12}/> รายละเอียด / บรีฟเบื้องต้น</label>
                  <textarea value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} rows={4} placeholder="รายละเอียดที่ต้องการให้ทีมงานทราบ..." className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black transition resize-none" />
                </div>

                <div className="p-5 border-t border-zinc-100 bg-white flex justify-end gap-3 sticky bottom-0 mt-6 -mx-6 md:-mx-8">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 text-zinc-600 font-medium rounded-full hover:bg-zinc-100 transition text-sm">ยกเลิก</button>
                  <button type="submit" disabled={isCreating} className="px-8 py-2.5 bg-black text-white font-bold rounded-full hover:bg-zinc-800 transition shadow-lg shadow-zinc-200 text-sm flex items-center gap-2">
                    {isCreating && <Loader2 size={16} className="animate-spin" />}
                    สร้างโปรเจค
                  </button>
                </div>
              </form>
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

function ProjectCard({ project, getClientName }: { project: any, getClientName: Function }) {
  const router = useRouter();
  
  // แปลง tag ตามประเภทงาน
  const getTagColor = (type: string) => {
    if(type?.includes('Design')) return 'bg-purple-100 text-purple-700';
    if(type?.includes('Mobile')) return 'bg-blue-100 text-blue-700';
    if(type?.includes('Brand')) return 'bg-orange-100 text-orange-700';
    return 'bg-zinc-100 text-zinc-700';
  };

  return (
    <motion.div 
      // 🌟 แก้ไข: ให้กดแล้วเด้งไปที่ /admin/chat/รหัสโปรเจกต์ (project.id) แทนที่จะเป็น client_id
      onClick={() => router.push(`/admin/chat/${project.id}`)}
      whileHover={{ y: -2 }}
      className={`relative bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition cursor-pointer group flex flex-col gap-3 ${!project.status || project.status === 'pending' ? 'border-zinc-300' : 'border-zinc-200 hover:border-black'}`}
    >
      {(!project.status || project.status === 'pending') && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-md animate-bounce">
          NEW REQUEST
        </span>
      )}

      <div className="flex justify-between items-start">
        <div className="flex flex-wrap gap-1 mb-1">
            {/* 🌟 แก้ไข: แมปปิ้งตัวแปร project.project_type */}
            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider ${getTagColor(project.project_type)}`}>
              {project.project_type || 'Project'}
            </span>
        </div>
      </div>

      <div>
        {/* 🌟 แก้ไข: แมปปิ้งตัวแปร project.project_name */}
        <h4 className="font-bold text-zinc-900 leading-tight group-hover:text-blue-600 transition pr-4">{project.project_name}</h4>
        <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1.5"><Users size={12}/> {getClientName(project)}</p>
      </div>

      <div className="pt-2 border-t border-zinc-100">
        <div className="flex justify-between items-center text-[10px] mb-1.5 font-medium">
          <span className={`flex items-center gap-1 ${!project.status || project.status === 'pending' ? 'text-orange-500 font-bold' : 'text-zinc-500'}`}>
            {!project.status || project.status === 'pending' ? <Calendar size={12}/> : <Clock size={12}/>} 
            {project.due_date || 'รอประเมิน'}
          </span>
          <span className="text-black font-bold">{project.progress || 0}%</span>
        </div>
        <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-1.5 rounded-full ${project.progress === 100 ? 'bg-green-500' : project.progress === 0 || !project.progress ? 'bg-zinc-300' : 'bg-black'}`} 
            style={{ width: project.progress === 0 || !project.progress ? '100%' : `${project.progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <span className="text-xs font-bold text-zinc-800">
          {project.budget ? `${Number(project.budget).toLocaleString()} ฿` : 'รอประเมิน'}
        </span>
        {project.progress === 100 && <CheckCircle2 size={16} className="text-green-500" />}
      </div>
    </motion.div>
  );
}
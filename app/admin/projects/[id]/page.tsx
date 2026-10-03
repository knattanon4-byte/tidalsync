"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Clock, CheckCircle2, User, Building, Phone, Mail, 
  FileText, FileSignature, Download, Milestone, CheckSquare, Square, ExternalLink, Calendar
} from "lucide-react";

export default function ProjectDetail() {
  const params = useParams();
  const projectId = params.id as string;

  // จำลองข้อมูลให้เปลี่ยนไปตาม ID ที่กดเข้ามา (เช่น P02 จะเป็นอีกงานนึง)
  const project = {
    id: projectId,
    title: projectId === "P02" ? "แอปพลิเคชัน N-SIGHT" : "ระบบจองคิวออนไลน์",
    clientName: projectId === "P02" ? "คุณนัท" : "คุณสมชาย",
    company: projectId === "P02" ? "N-SIGHT" : "คลินิกหมอใจดี",
    phone: "081-234-5678",
    email: "client@email.com",
    status: projectId === "P02" ? "Pending" : "In Progress",
    progress: projectId === "P02" ? 0 : 60,
    dueDate: projectId === "P02" ? "รอประเมิน" : "20 ก.ย. 2026",
    budget: projectId === "P02" ? "รอประเมิน" : "50,000",
    brief: "รายละเอียดบรีฟงานของลูกค้ารายนี้...",
    tasks: [
      { id: 1, title: "สรุป Requirement & รับมัดจำ", completed: true },
      { id: 2, title: "ออกแบบ UI/UX (Figma)", completed: projectId !== "P02" },
      { id: 3, title: "พัฒนาระบบ Frontend (หน้าบ้าน)", completed: false },
      { id: 4, title: "พัฒนาระบบ Backend & Database", completed: false },
    ],
    documents: {
      quotation: { id: `QT-2026-${projectId}`, status: "Approved" },
      contract: { id: `CT-2026-${projectId}`, status: "Signed" }
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 md:px-10 w-full max-w-[1600px] mx-auto space-y-6 h-screen overflow-y-auto bg-zinc-50/50">
      
      {/* ================= Header ================= */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link href="/admin/projects" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-black transition mb-3">
            <ArrowLeft size={14} /> กลับไปหน้ากระดานโปรเจค
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{project.title}</h1>
            <span className="px-3 py-1 bg-black text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
              {project.status}
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-1">รหัสโปรเจค: #{project.id}</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/admin/chat/1`} className="px-5 py-2.5 bg-white border border-zinc-200 text-zinc-700 font-bold rounded-full hover:bg-zinc-50 transition text-sm shadow-sm flex items-center gap-2">
            คุยกับลูกค้า
          </Link>
          <button className="px-5 py-2.5 bg-black text-white font-bold rounded-full hover:bg-zinc-800 transition shadow-md text-sm">
            แก้ไขโปรเจค
          </button>
        </div>
      </header>

      {/* ================= Layout แบบ 2 คอลัมน์ ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* คอลัมน์ซ้าย: ความคืบหน้า & บรีฟงาน */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2"><Milestone size={18} className="text-blue-500"/> ความคืบหน้างาน</h3>
                <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5"><Calendar size={12}/> กำหนดส่ง: {project.dueDate}</p>
              </div>
              <span className="text-3xl font-black">{project.progress}%</span>
            </div>
            <div className="w-full bg-zinc-100 rounded-full h-3 mb-6 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${project.progress}%` }} transition={{ duration: 1 }} className="bg-black h-3 rounded-full" />
            </div>
            <div className="space-y-3">
              {project.tasks.map((task) => (
                <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl border ${task.completed ? 'bg-zinc-50 border-zinc-100' : 'bg-white border-zinc-200'}`}>
                  {task.completed ? <CheckSquare size={18} className="text-black" /> : <Square size={18} className="text-zinc-300" />}
                  <span className={`text-sm font-medium ${task.completed ? 'line-through text-zinc-400' : 'text-zinc-800'}`}>{task.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <h3 className="font-bold text-lg mb-4">รายละเอียด & บรีฟงาน</h3>
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-sm text-zinc-700 leading-relaxed">
              {project.brief}
            </div>
          </div>
        </div>

        {/* คอลัมน์ขวา: ข้อมูลลูกค้า & เอกสารสำคัญ */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><User size={18} className="text-orange-500"/> ข้อมูลลูกค้า</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-xl text-zinc-400 shrink-0">
                  {project.clientName.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-zinc-900">{project.clientName}</p>
                  <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5"><Building size={12}/> {project.company}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-zinc-100 space-y-3">
                <p className="flex items-center gap-2 text-zinc-600"><Phone size={14} className="text-zinc-400"/> {project.phone}</p>
                <p className="flex items-center gap-2 text-zinc-600"><Mail size={14} className="text-zinc-400"/> {project.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><FileText size={18} className="text-green-500"/> เอกสารสำคัญ</h3>
            <div className="space-y-3">
              <div className="p-4 border border-zinc-200 rounded-xl hover:border-black transition group cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-zinc-900"><FileText size={16} className="text-blue-500"/> ใบเสนอราคา</div>
                </div>
                <p className="text-xs text-zinc-500 mb-3">รหัส: {project.documents.quotation.id}</p>
              </div>
              <div className="p-4 border border-zinc-200 rounded-xl hover:border-black transition group cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-zinc-900"><FileSignature size={16} className="text-purple-500"/> สัญญาจ้าง</div>
                </div>
                <p className="text-xs text-zinc-500 mb-3">รหัส: {project.documents.contract.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
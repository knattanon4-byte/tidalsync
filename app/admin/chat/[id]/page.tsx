"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Paperclip, Send, MoreVertical, FileText, 
  CheckCircle2, Search, Sparkles, FileSignature, 
  X, Milestone, Plus, Trash2, CheckSquare, Square, ChevronRight,
  PenTool, Download, Printer, Loader2, FileCheck2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminChatRoom() { // 🌟 2. เอา params ในวงเล็บออกไปเลย
  const router = useRouter();
  const params = useParams(); // 🌟 3. เรียกใช้ useParams ตรงนี้
  const projectId = params.id as string; // ใช้ project id จาก URL เป็นห้องแชทหลัก

  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ================= States (Database) =================
  const [chatInbox, setChatInbox] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [projectData, setProjectData] = useState<any | null>(null); // ข้อมูลลูกค้าและโปรเจกต์ที่กำลังคุยด้วย
  const [isLoading, setIsLoading] = useState(true);

  // ================= States (Modals & UI) =================
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const currentDate = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });

  // 🌟 (TODO) อันนี้อนาคตค่อยผูก Database ส่วน Task ผมเก็บ State เดิมไว้ให้ก่อน
  const [tasks, setTasks] = useState([
    { id: 1, title: "บรีฟงาน & ชำระมัดจำ", completed: true },
    { id: 2, title: "ออกแบบ UI/UX (Figma)", completed: true },
    { id: 3, title: "พัฒนาระบบ Frontend (หน้าบ้าน)", completed: false },
    { id: 4, title: "พัฒนาระบบ Backend & Database", completed: false },
    { id: 5, title: "ทดสอบระบบ (UAT)", completed: false },
  ]);
  const [tempTasks, setTempTasks] = useState([...tasks]);
  const [newTaskInput, setNewTaskInput] = useState("");
  const [isSendNotification, setIsSendNotification] = useState(true);
  const [overallStatus, setOverallStatus] = useState("กำลังพัฒนา");

  const calculateProgress = (taskList: any[]) => {
    if (taskList.length === 0) return 0;
    const completedCount = taskList.filter(t => t.completed).length;
    return Math.round((completedCount / taskList.length) * 100);
  };
  const currentProgress = calculateProgress(tasks);

  // ================= 🌟 ดึงข้อมูลจาก Database 🌟 =================
  const fetchInbox = async () => {
    try {
      // ดึงรายชื่อลูกค้าที่เคยคุย (ตอนนี้จำลองดึงจาก profiles ก่อน ในอนาคตควรมีตาราง projects หลัก)
      const { data, error } = await supabase.from('profiles').select('id, full_name, company_name');
      if (error) throw error;
      if (data) setChatInbox(data);
    } catch (error) {
      console.error("Error fetching inbox:", error);
    }
  };

  const fetchChatData = async () => {
    setIsLoading(true);
    try {
      // 1. ดึงข้อมูลว่ากำลังคุยกับใคร (ดึงโปรไฟล์ลูกค้าตาม ID)
      const { data: profile, error: profileErr } = await supabase.from('profiles').select('*').eq('id', projectId).single();
      if (!profileErr && profile) setProjectData(profile);

      // 2. ดึงข้อความแชทของห้องนี้
      const { data: msgs, error: msgsErr } = await supabase
        .from('messages')
        .select('*')
        .eq('project_id', projectId) // 🌟 ต้องมีคอลัมน์ project_id ในตาราง messages ด้วยนะครับ
        .order('created_at', { ascending: true });
      
      if (msgsErr) throw msgsErr;
      if (msgs) setMessages(msgs);

    } catch (error) {
      console.error("Error fetching chat data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
    if (projectId) fetchChatData();
  }, [projectId]);

  // ================= 🌟 Real-time Subscription 🌟 =================
  useEffect(() => {
    if (!projectId) return;
    const channel = supabase.channel(`room:${projectId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `project_id=eq.${projectId}` }, 
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [projectId]);

  // เลื่อนลงล่างสุด
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  // ================= 🌟 ส่งข้อความเข้า Database 🌟 =================
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const textToSend = newMessage;
    setNewMessage(""); // ล้างช่องพิมพ์ทันทีให้รู้สึกเร็ว

    try {
      const { error } = await supabase.from('messages').insert([{
        project_id: projectId,
        sender: 'admin',
        text: textToSend,
        type: 'text'
      }]);
      if (error) throw error;
    } catch (error) {
      console.error("Error sending message:", error);
      alert("ส่งข้อความไม่สำเร็จ");
    }
  };

  // ================= 🌟 ระบบส่งสัญญาเข้าแชท 🌟 =================
  const handleSendContractToChat = async () => {
    setIsContractModalOpen(false);
    try {
      // ส่ง 2 ข้อความติดกัน (ข้อความเกริ่น + ไฟล์สัญญา)
      await supabase.from('messages').insert([
        { project_id: projectId, sender: 'admin', type: 'text', text: "📄 สัญญาจ้างพัฒนาซอฟต์แวร์ TidalSync พร้อมแล้วครับ รบกวนคุณลูกค้าตรวจสอบและเซ็นชื่อออนไลน์ผ่านลิงก์ด้านล่างได้เลยครับ" },
        { project_id: projectId, sender: 'admin', type: 'file', text: "🔗 e-Sign: Contract_CT-2026-001", file_size: "Secure Link" } // 🌟 สร้างคอลัมน์ file_size ในตาราง messages ไว้ด้วยนะครับ
      ]);
    } catch (error) {
      console.error("Error sending contract:", error);
    }
  };

  // ================= UI Handlers (เหมือนเดิม) =================
  const handleAddTask = () => {
    if (!newTaskInput.trim()) return;
    setTempTasks([...tempTasks, { id: Date.now(), title: newTaskInput, completed: false }]);
    setNewTaskInput("");
  };
  const handleDeleteTask = (id: number) => setTempTasks(tempTasks.filter(t => t.id !== id));
  const handleToggleTask = (id: number) => setTempTasks(tempTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));

  const handleSaveTimeline = async () => {
    const newlyCompleted = tempTasks.filter(temp => temp.completed && !tasks.find(t => t.id === temp.id)?.completed);
    setTasks(tempTasks);
    setIsTimelineModalOpen(false);

    if (isSendNotification && newlyCompleted.length > 0) {
      const newProgress = calculateProgress(tempTasks);
      const completedTitles = newlyCompleted.map(t => `✅ ${t.title}`).join('\n');
      const updateMsg = `🔔 อัปเดตความคืบหน้าโปรเจค (รวม ${newProgress}%):\n${completedTitles}`;
      
      // ส่งข้อความแจ้งเตือนอัตโนมัติเข้า Database
      await supabase.from('messages').insert([{
        project_id: projectId,
        sender: 'system', // ส่งในนามระบบ
        text: updateMsg,
        type: 'text'
      }]);
    }
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => { setIsExporting(false); window.print(); }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-screen overflow-hidden bg-zinc-50 relative print:bg-white print:block">
      
      {/* เวทมนตร์ CSS บังคับหน้ากระดาษ A4 */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { background-color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          ::-webkit-scrollbar { display: none; }
        }
      `}} />

      {/* ================= 2. แผง Inbox (แชทรวม) ================= */}
      <aside className="hidden md:flex w-72 bg-white flex-col border-r border-zinc-200 h-screen shrink-0 z-20 print:hidden">
        <div className="p-4 border-b border-zinc-100 flex items-center bg-zinc-50">
          <h2 className="font-bold text-sm text-zinc-800">Inbox</h2>
        </div>
        <div className="p-4 border-b border-zinc-100">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-zinc-400" size={16} />
            <input type="text" placeholder="ค้นหาชื่อลูกค้า..." className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black transition" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chatInbox.map((chat) => {
            const isActive = chat.id === projectId;
            return (
              <Link key={chat.id} href={`/admin/chat/${chat.id}`} className={`flex items-start gap-3 p-4 border-b border-zinc-50 hover:bg-zinc-50 transition cursor-pointer ${isActive ? 'bg-zinc-50 border-l-4 border-l-black' : 'border-l-4 border-l-transparent'}`}>
                <div className="w-10 h-10 rounded-full bg-zinc-200 shrink-0 flex items-center justify-center font-bold text-zinc-500">{chat.full_name?.charAt(0) || '?'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="text-sm font-bold text-zinc-900 truncate">{chat.full_name}</h4>
                  </div>
                  <p className="text-xs text-zinc-500 truncate mb-1">{chat.company_name || 'บุคคลทั่วไป'}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </aside>

      {/* ================= 3. ห้องแชท ================= */}
      <section className="flex-1 flex flex-col h-full relative bg-zinc-50/50 print:hidden">
        <header className="bg-white px-4 py-4 border-b border-zinc-200 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-black transition"><ArrowLeft size={20} /></Link>
            <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-zinc-500">
              {projectData?.full_name?.charAt(0) || '?'}
            </div>
            <div>
              <h1 className="text-base font-bold text-zinc-900 leading-tight">
                {projectData?.full_name || 'Loading...'} {projectData?.company_name ? `(${projectData.company_name})` : ''}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <p className="text-[10px] md:text-xs text-zinc-500 font-medium">ออนไลน์</p>
              </div>
            </div>
          </div>
          <button className="p-2 text-zinc-400 hover:text-black transition rounded-full hover:bg-zinc-100"><MoreVertical size={20} /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <div className="text-center mb-8">
            <span className="text-[10px] font-bold bg-zinc-200 text-zinc-500 px-3 py-1 rounded-full uppercase tracking-wider">แชทโปรเจกต์</span>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-zinc-400" size={24} /></div>
          ) : messages.length === 0 ? (
            <div className="text-center text-zinc-400 text-sm mt-10">ยังไม่มีข้อความ เริ่มต้นทักทายลูกค้าได้เลยครับ</div>
          ) : (
            messages.map((msg) => {
              const isAdmin = msg.sender === "admin";
              const isSystem = msg.sender === "system";
              
              // 🌟 แสดงข้อความแจ้งเตือนระบบ
              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center w-full my-4">
                     <div className="bg-zinc-200/50 text-zinc-500 text-[11px] font-bold px-4 py-2 rounded-full whitespace-pre-wrap text-center max-w-[80%] border border-zinc-200">
                        {msg.text}
                     </div>
                  </div>
                );
              }

              // แสดงข้อความปกติ
              const timeString = new Date(msg.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
              
              return (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex w-full ${isAdmin ? "justify-end" : "justify-start"}`}>
                  <div className={`flex max-w-[85%] md:max-w-[70%] gap-2 md:gap-3 ${isAdmin ? "flex-row-reverse" : "flex-row"}`}>
                    <div className="shrink-0 mt-auto">
                      {isAdmin ? (
                        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shadow-sm"><Image src="/tidalsynclogo.png" alt="Admin" width={20} height={20} className="brightness-0 invert" /></div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center border border-zinc-300 font-bold text-zinc-500 text-xs">{projectData?.full_name?.charAt(0) || 'ค'}</div>
                      )}
                    </div>
                    <div className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}>
                      {msg.type === "text" || !msg.type ? (
                        <div className={`px-4 py-3 rounded-2xl text-[14px] md:text-[15px] shadow-sm whitespace-pre-wrap ${isAdmin ? "bg-black text-white rounded-br-sm" : "bg-white border border-zinc-200 text-zinc-800 rounded-bl-sm"}`}>
                          {msg.text}
                        </div>
                      ) : (
                        <div className={`flex items-center gap-3 p-3 md:p-4 rounded-2xl border cursor-pointer transition shadow-sm ${isAdmin ? "bg-white border-zinc-200 text-zinc-800 rounded-br-sm hover:bg-zinc-50" : "bg-white border-zinc-200 text-zinc-800 rounded-bl-sm hover:bg-zinc-50"}`}>
                          <div className={`p-2.5 rounded-xl ${msg.file_size === 'Secure Link' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                            {msg.file_size === 'Secure Link' ? <FileCheck2 size={20} /> : <FileText size={20} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold truncate max-w-[180px] md:max-w-[250px]">{msg.text}</p>
                            <p className="text-xs mt-0.5 text-zinc-500">{msg.file_size || 'File'}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-zinc-400 font-medium px-1">
                        {timeString} {isAdmin && <CheckCircle2 size={12} className="text-blue-500" />}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-zinc-200">
          <form onSubmit={handleSendMessage} className="relative flex items-end gap-2">
            <button type="button" className="p-3 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-full transition shrink-0"><Paperclip size={20} /></button>
            <div className="flex-1 relative">
              <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }} placeholder="พิมพ์ข้อความตอบกลับลูกค้า..." className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-4 pr-12 py-3.5 text-sm focus:outline-none focus:border-black transition resize-none max-h-[120px]" rows={1} />
              <button type="submit" disabled={!newMessage.trim()} className="absolute right-2 bottom-2 p-2 bg-black text-white rounded-full hover:bg-zinc-800 transition disabled:opacity-50 shadow-md"><Send size={16} className="ml-0.5" /></button>
            </div>
          </form>
        </div>
      </section>

      {/* ================= 4. แผงควบคุมโปรเจค (ขวาสุด) ================= */}
      <aside className="hidden xl:flex w-80 bg-white flex-col border-l border-zinc-200 h-full shrink-0 overflow-y-auto z-20 print:hidden">
        <div className="p-6 border-b border-zinc-100">
          <h3 className="font-bold text-lg">แผงควบคุม (Quick Actions)</h3>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-500">ประเภทงาน</span>
              <span className="font-bold text-black">Web App</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-500">งบประมาณ</span>
              <span className="font-bold text-black">50,000 ฿</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-500">ป้ายกำกับ</span>
              <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-100">{overallStatus}</span>
            </div>
            
            <div className="pt-3 mt-1 border-t border-zinc-200/60">
              <div className="flex justify-between items-center text-[11px] mb-2 font-medium">
                <span className="text-zinc-500">ความคืบหน้างาน</span>
                <span className="text-black font-bold">{currentProgress}%</span>
              </div>
              <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden relative">
                <motion.div 
                  className="bg-black h-full rounded-full absolute left-0 top-0" 
                  initial={{ width: `${currentProgress}%` }} animate={{ width: `${currentProgress}%` }} transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">เครื่องมือแอดมิน</p>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-purple-100 bg-purple-50 text-purple-700 hover:bg-purple-100 transition shadow-sm font-bold text-sm text-left">
                <Sparkles size={18} /> สรุปบรีฟด้วย AI
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-zinc-200 hover:border-black bg-white transition shadow-sm font-bold text-sm text-left">
                <FileSignature size={18} /> สร้างใบเสนอราคา
              </button>
              <button onClick={() => setIsContractModalOpen(true)} className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-black bg-black text-white hover:bg-zinc-800 transition shadow-md font-bold text-sm text-left">
                <PenTool size={18} /> สร้างสัญญาจ้าง (Contract)
              </button>
            </div>
          </div>

          <div>
             <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">จัดการงาน (Tasks)</p>
             <button 
                onClick={() => { setTempTasks([...tasks]); setIsTimelineModalOpen(true); }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-200 bg-white hover:border-black hover:shadow-sm transition text-sm group"
              >
               <div className="flex items-center gap-2 font-bold text-zinc-700 group-hover:text-black transition">
                 <Milestone size={16} className="text-blue-500" /> อัปเดต Task งาน
               </div>
               <ChevronRight size={16} className="text-zinc-400 group-hover:text-black transition" />
             </button>
          </div>
        </div>
      </aside>

      {/* ================= Task Modal (ย่อไว้) ================= */}
      <AnimatePresence>
        {isTimelineModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsTimelineModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", duration: 0.5 }} className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 flex flex-col max-h-[85vh]">
              <div className="flex justify-between items-center p-5 border-b border-zinc-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Milestone size={18} /></div>
                  <div><h3 className="font-bold text-lg">อัปเดต Task งาน</h3><p className="text-[11px] font-bold text-blue-600">ความคืบหน้า: {calculateProgress(tempTasks)}%</p></div>
                </div>
                <button onClick={() => setIsTimelineModalOpen(false)} className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-full transition"><X size={20} /></button>
              </div>
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">สถานะภาพรวม</label>
                  <select value={overallStatus} onChange={(e) => setOverallStatus(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:outline-none focus:border-black transition cursor-pointer">
                    <option value="รอประเมินราคา">รอประเมินราคา</option><option value="รอมัดจำ">รอมัดจำ</option><option value="กำลังพัฒนา">กำลังพัฒนา (In Progress)</option><option value="UAT">UAT / แก้ไขงาน</option><option value="ส่งมอบแล้ว">ส่งมอบแล้ว (Completed)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">รายการงาน (Tasks)</label>
                  <div className="space-y-2 mb-4">
                    {tempTasks.map((task) => (
                      <div key={task.id} className={`flex items-center justify-between p-3 rounded-xl border transition ${task.completed ? 'bg-zinc-50 border-zinc-200' : 'bg-white border-zinc-200 hover:border-black'}`}>
                        <div onClick={() => handleToggleTask(task.id)} className="flex items-center gap-3 cursor-pointer flex-1">
                          {task.completed ? <CheckSquare size={18} className="text-black" /> : <Square size={18} className="text-zinc-300" />}
                          <span className={`text-sm font-medium transition ${task.completed ? 'line-through text-zinc-400' : 'text-zinc-800'}`}>{task.title}</span>
                        </div>
                        <button onClick={() => handleDeleteTask(task.id)} className="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); handleAddTask(); }} className="flex items-center gap-2">
                    <input type="text" value={newTaskInput} onChange={(e) => setNewTaskInput(e.target.value)} placeholder="เพิ่มงานใหม่..." className="flex-1 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black transition" />
                    <button type="submit" disabled={!newTaskInput.trim()} className="p-3 bg-black text-white rounded-xl hover:bg-zinc-800 transition disabled:opacity-50"><Plus size={20} /></button>
                  </form>
                </div>
                <label className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-xl cursor-pointer hover:border-black transition">
                  <input type="checkbox" checked={isSendNotification} onChange={() => setIsSendNotification(!isSendNotification)} className="w-4 h-4 accent-black cursor-pointer" />
                  <div><p className="text-sm font-bold text-zinc-900">ส่งข้อความสรุปเข้าแชท</p><p className="text-[10px] text-zinc-500">แจ้งเตือนให้ลูกค้าทราบ</p></div>
                </label>
              </div>
              <div className="p-5 border-t border-zinc-100 bg-white flex justify-end gap-3 shrink-0">
                <button onClick={() => setIsTimelineModalOpen(false)} className="px-5 py-2.5 text-zinc-600 font-medium rounded-full hover:bg-zinc-100 transition text-sm">ยกเลิก</button>
                <button onClick={handleSaveTimeline} className="px-6 py-2.5 bg-black text-white font-bold rounded-full hover:bg-zinc-800 transition shadow-lg shadow-zinc-200 text-sm">บันทึกอัปเดต</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= 🌟 Contract Modal (สัญญาจ้าง) ================= */}
      <AnimatePresence>
        {isContractModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 print:static print:block print:p-0 print:m-0 print:z-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsContractModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm print:hidden" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", duration: 0.4 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl relative z-10 print:static print:h-auto print:max-h-none print:shadow-none print:w-full print:max-w-full print:rounded-none print:overflow-visible print:p-10"
            >
              <button onClick={() => setIsContractModalOpen(false)} className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-black transition print:hidden z-20"><X size={20} /></button>
              <div className="p-8 md:p-14 print:p-0 min-w-[700px] mx-auto text-zinc-900 font-sans flex flex-col justify-between min-h-full">
                <div>
                  <div className="flex justify-between items-start mb-10">
                    <div className="w-1/2">
                      <Image src="/tidalsynclogo.png" alt="TidalSync Logo" width={140} height={60} className="object-contain mix-blend-multiply mb-4" />
                      <h1 className="text-2xl font-extrabold mb-1 tracking-tight">สัญญาจ้างพัฒนาซอฟต์แวร์</h1>
                      <p className="text-xs text-zinc-500 font-medium">Software Development Agreement</p>
                    </div>
                    <div className="text-right text-xs space-y-1 text-zinc-600 print:text-black mt-2">
                      <p><span className="font-bold">เลขที่สัญญา (Contract No):</span> CT-2026-001</p>
                      <p><span className="font-bold">วันที่ (Date):</span> {currentDate}</p>
                    </div>
                  </div>
                  <div className="space-y-6 text-sm text-zinc-800 leading-relaxed print:text-black">
                    <p>
                      สัญญาฉบับนี้ทำขึ้น ณ <strong>TidalSync Studio</strong> ระหว่าง <strong>TidalSync (ผู้รับจ้าง)</strong> 
                      และ <strong>{projectData?.full_name || 'คุณสมชาย'} {projectData?.company_name ? `(${projectData.company_name})` : ''} (ผู้ว่าจ้าง)</strong> โดยทั้งสองฝ่ายตกลงทำสัญญาตามเงื่อนไขดังต่อไปนี้:
                    </p>
                    <div className="pl-4 border-l-2 border-black space-y-4">
                      <div>
                        <h4 className="font-bold text-black mb-1">ข้อ 1. ขอบเขตงาน (Scope of Work)</h4>
                        <p className="text-xs text-zinc-600">ผู้รับจ้างตกลงรับทำการ <strong>ออกแบบและพัฒนาระบบ Web Application</strong> ตามรายละเอียดฟีเจอร์ที่ระบุในใบเสนอราคา หากมีการเพิ่มฟีเจอร์นอกเหนือจากที่ตกลง จะมีการประเมินราคาและระยะเวลาเพิ่มเติม</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-black mb-1">ข้อ 2. ค่าตอบแทนและการชำระเงิน (Payment Terms)</h4>
                        <p className="text-xs text-zinc-600">
                          ผู้ว่าจ้างตกลงชำระค่าจ้างรวมทั้งสิ้น <strong>50,000 บาท</strong> โดยแบ่งชำระดังนี้:<br/>
                          - <strong>งวดที่ 1 (50%):</strong> จำนวน 25,000 บาท ณ วันเซ็นสัญญาเพื่อเริ่มงาน<br/>
                          - <strong>งวดที่ 2 (50%):</strong> จำนวน 25,000 บาท เมื่องานเสร็จสิ้นพร้อมส่งมอบ
                        </p>
                      </div>
                      <div>
                        <h4 className="font-bold text-black mb-1">ข้อ 3. การส่งมอบและการแก้ไขงาน (Revisions)</h4>
                        <p className="text-xs text-zinc-600">ผู้ว่าจ้างสามารถขอแก้ไขงาน (Revision) ในส่วนของการออกแบบ UI/UX ได้สูงสุด <strong>3 ครั้ง</strong> หากเกินกำหนดจะคิดค่าใช้จ่ายเพิ่มเติมจุดละ 1,000 บาท</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-black mb-1">ข้อ 4. ลิขสิทธิ์และทรัพย์สินทางปัญญา (Intellectual Property)</h4>
                        <p className="text-xs text-zinc-600">สิทธิ์ใน Source Code และงานออกแบบทั้งหมดจะตกเป็นของผู้ว่าจ้างอย่างสมบูรณ์ <strong className="text-red-600 print:text-black underline">ต่อเมื่อมีการชำระเงินงวดสุดท้ายครบถ้วนแล้วเท่านั้น</strong></p>
                      </div>
                    </div>
                  </div>
                  <div className="w-full flex justify-between mt-20 text-center text-sm print:text-black">
                    <div className="flex flex-col items-center w-1/2">
                      <div className="w-48 border-b border-zinc-400 print:border-black mb-3 h-16 flex items-end justify-center pb-2 text-zinc-300 italic text-xs">
                        (ลายมือชื่อผู้ว่าจ้าง / E-Signature)
                      </div>
                      <p className="font-bold">{projectData?.full_name || 'คุณสมชาย'}</p>
                      <p className="text-xs text-zinc-500 mt-1">ผู้ว่าจ้าง (Client)</p>
                    </div>
                    <div className="flex flex-col items-center w-1/2">
                      <div className="w-48 border-b border-zinc-400 print:border-black mb-3 h-16 flex items-end justify-center pb-2 font-black text-xl italic opacity-80">
                        TidalSync
                      </div>
                      <p className="font-bold">TidalSync Studio</p>
                      <p className="text-xs text-zinc-500 mt-1">ผู้รับจ้าง (Agency)</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            <div className="absolute bottom-6 right-6 flex gap-3 print:hidden z-50">
              <button onClick={handleExportPDF} disabled={isExporting} className="px-5 py-2.5 bg-white border border-zinc-200 text-zinc-700 font-medium rounded-full hover:bg-zinc-50 transition text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl">
                {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
                {isExporting ? "กำลังสร้าง PDF..." : "พิมพ์ / PDF"}
              </button>
              <button onClick={handleSendContractToChat} className="px-6 py-2.5 bg-black text-white font-medium rounded-full hover:bg-zinc-800 transition shadow-xl shadow-zinc-200/50 text-sm flex items-center justify-center gap-2">
                <Send size={16} /> ส่งให้ลูกค้าเซ็น (e-Sign)
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
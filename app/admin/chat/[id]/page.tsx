"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Paperclip, Send, MoreVertical, FileText, 
  CheckCircle2, Search, X, Milestone, Plus, Trash2, 
  CheckSquare, Square, ChevronRight, Loader2, FileCheck2, AlignLeft, Save
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminChatRoom() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string; 

  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ================= States (Database) =================
  const [chatInbox, setChatInbox] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [projectData, setProjectData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ================= States (Modals & UI) =================
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [editingBrief, setEditingBrief] = useState("");
  const [isSavingBrief, setIsSavingBrief] = useState(false);

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
  const [overallStatus, setOverallStatus] = useState("รอมัดจำ");

  const calculateProgress = (taskList: any[]) => {
    if (taskList.length === 0) return 0;
    const completedCount = taskList.filter(t => t.completed).length;
    return Math.round((completedCount / taskList.length) * 100);
  };
  const currentProgress = calculateProgress(tasks);

  // ================= ดึงข้อมูล =================
  const fetchInbox = async () => {
    try {
      const { data: inquiries, error } = await supabase.from('inquiries').select(`id, project_name, profiles:user_id (full_name, company_name)`).order('created_at', { ascending: false });
      if (error) throw error;

      const { data: unreadMsgs } = await supabase.from('messages').select('project_id').eq('is_read', false).eq('sender', 'client');
      const unreadCounts: Record<string, number> = {};
      unreadMsgs?.forEach(msg => { unreadCounts[msg.project_id] = (unreadCounts[msg.project_id] || 0) + 1; });
      
      if (inquiries) {
        const formattedInbox = inquiries.map((item: any) => ({
          id: item.id,
          project_name: item.project_name,
          full_name: item.profiles?.full_name || 'ลูกค้า',
          company_name: item.profiles?.company_name || 'บุคคลทั่วไป',
          unread_count: unreadCounts[item.id] || 0
        }));
        setChatInbox(formattedInbox);
      }
    } catch (error) { console.error("Error fetching inbox:", error); }
  };

  const fetchChatData = async () => {
    setIsLoading(true);
    try {
      const { data: inquiry, error: inquiryErr } = await supabase.from('inquiries').select(`*, profiles:user_id (full_name, company_name)`).eq('id', projectId).single();
      if (!inquiryErr && inquiry) { 
        setProjectData({ ...inquiry, full_name: inquiry.profiles?.full_name || 'ลูกค้า', company_name: inquiry.profiles?.company_name }); 
        if (inquiry.status) setOverallStatus(inquiry.status);
      }

      const { data: msgs, error: msgsErr } = await supabase.from('messages').select('*').eq('project_id', projectId).order('created_at', { ascending: true });
      if (msgsErr) throw msgsErr;
      if (msgs) setMessages(msgs);

      await supabase.from('messages').update({ is_read: true }).eq('project_id', projectId).eq('sender', 'client').eq('is_read', false);
      setChatInbox(prev => prev.map(c => c.id === projectId ? { ...c, unread_count: 0 } : c));
    } catch (error) { console.error("Error fetching chat data:", error); } finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchInbox();
    if (projectId) fetchChatData();
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    const channel = supabase.channel(`admin-global-messages`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, 
        async (payload) => {
          const newMsg = payload.new;
          if (newMsg.sender === 'client') {
            try { new Audio('https://actions.google.com/sounds/v1/cartoon/pop.ogg').play().catch(()=>{}); } catch(e) {}
          }
          if (newMsg.project_id === projectId) {
            setMessages((prev) => [...prev, newMsg]);
            if (newMsg.sender === 'client') { await supabase.from('messages').update({ is_read: true }).eq('id', newMsg.id); }
          } else {
            setChatInbox(prev => prev.map(chat => chat.id === newMsg.project_id ? { ...chat, unread_count: (chat.unread_count || 0) + 1 } : chat));
          }
        }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [projectId]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const renderTextWithLinks = (text: string, isAdmin: boolean) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return <a key={index} href={part} target="_blank" rel="noopener noreferrer" className={`underline font-bold transition break-all ${isAdmin ? 'text-blue-200 hover:text-white' : 'text-blue-600 hover:text-blue-800'}`}>{part}</a>;
      }
      return part;
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const textToSend = newMessage;
    setNewMessage(""); 
    try { await supabase.from('messages').insert([{ project_id: projectId, sender: 'admin', text: textToSend, type: 'text', is_read: true }]); } catch (error) { console.error("Error sending message:", error); alert("ส่งข้อความไม่สำเร็จ"); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `chat_images/${fileName}`;
      
      const { error: uploadError } = await supabase.storage.from('chat_files').upload(filePath, file);
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from('chat_files').getPublicUrl(filePath);
      
      const msgType = (fileExt === 'pdf') ? 'file' : 'image';

      await supabase.from('messages').insert([{ 
        project_id: projectId, 
        sender: 'admin', 
        text: publicUrl, 
        type: msgType, 
        file_size: file.name, 
        is_read: true 
      }]);
    } catch (error: any) { 
      console.error("Error uploading file:", error.message); 
      alert("อัปโหลดรูปภาพ/ไฟล์ไม่สำเร็จ"); 
    } finally { 
      setIsUploading(false); 
      if (fileInputRef.current) fileInputRef.current.value = ''; 
    }
  };

  const handleSaveBrief = async () => {
    setIsSavingBrief(true);
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ brief: editingBrief })
        .eq('id', projectId);

      if (error) throw error;
      
      setProjectData((prev: any) => ({ ...prev, brief: editingBrief }));
      setIsBriefModalOpen(false);
    } catch (error: any) {
      alert("บันทึกบรีฟไม่สำเร็จ: " + error.message);
    } finally {
      setIsSavingBrief(false);
    }
  };

  const openBriefModal = () => {
    setEditingBrief(projectData?.brief || projectData?.description || "");
    setIsBriefModalOpen(true);
  };

  const handleAddTask = () => {
    if (!newTaskInput.trim()) return;
    setTempTasks([...tempTasks, { id: Date.now(), title: newTaskInput, completed: false }]);
    setNewTaskInput("");
  };
  const handleDeleteTask = (id: number) => setTempTasks(tempTasks.filter(t => t.id !== id));
  const handleToggleTask = (id: number) => setTempTasks(tempTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));

  const handleSaveTimeline = async () => {
    const newlyCompleted = tempTasks.filter(temp => temp.completed && !tasks.find(t => t.id === temp.id)?.completed);
    const newProgress = calculateProgress(tempTasks);
    
    setTasks(tempTasks);
    setIsTimelineModalOpen(false);

    try {
      await supabase
        .from('inquiries')
        .update({ status: overallStatus, progress: newProgress })
        .eq('id', projectId);
    } catch (error) {
      console.error("Error updating project status:", error);
    }

    if (isSendNotification) {
      let updateMsg = "";

      if (newlyCompleted.length > 0) {
        const completedTitles = newlyCompleted.map(t => `✅ ${t.title}`).join('\n');
        updateMsg = `🔔 อัปเดตความคืบหน้า (สถานะ: ${overallStatus} | รวม ${newProgress}%):\n${completedTitles}`;
      } else {
        updateMsg = `🔔 อัปเดตสถานะโปรเจค:\nปรับสถานะเป็น "${overallStatus}" (ความคืบหน้ารวม ${newProgress}%)`;
      }

      try {
        await supabase.from('messages').insert([{ 
          project_id: projectId, 
          sender: 'system', 
          text: updateMsg, 
          type: 'text', 
          is_read: true 
        }]);
      } catch (error) {
        console.error("Error sending update msg:", error);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-screen overflow-hidden bg-zinc-50 relative">
      
      {/* ================= แผง Inbox ================= */}
      <aside className="hidden md:flex w-72 bg-white flex-col border-r border-zinc-200 h-screen shrink-0 z-20">
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
            const unreadCount = chat.unread_count || 0;

            return (
              <Link key={chat.id} href={`/admin/chat/${chat.id}`} className={`flex items-start gap-3 p-4 border-b border-zinc-50 hover:bg-zinc-50 transition cursor-pointer ${isActive ? 'bg-zinc-50 border-l-4 border-l-black' : 'border-l-4 border-l-transparent'}`}>
                <div className="w-10 h-10 rounded-full bg-zinc-200 shrink-0 flex items-center justify-center font-bold text-zinc-500 relative">
                  {chat.full_name?.charAt(0) || '?'}
                  {unreadCount > 0 && !isActive && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-white">{unreadCount}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className={`text-sm truncate ${unreadCount > 0 && !isActive ? 'font-black text-black' : 'font-bold text-zinc-900'}`}>{chat.full_name}</h4>
                  </div>
                  <p className={`text-xs truncate mb-1 ${unreadCount > 0 && !isActive ? 'font-bold text-red-500' : 'text-zinc-500'}`}>
                     {unreadCount > 0 && !isActive ? `มี ${unreadCount} ข้อความใหม่` : (chat.project_name || chat.company_name)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </aside>

      {/* ================= ห้องแชท ================= */}
      <section className="flex-1 flex flex-col h-full relative bg-zinc-50/50">
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
            <span className="text-[10px] font-bold bg-zinc-200 text-zinc-500 px-3 py-1 rounded-full uppercase tracking-wider">แชทโปรเจกต์: {projectData?.project_name}</span>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-zinc-400" size={24} /></div>
          ) : messages.length === 0 ? (
            <div className="text-center text-zinc-400 text-sm mt-10">ยังไม่มีข้อความ เริ่มต้นทักทายลูกค้าได้เลยครับ</div>
          ) : (
            messages.map((msg) => {
              const isAdmin = msg.sender === "admin";
              const isSystem = msg.sender === "system";
              
              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center w-full my-4">
                     <div className="bg-zinc-200/50 text-zinc-500 text-[11px] font-bold px-4 py-2 rounded-full whitespace-pre-wrap text-center max-w-[80%] border border-zinc-200">
                        {msg.text}
                     </div>
                  </div>
                );
              }

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
                      {(!msg.type || msg.type === "text") && (
                        <div className={`px-4 py-3 rounded-2xl text-[14px] md:text-[15px] shadow-sm whitespace-pre-wrap ${isAdmin ? "bg-black text-white rounded-br-sm" : "bg-white border border-zinc-200 text-zinc-800 rounded-bl-sm"}`}>
                          {renderTextWithLinks(msg.text, isAdmin)}
                        </div>
                      )}
                      {msg.type === 'image' && (
                        <div className={`max-w-[75%] md:max-w-[320px] rounded-2xl overflow-hidden shadow-sm border border-zinc-200 ${isAdmin ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
                          <img src={msg.text} alt="attachment" className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition" onClick={() => window.open(msg.text, '_blank')} />
                        </div>
                      )}
                      
                      {/* 🌟 กล่องเอกสาร (Admin Side) พร้อมระบบบังคับดาวน์โหลด 🌟 */}
                      {msg.type === 'file' && (
                        <div 
                          onClick={() => { 
                            if (msg.text.startsWith('http')) {
                               const downloadUrl = `${msg.text}?download=${msg.file_size || 'document.pdf'}`;
                               window.open(downloadUrl, '_blank');
                            }
                          }}
                          className={`flex items-center gap-3 p-3 md:p-4 rounded-2xl border transition shadow-sm ${msg.text.startsWith('http') ? 'cursor-pointer hover:bg-zinc-50' : ''} ${isAdmin ? "bg-white border-zinc-200 text-zinc-800 rounded-br-sm" : "bg-white border-zinc-200 text-zinc-800 rounded-bl-sm"}`}
                        >
                          <div className={`p-2.5 rounded-xl ${msg.file_size === 'Secure Link' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                            {msg.file_size === 'Secure Link' ? <FileCheck2 size={20} /> : <FileText size={20} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold truncate max-w-[180px] md:max-w-[250px]">
                              {msg.text.startsWith('http') ? (msg.file_size || 'Document.pdf') : msg.text}
                            </p>
                            <p className="text-xs mt-0.5 text-zinc-500">
                              {msg.text.startsWith('http') ? 'คลิกเพื่อดาวน์โหลดไฟล์' : msg.file_size}
                            </p>
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
            <input type="file" accept="image/*,application/pdf" hidden ref={fileInputRef} onChange={handleFileUpload} />
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="p-3 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-full transition shrink-0 disabled:opacity-50" title="แนบไฟล์ (รูปภาพ หรือ PDF)">
              {isUploading ? <Loader2 size={20} className="animate-spin text-black" /> : <Paperclip size={20} />}
            </button>
            <div className="flex-1 relative">
              <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }} placeholder="พิมพ์ข้อความ หรือกดไอคอนซ้ายมือเพื่อแนบไฟล์..." disabled={isUploading} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-4 pr-12 py-3.5 text-sm focus:outline-none focus:border-black transition resize-none max-h-[120px] disabled:opacity-50" rows={1} />
              <button type="submit" disabled={!newMessage.trim() || isUploading} className="absolute right-2 bottom-2 p-2 bg-black text-white rounded-full hover:bg-zinc-800 transition disabled:opacity-50 shadow-md">
                <Send size={16} className="ml-0.5" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ================= แผงควบคุมโปรเจค ================= */}
      <aside className="hidden xl:flex w-80 bg-white flex-col border-l border-zinc-200 h-full shrink-0 overflow-y-auto z-20">
        <div className="p-6 border-b border-zinc-100">
          <h3 className="font-bold text-lg">แผงควบคุม (Quick Actions)</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-500">ประเภทงาน</span>
              <span className="font-bold text-black">{projectData?.project_type || 'Web App'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-500">งบประมาณ</span>
              <span className="font-bold text-black">{projectData?.budget ? `${Number(projectData.budget).toLocaleString()} ฿` : 'รอประเมิน'}</span>
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
                <motion.div className="bg-black h-full rounded-full absolute left-0 top-0" initial={{ width: `${currentProgress}%` }} animate={{ width: `${currentProgress}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">เครื่องมือแอดมิน</p>
            <div className="space-y-2">
              <button onClick={openBriefModal} className="w-full flex items-center gap-3 p-3 rounded-xl border border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100 transition shadow-sm font-bold text-sm text-left">
                <AlignLeft size={18} /> จัดการบรีฟงาน
              </button>
            </div>
          </div>

          <div>
             <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">จัดการงาน (Tasks)</p>
             <button onClick={() => { setTempTasks([...tasks]); setIsTimelineModalOpen(true); }} className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-200 bg-white hover:border-black hover:shadow-sm transition text-sm group">
               <div className="flex items-center gap-2 font-bold text-zinc-700 group-hover:text-black transition"><Milestone size={16} className="text-blue-500" /> อัปเดต Task งาน</div>
               <ChevronRight size={16} className="text-zinc-400 group-hover:text-black transition" />
             </button>
          </div>
        </div>
      </aside>

      {/* ================= Modal: จัดการบรีฟงาน ================= */}
      <AnimatePresence>
        {isBriefModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBriefModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", duration: 0.4 }}
              className="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl relative z-10"
            >
              <div className="flex justify-between items-center p-5 md:p-6 border-b border-zinc-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><AlignLeft size={18} /></div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">จัดการบรีฟงาน (Brief)</h3>
                    <p className="text-[11px] text-zinc-500">รายละเอียดงานที่ต้องการให้ทีมพัฒนาทราบ</p>
                  </div>
                </div>
                <button onClick={() => setIsBriefModalOpen(false)} className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-full transition"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">รายละเอียดบรีฟ</label>
                  <textarea 
                    value={editingBrief} 
                    onChange={(e) => setEditingBrief(e.target.value)} 
                    rows={12} 
                    placeholder="พิมพ์รายละเอียดของโปรเจกต์ ฟีเจอร์ที่ลูกค้าต้องการ หรือข้อตกลงต่างๆ ไว้ที่นี่..." 
                    className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm leading-relaxed text-zinc-800 focus:outline-none focus:border-black transition resize-none"
                  />
                </div>
              </div>

              <div className="p-5 md:p-6 border-t border-zinc-100 bg-white flex justify-end gap-3 shrink-0">
                <button onClick={() => setIsBriefModalOpen(false)} className="px-5 py-2.5 text-zinc-600 font-medium rounded-full hover:bg-zinc-100 transition text-sm">
                  ยกเลิก
                </button>
                <button 
                  onClick={handleSaveBrief} 
                  disabled={isSavingBrief} 
                  className="px-6 py-2.5 bg-black text-white font-bold rounded-full hover:bg-zinc-800 transition shadow-lg shadow-zinc-200 text-sm flex items-center gap-2"
                >
                  {isSavingBrief ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                  บันทึกบรีฟ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= Modal: อัปเดต Task งาน ================= */}
      <AnimatePresence>
        {isTimelineModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                    <option value="รอประเมินราคา">รอประเมินราคา (New)</option><option value="รอมัดจำ">รอมัดจำ</option><option value="กำลังพัฒนา">กำลังพัฒนา (In Progress)</option><option value="UAT">UAT / แก้ไขงาน</option><option value="ส่งมอบแล้ว">ส่งมอบแล้ว (Completed)</option>
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

    </div>
  );
}
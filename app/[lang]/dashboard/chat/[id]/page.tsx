"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Paperclip, Send, User, CheckCircle2, 
  Info, FileIcon, FileText, Download, ChevronRight, X, Clock, AlertCircle, Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ChatProjectWorkspace() {
  const params = useParams();
  const searchParams = useSearchParams();
  const lang = params.lang === "en" ? "en" : "th";
  
  const projectId = params.id as string; 
  const projectTitleUrl = searchParams.get('title') || "Project Chat";

  const [projectData, setProjectData] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [inputText, setInputText] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [activeTab, setActiveTab] = useState<'overview' | 'files'>('overview');
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: projData, error: projErr } = await supabase.from('inquiries').select('*').eq('id', projectId).single();
      if (!projErr && projData) setProjectData(projData);

      const { data: msgsData, error: msgsErr } = await supabase.from('messages').select('*').eq('project_id', projectId).order('created_at', { ascending: true });
      if (!msgsErr && msgsData) setMessages(msgsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchData();
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    const channel = supabase.channel(`client-room:${projectId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `project_id=eq.${projectId}` }, 
        (payload) => setMessages((prev) => [...prev, payload.new])
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const textToSend = inputText;
    setInputText(""); 

    try {
      await supabase.from('messages').insert([{ project_id: projectId, sender: 'client', text: textToSend, type: 'text' }]);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("ไม่สามารถส่งข้อความได้ กรุณาลองใหม่");
    }
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
        sender: 'client',
        text: publicUrl, 
        type: msgType,   
        file_size: file.name
      }]);

    } catch (error: any) {
      console.error("Error uploading file:", error.message);
      alert("อัปโหลดรูปภาพไม่สำเร็จ กรุณาเช็คการตั้งค่า Storage");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; 
    }
  };

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'inProgress': return <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full text-xs font-bold"><div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div> กำลังดำเนินการ</span>;
      case 'reviewing': return <span className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full text-xs font-bold"><Clock size={12}/> รอลูกค้าตรวจงาน</span>;
      case 'completed': return <span className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-xs font-bold"><CheckCircle2 size={12}/> ส่งมอบงานแล้ว</span>;
      default: return <span className="flex items-center gap-1.5 text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full text-xs font-bold"><AlertCircle size={12}/> รอดำเนินการ</span>;
    }
  };

  const attachedFiles = messages.filter(msg => msg.type === 'file' || msg.type === 'image');

  const renderTextWithLinks = (text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="underline font-bold transition break-all hover:opacity-80">{part}</a>;
      }
      return part;
    });
  };

  return (
    <div className="flex h-screen bg-zinc-50 font-sans overflow-hidden">
      
      {/* ==================== 💬 ฝั่งแชท (ซ้าย/หลัก) ==================== */}
      <div className="flex-1 flex flex-col h-full relative z-10 transition-all duration-300">
        
        <header className="h-20 bg-white border-b border-zinc-100 flex items-center justify-between px-6 shrink-0 shadow-[0_4px_24px_rgba(0,0,0,0.02)] z-20">
          <div className="flex items-center gap-4">
            <Link href={`/${lang}/dashboard`} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-500 transition">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="font-bold text-lg text-zinc-900 leading-tight">
                {projectData ? projectData.project_name : projectTitleUrl}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-xs font-medium text-zinc-400">TidalSync ทีมงานออนไลน์</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden md:flex items-center gap-2 text-sm font-medium text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-200">
                <User size={14}/> Hi, {projectData?.company_name || 'Customer'}
             </div>
             <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${isSidebarOpen ? 'bg-black text-white shadow-md' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
             >
                <Info size={16} /> <span className="hidden md:block">ข้อมูลโปรเจกต์</span>
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-white/50">
          {isLoading ? (
             <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-zinc-400" size={24} /></div>
          ) : messages.length === 0 ? (
             <div className="text-center text-zinc-400 text-sm mt-10">ส่งข้อความหาทีมงานเพื่อเริ่มการสนทนาได้เลยครับ</div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender === 'client';
              const isSystem = msg.sender === 'system';
              const timeString = new Date(msg.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center w-full my-4">
                     <div className="bg-zinc-200/50 text-zinc-500 text-[11px] font-bold px-4 py-2 rounded-full whitespace-pre-wrap text-center max-w-[80%] border border-zinc-200">
                        {msg.text}
                     </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  
                  {/* ข้อความแบบ Text ธรรมดา */}
                  {(!msg.type || msg.type === 'text') && (
                    <div className={`max-w-[85%] md:max-w-[65%] px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap ${
                      isMe 
                        ? 'bg-black text-white rounded-tr-sm' 
                        : 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-sm'
                    }`}>
                      {renderTextWithLinks(msg.text)}
                    </div>
                  )}

                  {/* แสดงผลรูปภาพ (Image) */}
                  {msg.type === 'image' && (
                    <div className={`max-w-[75%] md:max-w-[320px] rounded-2xl overflow-hidden shadow-sm border border-zinc-200 ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={msg.text} alt="attachment" className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition" onClick={() => window.open(msg.text, '_blank')} />
                    </div>
                  )}

                  {/* 🌟 แสดงผลแบบกล่องเอกสาร PDF (File) และบังคับดาวน์โหลด 🌟 */}
                  {msg.type === 'file' && (
                    <div 
                      onClick={() => { 
                        if (msg.text.startsWith('http')) {
                          // เพิ่ม ?download= เพื่อบังคับให้เบราว์เซอร์ดาวน์โหลดแทนการพรีวิว
                          const downloadUrl = `${msg.text}?download=${msg.file_size || 'document.pdf'}`;
                          window.open(downloadUrl, '_blank'); 
                        }
                      }}
                      className={`max-w-[85%] md:max-w-[320px] bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm group cursor-pointer hover:border-black transition ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                    >
                      <div className="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-xl mb-3 flex items-center justify-center shrink-0">
                         <FileIcon size={24} className={msg.file_size === 'Secure Link' ? 'text-purple-500' : 'text-blue-500'} />
                      </div>
                      <h4 className="font-bold text-sm text-zinc-900 leading-tight mb-1 truncate">
                        {msg.text.startsWith('http') ? (msg.file_size || 'Document.pdf') : msg.text}
                      </h4>
                      <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-3">TidalSync Team • {msg.text.startsWith('http') ? 'PDF Document' : msg.file_size}</p>
                      <button className="w-full py-2 bg-zinc-50 text-xs font-bold text-zinc-600 rounded-lg group-hover:bg-black group-hover:text-white transition flex justify-center items-center gap-1.5">
                        <Download size={14} /> {msg.file_size === 'Secure Link' ? 'เปิดลิงก์เอกสาร' : 'ดาวน์โหลดไฟล์'}
                      </button>
                    </div>
                  )}

                  <span className="text-[10px] font-medium text-zinc-400 mt-1.5 px-1">{timeString} น.</span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* กล่องพิมพ์ข้อความ */}
        <div className="p-4 md:p-6 bg-white border-t border-zinc-100 shrink-0 z-20">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative flex items-center">
            
            <input type="file" accept="image/*,application/pdf" hidden ref={fileInputRef} onChange={handleFileUpload} />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isUploading}
              className="absolute left-4 text-zinc-400 hover:text-black transition disabled:opacity-50"
              title="แนบรูปภาพ หรือไฟล์ PDF"
            >
              {isUploading ? <Loader2 size={20} className="animate-spin text-black" /> : <Paperclip size={20} />}
            </button>
            
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="พิมพ์ข้อความตอบกลับ..."
              disabled={isUploading}
              className="w-full pl-12 pr-16 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-[15px] transition disabled:opacity-50"
            />
            <button 
              type="submit" 
              disabled={!inputText.trim() || isUploading}
              className="absolute right-3 w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center hover:bg-zinc-800 transition disabled:opacity-30 disabled:hover:bg-black"
            >
              <Send size={16} className="-ml-0.5 mt-0.5" />
            </button>
          </form>
        </div>
      </div>

      {/* ==================== ℹ️ แถบ Sidebar ขวา (Project Workspace) ==================== */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 z-30 md:hidden"
            />
            
            <motion.div 
              initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed md:static right-0 top-0 h-full w-[340px] md:w-[380px] bg-white border-l border-zinc-200 z-40 flex flex-col shadow-2xl md:shadow-none"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <h2 className="font-bold text-lg">Project Workspace</h2>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-zinc-200 rounded-full text-zinc-500 transition">
                  <X size={18} />
                </button>
              </div>

              <div className="flex p-2 border-b border-zinc-100">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'overview' ? 'bg-black text-white shadow-md' : 'text-zinc-500 hover:text-black hover:bg-zinc-50'}`}
                >
                  ภาพรวม (Overview)
                </button>
                <button 
                  onClick={() => setActiveTab('files')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'files' ? 'bg-black text-white shadow-md' : 'text-zinc-500 hover:text-black hover:bg-zinc-50'}`}
                >
                  ไฟล์ทั้งหมด ({attachedFiles.length})
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/30">
                
                {activeTab === 'overview' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{projectData?.project_type || 'Project'}</p>
                      <h3 className="text-xl font-black text-zinc-900 leading-tight">{projectData?.project_name || 'ชื่อโปรเจกต์'}</h3>
                      <p className="text-sm text-zinc-500 mt-1">{projectData?.company_name || '-'}</p>
                    </div>

                    <div className="p-4 bg-white border border-zinc-100 rounded-2xl shadow-sm space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-500">สถานะโปรเจกต์</span>
                        {getStatusDisplay(projectData?.status || 'pending')}
                      </div>
                      <hr className="border-zinc-50"/>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-500">งบประมาณ</span>
                        <span className="text-sm font-medium text-zinc-900">{projectData?.budget ? `${Number(projectData.budget).toLocaleString()} ฿` : 'รอประเมิน'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-500">ระยะเวลาที่ต้องการ</span>
                        <span className="text-sm font-medium text-zinc-900">{projectData?.timeline || '-'}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'files' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <p className="text-xs text-zinc-500">ไฟล์และรูปภาพทั้งหมดที่แนบในห้องแชทนี้จะถูกรวบรวมไว้ที่นี่อัตโนมัติ</p>
                    
                    <div className="space-y-3">
                      {attachedFiles.length === 0 ? (
                        <div className="text-center text-zinc-400 text-xs py-10">ยังไม่มีไฟล์แนบในโปรเจกต์นี้</div>
                      ) : (
                        attachedFiles.map((file) => (
                          <div 
                            key={file.id} 
                            onClick={() => { 
                              if (file.text.startsWith('http')) {
                                // 🌟 เพิ่ม ?download= ตรงส่วน Sidebar ด้วย 🌟
                                const downloadUrl = `${file.text}?download=${file.file_size || 'document'}`;
                                window.open(downloadUrl, '_blank'); 
                              }
                            }}
                            className="group flex items-center justify-between p-3 bg-white border border-zinc-100 rounded-xl hover:border-black transition cursor-pointer shadow-sm"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${file.type === 'image' ? 'bg-orange-50 text-orange-500' : file.file_size === 'Secure Link' ? 'bg-purple-50 text-purple-500' : 'bg-blue-50 text-blue-500'}`}>
                                <FileIcon size={18} />
                              </div>
                              <div className="truncate">
                                <p className="text-sm font-bold text-zinc-900 truncate">
                                  {file.text.startsWith('http') && file.type === 'file' ? (file.file_size || 'Document') : (file.file_size || 'Image File')}
                                </p>
                                <p className="text-[10px] font-medium text-zinc-400">{new Date(file.created_at).toLocaleDateString('th-TH')}</p>
                              </div>
                            </div>
                            <button className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-black group-hover:text-white transition shrink-0 ml-2">
                              <Download size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
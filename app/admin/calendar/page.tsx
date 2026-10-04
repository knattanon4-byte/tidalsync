"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar as CalendarIcon, Clock, MapPin, Video, 
  Users, AlignLeft, X, ChevronRight, FileText, 
  Edit2, Check, Send, ExternalLink, Loader2,
  CheckCircle2, AlertCircle, Plus
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const colorMap: Record<string, { bg: string, text: string, border: string }> = {
  blue: { bg: "bg-blue-500", text: "text-white", border: "border-blue-100" },
  orange: { bg: "bg-orange-500", text: "text-white", border: "border-orange-100" },
  purple: { bg: "bg-purple-500", text: "text-white", border: "border-purple-100" },
};

const thaiMonths = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

const weekDays = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

export default function AdminCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [clientList, setClientList] = useState<any[]>([]); // 🌟 เก็บรายชื่อลูกค้าจาก Database
  const [isLoading, setIsLoading] = useState(true);
  
  // State สำหรับ Modal ดูนัดหมาย
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingChat, setIsSendingChat] = useState(false);

  // 🌟 State สำหรับ Modal "สร้างนัดหมายใหม่"
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newApp, setNewApp] = useState({
    title: "", date: "", time: "", client_id: "", client_name: "", type: "online", location: "Google Meet", color: "blue", agenda: "", link: ""
  });
  const [isCreating, setIsCreating] = useState(false);

  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({ show: false, message: "", type: "success" });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  // 🌟 ฟังก์ชันดึงรายชื่อลูกค้า (Profiles) จาก Database มาทำ Dropdown
  const fetchClients = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('id, full_name, company_name');
      if (error) throw error;
      if (data) setClientList(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('appointments').select('*').order('date', { ascending: true });
      if (error) throw error;

      const formattedData = data.map(app => {
        const d = new Date(app.date);
        return { ...app, dayNumber: d.getDate(), monthNumber: d.getMonth(), yearNumber: d.getFullYear() };
      });
      setAppointments(formattedData);
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchClients(); // 🌟 สั่งให้ดึงลูกค้าตอนเปิดหน้าเว็บ
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = thaiMonths[month];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); 
  const blanks = Array.from({ length: firstDayOfMonth }); 
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const appointmentsThisMonth = appointments.filter(app => app.yearNumber === year && app.monthNumber === month);
  const filteredAppointments = selectedDate ? appointmentsThisMonth.filter(app => app.dayNumber === selectedDate) : appointmentsThisMonth;

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          title: newApp.title,
          date: newApp.date,
          time: newApp.time,
          client_name: newApp.client_name,
          type: newApp.type,
          location: newApp.type === 'online' ? 'Google Meet' : 'On-site',
          color: newApp.color,
          agenda: newApp.agenda,
          link: newApp.link
        }])
        .select()
        .single();

      if (error) throw error;

      showToast("สร้างนัดหมายและเตรียมส่งแชทเรียบร้อย!", "success");
      setIsAddModalOpen(false);
      setNewApp({ title: "", date: "", time: "", client_id: "", client_name: "", type: "online", location: "Google Meet", color: "blue", agenda: "", link: "" });
      
      fetchAppointments();
    } catch (error: any) {
      showToast("สร้างนัดหมายไม่สำเร็จ: " + error.message, "error");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveLink = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('appointments').update({ link: linkInput }).eq('id', selectedEvent.id);
      if (error) throw error;
      setSelectedEvent({ ...selectedEvent, link: linkInput });
      setAppointments(prev => prev.map(app => app.id === selectedEvent.id ? { ...app, link: linkInput } : app));
      setIsEditingLink(false);
      showToast("บันทึกลิงก์ Google Meet สำเร็จ", "success");
    } catch (error: any) {
      showToast("บันทึกลิงก์ไม่สำเร็จ", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans relative">
      
      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border ${toast.type === 'success' ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-red-50 text-red-600 border-red-100'}`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} className="text-green-400" /> : <AlertCircle size={18} className="text-red-500" />}
            <span className="text-sm font-medium tracking-wide">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panel ซ้าย: รายการนัดหมาย */}
      <div className="w-full md:w-[380px] bg-white border-r border-zinc-100 flex flex-col h-full z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Clock size={20} className="text-zinc-400" /> 
            {selectedDate ? `วันที่ ${selectedDate} ${monthName}` : `นัดหมายของเดือนนี้`}
          </h2>
          {selectedDate && (
            <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-md">
              {filteredAppointments.length} รายการ
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-10"><Loader2 className="animate-spin text-zinc-400" size={24} /></div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((app) => (
                  <motion.div
                    key={app.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => { setSelectedEvent(app); setLinkInput(app.link || ""); setIsEditingLink(false); }} 
                    className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${colorMap[app.color]?.bg || 'bg-blue-500'} ${colorMap[app.color]?.text || 'text-white'}`}>
                        {app.dayNumber} {monthName.substring(0, 3)}.
                      </span>
                    </div>
                    <h3 className="font-bold text-zinc-900 group-hover:text-black">{app.title}</h3>
                    <p className="text-sm text-zinc-500 mb-4">{app.clientName}</p>
                    <div className="space-y-2 text-xs font-medium text-zinc-400">
                      <div className="flex items-center gap-2"><Clock size={14} /> {app.time}</div>
                      <div className="flex items-center gap-2">{app.type === 'online' ? <Video size={14} /> : <MapPin size={14} />} {app.location}</div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 text-zinc-400">
                  <CalendarIcon size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm">ไม่มีนัดหมาย</p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        <div className="p-6 border-t border-zinc-100 bg-zinc-50/50">
          <button 
            onClick={() => setSelectedDate(null)}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${selectedDate === null ? "bg-zinc-200 text-zinc-500 cursor-default" : "bg-white border border-zinc-200 text-black hover:bg-zinc-100 shadow-sm"}`}
          >
            <CalendarIcon size={16} /> ดูนัดหมายทั้งหมดในเดือนนี้
          </button>
        </div>
      </div>

      {/* Panel ขวา: ปฏิทิน */}
      <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-zinc-50">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-zinc-100 shadow-sm p-8">
          
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-black text-zinc-900">{monthName} {year}</h1>
            <div className="flex gap-4 items-center">
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-zinc-800 transition"
              >
                <Plus size={16} /> สร้างนัดหมาย
              </button>

              <div className="flex gap-2">
                <button onClick={() => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDate(null); }} className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:bg-zinc-50 hover:text-black transition">
                  <ChevronRight size={20} className="rotate-180" />
                </button>
                <button onClick={() => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDate(null); }} className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:bg-zinc-50 hover:text-black transition">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-zinc-100 border border-zinc-100 rounded-2xl overflow-hidden">
            {weekDays.map(day => <div key={day} className="bg-white py-4 text-center text-xs font-bold text-zinc-400">{day}</div>)}
            {blanks.map((_, i) => <div key={`blank-${i}`} className="bg-white/50 min-h-[120px] p-2"></div>)}
            {days.map(day => {
              const dayEvents = appointmentsThisMonth.filter(app => app.dayNumber === day);
              const isSelected = selectedDate === day;
              return (
                <div 
                  key={day} onClick={() => setSelectedDate(day)}
                  className={`bg-white min-h-[120px] p-2 border-t border-zinc-50 transition-colors cursor-pointer relative group ${isSelected ? 'ring-2 ring-inset ring-black bg-zinc-50/50' : 'hover:bg-zinc-50'}`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${isSelected ? 'bg-black text-white' : dayEvents.length > 0 ? 'text-black' : 'text-zinc-400'}`}>{day}</span>
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {dayEvents.map(event => (
                      <div key={event.id} className={`text-[10px] font-bold px-2 py-1 rounded-md truncate ${colorMap[event.color]?.bg || 'bg-blue-500'} ${colorMap[event.color]?.text || 'text-white'}`}>
                        {event.time.split(' ')[0]} {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 🌟 Modal: สร้างนัดหมายใหม่ */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white w-full max-w-xl rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2"><Plus size={20} className="text-blue-500"/> สร้างนัดหมายใหม่</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 bg-zinc-200/50 hover:bg-zinc-200 rounded-full flex items-center justify-center transition"><X size={16} /></button>
              </div>
              <form onSubmit={handleCreateAppointment} className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">หัวข้อการประชุม / นัดหมาย *</label>
                  <input type="text" required value={newApp.title} onChange={e => setNewApp({...newApp, title: e.target.value})} className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm" placeholder="เช่น ส่งมอบโปรเจกต์ เฟส 1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">วันที่ *</label>
                    <input type="date" required value={newApp.date} onChange={e => setNewApp({...newApp, date: e.target.value})} className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">เวลา (เช่น 14:00 - 15:00) *</label>
                    <input type="text" required value={newApp.time} onChange={e => setNewApp({...newApp, time: e.target.value})} className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm" placeholder="10:00 - 11:30" />
                  </div>
                </div>
                
                {/* 🌟 เปลี่ยนช่องใส่ชื่อลูกค้าเป็น Dropdown (ดึงจากตาราง Profiles) 🌟 */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">เลือกลูกค้า / โครงการ *</label>
                  <select 
                    required 
                    value={newApp.client_id} 
                    onChange={e => {
                      const selectedClient = clientList.find(c => c.id === e.target.value);
                      setNewApp({
                        ...newApp, 
                        client_id: e.target.value,
                        // เซฟชื่อไว้โชว์บนปฏิทินด้วย
                        client_name: selectedClient ? (selectedClient.company_name || selectedClient.full_name) : ""
                      });
                    }} 
                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  >
                    <option value="" disabled>-- กรุณาเลือกลูกค้าที่มีในระบบ --</option>
                    {clientList.length > 0 ? (
                      clientList.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.company_name ? `${client.company_name} (คุณ${client.full_name})` : `คุณ${client.full_name}`}
                        </option>
                      ))
                    ) : (
                      <option value="test-client">คุณลูกค้าตัวอย่าง (ระบบจำลอง)</option>
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">รูปแบบ</label>
                    <select value={newApp.type} onChange={e => setNewApp({...newApp, type: e.target.value})} className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm">
                      <option value="online">Online (Video Call)</option>
                      <option value="onsite">On-Site (เจอตัว)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">สีป้ายกำกับ</label>
                    <select value={newApp.color} onChange={e => setNewApp({...newApp, color: e.target.value})} className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm">
                      <option value="blue">น้ำเงิน (ปกติ)</option>
                      <option value="orange">ส้ม (ด่วน / UAT)</option>
                      <option value="purple">ม่วง (Requirement)</option>
                    </select>
                  </div>
                </div>

                {newApp.type === 'online' && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">ลิงก์การประชุม (Google Meet, Zoom)</label>
                    <input type="text" value={newApp.link} onChange={e => setNewApp({...newApp, link: e.target.value})} className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm" placeholder="https://meet.google.com/..." />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">หมายเหตุ / วาระการประชุม (Agenda)</label>
                  <textarea value={newApp.agenda} onChange={e => setNewApp({...newApp, agenda: e.target.value})} rows={3} className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm resize-none" placeholder="รายละเอียด, วาระการประชุม, หรือสิ่งที่ต้องเตรียม..." />
                </div>

                <div className="pt-4 border-t border-zinc-100">
                  <button type="submit" disabled={isCreating} className="w-full py-4 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition disabled:opacity-50">
                    {isCreating ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />} บันทึกและส่งแจ้งเตือนเข้าแชท
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal ดูรายละเอียดนัดหมาย */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedEvent(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className={`${colorMap[selectedEvent.color]?.bg || 'bg-blue-500'} px-8 py-6 text-white relative shrink-0`}>
                <button onClick={() => setSelectedEvent(null)} className="absolute top-6 right-6 w-8 h-8 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center transition"><X size={18} /></button>
                <div className="flex items-center gap-2 text-sm font-bold opacity-80 mb-2">
                  <CalendarIcon size={16} /> {selectedEvent.dayNumber} {monthName} {year} • {selectedEvent.time}
                </div>
                <h2 className="text-2xl font-black">{selectedEvent.title}</h2>
              </div>
              {/* Body */}
              <div className="p-8 space-y-6 overflow-y-auto">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0"><Users size={18} className="text-zinc-500" /></div>
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Client Details</p>
                    <p className="font-bold text-zinc-900">{selectedEvent.clientName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${selectedEvent.type === 'online' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}>
                    {selectedEvent.type === 'online' ? <Video size={18} /> : <MapPin size={18} />}
                  </div>
                  <div className="w-full">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Location</p>
                    {!isEditingLink ? (
                      <div className="group flex items-center justify-between bg-white border border-zinc-200 px-4 py-3 rounded-xl transition hover:border-zinc-300">
                        <div>
                          <h4 className="font-bold text-zinc-900 text-sm">{selectedEvent.location}</h4>
                          {selectedEvent.link ? (
                            <a href={selectedEvent.link} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5">เข้าร่วมการประชุม (Link) <ExternalLink size={12} /></a>
                          ) : (
                            <span className="text-xs text-red-400 mt-0.5 block">ยังไม่ได้ระบุลิงก์</span>
                          )}
                        </div>
                        <button onClick={() => setIsEditingLink(true)} className="p-2 bg-zinc-50 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-lg transition opacity-0 group-hover:opacity-100"><Edit2 size={16} /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input type="text" value={linkInput} onChange={(e) => setLinkInput(e.target.value)} placeholder="วางลิงก์ Google Meet ที่นี่..." className="w-full text-sm px-4 py-3 border border-blue-400 ring-2 ring-blue-100 rounded-xl focus:outline-none" autoFocus />
                        <button onClick={handleSaveLink} disabled={isSaving} className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition disabled:opacity-50 shrink-0">
                          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {selectedEvent.agenda && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                      <AlignLeft size={18} className="text-zinc-500" />
                    </div>
                    <div className="w-full">
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Agenda / Details</p>
                      <p className="text-sm text-zinc-700 leading-relaxed bg-zinc-50 border border-zinc-100 p-4 rounded-xl mt-1.5 whitespace-pre-wrap">{selectedEvent.agenda}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
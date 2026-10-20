"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar as CalendarIcon, Clock, MapPin, Video, 
  Users, AlignLeft, X, ChevronRight, FileText, 
  Edit2, Check, Send, ExternalLink, Loader2,
  CheckCircle2, AlertCircle, Plus, Lock, Briefcase, Unlock
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { startOfDay, isSameDay, format, isBefore, endOfDay } from "date-fns";
import { th } from "date-fns/locale";

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
  const [clientList, setClientList] = useState<any[]>([]); 
  const [lockedDates, setLockedDates] = useState<any[]>([]);
  const [projectDates, setProjectDates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('id, full_name, company_name');
      if (error) throw error;
      if (data) setClientList(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const fetchAllCalendarData = async () => {
    setIsLoading(true);
    try {
      const { data: appData, error: appError } = await supabase.from('appointments').select('*').order('date', { ascending: true });
      if (appError) throw appError;
      if (appData) {
        const formattedData = appData.map(app => {
          const d = new Date(app.date);
          return { ...app, dayNumber: d.getDate(), monthNumber: d.getMonth(), yearNumber: d.getFullYear() };
        });
        setAppointments(formattedData);
      }

      const { data: lockData } = await supabase.from('locked_dates').select('*');
      if (lockData) setLockedDates(lockData);

      const { data: projData } = await supabase
        .from('inquiries')
        .select('id, project_name, created_at')
        .not('status', 'ilike', '%เสร็จ%');
      if (projData) setProjectDates(projData);

    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCalendarData();
    fetchClients(); 
  }, [currentDate]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = thaiMonths[month];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); 
  const blanks = Array.from({ length: firstDayOfMonth }); 
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const appointmentsThisMonth = appointments.filter(app => app.yearNumber === year && app.monthNumber === month);
  const filteredAppointments = selectedDate ? appointmentsThisMonth.filter(app => app.dayNumber === selectedDate) : appointmentsThisMonth;

  const getDateString = (d: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const isDateBooked = (day: number) => {
    const targetDateStr = getDateString(day);
    const checkDate = new Date(year, month, day);
    
    const isLocked = lockedDates.some(ld => ld.date && ld.date.startsWith(targetDateStr));
    if (isLocked) return true;
    
    const hasProjectQueue = projectDates.some(proj => proj.created_at && isSameDay(new Date(proj.created_at), checkDate));
    if (hasProjectQueue) return true;
    
    const hasAppointment = appointmentsThisMonth.some(app => app.dayNumber === day);
    if (hasAppointment) return true;
    
    return false;
  };

  // 🌟 ฟังก์ชันเช็กว่าวันที่นั้นเป็น "อดีต" ไปแล้วหรือยัง
  const isPastDate = (day: number) => {
    const checkDate = endOfDay(new Date(year, month, day)); 
    return isBefore(checkDate, new Date());
  };

  const toggleLockDate = async () => {
    if (!selectedDate) return;
    const targetDateStr = getDateString(selectedDate);
    const existingLock = lockedDates.find(ld => ld.date && ld.date.startsWith(targetDateStr));

    try {
      if (existingLock) {
        setLockedDates(prev => prev.filter(ld => ld.id !== existingLock.id));
        const { error } = await supabase.from('locked_dates').delete().eq('id', existingLock.id);
        if (error) throw error; 
        showToast("ปลดล็อกคิวเรียบร้อย", "success");
      } else {
        const tempId = Date.now().toString();
        setLockedDates(prev => [...prev, { id: tempId, date: targetDateStr, reason: 'ปิดรับคิว (Manual)' }]);
        const { error } = await supabase.from('locked_dates').insert([{ date: targetDateStr, reason: 'ปิดรับคิว (Manual)' }]);
        if (error) throw error; 
        showToast("ล็อกคิววันนี้เรียบร้อย", "success");
      }
    } catch (error: any) {
      showToast("DB Error: " + error.message, "error");
      fetchAllCalendarData(); 
    }
  };

  const handleQuickLockToggle = async (day: number, e: React.MouseEvent) => {
    e.stopPropagation(); 
    const targetDateStr = getDateString(day);
    const existingLock = lockedDates.find(ld => ld.date && ld.date.startsWith(targetDateStr));

    try {
      if (existingLock) {
        setLockedDates(prev => prev.filter(ld => ld.id !== existingLock.id));
        const { error } = await supabase.from('locked_dates').delete().eq('id', existingLock.id);
        if (error) throw error; 
        showToast("ปลดล็อกคิวเรียบร้อย", "success");
      } else {
        const tempId = Date.now().toString();
        setLockedDates(prev => [...prev, { id: tempId, date: targetDateStr, reason: 'ปิดรับคิว (Manual)' }]);
        const { error } = await supabase.from('locked_dates').insert([{ date: targetDateStr, reason: 'ปิดรับคิว (Manual)' }]);
        if (error) throw error; 
        showToast("ล็อกคิววันนี้เรียบร้อย", "success");
      }
    } catch (error: any) {
      showToast("DB Error: " + error.message, "error");
      fetchAllCalendarData();
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const { error } = await supabase
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
        }]);

      if (error) throw error;

      showToast("สร้างนัดหมายเรียบร้อย!", "success");
      setIsAddModalOpen(false);
      setNewApp({ title: "", date: "", time: "", client_id: "", client_name: "", type: "online", location: "Google Meet", color: "blue", agenda: "", link: "" });
      
      fetchAllCalendarData();
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
      fetchAllCalendarData();
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

      <div className="w-full md:w-[380px] bg-white border-r border-zinc-100 flex flex-col h-full z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Clock size={20} className="text-zinc-400" /> 
            {selectedDate ? `วันที่ ${selectedDate} ${monthName}` : `นัดหมายของเดือนนี้`}
          </h2>
          {selectedDate && filteredAppointments.length > 0 && (
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
                  <p className="text-sm">ไม่มีนัดหมายในระบบ</p>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {selectedDate && (
             <div className="mt-4 pt-4 border-t border-zinc-100">
                {isPastDate(selectedDate) ? (
                   // 🌟 ถ้าเป็นวันในอดีต ซ่อนปุ่มล็อค
                   <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col gap-3 opacity-60">
                      <div className="flex items-center gap-2 text-zinc-500 font-bold text-sm">
                         <Clock size={16} /> วันนี้ผ่านไปแล้ว
                      </div>
                   </div>
                ) : isDateBooked(selectedDate) ? (
                   <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
                         <Lock size={16} /> คิวเต็มแล้ว / ปิดรับคิว
                      </div>
                      <button onClick={toggleLockDate} className="w-full py-2 bg-white border border-red-200 text-red-500 rounded-xl text-xs font-bold hover:bg-red-50 transition">
                         ปลดล็อกคิวนี้
                      </button>
                   </div>
                ) : (
                   <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-green-500 font-bold text-sm">
                         <CheckCircle2 size={16} /> ว่างรับคิวได้
                      </div>
                      <button onClick={toggleLockDate} className="w-full py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition">
                         บล็อกรับคิว 1 วัน (Manual)
                      </button>
                   </div>
                )}
             </div>
          )}
        </div>

        <div className="p-6 border-t border-zinc-100 bg-zinc-50/50">
          <button 
            onClick={() => {
               setCurrentDate(new Date()); // กลับไปเดือนปัจจุบัน
               setSelectedDate(null);
            }}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-white border border-zinc-200 text-black hover:bg-zinc-100 shadow-sm"
          >
            <CalendarIcon size={16} /> กลับไปเดือนปัจจุบัน
          </button>
        </div>
      </div>

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
              const checkDate = new Date(year, month, day);
              
              const currentDayStr = getDateString(day);
              const hasProjectQueue = projectDates.some(proj => proj.created_at && isSameDay(new Date(proj.created_at), checkDate));
              const isLockedManual = lockedDates.some(ld => ld.date && ld.date.startsWith(currentDayStr));
              const hasAppointment = dayEvents.length > 0;
              
              const isAutoBooked = hasProjectQueue || hasAppointment;
              const booked = isAutoBooked || isLockedManual; 
              const isSelected = selectedDate === day;
              
              // 🌟 เช็กว่าเป็นอดีตไหม
              const isPast = isPastDate(day);

              return (
                <div 
                  key={day} onClick={() => setSelectedDate(day)}
                  className={`bg-white min-h-[120px] p-2 border-t border-zinc-50 transition-colors cursor-pointer relative group 
                    ${isSelected ? 'ring-2 ring-inset ring-black bg-zinc-50/50' : 'hover:bg-zinc-50'}
                    ${booked && !isSelected && !isPast ? 'bg-zinc-50/80 grayscale-[30%]' : ''}
                    ${isPast ? 'bg-zinc-50/50 opacity-50 cursor-not-allowed' : ''} 
                  `}
                >
                  <div className="flex justify-between items-start">
                    <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${isSelected ? 'bg-black text-white' : booked || isPast ? 'text-zinc-400' : 'text-black'}`}>
                      {day}
                    </span>
                    
                    {/* 🌟 ซ่อนปุ่มล็อคถ้าเป็นอดีตไปแล้ว */}
                    {!isAutoBooked && !isPast && (
                       <button 
                         onClick={(e) => handleQuickLockToggle(day, e)}
                         className={`p-1.5 rounded-lg transition-all duration-300 ${
                           isLockedManual 
                           ? 'text-white bg-red-500 hover:bg-red-600 opacity-100 shadow-md scale-105' 
                           : 'text-zinc-300 hover:text-zinc-800 hover:bg-zinc-200 opacity-0 group-hover:opacity-100'
                         }`}
                         title={isLockedManual ? "คลิกเพื่อปลดล็อกวัน" : "คลิกเพื่อล็อกวัน (ไม่รับคิว)"}
                       >
                         <AnimatePresence mode="wait">
                           {isLockedManual ? (
                             <motion.div key="locked" initial={{ scale: 0.5, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.2 }}>
                               <Lock size={14} />
                             </motion.div>
                           ) : (
                             <motion.div key="unlocked" initial={{ scale: 0.5, rotate: 45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.2 }}>
                               <Unlock size={14} />
                             </motion.div>
                           )}
                         </AnimatePresence>
                       </button>
                    )}
                  </div>
                  
                  <div className="mt-2 space-y-1.5 flex flex-col justify-end h-full">
                    {dayEvents.map(event => (
                      <div key={event.id} className={`text-[10px] font-bold px-2 py-1 rounded-md truncate ${colorMap[event.color]?.bg || 'bg-blue-500'} ${colorMap[event.color]?.text || 'text-white'}`}>
                        {event.time.split(' ')[0]} {event.title}
                      </div>
                    ))}
                    
                    {hasProjectQueue && (
                      <div className="text-[10px] font-bold px-2 py-1 rounded-md bg-orange-500 text-white truncate shadow-sm flex items-center gap-1">
                        <Briefcase size={10} /> คิวโปรเจกต์
                      </div>
                    )}
                    
                    {isLockedManual && (
                      <div className="text-[10px] font-bold px-2 py-1 rounded-md bg-red-500 text-white truncate shadow-sm flex items-center gap-1">
                        <Lock size={10} /> ปิดรับคิว
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

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
                {newApp.date && isDateBooked(parseInt(newApp.date.split('-')[2])) && (
                  <div className="p-3 bg-red-50 text-red-500 rounded-xl text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={16} /> วันที่เลือกคิวเต็มแล้ว (ระบบรับแค่ 1 เคส/วัน) แต่ยังสามารถฝืนบันทึกได้ครับ
                  </div>
                )}
                
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

      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedEvent(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
              <div className={`${colorMap[selectedEvent.color]?.bg || 'bg-blue-500'} px-8 py-6 text-white relative shrink-0`}>
                <button onClick={() => setSelectedEvent(null)} className="absolute top-6 right-6 w-8 h-8 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center transition"><X size={18} /></button>
                <div className="flex items-center gap-2 text-sm font-bold opacity-80 mb-2">
                   <CalendarIcon size={16} /> {selectedEvent.dayNumber} {monthName} {year} {selectedEvent.time}
                </div>
                <h2 className="text-2xl font-black">{selectedEvent.title}</h2>
              </div>
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
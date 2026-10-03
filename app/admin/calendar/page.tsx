"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar as CalendarIcon, Clock, MapPin, Video, 
  Users, AlignLeft, X, ChevronRight, FileText, 
  Edit2, Check, Send, ExternalLink, Loader2,
  CheckCircle2, AlertCircle // 🌟 เพิ่มไอคอนสำหรับแจ้งเตือน
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// 🌟 ข้อมูลจำลองนัดหมาย
const appointments = [
  {
    id: 1,
    date: "2026-10-15",
    dayNumber: 15,
    time: "10:00 - 11:30",
    title: "ส่งมอบงาน N-SIGHT",
    clientName: "คุณนัท",
    clientCompany: "N-SIGHT Co., Ltd.",
    type: "online",
    location: "Google Meet",
    link: "https://meet.google.com/abc-defg-hij",
    color: "blue",
    agenda: "พรีเซนต์ระบบรอบ Final, ส่งมอบ Source Code และสอนการใช้งาน Dashboard เบื้องต้น",
    attendees: ["คุณนัท (CEO)", "ทีมการตลาด N-SIGHT", "ทีม Dev TidalSync"]
  },
  {
    id: 2,
    date: "2026-10-18",
    dayNumber: 18,
    time: "14:00 - 16:00",
    title: "UAT ระบบจองคิว",
    clientName: "คุณสมชาย",
    clientCompany: "คลินิกหมอใจดี",
    type: "onsite",
    location: "คลินิกหมอใจดี สาขาลาดพร้าว",
    link: null,
    color: "orange",
    agenda: "ทดสอบระบบจองคิวหน้าเคาน์เตอร์จริง, จำลองสถานการณ์ลูกค้า Walk-in และทดสอบระบบพิมพ์บัตรคิว",
    attendees: ["คุณสมชาย", "พนักงานต้อนรับ 2 ท่าน"]
  },
  {
    id: 3,
    date: "2026-10-22",
    dayNumber: 22,
    time: "09:00 - 10:30",
    title: "ประชุม Requirement",
    clientName: "Tutor Center",
    clientCompany: "สถาบันกวดวิชา Tutor Center",
    type: "online",
    location: "Google Meet",
    link: "https://meet.google.com/xyz-uvwx-yz",
    color: "purple",
    agenda: "พูดคุยและเก็บ Requirement ระบบจัดการคอร์สเรียนออนไลน์, ระบบชำระเงิน และระบบตรวจการบ้าน",
    attendees: ["ครูพี่แอน", "ฝ่ายวิชาการ", "นนท์ธวัฒน์ (System Analyst)"]
  },
  {
    id: 4,
    date: "2026-11-05",
    dayNumber: 5,
    time: "13:00 - 15:00",
    title: "Kickoff Project ใหม่",
    clientName: "คุณเอก",
    clientCompany: "บริษัท โลจิสติกส์ ไทย",
    type: "online",
    location: "Zoom",
    link: "https://zoom.us/j/123456789",
    color: "blue",
    agenda: "เริ่มงานพัฒนาระบบหลังบ้าน Logistics",
    attendees: ["คุณเอก", "ทีมจัดการขนส่ง", "นนท์ธวัฒน์"]
  }
];

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
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); 
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  
  // State สำหรับ Modal
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingChat, setIsSendingChat] = useState(false);

  // 🌟 State สำหรับระบบแจ้งเตือน (Custom Toast)
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({ show: false, message: "", type: "success" });

  // 🌟 ฟังก์ชันเรียกใช้แจ้งเตือน
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000); // แจ้งเตือนจะหายไปเองใน 3 วินาที
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = thaiMonths[month];
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); 
  
  const blanks = Array.from({ length: firstDayOfMonth }); 
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null); 
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const appointmentsThisMonth = appointments.filter(app => {
    const appDate = new Date(app.date);
    return appDate.getFullYear() === year && appDate.getMonth() === month;
  });

  const filteredAppointments = selectedDate 
    ? appointmentsThisMonth.filter(app => app.dayNumber === selectedDate)
    : appointmentsThisMonth;

  const openModal = (app: any) => {
    setSelectedEvent(app);
    setLinkInput(app.link || "");
    setIsEditingLink(false);
  };

  // 🌟 แก้ไข: บันทึกลิงก์และเรียก Toast แทน alert
  const handleSaveLink = async () => {
    setIsSaving(true);
    try {
      // await supabase.from('inquiries').update({ meeting_link: linkInput }).eq('id', selectedEvent.id);
      setSelectedEvent({ ...selectedEvent, link: linkInput });
      setIsEditingLink(false);
      showToast("บันทึกลิงก์ Google Meet สำเร็จ", "success");
    } catch (error: any) {
      showToast("บันทึกลิงก์ไม่สำเร็จ: " + error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // 🌟 แก้ไข: ส่งลิงก์เข้าแชทและเรียก Toast แทน alert
  const handleSendToChat = async () => {
    if (!linkInput) return;
    setIsSendingChat(true);
    
    try {
      // const { data: { user } } = await supabase.auth.getUser();
      // await supabase.from('messages').insert([{ project_id: selectedEvent.id, sender_id: user.id, message: `📍 ลิงก์สำหรับเข้าร่วมประชุม Google Meet ครับ:\n${linkInput}`, is_admin: true }]);

      await new Promise(resolve => setTimeout(resolve, 800)); // จำลองการโหลด
      showToast("ส่งลิงก์แจ้งเตือนเข้าแชทลูกค้าเรียบร้อยแล้ว!", "success");
    } catch (error: any) {
      showToast("ส่งแชทไม่สำเร็จ: " + error.message, "error");
    } finally {
      setIsSendingChat(false);
    }
  };


  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans relative">
      
      {/* 🌟 🌟 🌟 แถบแจ้งเตือน Custom Toast (หรูหรา ดูแพง) 🌟 🌟 🌟 */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border ${
              toast.type === 'success' 
                ? 'bg-zinc-900 text-white border-zinc-800' 
                : 'bg-red-50 text-red-600 border-red-100'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 size={18} className="text-green-400" />
            ) : (
              <AlertCircle size={18} className="text-red-500" />
            )}
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
          <AnimatePresence mode="popLayout">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((app) => (
                <motion.div
                  key={app.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => openModal(app)} 
                  className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${colorMap[app.color].bg} ${colorMap[app.color].text}`}>
                      {app.dayNumber} {monthName.substring(0, 3)}.
                    </span>
                  </div>
                  <h3 className="font-bold text-zinc-900 group-hover:text-black">{app.title}</h3>
                  <p className="text-sm text-zinc-500 mb-4">{app.clientName}</p>
                  
                  <div className="space-y-2 text-xs font-medium text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Clock size={14} /> {app.time}
                    </div>
                    <div className="flex items-center gap-2">
                      {app.type === 'online' ? <Video size={14} /> : <MapPin size={14} />} 
                      {app.location}
                    </div>
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
        </div>

        {/* ปุ่มดูตารางทั้งหมด */}
        <div className="p-6 border-t border-zinc-100 bg-zinc-50/50">
          <button 
            onClick={() => setSelectedDate(null)}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              selectedDate === null 
                ? "bg-zinc-200 text-zinc-500 cursor-default" 
                : "bg-white border border-zinc-200 text-black hover:bg-zinc-100 shadow-sm"
            }`}
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
            <div className="flex gap-2">
              <button 
                onClick={handlePrevMonth} 
                className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:bg-zinc-50 hover:text-black transition"
              >
                <ChevronRight size={20} className="rotate-180" />
              </button>
              <button 
                onClick={handleNextMonth} 
                className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:bg-zinc-50 hover:text-black transition"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-zinc-100 border border-zinc-100 rounded-2xl overflow-hidden">
            {weekDays.map(day => (
              <div key={day} className="bg-white py-4 text-center text-xs font-bold text-zinc-400">{day}</div>
            ))}

            {blanks.map((_, i) => (
              <div key={`blank-${i}`} className="bg-white/50 min-h-[120px] p-2"></div>
            ))}

            {days.map(day => {
              const dayEvents = appointmentsThisMonth.filter(app => app.dayNumber === day);
              const isSelected = selectedDate === day;

              return (
                <div 
                  key={day} 
                  onClick={() => setSelectedDate(day)}
                  className={`bg-white min-h-[120px] p-2 border-t border-zinc-50 transition-colors cursor-pointer relative group ${
                    isSelected ? 'ring-2 ring-inset ring-black bg-zinc-50/50' : 'hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${
                      isSelected ? 'bg-black text-white' : dayEvents.length > 0 ? 'text-black' : 'text-zinc-400'
                    }`}>
                      {day}
                    </span>
                  </div>
                  
                  <div className="mt-2 space-y-1.5">
                    {dayEvents.map(event => (
                      <div key={event.id} className={`text-[10px] font-bold px-2 py-1 rounded-md truncate ${colorMap[event.color].bg} ${colorMap[event.color].text}`}>
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

      {/* Modal โชว์รายละเอียดนัดหมาย */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className={`${colorMap[selectedEvent.color].bg} px-8 py-6 text-white relative shrink-0`}>
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-6 right-6 w-8 h-8 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center transition"
                >
                  <X size={18} />
                </button>
                <div className="flex items-center gap-2 text-sm font-bold opacity-80 mb-2">
                  <CalendarIcon size={16} /> {selectedEvent.dayNumber} {monthName} {year} • {selectedEvent.time}
                </div>
                <h2 className="text-2xl font-black">{selectedEvent.title}</h2>
              </div>

              {/* Body */}
              <div className="p-8 space-y-6 overflow-y-auto">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                    <Users size={18} className="text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Client Details</p>
                    <p className="font-bold text-zinc-900">{selectedEvent.clientName}</p>
                    <p className="text-sm text-zinc-500">{selectedEvent.clientCompany}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${selectedEvent.type === 'online' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}>
                    {selectedEvent.type === 'online' ? <Video size={18} /> : <MapPin size={18} />}
                  </div>
                  <div className="w-full">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Location</p>
                    
                    {selectedEvent.type === 'online' ? (
                      !isEditingLink ? (
                        <div className="group flex items-center justify-between bg-white border border-zinc-200 px-4 py-3 rounded-xl transition hover:border-zinc-300">
                          <div>
                            <h4 className="font-bold text-zinc-900 text-sm">{selectedEvent.location}</h4>
                            {selectedEvent.link ? (
                              <a href={selectedEvent.link} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5">
                                เข้าร่วมการประชุม (Link) <ExternalLink size={12} />
                              </a>
                            ) : (
                              <span className="text-xs text-red-400 mt-0.5 block">ยังไม่ได้ระบุลิงก์</span>
                            )}
                          </div>
                          <button 
                            onClick={() => setIsEditingLink(true)}
                            className="p-2 bg-zinc-50 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-lg transition opacity-0 group-hover:opacity-100"
                          >
                            <Edit2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input 
                            type="text"
                            value={linkInput}
                            onChange={(e) => setLinkInput(e.target.value)}
                            placeholder="วางลิงก์ Google Meet ที่นี่..."
                            className="w-full text-sm px-4 py-3 border border-blue-400 ring-2 ring-blue-100 rounded-xl focus:outline-none"
                            autoFocus
                          />
                          <button 
                            onClick={handleSaveLink}
                            disabled={isSaving}
                            className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition disabled:opacity-50 shrink-0"
                          >
                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                          </button>
                        </div>
                      )
                    ) : (
                      <p className="font-bold text-zinc-900 mt-1">{selectedEvent.location}</p>
                    )}

                    {selectedEvent.type === 'online' && selectedEvent.link && !isEditingLink && (
                      <button 
                        onClick={handleSendToChat}
                        disabled={isSendingChat}
                        className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition disabled:opacity-50"
                      >
                        {isSendingChat ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        ส่งลิงก์แจ้งเตือนเข้าแชทลูกค้า
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                    <AlignLeft size={18} className="text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Agenda / Details</p>
                    <p className="text-sm text-zinc-700 leading-relaxed bg-zinc-50 border border-zinc-100 p-4 rounded-xl mt-1.5">{selectedEvent.agenda}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-zinc-200">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <Users size={14} /> ผู้เข้าร่วมทั้งหมด ({selectedEvent.attendees.length})
                  </p>
                  <ul className="space-y-2">
                    {selectedEvent.attendees.map((person: string, idx: number) => (
                      <li key={idx} className="text-sm font-medium text-zinc-800 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-300"></div> {person}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
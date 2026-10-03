"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Send, Code, ShoppingCart, Sparkles, CheckCircle2, 
  Paperclip, Link as LinkIcon, Building2, Calendar, ChevronLeft, ChevronRight, 
  Loader2, MessageSquare, FileText, ChevronDown // 🌟 เพิ่ม ChevronDown
} from "lucide-react";
import { supabase } from "@/lib/supabase"; 

export default function NewProjectPage() {
  const params = useParams();
  const lang = params.lang === "en" ? "en" : "th";

  // State สำหรับส่งข้อมูลโปรเจค
  const [projectName, setProjectName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [brief, setBrief] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  
  // 🌟 State ใหม่: ข้อมูลสำหรับออกเอกสาร & เก็บข้อมูลผู้ใช้
  const [billingAddress, setBillingAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const [createdProjectId, setCreatedProjectId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isBudgetFlexible, setIsBudgetFlexible] = useState(false); 
  const [bookingDate, setBookingDate] = useState(""); 

  // 🌟 State สำหรับ Custom Dropdown ระยะเวลา
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const timelineOptions = [
    { value: "urgent", label: "ด่วนมาก (ภายใน 2 สัปดาห์)" },
    { value: "1month", label: "1 เดือน" },
    { value: "2-3months", label: "2-3 เดือน" },
    { value: "flexible", label: "ยืดหยุ่นได้ (Flexible)" }
  ];
  const selectedTimelineLabel = timelineOptions.find(t => t.value === timeline)?.label || "";

  // 🌟 ดึงข้อมูลจาก Profile มา Auto-fill ตอนเปิดหน้าเว็บ
  useEffect(() => {
    const fetchProfileData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_name, billing_address, tax_id')
          .eq('id', user.id)
          .single();

        if (profile) {
          if (profile.company_name) setCompanyName(profile.company_name);
          if (profile.billing_address) setBillingAddress(profile.billing_address);
          if (profile.tax_id) setTaxId(profile.tax_id);
        }
      }
    };
    fetchProfileData();
  }, []);

  // ================= LOGIC ปฏิทินแบบ Custom =================
  const lockedDates = ["2026-09-12", "2026-09-13", "2026-09-19", "2026-09-20"];
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 8));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const monthNames = {
    th: ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"],
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  };
  const dayNames = { th: ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"], en: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] };

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const handleSelectDate = (day: number) => {
    const formattedDate = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (!lockedDates.includes(formattedDate)) {
      setBookingDate(formattedDate);
      setIsCalendarOpen(false);
    }
  };

  const renderCalendarDays = () => {
    let days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const formattedDate = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isLocked = lockedDates.includes(formattedDate);
      const isSelected = bookingDate === formattedDate;

      days.push(
        <button
          key={day}
          type="button" 
          disabled={isLocked}
          onClick={() => handleSelectDate(day)}
          className={`h-10 w-10 rounded-full flex items-center justify-center text-sm transition-all
            ${isLocked ? 'text-zinc-300 bg-zinc-50 cursor-not-allowed line-through' : 
              isSelected ? 'bg-black text-white font-bold shadow-md' : 
              'text-zinc-700 hover:bg-zinc-100 font-medium'}
          `}
        >
          {day}
        </button>
      );
    }
    return days;
  };

  // ================= 🌟 ฟังก์ชัน Submit =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const typeLabel = projectTypes.find(t => t.id === selectedType)?.title || "Other";

      const { data: inquiryData, error: inquiryError } = await supabase
        .from('inquiries')
        .insert([
          {
            user_id: userId,
            project_name: projectName,
            company_name: companyName,
            project_type: typeLabel,
            budget: isBudgetFlexible ? null : parseFloat(budget),
            is_budget_flexible: isBudgetFlexible,
            timeline: timeline,
            brief: brief,
            booking_date: bookingDate || null,
            reference_url: referenceUrl,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (inquiryError) throw inquiryError;
      
      if (userId) {
         await supabase
           .from('profiles')
           .update({
             company_name: companyName,
             billing_address: billingAddress,
             tax_id: taxId
           })
           .eq('id', userId);
      }

      setCreatedProjectId(inquiryData.id);
      setIsSubmitted(true); 

    } catch (error: any) {
      console.error("Error submitting:", error.message);
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  const projectTypes = [
    { id: "webapp", title: "Web Application", desc: "ระบบจัดการหลังบ้าน, แดชบอร์ด", icon: <Code size={24} /> },
    { id: "ecommerce", title: "E-Commerce", desc: "เว็บไซต์ขายของออนไลน์", icon: <ShoppingCart size={24} /> },
    { id: "custom", title: "Custom Design", desc: "ออกแบบ UI/UX, เว็บไซต์องค์กร", icon: <Sparkles size={24} /> },
  ];

  const chatTitle = companyName ? `${projectName} - ${companyName}` : projectName;
  const chatUrl = `/${lang}/dashboard/chat/${createdProjectId}?title=${encodeURIComponent(chatTitle)}`;

  return (
    <main className="min-h-screen bg-zinc-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        
        <Link href={`/${lang}/dashboard`} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-black transition mb-8 bg-white px-4 py-2 rounded-full border border-zinc-200 shadow-sm">
          <ArrowLeft size={16} /> กลับไปหน้างานของฉัน
        </Link>

        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-3xl shadow-xl shadow-zinc-200/50 p-8 md:p-12 border border-zinc-100"
            >
              <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight">เริ่มต้นโปรเจคใหม่</h1>
                <p className="text-zinc-500 mt-2">บอกเล่าไอเดียของคุณให้เราฟัง เพื่อให้ทีมงานประเมินราคาและระยะเวลาเบื้องต้น</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* 1. ชื่อโปรเจค & ชื่อแบรนด์ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-zinc-900 mb-3">1. ชื่อโปรเจคของคุณ</label>
                    <input 
                      type="text" 
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="เช่น ระบบจองคิวออนไลน์" 
                      className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-900 mb-3">
                      ชื่อแบรนด์ / ธุรกิจ <span className="text-zinc-400 font-normal">(ถ้ามี)</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-4 text-zinc-400" size={18} />
                      <input 
                        type="text" 
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="เช่น คลินิกหมอใจดี" 
                        className="w-full pl-11 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. ประเภทโปรเจค */}
                <div>
                  <label className="block text-sm font-bold text-zinc-900 mb-4">2. ประเภทงานที่สนใจ</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {projectTypes.map((type) => (
                      <div 
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-start gap-3 ${
                          selectedType === type.id 
                          ? "border-black bg-zinc-50" 
                          : "border-zinc-100 bg-white hover:border-zinc-300 hover:shadow-sm"
                        }`}
                      >
                        <div className={`p-2 rounded-full ${selectedType === type.id ? "bg-black text-white" : "bg-zinc-100 text-zinc-500"}`}>
                          {type.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-zinc-900">{type.title}</h3>
                          <p className="text-xs text-zinc-500 mt-1">{type.desc}</p>
                        </div>
                        {selectedType === type.id && (
                          <div className="absolute top-4 right-4 text-black">
                            <CheckCircle2 size={18} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* ซ่อน input ไว้เพื่อทำ Required Validation สำหรับโปรเจค */}
                  <input type="text" readOnly required value={selectedType || ""} className="opacity-0 absolute w-px h-px pointer-events-none -z-10" tabIndex={-1} />
                </div>

                {/* 3. งบประมาณ & ระยะเวลา */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-zinc-900 mb-3">3. งบประมาณโดยประมาณ (บาท)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder={isBudgetFlexible ? "ไม่ได้ระบุ" : "เช่น 45000"} 
                        disabled={isBudgetFlexible}
                        className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition text-sm disabled:opacity-50 disabled:bg-zinc-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        required={!isBudgetFlexible}
                      />
                      {!isBudgetFlexible && <span className="absolute right-4 top-4 text-zinc-400 text-sm">THB</span>}
                    </div>
                    <label className="flex items-center gap-2 mt-3 cursor-pointer group w-fit">
                      <input 
                        type="checkbox" 
                        checked={isBudgetFlexible}
                        onChange={() => {
                          setIsBudgetFlexible(!isBudgetFlexible);
                          if (!isBudgetFlexible) setBudget(""); 
                        }}
                        className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-black cursor-pointer" 
                      />
                      <span className="text-sm text-zinc-500 group-hover:text-black transition">ยังไม่แน่ใจ ต้องการปรึกษาก่อน</span>
                    </label>
                  </div>

                  {/* 🌟 4. ระยะเวลาที่ต้องการรับงาน (Custom Dropdown) */}
                  <div>
                    <label className="block text-sm font-bold text-zinc-900 mb-3">4. ระยะเวลาที่ต้องการรับงาน</label>
                    <div className="relative">
                      
                      {/* กล่องปุ่มกดจำลอง */}
                      <div 
                        onClick={() => setIsTimelineOpen(!isTimelineOpen)}
                        className={`w-full p-4 bg-zinc-50 border rounded-xl cursor-pointer flex justify-between items-center transition-all duration-200 ${
                          isTimelineOpen ? 'border-black ring-2 ring-black' : 'border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        <span className={`text-sm ${timeline ? "text-zinc-900 font-medium" : "text-zinc-400"}`}>
                          {selectedTimelineLabel || "เลือกระยะเวลา..."}
                        </span>
                        <ChevronDown size={16} className={`text-zinc-400 transition-transform duration-300 ${isTimelineOpen ? 'rotate-180' : ''}`} />
                      </div>
                      
                      {/* เมนูที่กางลงมา */}
                      <AnimatePresence>
                        {isTimelineOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsTimelineOpen(false)} />
                            
                            <motion.div 
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              transition={{ duration: 0.15, ease: "easeOut" }}
                              className="absolute z-50 w-full mt-2 bg-white border border-zinc-100 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden py-1"
                            >
                              {timelineOptions.map((option) => (
                                <div 
                                  key={option.value}
                                  onClick={() => { setTimeline(option.value); setIsTimelineOpen(false); }}
                                  className={`px-4 py-3 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                                    timeline === option.value 
                                      ? 'bg-zinc-50 font-bold text-black' 
                                      : 'text-zinc-600 hover:bg-zinc-50'
                                  }`}
                                >
                                  {option.label}
                                  {timeline === option.value && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                      <CheckCircle2 size={16} className="text-black" />
                                    </motion.div>
                                  )}
                                </div>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                      
                      {/* ซ่อน input ไว้เพื่อทำ Required Validation สำหรับ Custom Dropdown */}
                      <input type="text" readOnly required value={timeline} className="opacity-0 absolute w-px h-px pointer-events-none -z-10" tabIndex={-1} />
                    </div>
                  </div>
                </div>

                {/* 5. รายละเอียดงาน */}
                <div>
                  <label className="block text-sm font-bold text-zinc-900 mb-3">5. รายละเอียดโปรเจค (Brief)</label>
                  <textarea 
                    rows={5} 
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    placeholder="อธิบายฟีเจอร์หลักๆ ที่ต้องการ หรือปัญหาที่ต้องการให้ระบบนี้ช่วยแก้..." 
                    className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition text-sm resize-none"
                    required
                  ></textarea>
                </div>

                {/* 6. วันนัดหมาย */}
                <div className="relative">
                  <label className="block text-sm font-bold text-zinc-900 mb-3">6. วันที่สะดวกคุยรายละเอียดเบื้องต้น (ถ้ามี)</label>
                  
                  <button 
                    type="button" 
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    className="w-full flex items-center p-4 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 hover:border-zinc-300 transition text-sm text-left relative"
                  >
                    <Calendar className="absolute left-4 text-zinc-400" size={18} />
                    <span className={`ml-8 ${bookingDate ? "font-medium text-black" : "text-zinc-500"}`}>
                      {bookingDate ? bookingDate : "คลิกเพื่อเลือกวันที่สะดวก..."}
                    </span>
                  </button>

                  <p className="text-xs text-zinc-500 mt-2 ml-1">วันที่เป็นสีเทาคือวันหยุดหรือคิวเต็ม กรุณาเลือกวันอื่นครับ</p>

                  <AnimatePresence>
                    {isCalendarOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute left-0 top-20 w-full max-w-[340px] bg-white border border-zinc-200 shadow-2xl rounded-2xl p-4 z-50"
                      >
                        <div className="flex justify-between items-center mb-4 px-2">
                          <button type="button" onClick={prevMonth} className="p-1.5 hover:bg-zinc-100 rounded-full transition"><ChevronLeft size={18} /></button>
                          <span className="font-bold text-sm">
                            {monthNames[lang][currentMonth.getMonth()]} {lang === 'th' ? currentMonth.getFullYear() + 543 : currentMonth.getFullYear()}
                          </span>
                          <button type="button" onClick={nextMonth} className="p-1.5 hover:bg-zinc-100 rounded-full transition"><ChevronRight size={18} /></button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {dayNames[lang].map((day, i) => (
                            <div key={i} className="text-center text-[11px] font-bold text-zinc-400">{day}</div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {renderCalendarDays()}
                        </div>
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-zinc-100 text-[10px] md:text-xs">
                          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-black rounded-full"></div> เลือกแล้ว</div>
                          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-zinc-100 border border-zinc-200 rounded-full flex items-center justify-center"><span className="w-full h-px bg-zinc-300 rotate-45"></span></div> คิวเต็ม/วันหยุด</div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 7. ลิงก์อ้างอิง & แนบไฟล์ */}
                <div className="bg-zinc-50/50 p-6 rounded-2xl border border-zinc-100 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                     <Sparkles size={16} className="text-zinc-400" />
                     <h4 className="text-sm font-bold text-zinc-700">แนบข้อมูลเพิ่มเติม (ถ้ามี)</h4>
                  </div>
                  
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-3.5 text-zinc-400" size={18} />
                    <input 
                      type="text" 
                      value={referenceUrl}
                      onChange={(e) => setReferenceUrl(e.target.value)}
                      placeholder="ลิงก์ตัวอย่างเว็บไซต์ที่ชอบ (Reference URLs)" 
                      className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm transition" 
                    />
                  </div>

                  <button type="button" className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-zinc-200 bg-white rounded-xl text-sm font-medium text-zinc-500 hover:text-black hover:border-zinc-400 transition cursor-pointer">
                    <Paperclip size={16} /> อัปโหลดไฟล์เอกสาร หรือ Brand Guidelines (PDF, ZIP)
                  </button>
                </div>

                {/* 8. ข้อมูลสำหรับออกเอกสาร (Auto-save) */}
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-blue-500" />
                        <h4 className="text-sm font-bold text-blue-900">ข้อมูลสำหรับออกเอกสาร (Billing Information)</h4>
                      </div>
                      <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded-md font-bold w-fit">บันทึกอัตโนมัติ</span>
                    </div>
                    <p className="text-xs text-blue-700/70 mb-4">ข้อมูลส่วนนี้จะถูกบันทึกไว้ในโปรไฟล์ของคุณอัตโนมัติ เพื่อให้ทีมงานสามารถจัดทำใบเสนอราคาให้คุณได้อย่างรวดเร็ว</p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-blue-800 mb-2 uppercase tracking-wider">ที่อยู่บริษัท / ที่อยู่สำหรับออกบิล</label>
                        <textarea 
                          value={billingAddress}
                          onChange={(e) => setBillingAddress(e.target.value)}
                          placeholder="เลขที่ อาคาร ซอย ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์" 
                          className="w-full p-3.5 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm resize-none"
                          rows={3}
                          required
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-blue-800 mb-2 uppercase tracking-wider">เลขประจำตัวผู้เสียภาษี / เลขบัตรประชาชน</label>
                        <input 
                          type="text" 
                          value={taxId}
                          onChange={(e) => setTaxId(e.target.value)}
                          placeholder="กรอกเลข 13 หลัก" 
                          className="w-full p-3.5 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={!selectedType || isSubmitting}
                  className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-zinc-800 transition flex items-center justify-center gap-2 mt-4 shadow-lg shadow-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <><Loader2 size={18} className="animate-spin" /> กำลังส่งข้อมูล...</>
                  ) : (
                    <>ส่งข้อมูลเพื่อประเมินราคา <Send size={18} className="-ml-1" /></>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="bg-white rounded-3xl shadow-xl shadow-zinc-200/50 p-12 text-center border border-zinc-100 flex flex-col items-center justify-center min-h-[500px]"
            >
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-bold mb-4">ได้รับข้อมูลเรียบร้อย!</h2>
              <p className="text-zinc-500 max-w-md mx-auto mb-8 text-sm leading-relaxed">
                ขอบคุณที่สนใจร่วมงานกับ TidalSync ครับ <br/>
                ทีมงานจะทำการประเมินราคาและส่งใบเสนอราคาผ่านช่องทางแชท ภายใน 1-2 วันทำการครับ
              </p>
              
              <Link 
                href={chatUrl} 
                className="bg-black text-white px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition shadow-lg shadow-zinc-200"
              >
                เข้าสู่ห้องแชทของโปรเจค <MessageSquare size={18} />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}
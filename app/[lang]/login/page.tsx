"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, Loader2, ShieldCheck, AlertCircle, User, Phone, Building2, Briefcase, MessageCircle, Store } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang === "en" ? "en" : "th";

  const [isLogin, setIsLogin] = useState(true);
  
  // State พื้นฐาน
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // State สำหรับหน้าสมัครสมาชิก
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clientType, setClientType] = useState("บุคคลทั่วไป");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [lineId, setLineId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [showBlackHole, setShowBlackHole] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      if (isLogin) {
        // ล็อกอิน
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        setShowBlackHole(true);
        setTimeout(() => router.push(`/${lang}/dashboard`), 2000);

      } else {
        // ตรวจสอบรหัสผ่าน
        if (password !== confirmPassword) {
          throw new Error(lang === 'th' ? "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน" : "Passwords do not match");
        }

        // สมัครสมาชิก
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
              client_type: clientType,
              company_name: clientType !== "บุคคลทั่วไป" ? companyName : "",
              role: clientType !== "บุคคลทั่วไป" ? role : "",
              line_id: lineId
            }
          }
        });
        
        if (error) throw error;
        
        setShowBlackHole(true);
        setTimeout(() => router.push(`/${lang}/dashboard`), 2000);
      }
    } catch (error: any) {
      setErrorMsg(error.message);
      setIsLoading(false);
    }
  };

  // 🌟 ข้อมูลตัวเลือกประเภทลูกค้า
  const clientTypeOptions = [
    { id: "บุคคลทั่วไป", label: "บุคคลทั่วไป", icon: User },
    { id: "บริษัท/นิติบุคคล", label: "บริษัท/นิติบุคคล", icon: Building2 },
    { id: "ร้านค้า/ธุรกิจ", label: "ร้านค้า/ธุรกิจ", icon: Store }
  ];

  return (
    <main className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-zinc-200/50 to-transparent pointer-events-none"></div>

      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[480px] z-10 my-8" 
      >
        <div className="flex justify-center mb-8">
          <Link href={`/${lang}`} className="hover:opacity-70 transition duration-200">
            <Image src="/tidalsynclogo.png" alt="TidalSync Logo" width={140} height={70} className="object-contain mix-blend-multiply" />
          </Link>
        </div>

        <motion.div layout className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-xl shadow-zinc-200/40 border border-zinc-100 relative overflow-hidden">
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mb-2">
              {isLogin ? (lang === 'th' ? "เข้าสู่ระบบ" : "Welcome Back") : (lang === 'th' ? "สร้างบัญชีใหม่" : "Create Account")}
            </h1>
            <p className="text-sm text-zinc-500">
              {lang === 'th' ? "Client Portal - เข้าสู่ระบบเพื่อติดตามงานของคุณ" : "Client Portal - Log in to track your projects"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
  animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="bg-red-50 border border-red-100 text-red-600 text-xs font-medium p-3 rounded-xl flex items-start gap-2 overflow-hidden"
              >
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <AnimatePresence>
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ชื่อ-นามสกุล */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                      <div className="relative group">
                        <User size={18} className="absolute left-4 top-[14px] text-zinc-400 group-focus-within:text-black transition-colors" />
                        <input 
                          type="text" required={!isLogin} value={fullName} onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-sm"
                          placeholder="สมชาย ใจดี"
                        />
                      </div>
                    </div>

                    {/* เบอร์โทรศัพท์ */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
                      <div className="relative group">
                        <Phone size={18} className="absolute left-4 top-[14px] text-zinc-400 group-focus-within:text-black transition-colors" />
                        <input 
                          type="tel" required={!isLogin} value={phone} onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-sm"
                          placeholder="08X-XXX-XXXX"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ประเภทลูกค้า */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">ประเภทลูกค้า <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-3 gap-2">
                      {clientTypeOptions.map((type) => {
                        const Icon = type.icon;
                        const isSelected = clientType === type.id;
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setClientType(type.id)}
                            className={`flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-xl border transition-all duration-200 ${
                              isSelected 
                                ? 'bg-black border-black text-white shadow-md' 
                                : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100 hover:border-zinc-300'
                            }`}
                          >
                            <Icon size={18} className={isSelected ? 'text-white' : 'text-zinc-400'} />
                            <span className="text-[10px] font-bold text-center leading-tight">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* แสดงฟิลด์บริษัท/ร้านค้า เมื่อไม่ได้เลือกบุคคลทั่วไป */}
                  <AnimatePresence>
                    {clientType !== "บุคคลทั่วไป" && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden"
                      >
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">ชื่อบริษัท/ร้านค้า <span className="text-red-500">*</span></label>
                          <div className="relative group">
                            <Building2 size={18} className="absolute left-4 top-[14px] text-zinc-400 group-focus-within:text-black transition-colors" />
                            <input 
                              type="text" required={clientType !== "บุคคลทั่วไป"} value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                              className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-sm"
                              placeholder="ระบุชื่อองค์กร"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">ตำแหน่ง (ไม่บังคับ)</label>
                          <div className="relative group">
                            <Briefcase size={18} className="absolute left-4 top-[14px] text-zinc-400 group-focus-within:text-black transition-colors" />
                            <input 
                              type="text" value={role} onChange={(e) => setRole(e.target.value)}
                              className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-sm"
                              placeholder="เช่น Owner, Manager"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ช่องทางติดต่อเพิ่มเติม (LINE ID) */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">LINE ID (ไม่บังคับ)</label>
                    <div className="relative group">
                      <MessageCircle size={18} className="absolute left-4 top-[14px] text-zinc-400 group-focus-within:text-black transition-colors" />
                      <input 
                        type="text" value={lineId} onChange={(e) => setLineId(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-sm"
                        placeholder="ไอดีไลน์สำหรับติดต่อ"
                      />
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Email {<span className="text-red-500">*</span>}</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-[14px] text-zinc-400 group-focus-within:text-black transition-colors" />
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-sm"
                  placeholder="admin@tidalsync.com"
                />
              </div>
            </div>

            <div className={`grid ${!isLogin ? 'grid-cols-1 md:grid-cols-2 gap-4' : 'grid-cols-1'}`}>
              
              {/* 🌟 แก้ไข: Password พร้อมปุ่มลืมรหัสผ่าน 🌟 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Password <span className="text-red-500">*</span>
                  </label>
                  {/* แสดงเฉพาะตอนล็อกอิน */}
                  {isLogin && (
                    <Link href={`/${lang}/forgot-password`} className="text-[10px] font-bold text-zinc-500 hover:text-black transition-colors hover:underline">
                      {lang === 'th' ? "ลืมรหัสผ่าน?" : "Forgot Password?"}
                    </Link>
                  )}
                </div>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-[14px] text-zinc-400 group-focus-within:text-black transition-colors" />
                  <input 
                    type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <AnimatePresence>
                {!isLogin && (
                  <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }}>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Confirm Password <span className="text-red-500">*</span></label>
                    <div className="relative group">
                      <Lock size={18} className="absolute left-4 top-[14px] text-zinc-400 group-focus-within:text-black transition-colors" />
                      <input 
                        type="password" required={!isLogin} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              type="submit" disabled={isLoading}
              className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
              {isLoading ? (lang === 'th' ? "กำลังโหลด..." : "Processing...") : (isLogin ? (lang === 'th' ? "เข้าสู่ระบบ" : "Sign In") : (lang === 'th' ? "สมัครสมาชิก" : "Sign Up"))}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-100 text-center text-sm">
            <span className="text-zinc-500">
              {isLogin ? (lang === 'th' ? "ยังไม่มีบัญชี?" : "New to TidalSync?") : (lang === 'th' ? "มีบัญชีอยู่แล้ว?" : "Already have an account?")}
            </span>
            <button 
              type="button" 
              onClick={() => { 
                setIsLogin(!isLogin); 
                setErrorMsg(""); 
                if (isLogin) setConfirmPassword("");
              }}
              className="ml-2 font-bold text-black hover:underline focus:outline-none"
            >
              {isLogin ? (lang === 'th' ? "สร้างบัญชี" : "Create one") : (lang === 'th' ? "เข้าสู่ระบบ" : "Log in")}
            </button>
          </div>
        </motion.div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-400 font-medium pb-10">
          <ShieldCheck size={14} /> ข้อมูลของคุณถูกคุ้มครองตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA)
        </div>
      </motion.div>

      {/* 🌟 แอนิเมชันหลุมดำ */}
      <AnimatePresence>
        {showBlackHole && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center"
          >
            <div className="relative w-32 h-32 md:w-48 md:h-48 flex items-center justify-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-[1px] border-zinc-200 border-t-zinc-800" />
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} className="absolute inset-2 md:inset-4 rounded-full border-[2px] border-zinc-100 border-b-zinc-900 border-r-zinc-600 opacity-80" />
              <motion.div animate={{ rotate: 360, scale: [1, 1.05, 1] }} transition={{ rotate: { duration: 3, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity, ease: "easeInOut" } }} className="absolute inset-6 md:inset-10 rounded-full border-[3px] border-transparent border-t-black border-l-black shadow-[0_0_15px_rgba(0,0,0,0.2)]" />
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="w-4 h-4 md:w-6 md:h-6 bg-black rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)]" />
            </div>
            
            <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8 text-xl md:text-2xl font-bold tracking-tight text-zinc-900">
              {isLogin ? (lang === 'th' ? "เข้าสู่ระบบสำเร็จ" : "Authentication Successful") : (lang === 'th' ? "สร้างบัญชีสำเร็จ" : "Account Created")}
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-2 text-sm text-zinc-500 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              {lang === 'th' ? "กำลังเตรียมพื้นที่ทำงานของคุณ..." : "Preparing your workspace..."}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
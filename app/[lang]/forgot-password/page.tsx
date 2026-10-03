"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

const dictionaries = {
  th: {
    title: "ลืมรหัสผ่าน?",
    subtitle: "ไม่ต้องห่วง กรอกอีเมลของคุณด้านล่าง แล้วเราจะส่งลิงก์สำหรับตั้งค่ารหัสผ่านใหม่ไปให้ครับ",
    emailLabel: "อีเมล (Email)",
    emailPlaceholder: "กรอกอีเมลของคุณ...",
    btnSubmit: "ส่งลิงก์รีเซ็ตรหัสผ่าน",
    btnLoading: "กำลังส่งข้อมูล...",
    backToLogin: "กลับไปหน้าเข้าสู่ระบบ",
    successTitle: "ส่งลิงก์เรียบร้อยแล้ว!",
    successDesc: "กรุณาตรวจสอบกล่องข้อความ (Inbox) หรือโฟลเดอร์จดหมายขยะ (Spam) ของคุณ เพื่อคลิกลิงก์ตั้งค่ารหัสผ่านใหม่",
    errorRequired: "กรุณากรอกอีเมลให้ถูกต้อง"
  },
  en: {
    title: "Forgot Password?",
    subtitle: "Don't worry. Enter your email below and we will send you a link to reset your password.",
    emailLabel: "Email Address",
    emailPlaceholder: "Enter your email...",
    btnSubmit: "Send Reset Link",
    btnLoading: "Sending...",
    backToLogin: "Back to Login",
    successTitle: "Reset Link Sent!",
    successDesc: "Please check your inbox or spam folder for the password reset link.",
    errorRequired: "Please enter a valid email address."
  }
};

export default function ForgotPasswordPage() {
  const params = useParams();
  const lang = params.lang === "en" ? "en" : "th";
  const dict = dictionaries[lang];

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg(dict.errorRequired);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      // 🌟 คำสั่งส่งลิงก์รีเซ็ตรหัสผ่านของ Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // ให้เด้งกลับมาที่หน้าตั้งรหัสผ่านใหม่ (เดี๋ยวเราค่อยไปสร้างหน้านี้กัน)
        redirectTo: `${window.location.origin}/${lang}/update-password`,
      });

      if (error) throw error;
      
      setIsSubmitted(true);
    } catch (error: any) {
      setErrorMsg(error.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-zinc-200/50 to-transparent blur-3xl -z-10 rounded-full opacity-50"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href={`/${lang}`} className="flex justify-center mb-8 hover:opacity-70 transition">
          <Image src="/tidalsynclogo.png" alt="TidalSync Logo" width={140} height={60} className="object-contain mix-blend-multiply" />
        </Link>

        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-white py-10 px-8 shadow-2xl shadow-zinc-200/50 sm:rounded-3xl border border-zinc-100"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-zinc-900 tracking-tight">{dict.title}</h2>
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed">{dict.subtitle}</p>
              </div>

              {errorMsg && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                  <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-red-600">{errorMsg}</p>
                </motion.div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">{dict.emailLabel}</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                      className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-[15px]"
                      placeholder={dict.emailPlaceholder}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting || !email}
                  className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-zinc-200 text-sm font-bold text-white bg-black hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
                  {isSubmitting ? dict.btnLoading : dict.btnSubmit}
                </button>
              </form>

              <div className="mt-8 text-center">
                <Link href={`/${lang}/login`} className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-black transition">
                  <ArrowLeft size={16} /> {dict.backToLogin}
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white py-12 px-8 shadow-2xl shadow-zinc-200/50 sm:rounded-3xl border border-zinc-100 text-center"
            >
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-black text-zinc-900 mb-3">{dict.successTitle}</h2>
              <p className="text-sm text-zinc-500 leading-relaxed mb-8">{dict.successDesc}</p>
              
              <Link href={`/${lang}/login`} className="inline-flex justify-center items-center w-full py-4 px-4 border border-zinc-200 rounded-2xl text-sm font-bold text-black bg-white hover:bg-zinc-50 transition-all">
                {dict.backToLogin}
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
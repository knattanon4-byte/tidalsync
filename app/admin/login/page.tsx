"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, ShieldAlert, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      // 1. ลองล็อคอินด้วย Email / Password ในระบบ
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // 2. ล็อคอินสำเร็จ! แวะตรวจบัตรพนักงานก่อน (ดึงข้อมูล role จาก profiles)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single(); // ดึงมาแค่คนเดียว

      // 3. ถ้าไม่ใช่ admin (หรือไม่มีข้อมูล role) ให้เตะออกทันที!
      if (!profileData || profileData.role !== 'admin') {
        await supabase.auth.signOut(); // บังคับออกจากระบบ
        throw new Error("ACCESS_DENIED"); // โยน Error ไปให้ catch ดักจับ
      }

      // 4. ถ้าผ่านด่านมาได้ (เป็น admin) พาเข้า Dashboard เลย!
      router.push("/admin");

    } catch (error: any) {
      // ดัก Error แจ้งเตือน
      if (error.message === "ACCESS_DENIED") {
        setErrorMsg("บัญชีนี้ไม่มีสิทธิ์เข้าถึงระบบหลังบ้าน (Restricted Area)!");
      } else if (error.message.includes("Invalid login credentials") || error.message.includes("invalid claim")) {
        setErrorMsg("อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
      } else {
        setErrorMsg(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-black flex flex-col justify-center items-center p-4 relative font-sans selection:bg-zinc-800">
      
      {/* วงกลมแสง Background ให้ดูมีความลึกลับ */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
        className="w-full max-w-sm bg-zinc-950/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 flex flex-col items-center relative z-10 shadow-2xl"
      >
        <div className="mb-8 flex flex-col items-center">
          <div className="p-3 bg-white/10 rounded-2xl mb-4 border border-white/5">
            <ShieldAlert size={28} className="text-white" />
          </div>
          <Image src="/tidalsynclogo.png" alt="TidalSync" width={100} height={40} className="object-contain brightness-0 invert mb-2" />
          <p className="text-xs text-zinc-400 font-medium tracking-widest uppercase">System Access</p>
        </div>

        {/* แสดงข้อความแจ้งเตือน Error */}
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="w-full mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-2 text-red-500 text-xs font-medium"
          >
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Admin Email</label>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-3.5 text-zinc-500" />
              <input 
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)} 
                placeholder="admin@tidalsync.com" 
                className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-zinc-800 text-white rounded-xl text-sm focus:outline-none focus:border-zinc-500 transition placeholder:text-zinc-700" 
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Passcode</label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3.5 text-zinc-500" />
              <input 
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-zinc-800 text-white rounded-xl text-sm focus:outline-none focus:border-zinc-500 transition placeholder:text-zinc-700" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-4 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Authorize \u2192"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
            Restricted Area
          </p>
        </div>
      </motion.div>
    </main>
  );
}
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, ShieldAlert } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/admin"); // พาบอสเข้าหน้า Admin Dashboard
  };

  return (
    <main className="min-h-screen bg-black flex flex-col justify-center items-center p-4 relative font-sans selection:bg-zinc-800">
      
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

          <button type="submit" className="w-full mt-4 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition text-sm flex items-center justify-center gap-2">
            Authorize &rarr;
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
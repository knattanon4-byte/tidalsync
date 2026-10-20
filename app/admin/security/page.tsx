"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ShieldCheck, Loader2, QrCode, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SecuritySettingsPage() {
  const [qrCodeSvg, setQrCodeSvg] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false); // เช็กว่าเคยเปิด 2FA ไปแล้วหรือยัง

  useEffect(() => {
    checkMfaStatus();
  }, []);

  // 🌟 เช็กสถานะว่าบัญชีนี้เปิด 2FA ไว้หรือยัง
  const checkMfaStatus = async () => {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) {
      console.error("Error checking MFA status:", error);
      return;
    }
    // ถ้า currentLevel หรือ nextLevel เป็น aal2 แสดงว่าเปิดใช้งาน 2FA แล้ว
    if (data.currentLevel === 'aal2' || data.nextLevel === 'aal2') {
      setIsEnrolled(true);
    }
  };

  // 🌟 ฟังก์ชันขอเริ่มเปิดใช้งาน 2FA (Generate QR Code)
  const handleEnable2FA = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
      });

      if (error) throw error;

      // Supabase จะส่ง QR Code มาในรูปแบบ SVG string
      setFactorId(data.id);
      setQrCodeSvg(data.totp.qr_code);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 🌟 ฟังก์ชันยืนยันรหัส 6 หลักที่ได้จากแอป
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;

    setIsLoading(true);
    setError(null);

    try {
      // 1. สร้าง Challenge
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;

      // 2. ส่งรหัสไป Verify
      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verifyCode,
      });

      if (verify.error) throw verify.error;

      setSuccess(true);
      setIsEnrolled(true);
      setQrCodeSvg(null); // ปิดหน้าต่าง QR
    } catch (err: any) {
      setError("รหัสไม่ถูกต้อง หรือหมดเวลา กรุณาลองใหม่ครับ");
    } finally {
      setIsLoading(false);
    }
  };

  // 🌟 ฟังก์ชันยกเลิก 2FA (Unenroll)
  const handleDisable2FA = async () => {
    setIsLoading(true);
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors && factors.totp.length > 0) {
        const factorIdToUnenroll = factors.totp[0].id;
        const { error } = await supabase.auth.mfa.unenroll({ factorId: factorIdToUnenroll });
        if (error) throw error;
        
        setIsEnrolled(false);
        setSuccess(false);
      }
    } catch (err: any) {
      setError("ไม่สามารถปิดใช้งาน 2FA ได้: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-zinc-100 p-8 md:p-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center shadow-md">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900">Security & 2FA</h1>
            <p className="text-sm text-zinc-500 mt-1">ตั้งค่าการยืนยันตัวตนสองขั้นตอนเพื่อความปลอดภัยสูงสุด</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="p-4 mb-6 bg-red-50 text-red-600 rounded-xl flex items-start gap-2 text-sm border border-red-100">
              <AlertCircle size={18} className="shrink-0 mt-0.5" /> {error}
            </motion.div>
          )}

          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="p-4 mb-6 bg-green-50 text-green-600 rounded-xl flex items-start gap-2 text-sm border border-green-100 font-bold">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> เปิดใช้งานระบบ 2FA สำเร็จเรียบร้อยแล้ว!
            </motion.div>
          )}
        </AnimatePresence>

        {isEnrolled ? (
          <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={24} className="text-green-500" />
              <div>
                <h3 className="font-bold text-zinc-900">2FA เปิดใช้งานอยู่</h3>
                <p className="text-xs text-zinc-500 mt-1">บัญชีของคุณได้รับการปกป้องขั้นสูงสุดแล้ว</p>
              </div>
            </div>
            <button 
              onClick={handleDisable2FA} disabled={isLoading}
              className="px-4 py-2 bg-white border border-red-200 text-red-500 rounded-lg text-sm font-bold hover:bg-red-50 transition disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : "ปิดการใช้งาน 2FA"}
            </button>
          </div>
        ) : !qrCodeSvg ? (
          <div className="p-8 border-2 border-dashed border-zinc-200 rounded-2xl text-center">
            <QrCode size={48} className="mx-auto text-zinc-300 mb-4" />
            <h3 className="font-bold text-zinc-900 mb-2">ปกป้องบัญชีของคุณ</h3>
            <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">
              เปิดใช้งาน Two-Factor Authentication ด้วยแอป Authenticator เช่น Google Authenticator หรือ Authy
            </p>
            <button 
              onClick={handleEnable2FA} disabled={isLoading}
              className="bg-black text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-zinc-800 transition flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : "เริ่มตั้งค่า 2FA ตอนนี้"}
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col items-center text-center">
              <h3 className="font-bold text-zinc-900 mb-2">1. สแกน QR Code</h3>
              <p className="text-xs text-zinc-500 mb-6">เปิดแอป Authenticator บนมือถือแล้วสแกนภาพด้านล่างนี้</p>
              
              <div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-100 mb-6" dangerouslySetInnerHTML={{ __html: qrCodeSvg }} />
            </div>

            <form onSubmit={handleVerifyCode} className="p-6 border border-zinc-200 rounded-2xl">
              <h3 className="font-bold text-zinc-900 mb-2">2. ยืนยันรหัส 6 หลัก</h3>
              <p className="text-xs text-zinc-500 mb-4">กรอกรหัสที่ปรากฏในแอปมือถือของคุณเพื่อยืนยันการตั้งค่า</p>
              
              <div className="flex gap-3">
                <input 
                  type="text" maxLength={6} required
                  value={verifyCode} onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456" 
                  className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-mono text-center tracking-[0.5em] text-lg font-bold"
                />
                <button type="submit" disabled={isLoading || verifyCode.length !== 6} className="bg-black text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-zinc-800 transition disabled:opacity-50 flex items-center justify-center min-w-[120px]">
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : "ยืนยันรหัส"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
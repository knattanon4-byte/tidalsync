"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, Phone, FileText, MapPin, Building2, 
  Save, Loader2, ArrowLeft, CreditCard,
  CheckCircle2, AlertCircle, Shield, Download, Trash2, Smartphone
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const lang = params.lang === "en" ? "en" : "th";

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({ show: false, message: "", type: "success" });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  // State: Account Info
  const [email, setEmail] = useState("");
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  
  // State: Basic Info
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  // State: Billing Info
  const [clientType, setClientType] = useState("บุคคลทั่วไป");
  const [billingName, setBillingName] = useState(""); 
  const [taxId, setTaxId] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingPhone, setBillingPhone] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  
  // เฉพาะนิติบุคคล
  const [branch, setBranch] = useState("สำนักงานใหญ่");
  const [contactPerson, setContactPerson] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (user) {
          setEmail(user.email || "");
          setEmailConfirmed(!!user.email_confirmed_at);

          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError) {
             const meta = user.user_metadata;
             setFullName(meta?.full_name || "");
             setPhone(meta?.phone || "");
          } else if (profile) {
            setFullName(profile.full_name || user.user_metadata?.full_name || "");
            setPhone(profile.phone || user.user_metadata?.phone || "");
            setClientType(profile.client_type || "บุคคลทั่วไป");
            setBillingName(profile.billing_name || "");
            setTaxId(profile.tax_id || "");
            setBillingAddress(profile.billing_address || "");
            setBillingPhone(profile.billing_phone || "");
            setBillingEmail(profile.billing_email || "");
            setBranch(profile.branch || "สำนักงานใหญ่");
            setContactPerson(profile.contact_person || "");
          }
        } else {
            router.push(`/${lang}/login`);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [lang, router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      await supabase.auth.updateUser({
        data: { full_name: fullName, phone: phone }
      });

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          phone: phone,
          client_type: clientType,
          billing_name: billingName,
          tax_id: taxId,
          billing_address: billingAddress,
          billing_phone: billingPhone,
          billing_email: billingEmail,
          branch: clientType === 'บริษัท/นิติบุคคล' ? branch : null,
          contact_person: clientType === 'บริษัท/นิติบุคคล' ? contactPerson : null,
          
        });

      if (profileError) throw profileError;
      
      showToast(lang === 'th' ? "บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว" : "Profile updated successfully!", "success");
    } catch (error: any) {
      showToast("Error: " + error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 py-10 px-4 md:px-12 font-sans relative pb-32">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border ${
              toast.type === 'success' ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-red-50 text-red-600 border-red-100'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} className="text-green-400" /> : <AlertCircle size={18} className="text-red-500" />}
            <span className="text-sm font-medium tracking-wide">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto space-y-8">
        
        <Link href={`/${lang}/dashboard`} className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-black transition w-fit bg-white px-4 py-2 rounded-full border border-zinc-200 shadow-sm">
          <ArrowLeft size={16} /> {lang === 'th' ? "กลับไปหน้าแดชบอร์ด" : "Back to Dashboard"}
        </Link>

        {/* 🌟 Header Card */}
        <div className="bg-zinc-900 rounded-3xl p-8 md:p-10 text-white flex flex-col md:flex-row items-center md:items-start gap-6 shadow-xl">
          <div className="w-24 h-24 rounded-full border-4 border-zinc-700 bg-zinc-800 flex items-center justify-center shrink-0">
            <User size={40} className="text-zinc-300" />
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold">{lang === 'th' ? "โปรไฟล์ของฉัน" : "My Profile"}</h1>
            <p className="text-zinc-400 mt-2">{lang === 'th' ? "จัดการข้อมูลโปรไฟล์ บัญชี และการตั้งค่าความปลอดภัยของคุณ" : "Manage your profile, account, and security settings."}</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-8">
          
          {/* 🌟 Section 1: ข้อมูลพื้นฐาน (Basic Info) */}
          <section className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-zinc-100">
            <div className="flex items-center gap-3 mb-8 border-b border-zinc-100 pb-4">
              <User size={20} className="text-blue-500" />
              <h2 className="text-lg font-bold text-zinc-900">ข้อมูลพื้นฐาน</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">ชื่อ - นามสกุล</label>
                <input 
                  type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">เบอร์โทรศัพท์</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input 
                    type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
                    className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Email (บัญชีผู้ใช้)</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                      type="email" readOnly value={email}
                      className="w-full pl-11 pr-4 py-3 bg-zinc-100 border border-zinc-200 rounded-xl text-sm text-zinc-500 cursor-not-allowed"
                    />
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold ${emailConfirmed ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                    {emailConfirmed ? <><CheckCircle2 size={14}/> ยืนยันแล้ว</> : <><AlertCircle size={14}/> รอยืนยัน</>}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 🌟 Section 2: ข้อมูลสำหรับออกเอกสาร (Billing) */}
          <section className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-zinc-100">
             <div className="flex items-center justify-between mb-8 border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-orange-500" />
                <h2 className="text-lg font-bold text-zinc-900">ข้อมูลสำหรับออกเอกสาร (Billing)</h2>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-3 uppercase tracking-wider">ประเภทลูกค้า</label>
                <div className="flex bg-zinc-50 p-1 rounded-xl border border-zinc-200 w-fit">
                  <button 
                    type="button" onClick={() => setClientType("บุคคลทั่วไป")}
                    className={`flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-lg transition-all ${clientType === "บุคคลทั่วไป" ? 'bg-white text-black shadow-sm border border-zinc-200' : 'text-zinc-500 hover:text-black'}`}
                  >
                    <User size={14} /> บุคคลทั่วไป
                  </button>
                  <button 
                    type="button" onClick={() => setClientType("บริษัท/นิติบุคคล")}
                    className={`flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-lg transition-all ${clientType === "บริษัท/นิติบุคคล" ? 'bg-white text-black shadow-sm border border-zinc-200' : 'text-zinc-500 hover:text-black'}`}
                  >
                    <Building2 size={14} /> นิติบุคคล
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-50/50 p-6 rounded-2xl border border-zinc-100">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-zinc-700 mb-2">{clientType === 'บุคคลทั่วไป' ? 'ชื่อ - นามสกุล (สำหรับออกเอกสาร)' : 'ชื่อบริษัท'}</label>
                  <input 
                    type="text" value={billingName} onChange={(e) => setBillingName(e.target.value)} 
                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                    placeholder={clientType === 'บุคคลทั่วไป' ? 'ชื่อ-นามสกุล ที่ตรงกับบัตรประชาชน' : 'ชื่อบริษัทจำกัด หรือ ห้างหุ้นส่วนจำกัด'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-2">{clientType === 'บุคคลทั่วไป' ? 'เลขประจำตัวบัตรประชาชน (13 หลัก)' : 'เลขประจำตัวผู้เสียภาษี (13 หลัก)'}</label>
                  <div className="relative">
                    <CreditCard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                      type="text" value={taxId} onChange={(e) => setTaxId(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                      placeholder="กรอกเลข 13 หลัก"
                    />
                  </div>
                </div>

                {clientType === 'บริษัท/นิติบุคคล' && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-2">สำนักงานใหญ่ / สาขา</label>
                    <input 
                      type="text" value={branch} onChange={(e) => setBranch(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                      placeholder="เช่น สำนักงานใหญ่ หรือ สาขา 00001"
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-zinc-700 mb-2">{clientType === 'บุคคลทั่วไป' ? 'ที่อยู่ตามบัตรประชาชน / ทะเบียนบ้าน' : 'ที่อยู่บริษัท (ตาม ภ.พ.20)'}</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-4 top-4 text-zinc-400" />
                    <textarea 
                      value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} rows={3}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm resize-none"
                      placeholder="เลขที่, อาคาร, ซอย, ถนน, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-2">เบอร์โทรศัพท์ (สำหรับออกเอกสาร)</label>
                  <input 
                    type="tel" value={billingPhone} onChange={(e) => setBillingPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                    placeholder="เว้นว่างได้หากใช้เบอร์เดียวกับโปรไฟล์"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-2">Email (สำหรับรับเอกสาร e-Tax / ใบเสร็จ)</label>
                  <input 
                    type="email" value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                    placeholder="เว้นว่างได้หากใช้อีเมลเดียวกับโปรไฟล์"
                  />
                </div>

                {clientType === 'บริษัท/นิติบุคคล' && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-zinc-700 mb-2">ชื่อผู้ติดต่อประสานงาน (Contact Person)</label>
                    <input 
                      type="text" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                      placeholder="ชื่อพนักงาน หรือ ผู้มีอำนาจลงนาม"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 🌟 Section 3: ความปลอดภัย (Security) */}
          <section className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-zinc-100">
            <div className="flex items-center gap-3 mb-8 border-b border-zinc-100 pb-4">
              <Shield size={20} className="text-green-500" />
              <h2 className="text-lg font-bold text-zinc-900">ความปลอดภัยของบัญชี (Security)</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-zinc-100 rounded-2xl gap-4">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900">รหัสผ่าน (Password)</h4>
                  <p className="text-xs text-zinc-500">อัปเดตรหัสผ่านของคุณให้ปลอดภัยอยู่เสมอ</p>
                </div>
                <button type="button" className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-lg transition-colors">
                  เปลี่ยนรหัสผ่าน
                </button>
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-zinc-100 rounded-2xl gap-4">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900">การยืนยันตัวตนแบบสองขั้นตอน (2FA)</h4>
                  <p className="text-xs text-zinc-500">เพิ่มความปลอดภัยอีกระดับด้วยรหัส OTP</p>
                </div>
                <button type="button" className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-lg transition-colors">
                  เปิดใช้งาน 2FA
                </button>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                 <Smartphone size={20} className="text-blue-500 shrink-0"/>
                 <div>
                    <h4 className="text-sm font-bold text-zinc-900">อุปกรณ์ปัจจุบัน (Current Device)</h4>
                    <p className="text-xs text-zinc-500">เข้าสู่ระบบล่าสุด: วันนี้ • Mac OS - Chrome</p>
                 </div>
              </div>
            </div>
          </section>

          {/* 🌟 Floating Save Button */}
          <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-zinc-200 p-4 z-40">
            <div className="max-w-4xl mx-auto flex justify-end">
              <button 
                type="submit" disabled={isSaving}
                className="flex items-center gap-2 px-10 py-4 bg-black text-white rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-all shadow-xl disabled:opacity-70"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {isSaving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลงทั้งหมด"}
              </button>
            </div>
          </div>
        </form>

        {/* 🌟 Section 4: Danger Zone */}
        <section className="bg-red-50/50 rounded-3xl p-8 md:p-10 border border-red-100 mt-12">
          <h2 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-6">การจัดการบัญชี (Danger Zone)</h2>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-zinc-900">ดาวน์โหลดข้อมูลของฉัน</h4>
                <p className="text-xs text-zinc-500">ขอไฟล์ประวัติการใช้งานและข้อมูลส่วนบุคคลทั้งหมด</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 text-xs font-bold rounded-lg hover:bg-zinc-50 transition-colors">
                <Download size={14}/> ร้องขอข้อมูล
              </button>
            </div>
            <hr className="border-red-100/50" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-zinc-900">ลบบัญชีผู้ใช้ (Delete Account)</h4>
                <p className="text-xs text-zinc-500">ลบข้อมูล โปรเจกต์ และประวัติการแชททั้งหมดอย่างถาวร</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 text-xs font-bold rounded-lg hover:bg-red-200 transition-colors">
                <Trash2 size={14}/> ขอลบบัญชี
              </button>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
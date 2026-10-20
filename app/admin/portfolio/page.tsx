"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Plus, Filter, Eye, EyeOff, Edit, Trash2, Image as ImageIcon, X, Upload, TrendingUp, Target, Images, Loader2, CheckCircle2, AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase"; 

export default function AdminPortfolio() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [portfolios, setPortfolios] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false); 

  // 🌟 State สำหรับ Custom Toast
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  // 🌟 State สำหรับ Custom Delete Modal
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: "" });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const [newPortfolio, setNewPortfolio] = useState({
    title: "", title_en: "",
    client: "", client_en: "",
    category: "Web Application",
    goal: "", goal_en: "",
    impact: "", impact_en: "",
    status: "published",
  });

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const fetchPortfolios = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .order('created_at', { ascending: false }); 

    if (!error) setPortfolios(data || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchPortfolios(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (galleryFiles.length + files.length > 5) {
      showToast("อัปโหลดได้สูงสุด 5 รูปเท่านั้นครับ", "error");
      return;
    }
    const newFiles = [...galleryFiles, ...files].slice(0, 5);
    setGalleryFiles(newFiles);
    setGalleryPreviews(newFiles.map(file => URL.createObjectURL(file)));
  };

  const removeImage = (indexToRemove: number) => {
    setGalleryFiles(galleryFiles.filter((_, idx) => idx !== indexToRemove));
    setGalleryPreviews(galleryPreviews.filter((_, idx) => idx !== indexToRemove));
  };

  const handleCreatePortfolio = async () => {
    if (!newPortfolio.title || !newPortfolio.client) {
      showToast("กรุณากรอกชื่อผลงานและชื่อลูกค้า (อย่างน้อยภาษาไทย) ให้ครบถ้วน", "error");
      return;
    }

    setIsUploading(true); 
    let uploadedUrls: string[] = [];

    if (galleryFiles.length > 0) {
      const uploadPromises = galleryFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error } = await supabase.storage.from('portfolio-images').upload(fileName, file);
        if (!error) return supabase.storage.from('portfolio-images').getPublicUrl(fileName).data.publicUrl;
        return null;
      });
      const results = await Promise.all(uploadPromises);
      uploadedUrls = results.filter(url => url !== null) as string[];
    }

    const uniqueId = "portfolio-" + Date.now().toString();

    const { error: insertError } = await supabase.from('portfolios').insert([{ 
        id: uniqueId, 
        title: newPortfolio.title, title_en: newPortfolio.title_en,
        client: newPortfolio.client, client_en: newPortfolio.client_en,
        category: newPortfolio.category,
        challenge: newPortfolio.goal, challenge_en: newPortfolio.goal_en,
        result: newPortfolio.impact, result_en: newPortfolio.impact_en,
        status: newPortfolio.status,
        image_url: uploadedUrls[0] || "", 
        image_urls: uploadedUrls,         
        views: 0 
    }]);

    if (insertError) {
      showToast("เกิดข้อผิดพลาดในการบันทึกข้อมูล", "error");
    } else {
      showToast("บันทึกผลงานสำเร็จ!", "success");
      setIsAddModalOpen(false); 
      setNewPortfolio({ title: "", title_en: "", client: "", client_en: "", category: "Web Application", goal: "", goal_en: "", impact: "", impact_en: "", status: "published" });
      setGalleryFiles([]); setGalleryPreviews([]);
      fetchPortfolios(); 
    }
    setIsUploading(false);
  };

  // 🌟 ฟังก์ชันเปิดหน้าต่างยืนยันการลบ
  const handleDeleteClick = (id: string) => {
    setDeleteModal({ isOpen: true, id });
  };

  // 🌟 ฟังก์ชันลบข้อมูลจริงๆ (หลังจากกดยืนยัน)
  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    
    const { error } = await supabase.from('portfolios').delete().eq('id', deleteModal.id);
    
    if (error) {
      showToast("ลบไม่สำเร็จ: " + error.message, "error");
    } else {
      showToast("ลบผลงานเรียบร้อยแล้ว", "success");
      fetchPortfolios(); 
    }
    setDeleteModal({ isOpen: false, id: "" }); // ปิด Modal
  };

  return (
    <div className="flex-1 p-4 md:p-8 md:px-10 w-full max-w-[1600px] mx-auto space-y-6 h-screen overflow-y-auto relative">
      
      {/* 🌟 Toast แจ้งเตือนมุมขวาบน */}
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-md ${toast.type === 'success' ? 'bg-black/90 text-white border-zinc-800' : 'bg-red-50/90 text-red-600 border-red-200'}`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={20} className="text-green-400" /> : <AlertCircle size={20} />}
            <span className="text-sm font-bold tracking-wide">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">จัดการผลงาน (Portfolio) ✨</h1>
          <p className="text-sm text-zinc-500 mt-1">สร้าง Case Study ผลลัพธ์ปังๆ เพื่อปิดการขายบนหน้าเว็บ</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3.5 top-2.5 text-zinc-400" size={16} />
            <input type="text" placeholder="ค้นหาผลงาน..." className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-full text-sm font-medium focus:outline-none focus:border-black transition shadow-sm" />
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 p-2 px-4 bg-black text-white rounded-full hover:bg-zinc-800 transition shadow-md text-sm font-medium">
            <Plus size={16} /> สร้าง Case Study
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-zinc-400" size={32} /></div>
      ) : portfolios.length === 0 ? (
         <div className="flex flex-col justify-center items-center py-20 bg-white rounded-2xl border border-zinc-200 border-dashed">
            <Images size={48} className="text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-bold">ยังไม่มีผลงานในระบบ</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {portfolios.map((item) => {
            const coverImage = item.image_urls?.[0] || item.image_url;
            return (
              <motion.div key={item.id} whileHover={{ y: -4 }} className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden group flex flex-col">
                <div className={`h-56 w-full ${coverImage ? 'bg-zinc-100' : 'bg-gradient-to-br from-zinc-800 to-black'} relative flex items-center justify-center overflow-hidden`}>
                  {coverImage ? <img src={coverImage} alt={item.title} className="w-full h-full object-cover" /> : <ImageIcon size={48} className="text-white/20" />}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                    {/* 🌟 เปลี่ยนปุ่มลบให้เรียกเปิด Modal แทน */}
                    <button onClick={() => handleDeleteClick(item.id)} className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition shadow-lg"><Trash2 size={16} /></button>
                  </div>
                  <div className="absolute top-3 right-3">
                    {item.status === 'published' ? (
                      <span className="px-2.5 py-1 bg-white/90 backdrop-blur text-black text-[10px] font-bold rounded-full shadow-sm flex items-center gap-1.5"><Eye size={12} className="text-green-500" /> เผยแพร่แล้ว</span>
                    ) : (
                      <span className="px-2.5 py-1 bg-black/50 backdrop-blur text-white text-[10px] font-bold rounded-full border border-white/20 flex items-center gap-1.5"><EyeOff size={12} /> แบบร่าง</span>
                    )}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{item.category}</span>
                    </div>
                    <h3 className="font-bold text-lg text-zinc-900 leading-tight mb-1 line-clamp-1">{item.title || "ไม่มีชื่อผลงาน"}</h3>
                    <p className="text-xs text-zinc-500 mb-4 font-medium">ลูกค้า: {item.client}</p>
                    
                    <div className="space-y-2">
                      <div className="flex gap-2 items-start bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                        <Target size={14} className="text-orange-500 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-zinc-600 leading-relaxed line-clamp-2"><span className="font-bold text-zinc-800">โจทย์:</span> {item.challenge || "-"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 pt-4 border-t border-zinc-100 flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500"><Eye size={14} className="text-zinc-400" /> {item.views?.toLocaleString() || 0} Views</div>
                    <Link href={`/th/portfolio/${item.id}`} target="_blank" className="text-[11px] font-bold text-blue-600 hover:underline">พรีวิว Case Study &rarr;</Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ================= 🌟 Custom Modal ยืนยันการลบ ================= */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteModal({ isOpen: false, id: "" })} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-white w-full max-w-md overflow-hidden flex flex-col rounded-3xl shadow-2xl relative z-10 p-6 md:p-8 text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
                <AlertCircle size={32} />
              </div>
              
              <h3 className="text-xl font-black text-zinc-900 mb-2">ยืนยันการลบผลงาน</h3>
              <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
                คุณแน่ใจหรือไม่ว่าต้องการลบผลงานนี้? <br/> ข้อมูลจะถูกลบออกจากฐานข้อมูลและไม่สามารถกู้คืนได้
              </p>

              <div className="flex gap-3 w-full">
                <button onClick={() => setDeleteModal({ isOpen: false, id: "" })} className="flex-1 py-3 text-zinc-600 font-bold rounded-xl bg-zinc-100 hover:bg-zinc-200 transition">
                  ยกเลิก
                </button>
                <button onClick={confirmDelete} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-500/30">
                  ลบทิ้งเลย
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= Modal: เพิ่มผลงานใหม่ (2 ภาษา) ================= */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[105] flex items-center justify-center p-4 md:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl shadow-2xl relative z-10">
              
              <div className="flex justify-between items-center p-5 md:p-6 border-b border-zinc-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black text-white rounded-lg"><TrendingUp size={18} /></div>
                  <div><h3 className="font-bold text-lg leading-tight">สร้าง Case Study ผลงาน</h3></div>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-full"><X size={20} /></button>
              </div>

              <div className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto bg-zinc-50/50">
                
                <div className="space-y-2">
                   <label className="text-xs font-bold text-zinc-700 flex justify-between">
                     <span>แกลเลอรีรูปภาพ (ภาพแรกจะเป็นภาพหน้าปก)</span>
                     <span className={`${galleryFiles.length === 5 ? 'text-red-500' : 'text-zinc-500'}`}>{galleryFiles.length} / 5</span>
                   </label>
                   
                   <div className="flex flex-wrap gap-3">
                      {galleryPreviews.map((preview, idx) => (
                         <div key={idx} className="relative w-24 h-24 shrink-0 rounded-xl border border-zinc-200 overflow-hidden shadow-sm group">
                            <img src={preview} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                            <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-md"><X size={12} /></button>
                            {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center py-0.5 font-bold">COVER</span>}
                         </div>
                      ))}
                      {galleryFiles.length < 5 && (
                         <label className="w-24 h-24 shrink-0 flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 rounded-xl bg-white cursor-pointer hover:border-black transition group">
                            <Plus size={24} className="text-zinc-400 group-hover:text-black transition" />
                            <span className="text-[10px] font-bold text-zinc-400 mt-1">เพิ่มรูป</span>
                            <input type="file" multiple accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleFileChange} />
                         </label>
                      )}
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700">หมวดหมู่</label>
                      <select value={newPortfolio.category} onChange={(e) => setNewPortfolio({...newPortfolio, category: e.target.value})} className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm bg-white">
                        <option value="Web Application">Web Application</option>
                        <option value="Web Design">Web Design</option>
                        <option value="Branding">Branding</option>
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700">สถานะ</label>
                      <select value={newPortfolio.status} onChange={(e) => setNewPortfolio({...newPortfolio, status: e.target.value})} className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm bg-white">
                        <option value="published">เผยแพร่ (แสดงหน้าเว็บ)</option>
                        <option value="draft">แบบร่าง (ซ่อน)</option>
                      </select>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white p-4 md:p-6 rounded-2xl border border-zinc-200 shadow-sm">
                   <div className="space-y-4">
                      <h4 className="font-bold text-sm text-blue-600 border-b border-zinc-100 pb-2">🇹🇭 ภาษาไทย (TH)</h4>
                      <div className="space-y-1.5">
                         <label className="text-[11px] font-bold text-zinc-500 uppercase">ชื่อผลงาน *</label>
                         <input type="text" value={newPortfolio.title} onChange={(e) => setNewPortfolio({...newPortfolio, title: e.target.value})} className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm" placeholder="ระบบจองคิวออนไลน์..." />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[11px] font-bold text-zinc-500 uppercase">ชื่อลูกค้า *</label>
                         <input type="text" value={newPortfolio.client} onChange={(e) => setNewPortfolio({...newPortfolio, client: e.target.value})} className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm" placeholder="บริษัท ABC จำกัด" />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[11px] font-bold text-zinc-500 uppercase">โจทย์ / ปัญหาที่ลูกค้าเจอ</label>
                         <textarea rows={2} value={newPortfolio.goal} onChange={(e) => setNewPortfolio({...newPortfolio, goal: e.target.value})} className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm resize-none" placeholder="ลูกค้าต้องการระบบ..."></textarea>
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[11px] font-bold text-zinc-500 uppercase">ผลลัพธ์ที่ได้</label>
                         <textarea rows={2} value={newPortfolio.impact} onChange={(e) => setNewPortfolio({...newPortfolio, impact: e.target.value})} className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm resize-none" placeholder="ลดเวลาทำงานแอดมิน..."></textarea>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <h4 className="font-bold text-sm text-orange-600 border-b border-zinc-100 pb-2">🇬🇧 English (EN)</h4>
                      <div className="space-y-1.5">
                         <label className="text-[11px] font-bold text-zinc-500 uppercase">Project Title</label>
                         <input type="text" value={newPortfolio.title_en} onChange={(e) => setNewPortfolio({...newPortfolio, title_en: e.target.value})} className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm" placeholder="Online Booking System..." />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[11px] font-bold text-zinc-500 uppercase">Client Name</label>
                         <input type="text" value={newPortfolio.client_en} onChange={(e) => setNewPortfolio({...newPortfolio, client_en: e.target.value})} className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm" placeholder="ABC Co., Ltd." />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[11px] font-bold text-zinc-500 uppercase">The Challenge</label>
                         <textarea rows={2} value={newPortfolio.goal_en} onChange={(e) => setNewPortfolio({...newPortfolio, goal_en: e.target.value})} className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm resize-none" placeholder="The client needed a system..."></textarea>
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[11px] font-bold text-zinc-500 uppercase">The Impact</label>
                         <textarea rows={2} value={newPortfolio.impact_en} onChange={(e) => setNewPortfolio({...newPortfolio, impact_en: e.target.value})} className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm resize-none" placeholder="Reduced admin workload..."></textarea>
                      </div>
                   </div>

                </div>
              </div>

              <div className="p-5 md:p-6 border-t border-zinc-100 bg-white flex justify-end gap-3 shrink-0">
                <button onClick={() => setIsAddModalOpen(false)} disabled={isUploading} className="px-6 py-2.5 text-zinc-600 font-medium rounded-full hover:bg-zinc-100 transition text-sm disabled:opacity-50">ยกเลิก</button>
                <button onClick={handleCreatePortfolio} disabled={isUploading} className="px-8 py-2.5 bg-black text-white font-bold rounded-full hover:bg-zinc-800 transition shadow-lg text-sm flex items-center gap-2 disabled:opacity-70">
                  {isUploading ? <><Loader2 size={16} className="animate-spin" /> กำลังอัปโหลด...</> : "บันทึกผลงาน"}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
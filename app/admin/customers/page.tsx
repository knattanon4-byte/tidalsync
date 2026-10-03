"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Plus, Filter, MoreHorizontal, Mail, Phone, 
  MessageSquare, Briefcase, DollarSign, X, User, Building, MapPin, Edit, Save
} from "lucide-react";
import Link from "next/link";

export default function AdminCustomers() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // ข้อมูลจำลองฐานลูกค้า
  const [customers] = useState([
    { 
      id: "CUS-001", name: "คุณสมชาย", company: "คลินิกหมอใจดี", email: "somchai@clinic.com", phone: "081-234-5678",
      status: "active", totalProjects: 1, totalSpend: 50000, lastContact: "วันนี้ 10:15",
      address: "123 ถ.สุขุมวิท กรุงเทพฯ", notes: "ลูกค้า VIP ชอบงานไว ทักแชทตอบเร็ว"
    },
    { 
      id: "CUS-002", name: "คุณนัท", company: "N-SIGHT", email: "nat@n-sight.co", phone: "089-876-5432",
      status: "lead", totalProjects: 0, totalSpend: 0, lastContact: "เมื่อวาน",
      address: "-", notes: "รอตัดสินใจเรื่องราคาแพ็กเกจ"
    },
    { 
      id: "CUS-003", name: "ฝ่ายการตลาด", company: "Cafe Amazon", email: "mkt@cafeamazon.com", phone: "02-123-4567",
      status: "completed", totalProjects: 1, totalSpend: 15000, lastContact: "1 ก.ย. 2026",
      address: "ปตท. สำนักงานใหญ่ วิภาวดีรังสิต", notes: "อาจจะมีงานต่อเฟส 2 ช่วงปลายปี"
    },
    { 
      id: "CUS-004", name: "ครูพี่เอก", company: "Tutor Center", email: "ake@tutorcenter.com", phone: "085-555-5555",
      status: "active", totalProjects: 1, totalSpend: 85000, lastContact: "18 ก.ย. 2026",
      address: "สยามสแควร์ ซอย 2", notes: "เน้นดีไซน์ UI/UX ให้เหมาะกับเด็กนักเรียน"
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active': return <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-100">กำลังบริการ</span>;
      case 'lead': return <span className="px-2.5 py-1 bg-orange-50 text-orange-600 text-[10px] font-bold rounded-full border border-orange-100">ผู้มุ่งหวัง (Lead)</span>;
      case 'completed': return <span className="px-2.5 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full border border-green-100">ลูกค้าเก่า</span>;
      default: return null;
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 md:px-10 w-full max-w-[1600px] mx-auto space-y-6 h-screen overflow-y-auto">
      
      {/* ================= Topbar ================= */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">ฐานข้อมูลลูกค้า 👥</h1>
          <p className="text-sm text-zinc-500 mt-1">จัดการรายชื่อลูกค้าและยอดขายสะสม (CRM)</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3.5 top-2.5 text-zinc-400" size={16} />
            <input type="text" placeholder="ค้นหาชื่อ, บริษัท..." className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-full text-sm font-medium focus:outline-none focus:border-black transition shadow-sm" />
          </div>
          <button className="flex items-center gap-2 p-2 px-4 bg-white border border-zinc-200 rounded-full text-zinc-700 hover:text-black hover:bg-zinc-50 transition shadow-sm text-sm font-medium">
            <Filter size={14} /> ตัวกรอง
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 p-2 px-4 bg-black text-white rounded-full hover:bg-zinc-800 transition shadow-md text-sm font-medium"
          >
            <Plus size={16} /> เพิ่มลูกค้าใหม่
          </button>
        </div>
      </header>

      {/* ================= สรุปข้อมูล (Stats) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-700"><User size={24} /></div>
          <div>
            <p className="text-xs text-zinc-500 font-medium mb-1">ลูกค้าทั้งหมด</p>
            <h3 className="text-2xl font-black">{customers.length} <span className="text-sm font-medium text-zinc-400">ราย</span></h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600"><Briefcase size={24} /></div>
          <div>
            <p className="text-xs text-zinc-500 font-medium mb-1">กำลังให้บริการ (Active)</p>
            <h3 className="text-2xl font-black">{customers.filter(c => c.status === 'active').length} <span className="text-sm font-medium text-zinc-400">โปรเจค</span></h3>
          </div>
        </div>
        <div className="bg-black text-white p-5 rounded-2xl shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white"><DollarSign size={24} /></div>
          <div>
            <p className="text-xs text-zinc-400 font-medium mb-1">ยอดขายรวม (LTV)</p>
            <h3 className="text-2xl font-black">150k <span className="text-sm font-medium text-zinc-400">฿</span></h3>
          </div>
        </div>
      </div>

      {/* ================= ตารางรายชื่อลูกค้า ================= */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-zinc-50 text-zinc-500 text-xs font-bold border-b border-zinc-200 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">ลูกค้า / บริษัท</th>
                <th className="px-6 py-4">ข้อมูลติดต่อ</th>
                <th className="px-6 py-4">สถานะ</th>
                <th className="px-6 py-4">ยอดสะสม (LTV)</th>
                <th className="px-6 py-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-zinc-50/80 transition cursor-pointer group" onClick={() => setSelectedCustomer(customer)}>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-zinc-600 shrink-0">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900">{customer.name}</p>
                      <p className="text-[11px] text-zinc-500 font-medium flex items-center gap-1 mt-0.5"><Building size={10}/> {customer.company}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-600">
                    <p className="flex items-center gap-1.5 text-xs mb-1"><Phone size={12} className="text-zinc-400"/> {customer.phone}</p>
                    <p className="flex items-center gap-1.5 text-xs"><Mail size={12} className="text-zinc-400"/> {customer.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(customer.status)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-black">{customer.totalSpend > 0 ? `${customer.totalSpend.toLocaleString()} ฿` : '-'}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{customer.totalProjects} โปรเจค</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/admin/chat/${customer.id === 'CUS-001' ? '1' : '2'}`} onClick={(e) => e.stopPropagation()} className="p-2 bg-zinc-100 text-zinc-600 hover:text-black hover:bg-zinc-200 rounded-lg transition shadow-sm" title="แชท">
                        <MessageSquare size={16} />
                      </Link>
                      <button className="p-2 border border-zinc-200 text-zinc-400 hover:text-black hover:bg-zinc-50 rounded-lg transition" title="แก้ไข">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= Modal: ดูรายละเอียดลูกค้า ================= */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCustomer(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", duration: 0.5 }} className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 flex flex-col">
              
              <div className="p-6 md:p-8 flex items-start gap-4 border-b border-zinc-100 relative">
                <button onClick={() => setSelectedCustomer(null)} className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-full transition"><X size={20} /></button>
                <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-lg">{selectedCustomer.name.charAt(0)}</div>
                <div className="pt-1">
                  <h2 className="text-xl font-bold text-zinc-900 leading-tight">{selectedCustomer.name}</h2>
                  <p className="text-sm text-zinc-500 font-medium mb-2">{selectedCustomer.company}</p>
                  {getStatusBadge(selectedCustomer.status)}
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">เบอร์โทร</p>
                    <p className="text-sm font-bold">{selectedCustomer.phone}</p>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">อีเมล</p>
                    <p className="text-sm font-bold truncate" title={selectedCustomer.email}>{selectedCustomer.email}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1"><MapPin size={12}/> ที่อยู่</p>
                  <p className="text-sm text-zinc-700 bg-zinc-50 p-3 rounded-lg border border-zinc-100">{selectedCustomer.address}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Briefcase size={12}/> บันทึก / ความต้องการลูกค้า</p>
                  <p className="text-sm text-zinc-700 bg-orange-50/50 p-3 rounded-lg border border-orange-100 italic">
                    {selectedCustomer.notes || "ไม่มีบันทึกเพิ่มเติม"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">โปรเจคทั้งหมด</p>
                    <p className="font-bold text-lg">{selectedCustomer.totalProjects} งาน</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">ยอดใช้จ่ายสะสม (LTV)</p>
                    <p className="font-bold text-lg text-green-600">{selectedCustomer.totalSpend > 0 ? `${selectedCustomer.totalSpend.toLocaleString()} ฿` : '0 ฿'}</p>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-zinc-50 border-t border-zinc-100 rounded-b-3xl flex justify-between gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 text-zinc-600 font-bold bg-white border border-zinc-200 rounded-full hover:bg-zinc-100 transition text-sm shadow-sm">
                  <Edit size={16} /> แก้ไขข้อมูล
                </button>
                <Link href={`/admin/chat/${selectedCustomer.id === 'CUS-001' ? '1' : '2'}`} className="flex-1 flex justify-center items-center gap-2 px-6 py-2.5 bg-black text-white font-bold rounded-full hover:bg-zinc-800 transition shadow-lg shadow-zinc-200 text-sm">
                  <MessageSquare size={16} /> ส่งข้อความ (Chat)
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= 🌟 Modal: เพิ่มลูกค้าใหม่ (ดีไซน์เต็มรูปแบบ) ================= */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", duration: 0.5 }}
              className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative z-10"
            >
              <div className="flex justify-between items-center p-5 md:p-6 border-b border-zinc-100 sticky top-0 bg-white/90 backdrop-blur z-20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black text-white rounded-lg"><User size={18} /></div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">เพิ่มลูกค้าใหม่</h3>
                    <p className="text-[11px] text-zinc-500">บันทึกรายชื่อลูกค้าเข้าสู่ระบบ CRM</p>
                  </div>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-full transition"><X size={20} /></button>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                
                {/* ข้อมูลทั่วไป */}
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2 mb-4">ข้อมูลเบื้องต้น</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                      <input type="text" placeholder="เช่น คุณสมชาย ใจดี" className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">ชื่อบริษัท / แบรนด์</label>
                      <input type="text" placeholder="เช่น คลินิกหมอใจดี" className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black transition" />
                    </div>
                  </div>
                </div>

                {/* ข้อมูลติดต่อ */}
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2 mb-4">ข้อมูลติดต่อ</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Phone size={12}/> เบอร์โทรศัพท์</label>
                      <input type="tel" placeholder="08X-XXX-XXXX" className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Mail size={12}/> อีเมล</label>
                      <input type="email" placeholder="example@email.com" className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black transition" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1"><MapPin size={12}/> ที่อยู่ / สถานที่ตั้ง</label>
                    <textarea rows={2} placeholder="กรอกที่อยู่สำหรับออกใบเสร็จหรือจัดส่ง..." className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black transition resize-none" />
                  </div>
                </div>

                {/* สถานะ & บันทึกเพิ่มเติม */}
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2 mb-4">สถานะ & บันทึก</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">สถานะลูกค้า</label>
                      <select className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:outline-none focus:border-black transition cursor-pointer">
                        <option value="lead">ผู้มุ่งหวัง (Lead) - ทักมาสอบถาม</option>
                        <option value="active">กำลังบริการ (Active) - อยู่ระหว่างทำงาน</option>
                        <option value="completed">ลูกค้าเก่า (Completed) - ปิดจ๊อบแล้ว</option>
                      </select>
                    </div>
                    <div>
                       {/* ช่องว่างเว้นไว้ หรือใส่วันที่ติดต่อล่าสุดได้ แต่ให้ระบบออโต้ดีกว่า */}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Briefcase size={12}/> บันทึกเพิ่มเติม (Internal Notes)</label>
                    <textarea rows={3} placeholder="ลูกค้าชอบสไตล์ไหน? มีความต้องการพิเศษอะไร? (ลูกค้าจะไม่เห็นข้อความนี้)" className="w-full p-3 bg-orange-50/50 border border-orange-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition resize-none" />
                  </div>
                </div>

              </div>

              <div className="p-5 border-t border-zinc-100 bg-white flex justify-end gap-3 sticky bottom-0">
                <button onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 text-zinc-600 font-medium rounded-full hover:bg-zinc-100 transition text-sm">ยกเลิก</button>
                <button className="px-8 py-2.5 bg-black text-white font-bold rounded-full hover:bg-zinc-800 transition shadow-lg shadow-zinc-200 text-sm flex items-center gap-2">
                  <Save size={16} /> บันทึกลูกค้า
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
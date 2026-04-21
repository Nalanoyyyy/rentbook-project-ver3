import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdmin, isAuthenticated } from '../../services/authService';
import { getInventory, saveInventory } from '../../services/inventoryService';
import AdminNav from './AdminNav';

// ── helpers ───────────────────────────────────────────────────────────────────

const parseOrders = (key: string): any[] => {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
};

const isOverdue = (returnDate: string): boolean => {
  if (!returnDate) return false;
  const parts = returnDate.includes('/') ? returnDate.split('/').reverse() : returnDate.split('-');
  const date = new Date(parts.join('-'));
  return !isNaN(date.getTime()) && date < new Date();
};

// ── AdminReturns ──────────────────────────────────────────────────────────────

const AdminReturns: React.FC = () => {
  const navigate = useNavigate();
  const [rentals, setRentals]           = useState<any[]>([]);
  const [viewOrder, setViewOrder]       = useState<any | null>(null);
  const [confirmOrder, setConfirmOrder] = useState<any | null>(null);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) { navigate('/'); return; }

    const load = () => {
      const all = [...parseOrders('admin_orders'), ...parseOrders('allOrders')];
      const seen = new Set();
      setRentals(all.filter(o => {
        if (seen.has(o.id) || ['รอดำเนินการ', 'คืนหนังสือแล้ว', 'ยกเลิก'].includes(o.status)) return false;
        seen.add(o.id);
        return true;
      }));
    };

    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, [navigate]);

  const handleReturnBook = useCallback((order: any) => {
    ['admin_orders', 'allOrders'].forEach(key =>
      localStorage.setItem(key, JSON.stringify(
        parseOrders(key).map((o: any) => o.id === order.id ? { ...o, status: 'คืนหนังสือแล้ว' } : o)
      ))
    );

    const returnedIds = new Set(order.items.map((i: any) => String(i.id)));
    saveInventory(getInventory().map((b: any) =>
      returnedIds.has(String(b.id))
        ? { ...b, stock: (b.stock || 0) + 1, isAvailable: true, status: 'พร้อมให้เช่า' }
        : b
    ));

    window.dispatchEvent(new Event('storage'));
    setRentals(prev => prev.filter(r => r.id !== order.id));
    setConfirmOrder(null);
    setViewOrder(null);
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-4 py-12 min-h-[80vh]">
      <h1 className="text-3xl font-black mb-2">ระบบจัดการร้าน (Admin)</h1>

      {/* ใช้ AdminNav กลาง — prop ชื่อ pendingReturns ให้ตรงกับไฟล์ AdminNav.tsx */}
      <AdminNav pendingReturns={rentals.length} />

      {/* Table */}
      <div className="bg-white dark:bg-[#1a3324] rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 dark:border-white/5">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-black/20 text-xs uppercase text-gray-500">
            <tr>{['รหัสเช่า', 'ลูกค้า', 'กำหนดคืน', 'จำนวน', 'จัดการ'].map(h => (
              <th key={h} className="p-4 font-bold">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {rentals.length === 0 ? (
              <tr><td colSpan={5} className="p-12 text-center text-gray-400 font-bold">
                <span className="material-symbols-outlined text-4xl mb-2 block">inventory_2</span>
                ไม่มีรายการรอรับคืน
              </td></tr>
            ) : rentals.map(order => {
              const overdue = isOverdue(order.returnDate);
              return (
                <tr key={order.id} className="border-t border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-primary">{order.id}</td>
                  <td className="p-4 font-bold">{order.customerName}</td>
                  <td className="p-4">
                    <span className={`font-bold text-sm flex items-center gap-1 ${overdue ? 'text-red-500' : 'text-gray-700 dark:text-gray-200'}`}>
                      {overdue && <span className="material-symbols-outlined text-[16px]">warning</span>}
                      {order.returnDate || '-'}
                      {overdue && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-black ml-1">เกินกำหนด</span>}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-gray-600 dark:text-gray-300">{order.items?.length || 0} เล่ม</td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => setViewOrder(order)} className="text-xs font-bold bg-primary/10 text-primary px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-all">รายละเอียด</button>
                    <button onClick={() => setConfirmOrder(order)} className="text-xs font-bold bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition-all shadow-md">รับคืน</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewOrder(null)} />
          <div className="relative bg-white dark:bg-[#0f1712] w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">assignment_return</span>รายละเอียดรับคืน
              </h3>
              <button onClick={() => setViewOrder(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-white/10 hover:bg-red-500 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 bg-primary/5 p-4 rounded-2xl border border-primary/10">
                {[['ลูกค้า', viewOrder.customerName], ['เบอร์โทร', viewOrder.phone]].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">{label}</p>
                    <p className="font-bold text-sm">{value}</p>
                  </div>
                ))}
                <div className="col-span-2">
                  <p className="text-[10px] font-bold uppercase text-red-500">กำหนดคืน</p>
                  <p className={`font-black ${isOverdue(viewOrder.returnDate) ? 'text-red-500' : ''}`}>{viewOrder.returnDate}</p>
                </div>
              </div>

              <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider">หนังสือที่ต้องเช็คสภาพ:</h4>
              <div className="space-y-3">
                {viewOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 bg-gray-50 dark:bg-black/20 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                    {item.image
                      ? <img src={item.image} className="w-10 h-14 object-cover rounded-md shadow-sm" alt="" />
                      : <div className="w-10 h-14 bg-gray-200 dark:bg-white/10 rounded-md flex items-center justify-center"><span className="material-symbols-outlined text-gray-400 text-lg">image</span></div>}
                    <div>
                      <p className="font-bold text-sm leading-tight">{item.title}</p>
                      <p className="text-[10px] text-gray-400 mt-1">ระยะเวลาเช่า: {item.days ? item.days / 7 : item.rentweeks} สัปดาห์</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex justify-end gap-3">
              <button onClick={() => setViewOrder(null)} className="px-5 py-2 rounded-xl font-bold border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm">ปิด</button>
              <button onClick={() => { setViewOrder(null); setConfirmOrder(viewOrder); }}
                className="px-6 py-2 rounded-xl font-bold bg-green-500 text-white hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20 text-sm">
                ยืนยันรับคืนเข้าสต็อก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmOrder(null)} />
          <div className="relative bg-white dark:bg-[#0f1712] w-full max-w-md rounded-[2rem] shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-green-500 text-3xl">assignment_return</span>
            </div>
            <h3 className="text-xl font-black mb-2">ยืนยันรับคืน?</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              ออเดอร์ <span className="font-bold text-gray-800 dark:text-white">{confirmOrder.id}</span><br />
              หนังสือ {confirmOrder.items?.length || 0} เล่มจะถูกคืนเข้าสต็อกทันที
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setConfirmOrder(null)} className="px-6 py-2 rounded-xl font-bold border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">ยกเลิก</button>
              <button onClick={() => handleReturnBook(confirmOrder)} className="px-6 py-2 rounded-xl font-bold bg-green-500 text-white hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20">ยืนยัน</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminReturns;
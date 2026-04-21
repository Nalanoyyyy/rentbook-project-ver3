import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdmin, isAuthenticated } from '../../services/authService';
import AdminNav from './AdminNav';

type OrderItem = { id: string; title: string; price: number; days?: number; rentweeks?: number };
type Order = { id: string; customerName: string; phone: string; email: string; address: string; note?: string; date: string; status: string; total: number; items: OrderItem[]; slip?: string };

const parse = (k: string): any[] => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch { return []; } };

const formatOrders = (raw: any[]): Order[] => {
  const seen = new Set<string>();
  return raw.reduce<Order[]>((acc, o) => {
    const id = o.id || o.orderId;
    if (!id || seen.has(id)) return acc;
    seen.add(id);
    return [...acc, {
      id, customerName: o.customerName || 'ไม่ระบุชื่อลูกค้า',
      phone: o.phone || '-', email: o.email || '-', address: o.address || '-', note: o.note || '-',
      date: o.date || o.orderDate || '-',
      status: o.status === 'pending' ? 'รอดำเนินการ' : (o.status || 'รอดำเนินการ'),
      total: Number(o.total) || 0, items: Array.isArray(o.items) ? o.items : [],
      slip: o.slip || o.paymentSlip || o.slipImage || undefined,
    }];
  }, []);
};

const STATUS_CLS: Record<string, string> = {
  'รอดำเนินการ':    'bg-yellow-100 text-yellow-700',
  'ยืนยันแล้ว':     'bg-blue-100 text-blue-700',
  'คืนหนังสือแล้ว': 'bg-green-100 text-green-700',
  'ยกเลิก':         'bg-red-100 text-red-600',
};

const patchOrders = (ids: string[], status: string) => {
  ['admin_orders', 'allOrders'].forEach(k =>
    localStorage.setItem(k, JSON.stringify(parse(k).map((o: any) =>
      ids.includes(o.id || o.orderId) ? { ...o, status } : o
    )))
  );
};

const Modal: React.FC<{ onClose: () => void; maxW?: string; children: React.ReactNode }> =
  ({ onClose, maxW = 'max-w-2xl', children }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white dark:bg-[#0f1712] w-full ${maxW} rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`}>{children}</div>
    </div>
  );

const AdminOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders,        setOrders]        = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [confirmId,     setConfirmId]     = useState<string | null>(null);
  const [selected,      setSelected]      = useState<Set<string>>(new Set()); // bulk select
  const [bulkConfirm,   setBulkConfirm]   = useState(false);
  const [toast,         setToast]         = useState('');

  const load = useCallback(() =>
    setOrders(formatOrders([...parse('admin_orders'), ...parse('allOrders')]))
  , []);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) { navigate('/'); return; }
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, [navigate, load]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const pendingReturns = orders.filter(o => !['รอดำเนินการ', 'คืนหนังสือแล้ว', 'ยกเลิก'].includes(o.status)).length;
  const pendingOrders  = orders.filter(o => o.status === 'รอดำเนินการ');

  // Single confirm
  const doConfirm = (id: string) => {
    patchOrders([id], 'ยืนยันแล้ว');
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'ยืนยันแล้ว' } : o));
    window.dispatchEvent(new Event('storage'));
    setConfirmId(null); setSelectedOrder(null);
    showToast('ยืนยัน order เรียบร้อยแล้ว');
  };

  // Bulk confirm
  const doBulkConfirm = () => {
    const ids = [...selected];
    patchOrders(ids, 'ยืนยันแล้ว');
    setOrders(prev => prev.map(o => selected.has(o.id) ? { ...o, status: 'ยืนยันแล้ว' } : o));
    window.dispatchEvent(new Event('storage'));
    setSelected(new Set()); setBulkConfirm(false);
    showToast(`ยืนยัน ${ids.length} order เรียบร้อยแล้ว`);
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const toggleAll = () => {
    if (selected.size === pendingOrders.length) setSelected(new Set());
    else setSelected(new Set(pendingOrders.map(o => o.id)));
  };

  const SectionHeader: React.FC<{ icon: string; label: string }> = ({ icon, label }) => (
    <h4 className="font-bold mb-3 flex items-center gap-2 border-b border-gray-100 dark:border-white/10 pb-2">
      <span className="material-symbols-outlined text-primary">{icon}</span>{label}
    </h4>
  );

  return (
    <main className="max-w-6xl mx-auto px-4 py-12 min-h-[80vh]">

      {toast && (
        <div className="fixed top-6 right-6 z-[200] bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <span className="material-symbols-outlined text-green-400 dark:text-green-600 text-[18px]">check_circle</span>{toast}
        </div>
      )}

      <h1 className="text-3xl font-black mb-2">ระบบจัดการร้าน (Admin)</h1>
      <AdminNav pendingReturns={pendingReturns} />

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-2xl p-4 animate-in slide-in-from-top-2 duration-200">
          <span className="material-symbols-outlined text-primary">checklist</span>
          <p className="font-bold text-primary flex-1">เลือกแล้ว {selected.size} order</p>
          <button onClick={() => setSelected(new Set())}
            className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            ยกเลิก
          </button>
          <button onClick={() => setBulkConfirm(true)}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            ยืนยัน {selected.size} order พร้อมกัน
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-[#1a3324] rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 dark:border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-black/20 text-xs uppercase tracking-widest text-gray-500">
                <th className="p-4 w-10">
                  <input type="checkbox" checked={pendingOrders.length > 0 && selected.size === pendingOrders.length}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded accent-primary cursor-pointer" />
                </th>
                {['Order ID', 'ลูกค้า', 'วันที่', 'สถานะ', 'ยอดชำระ', 'จัดการ'].map((h, i) => (
                  <th key={h} className={`p-4 font-bold ${i === 4 ? 'text-right' : i === 5 ? 'text-center' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-400 font-bold">ยังไม่มีคำสั่งซื้อในระบบ</td></tr>
              ) : orders.map(o => (
                <tr key={o.id} className={`border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${selected.has(o.id) ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
                  <td className="p-4">
                    {o.status === 'รอดำเนินการ' && (
                      <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggleSelect(o.id)}
                        className="w-4 h-4 rounded accent-primary cursor-pointer" />
                    )}
                  </td>
                  <td className="p-4 font-bold text-primary">{o.id}</td>
                  <td className="p-4">{o.customerName}</td>
                  <td className="p-4 text-sm text-gray-500">{o.date}</td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_CLS[o.status] || 'bg-yellow-100 text-yellow-700'}`}>{o.status}</span>
                  </td>
                  <td className="p-4 text-right font-bold">฿{o.total.toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => setSelectedOrder(o)} className="text-sm font-bold bg-primary/10 text-primary px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-colors">ดูรายละเอียด</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <Modal onClose={() => setSelectedOrder(null)}>
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">contact_mail</span>
              ข้อมูลคำสั่งซื้อ: <span className="text-primary">{selectedOrder.id}</span>
            </h3>
            <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-white/10 hover:bg-red-500 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10">
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2 border-b border-primary/10 pb-2">
                <span className="material-symbols-outlined text-primary">person</span>ข้อมูลลูกค้า
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[['ชื่อ-นามสกุล', selectedOrder.customerName], ['เบอร์โทรศัพท์', selectedOrder.phone], ['อีเมล', selectedOrder.email]].map(([l, v]) => (
                  <div key={l}><p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{l}</p><p className="font-bold">{v}</p></div>
                ))}
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">ที่อยู่จัดส่ง</p>
                  <p className="font-medium leading-relaxed bg-white dark:bg-black/20 p-3 rounded-lg border border-gray-100 dark:border-white/5">{selectedOrder.address}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">edit_note</span>หมายเหตุ
                  </p>
                  <p className={`font-medium leading-relaxed p-3 rounded-lg border ${
                    selectedOrder.note && selectedOrder.note !== '-'
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700/30 text-yellow-800 dark:text-yellow-200'
                      : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-500'
                  }`}>{selectedOrder.note || '-'}</p>
                </div>
              </div>
            </div>

            <div>
              <SectionHeader icon="library_books" label="รายการเช่า" />
              <div className="space-y-3">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center bg-gray-50 dark:bg-white/5 p-3 rounded-xl">
                    <div>
                      <p className="font-bold">{item.title || 'ไม่มีชื่อหนังสือ'}</p>
                      <p className="text-xs text-gray-500">ระยะเวลา: {item.days ? item.days / 7 : (item.rentweeks || 1)} สัปดาห์</p>
                    </div>
                    <p className="font-bold text-primary">฿{Number(item.price || 0).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {selectedOrder.slip && (
              <div>
                <SectionHeader icon="receipt_long" label="หลักฐานการชำระเงิน" />
                <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-100 dark:border-white/5 flex justify-center">
                  <img src={selectedOrder.slip} alt="Payment Slip" className="max-w-full max-h-[400px] object-contain rounded-lg shadow-sm"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex justify-end">
            <button onClick={() => setConfirmId(selectedOrder.id)}
              disabled={selectedOrder.status !== 'รอดำเนินการ'}
              className="px-6 py-2 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-40 disabled:pointer-events-none">
              ยืนยันการดำเนินการ
            </button>
          </div>
        </Modal>
      )}

      {/* Single confirm */}
      {confirmId && (
        <Modal onClose={() => setConfirmId(null)} maxW="max-w-md">
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-green-500 text-3xl">check_circle</span>
            </div>
            <h3 className="text-xl font-black mb-2">ยืนยันออเดอร์?</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              ออเดอร์ <span className="font-bold text-gray-800 dark:text-white">{confirmId}</span><br />
              จะถูกอัปเดตสถานะเป็น "ยืนยันแล้ว"
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setConfirmId(null)} className="px-6 py-2 rounded-xl font-bold border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">ยกเลิก</button>
              <button onClick={() => doConfirm(confirmId)} className="px-6 py-2 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">ยืนยัน</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bulk confirm */}
      {bulkConfirm && (
        <Modal onClose={() => setBulkConfirm(false)} maxW="max-w-md">
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">checklist</span>
            </div>
            <h3 className="text-xl font-black mb-2">ยืนยัน {selected.size} order พร้อมกัน?</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              order ที่เลือกทั้งหมดจะถูกเปลี่ยนสถานะเป็น "ยืนยันแล้ว" พร้อมกัน
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setBulkConfirm(false)} className="px-6 py-2 rounded-xl font-bold border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">ยกเลิก</button>
              <button onClick={doBulkConfirm} className="px-6 py-2 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">ยืนยันทั้งหมด</button>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
};

export default AdminOrders;
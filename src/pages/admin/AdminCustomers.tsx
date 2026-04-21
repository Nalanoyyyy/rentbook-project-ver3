import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdmin, isAuthenticated } from '../../services/authService';
import AdminNav from './AdminNav';

// ── Types ─────────────────────────────────────────────────────────────────────

type Customer = {
  phone: string; name: string; email: string;
  totalOrders: number; totalSpend: number;
  isBlacklisted: boolean; blacklistReason?: string;
  orders: any[];
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const parse = (k: string): any[] => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch { return []; } };

const getAllOrders = (): any[] => {
  const seen = new Set();
  return [...parse('admin_orders'), ...parse('allOrders')]
    .filter(o => { const id = o.id || o.orderId; return id && !seen.has(id) && seen.add(id); });
};

const getBlacklist = (): Record<string, string> => { try { return JSON.parse(localStorage.getItem('blacklist') || '{}'); } catch { return {}; } };
const setBlacklist = (bl: Record<string, string>) => { localStorage.setItem('blacklist', JSON.stringify(bl)); window.dispatchEvent(new Event('storage')); };

const buildCustomers = (orders: any[], bl: Record<string, string>): Customer[] => {
  const map = new Map<string, Customer>();
  orders.forEach(o => {
    const phone = o.phone || '-';
    if (!map.has(phone)) map.set(phone, { phone, name: o.customerName || 'ไม่ระบุชื่อ', email: o.email || '-', totalOrders: 0, totalSpend: 0, isBlacklisted: !!bl[phone], blacklistReason: bl[phone], orders: [] });
    const c = map.get(phone)!;
    c.totalOrders++; c.totalSpend += Number(o.total || 0); c.orders.push(o);
  });
  return [...map.values()].sort((a, b) => b.totalOrders - a.totalOrders);
};

const statusCls = (s: string) =>
  s === 'คืนหนังสือแล้ว' ? 'bg-green-100 text-green-700' :
  s === 'รอดำเนินการ'    ? 'bg-yellow-100 text-yellow-700' :
  s === 'ยกเลิก'         ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-700';

// ── Modals ────────────────────────────────────────────────────────────────────

const ModalShell: React.FC<{ onClose: () => void; maxW?: string; children: React.ReactNode }> =
  ({ onClose, maxW = 'max-w-xl', children }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white dark:bg-[#0f1712] w-full ${maxW} rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`}>{children}</div>
    </div>
  );

const BlacklistModal: React.FC<{ customer: Customer; onClose: () => void; onConfirm: (r: string) => void }> =
  ({ customer, onClose, onConfirm }) => {
    const [reason, setReason] = useState('');
    return (
      <ModalShell onClose={onClose} maxW="max-w-md">
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-red-500 text-3xl">block</span>
          </div>
          <h3 className="text-xl font-black mb-1">เพิ่มใน Blacklist?</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4"><span className="font-bold text-gray-800 dark:text-white">{customer.name}</span> จะไม่สามารถเช่าหนังสือได้</p>
          <textarea className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 transition-all resize-none mb-4"
            rows={3} placeholder="ระบุเหตุผล (ไม่บังคับ)" value={reason} onChange={e => setReason(e.target.value)} />
          <div className="flex gap-3 justify-center">
            <button onClick={onClose} className="px-6 py-2 rounded-xl font-bold border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">ยกเลิก</button>
            <button onClick={() => onConfirm(reason)} className="px-6 py-2 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">เพิ่ม Blacklist</button>
          </div>
        </div>
      </ModalShell>
    );
  };

const CustomerDetailModal: React.FC<{ customer: Customer; onClose: () => void }> = ({ customer, onClose }) => (
  <ModalShell onClose={onClose} maxW="max-w-2xl">
    <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
      <h3 className="text-xl font-bold flex items-center gap-2"><span className="material-symbols-outlined text-primary">person</span>ประวัติลูกค้า</h3>
      <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-white/10 hover:bg-red-500 hover:text-white transition-colors">
        <span className="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>
    <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
      <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
        <div className="grid grid-cols-2 gap-4">
          {[['ชื่อ-นามสกุล', customer.name], ['เบอร์โทรศัพท์', customer.phone], ['อีเมล', customer.email], ['คำสั่งซื้อ', `${customer.totalOrders} ออเดอร์`]].map(([l, v]) => (
            <div key={l}><p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">{l}</p><p className="font-bold text-sm">{v}</p></div>
          ))}
          <div className="col-span-2">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">ยอดใช้จ่ายรวม</p>
            <p className="font-black text-primary text-lg">฿{customer.totalSpend.toLocaleString()}</p>
          </div>
        </div>
        {customer.isBlacklisted && customer.blacklistReason && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700/30">
            <p className="text-xs font-bold text-red-500 uppercase mb-1">เหตุผล Blacklist</p>
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">{customer.blacklistReason}</p>
          </div>
        )}
      </div>
      <div>
        <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-3">ประวัติการเช่า</h4>
        {customer.orders.length === 0
          ? <p className="text-gray-400 text-sm text-center py-4">ไม่มีประวัติ</p>
          : <div className="space-y-2">{customer.orders.map((o, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                <div>
                  <p className="font-bold text-sm text-primary">{o.id || o.orderId}</p>
                  <p className="text-xs text-gray-400">{o.date || '-'} · {o.items?.length || 0} เล่ม</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusCls(o.status)}`}>{o.status}</span>
                  <span className="font-bold text-sm">฿{Number(o.total || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}</div>}
      </div>
    </div>
  </ModalShell>
);

// ── AdminCustomers ────────────────────────────────────────────────────────────

const AdminCustomers: React.FC = () => {
  const navigate = useNavigate();
  const [customers,       setCustomers]       = useState<Customer[]>([]);
  const [search,          setSearch]          = useState('');
  const [filterTab,       setFilterTab]       = useState<'all' | 'blacklisted'>('all');
  const [detailTarget,    setDetailTarget]    = useState<Customer | null>(null);
  const [blacklistTarget, setBlacklistTarget] = useState<Customer | null>(null);
  const [toast,           setToast]           = useState<string | null>(null);

  const load = useCallback(() => setCustomers(buildCustomers(getAllOrders(), getBlacklist())), []);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) { navigate('/'); return; }
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, [navigate, load]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const doBlacklist = useCallback((customer: Customer, reason: string) => {
    const bl = getBlacklist(); bl[customer.phone] = reason; setBlacklist(bl);
    load(); showToast(`เพิ่ม ${customer.name} ใน Blacklist แล้ว`); setBlacklistTarget(null);
  }, [load]);

  const doUnblacklist = useCallback((customer: Customer) => {
    const bl = getBlacklist(); delete bl[customer.phone]; setBlacklist(bl);
    load(); showToast(`นำ ${customer.name} ออกจาก Blacklist แล้ว`);
  }, [load]);

  const blacklistCount = customers.filter(c => c.isBlacklisted).length;

  const filtered = customers.filter(c =>
    (c.name + c.phone + c.email).toLowerCase().includes(search.toLowerCase()) &&
    (filterTab === 'all' || c.isBlacklisted)
  );

  const STATS = [
    { label: 'ลูกค้าทั้งหมด', value: customers.length,                   icon: 'group',        color: 'text-blue-500',  bg: 'bg-blue-100 dark:bg-blue-900/30'   },
    { label: 'Blacklist',      value: blacklistCount,                      icon: 'block',        color: 'text-red-500',   bg: 'bg-red-100 dark:bg-red-900/30'     },
    { label: 'ลูกค้าปกติ',    value: customers.length - blacklistCount,   icon: 'verified_user',color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 py-12 min-h-[80vh]">
      {toast && (
        <div className="fixed top-6 right-6 z-[200] bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <span className="material-symbols-outlined text-green-400 dark:text-green-600 text-[18px]">check_circle</span>{toast}
        </div>
      )}

      <h1 className="text-3xl font-black mb-2">ระบบจัดการร้าน (Admin)</h1>
      <AdminNav />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {STATS.map(s => (
          <div key={s.label} className="bg-white dark:bg-[#1a3324] rounded-2xl border border-gray-100 dark:border-white/5 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}>
              <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
            </div>
            <div><p className="text-2xl font-black">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
          <input type="text" placeholder="ค้นหาชื่อ, เบอร์, อีเมล..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden text-sm font-bold">
          {(['all', 'blacklisted'] as const).map(val => (
            <button key={val} onClick={() => setFilterTab(val)}
              className={`px-5 py-2.5 transition-colors ${filterTab === val ? 'bg-primary text-white' : 'bg-white dark:bg-white/5 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/10'}`}>
              {val === 'all' ? 'ทั้งหมด' : 'Blacklist'}
              {val === 'blacklisted' && blacklistCount > 0 && (
                <span className={`ml-1.5 text-[10px] font-black px-1.5 py-0.5 rounded-full ${filterTab === 'blacklisted' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>{blacklistCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1a3324] rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 dark:border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-black/20 text-xs uppercase tracking-widest text-gray-500">
                {['ลูกค้า', 'เบอร์โทร', 'ออเดอร์', 'ยอดรวม', 'สถานะ', 'จัดการ'].map((h, i) => (
                  <th key={h} className={`p-4 font-bold ${i >= 4 ? 'text-center' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-gray-400">
                  <span className="material-symbols-outlined text-4xl mb-2 block">person_search</span>
                  {search ? 'ไม่พบลูกค้าที่ค้นหา' : 'ยังไม่มีข้อมูลลูกค้า'}
                </td></tr>
              ) : filtered.map(c => (
                <tr key={c.phone} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="font-black text-primary text-sm">{c.name.charAt(0)}</span>
                      </div>
                      <div><p className="font-bold text-sm">{c.name}</p><p className="text-xs text-gray-400">{c.email}</p></div>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium">{c.phone}</td>
                  <td className="p-4 font-bold text-center">{c.totalOrders}</td>
                  <td className="p-4 font-bold text-primary">฿{c.totalSpend.toLocaleString()}</td>
                  <td className="p-4 text-center">
                    {c.isBlacklisted
                      ? <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-600 inline-flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">block</span>Blacklist</span>
                      : <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700">ปกติ</span>}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setDetailTarget(c)} className="text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors">ประวัติ</button>
                      {c.isBlacklisted
                        ? <button onClick={() => doUnblacklist(c)} className="text-xs font-bold bg-green-50 dark:bg-green-900/20 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-500 hover:text-white transition-colors">ปลดล็อก</button>
                        : <button onClick={() => setBlacklistTarget(c)} className="text-xs font-bold bg-red-50 dark:bg-red-900/20 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-colors">Blacklist</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {detailTarget && <CustomerDetailModal customer={detailTarget} onClose={() => setDetailTarget(null)} />}
      {blacklistTarget && <BlacklistModal customer={blacklistTarget} onClose={() => setBlacklistTarget(null)} onConfirm={r => doBlacklist(blacklistTarget, r)} />}
    </main>
  );
};

export default AdminCustomers;
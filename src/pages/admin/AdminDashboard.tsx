import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAdmin, isAuthenticated } from '../../services/authService';
import { apiGetOrders, apiGetBooks, apiGetAllCoupons } from '../../services/api';
import AdminNav from './AdminNav';

const TH_MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

const buildTopBooks = (orders: any[]) => {
  const map = new Map<string, { title: string; count: number; image?: string }>();
  orders.forEach(o => {
    if (o.status === 'ยกเลิก') return;
    (o.items || []).forEach((item: any) => {
      const key = String(item.bookId || item.id || item.title);
      const cur = map.get(key) || { title: item.title || 'ไม่มีชื่อ', count: 0, image: item.image };
      map.set(key, { ...cur, count: cur.count + 1 });
    });
  });
  return [...map.entries()].map(([id, v]) => ({ id, ...v })).sort((a, b) => b.count - a.count).slice(0, 5);
};

const buildMonthly = (orders: any[]) => {
  const now = new Date();
  const result = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { month: TH_MONTHS[d.getMonth()], m: d.getMonth(), y: d.getFullYear(), revenue: 0 };
  });
  orders.forEach(o => {
    if (o.status === 'ยกเลิก') return;
    const d = new Date(o.date || o.createdAt);
    if (isNaN(d.getTime())) return;
    const slot = result.find(r => r.m === d.getMonth() && r.y === d.getFullYear());
    if (slot) slot.revenue += Number(o.total || 0);
  });
  return result;
};

const RevenueChart: React.FC<{ data: ReturnType<typeof buildMonthly> }> = ({ data }) => {
  const max = Math.max(...data.map(d => d.revenue), 1);
  return (
    <div className="flex items-end gap-3 h-40 px-2">
      {data.map((d, i) => {
        const pct = (d.revenue / max) * 100;
        const isLast = i === data.length - 1;
        return (
          <div key={`${d.m}-${d.y}`} className="flex-1 flex flex-col items-center gap-1">
            {d.revenue > 0 && <p className="text-[9px] font-black text-primary whitespace-nowrap">฿{d.revenue >= 1000 ? `${(d.revenue/1000).toFixed(1)}k` : d.revenue}</p>}
            <div className="w-full flex items-end" style={{ height: '100px' }}>
              <div className={`w-full rounded-t-xl transition-all duration-500 ${isLast ? 'bg-primary' : 'bg-primary/30 dark:bg-primary/20'}`} style={{ height: `${Math.max(pct, d.revenue > 0 ? 5 : 0)}%` }} />
            </div>
            <p className={`text-[10px] font-bold ${isLast ? 'text-primary' : 'text-gray-400'}`}>{d.month}</p>
          </div>
        );
      })}
    </div>
  );
};

const downloadCSV = (rows: string[][], filename: string) => {
  const content = '\uFEFF' + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8;' }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [orders,     setOrders]     = useState<any[]>([]);
  const [books,      setBooks]      = useState<any[]>([]);
  const [toast,      setToast]      = useState('');

  const load = useCallback(async () => {
    try {
      const [o, b] = await Promise.all([apiGetOrders(), apiGetBooks()]);
      setOrders(o); setBooks(b);
    } catch { navigate('/'); }
  }, [navigate]);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) { navigate('/'); return; }
    load();
  }, [navigate, load]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const revenue        = orders.reduce((s, o) => o.status !== 'ยกเลิก' ? s + Number(o.total || 0) : s, 0);
  const pendingReturns = orders.filter(o => !['รอดำเนินการ','คืนหนังสือแล้ว','ยกเลิก'].includes(o.status)).length;
  const outOfStock     = books.filter(b => !b.isAvailable || b.stock === 0);
  const topBooks       = buildTopBooks(orders);
  const monthlyData    = buildMonthly(orders);

  const STAT_CARDS = [
    { label: 'รายได้รวมทั้งหมด',     value: `฿${revenue.toLocaleString()}`,      icon: 'payments',          color: 'text-green-500',  bg: 'bg-green-100 dark:bg-green-900/30'  },
    { label: 'รอรับคืนหนังสือ',      value: `${pendingReturns} ออเดอร์`,          icon: 'assignment_return', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    { label: 'หนังสือทั้งหมดในคลัง', value: `${books.length} เล่ม`,              icon: 'library_books',     color: 'text-blue-500',   bg: 'bg-blue-100 dark:bg-blue-900/30'    },
    { label: 'หนังสือที่ถูกยืม/หมด', value: `${outOfStock.length} เล่ม`,         icon: 'warning',           color: 'text-red-500',    bg: 'bg-red-100 dark:bg-red-900/30'      },
  ];

  const statusCls = (s: string) =>
    s === 'คืนหนังสือแล้ว' ? 'bg-green-100 text-green-700' :
    s === 'รอดำเนินการ'    ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700';

  const handleExportOrders = () => {
    if (!orders.length) { showToast('ยังไม่มีข้อมูล'); return; }
    downloadCSV([
      ['รหัสออเดอร์','ชื่อลูกค้า','เบอร์โทร','อีเมล','ที่อยู่','วันที่','สถานะ','ยอดชำระ','วันคืน'],
      ...orders.map(o => [o.id, o.customerName, o.phone, o.email, o.address, o.date, o.status, String(o.total), o.returnDate || '-']),
    ], `orders_${new Date().toISOString().slice(0,10)}.csv`);
    showToast('ดาวน์โหลด orders.csv แล้ว');
  };

  const handleExportCustomers = () => {
    if (!orders.length) { showToast('ยังไม่มีข้อมูล'); return; }
    const map = new Map<string, any>();
    orders.forEach(o => {
      if (!map.has(o.email)) map.set(o.email, { name: o.customerName, email: o.email, phone: o.phone, count: 0, spend: 0 });
      const c = map.get(o.email); c.count++; c.spend += Number(o.total || 0);
    });
    downloadCSV([
      ['ชื่อลูกค้า','อีเมล','เบอร์โทร','จำนวนออเดอร์','ยอดรวม'],
      ...[...map.values()].map(c => [c.name, c.email, c.phone, String(c.count), String(c.spend)]),
    ], `customers_${new Date().toISOString().slice(0,10)}.csv`);
    showToast('ดาวน์โหลด customers.csv แล้ว');
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-12 min-h-[80vh]">
      {toast && (
        <div className="fixed top-6 right-6 z-[200] bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <span className="material-symbols-outlined text-green-400 dark:text-green-600 text-[18px]">check_circle</span>{toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-black">ภาพรวมระบบ (Dashboard)</h1>
        <div className="flex gap-2">
          <button onClick={handleExportOrders} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-[18px] text-primary">download</span>Orders CSV
          </button>
          <button onClick={handleExportCustomers} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-[18px] text-primary">download</span>Customers CSV
          </button>
        </div>
      </div>

      <AdminNav pendingReturns={pendingReturns} />

      {outOfStock.length > 0 && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-red-500">warning</span>
            <p className="font-black text-red-600 dark:text-red-400">หนังสือหมดสต็อก {outOfStock.length} เล่ม</p>
            <Link to="/admin/inventory" className="ml-auto text-xs font-bold text-red-500 hover:underline">จัดการสต็อก →</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {outOfStock.map(b => (
              <div key={b.id} className="flex items-center gap-2 bg-white dark:bg-black/20 px-3 py-1.5 rounded-xl border border-red-100 dark:border-red-700/20">
                {b.image && <img src={b.image} alt="" className="w-5 h-7 object-cover rounded" />}
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{b.title}</span>
                <span className="text-[10px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">0</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(({ label, value, icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-[#1a3324] p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-4 hover:scale-[1.02] transition-transform">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg}`}>
              <span className={`material-symbols-outlined text-3xl ${color}`}>{icon}</span>
            </div>
            <div><p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p><p className="text-2xl font-black">{value}</p></div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#1a3324] rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2"><span className="material-symbols-outlined text-primary">bar_chart</span>รายได้ 6 เดือนล่าสุด</h2>
          <p className="text-xs font-bold text-gray-400 bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-xl">รวม ฿{monthlyData.reduce((s, d) => s + d.revenue, 0).toLocaleString()}</p>
        </div>
        {monthlyData.every(d => d.revenue === 0)
          ? <div className="text-center py-10 text-gray-400"><span className="material-symbols-outlined text-4xl mb-2 block">bar_chart</span><p className="text-sm">ยังไม่มีข้อมูลรายได้</p></div>
          : <RevenueChart data={monthlyData} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#1a3324] rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-white/5">
            <h2 className="text-lg font-bold flex items-center gap-2"><span className="material-symbols-outlined text-primary">leaderboard</span>Top 5 หนังสือฮิต</h2>
          </div>
          {topBooks.length === 0
            ? <p className="p-8 text-center text-gray-400 text-sm">ยังไม่มีข้อมูลการเช่า</p>
            : <div className="p-4 space-y-3">
                {topBooks.map((book, i) => {
                  const pct = Math.round((book.count / topBooks[0].count) * 100);
                  const rankColor = i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-400' : 'text-gray-300';
                  return (
                    <div key={book.id} className="flex items-center gap-3">
                      <span className={`font-black text-lg w-6 text-center ${rankColor}`}>{i + 1}</span>
                      {book.image ? <img src={book.image} alt="" className="w-8 h-11 object-cover rounded-lg flex-shrink-0" /> : <div className="w-8 h-11 bg-gray-100 dark:bg-white/5 rounded-lg flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{book.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-black text-primary whitespace-nowrap">{book.count} ครั้ง</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>}
        </div>

        <div className="bg-white dark:bg-[#1a3324] rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2"><span className="material-symbols-outlined text-primary">history</span>ออเดอร์ล่าสุด</h2>
            <Link to="/admin/orders" className="text-xs font-bold text-primary hover:underline">ดูทั้งหมด</Link>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-black/20 text-xs uppercase text-gray-500">
              <tr>{['รหัส','ลูกค้า','ยอดชำระ','สถานะ'].map(h => <th key={h} className="p-4">{h}</th>)}</tr>
            </thead>
            <tbody>
              {orders.length === 0
                ? <tr><td colSpan={4} className="p-8 text-center text-gray-400">ยังไม่มีรายการเช่า</td></tr>
                : orders.slice(0, 5).map((o, i) => (
                    <tr key={i} className="border-t border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold text-xs text-primary">{o.id}</td>
                      <td className="p-4 font-medium text-sm">{o.customerName}</td>
                      <td className="p-4 font-bold text-primary">฿{Number(o.total || 0).toLocaleString()}</td>
                      <td className="p-4"><span className={`text-[10px] font-bold px-3 py-1 rounded-full ${statusCls(o.status)}`}>{o.status}</span></td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;
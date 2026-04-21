import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiGetOrders } from '../services/api';
import { isAuthenticated } from '../services/authService';
import { PageSpinner } from '../components/Skeleton';

const STATUS_CLS: Record<string, string> = {
  'รอดำเนินการ':    'bg-yellow-100 text-yellow-700',
  'ยืนยันแล้ว':     'bg-blue-100 text-blue-700',
  'กำลังจัดส่ง':    'bg-blue-100 text-blue-700',
  'คืนหนังสือแล้ว': 'bg-green-100 text-green-700',
  'สำเร็จ':         'bg-green-100 text-green-700',
  'ยกเลิก':         'bg-red-100 text-red-600',
};

const RentalHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders,  setOrders]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { navigate('/login'); return; }
    apiGetOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return <PageSpinner />;

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 min-h-[85vh]">
      <div className="flex items-center gap-3 mb-8">
        <span className="material-symbols-outlined text-4xl text-primary">history</span>
        <h1 className="text-3xl font-black">ประวัติการเช่าของคุณ</h1>
      </div>

      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="bg-white dark:bg-white/5 p-12 rounded-[2rem] border border-[#e7f3ec] dark:border-[#1a3324] text-center shadow-sm">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 block">auto_stories</span>
            <p className="text-gray-500 font-bold text-lg mb-4">คุณยังไม่มีประวัติการเช่าหนังสือ</p>
            <Link to="/" className="inline-block px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              ไปเลือกหนังสือกันเลย
            </Link>
          </div>
        ) : orders.map(o => (
          <div key={o.id} className="bg-white dark:bg-[#1a3324] rounded-[2rem] border border-[#e7f3ec] dark:border-[#1a3324] shadow-sm overflow-hidden">
            <div className="bg-gray-50 dark:bg-white/5 p-4 border-b border-gray-100 dark:border-white/5 flex flex-wrap justify-between items-center gap-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">รหัสคำสั่งเช่า</p>
                <p className="font-black text-primary">{o.id}</p>
              </div>
              <div className="flex gap-6 items-center">
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">วันที่ทำรายการ</p>
                  <p className="font-bold text-sm">{o.date}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${STATUS_CLS[o.status] || 'bg-yellow-100 text-yellow-700'}`}>{o.status}</span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {(o.items || []).map((item: any, i: number) => (
                <div key={i} className="flex gap-4 items-center bg-gray-50 dark:bg-black/20 p-3 rounded-2xl">
                  {item.image
                    ? <img src={item.image} alt={item.title} className="w-12 h-16 object-cover rounded-lg shadow-sm" />
                    : <div className="w-12 h-16 bg-gray-200 dark:bg-white/10 rounded-lg flex items-center justify-center"><span className="material-symbols-outlined text-gray-400">book</span></div>}
                  <div className="flex-1">
                    <p className="font-bold text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-1">ระยะเวลาเช่า: <span className="font-bold">{item.days ? item.days / 7 : 1} สัปดาห์</span></p>
                  </div>
                  <p className="font-black text-primary pr-2">฿{Number(item.price || 0).toLocaleString()}</p>
                </div>
              ))}
              <div className="pt-4 border-t border-dashed border-gray-200 dark:border-white/10 flex justify-between items-center">
                <div>
                  <p className="text-xs text-red-500 font-bold mb-1">กำหนดคืนหนังสือภายใน:</p>
                  <p className="font-bold text-sm">{o.returnDate || '-'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">ยอดชำระสุทธิ</p>
                  <p className="font-black text-xl text-primary">฿{Number(o.total || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default RentalHistoryPage;
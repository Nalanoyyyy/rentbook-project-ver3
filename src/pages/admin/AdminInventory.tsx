import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdmin, isAuthenticated } from '../../services/authService';
import { apiGetBooks, apiUpdateBook } from '../../services/api';
import AdminNav from './AdminNav';

const AdminInventory: React.FC = () => {
  const navigate = useNavigate();
  const [books,  setBooks]  = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [toast,  setToast]  = useState('');

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) { navigate('/'); return; }
    apiGetBooks().then(setBooks).catch(() => navigate('/'));
  }, [navigate]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000); };

  const toggleBookStatus = useCallback(async (book: any) => {
    try {
      await apiUpdateBook(book.id, {
        ...book,
        isAvailable: !book.isAvailable,
        status: book.isAvailable ? 'ไม่ว่าง' : 'พร้อมให้เช่า'
      });
      setBooks(prev => prev.map(b =>
        b.id === book.id ? { ...b, isAvailable: !b.isAvailable, status: b.isAvailable ? 'ไม่ว่าง' : 'พร้อมให้เช่า' } : b
      ));
      showToast('อัปเดตสถานะแล้ว');
    } catch (err: any) { showToast(err.message || 'เกิดข้อผิดพลาด'); }
  }, []);

  const filtered = books.filter(b =>
    (b.title + (b.author || '')).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="max-w-6xl mx-auto px-4 py-12 min-h-[80vh]">
      {toast && (
        <div className="fixed top-6 right-6 z-[200] bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <span className="material-symbols-outlined text-green-400 text-[18px]">check_circle</span>{toast}
        </div>
      )}

      <h1 className="text-3xl font-black mb-2">ระบบจัดการร้าน (Admin)</h1>
      <AdminNav />

      <div className="relative mb-6">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
        <input type="text" placeholder="ค้นหาชื่อหนังสือ หรือชื่อผู้แต่ง..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full md:w-1/2 pl-12 pr-4 py-3 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#1a3324] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
      </div>

      <div className="bg-white dark:bg-[#1a3324] rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 p-6">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-xs uppercase">
              {['หนังสือ', 'ราคา', 'สถานะ', 'จัดการ'].map(h => <th key={h} className="p-4">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={4} className="p-10 text-center text-gray-400">
                <span className="material-symbols-outlined text-4xl mb-2 block">search_off</span>
                ไม่พบหนังสือที่ค้นหา
              </td></tr>
            ) : filtered.map(book => (
              <tr key={book.id} className="border-t border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td className="p-4 flex items-center gap-4">
                  {book.image
                    ? <img src={book.image} className="w-10 h-14 rounded-lg object-cover shadow-sm" alt={book.title} />
                    : <div className="w-10 h-14 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center"><span className="material-symbols-outlined text-gray-300">image</span></div>}
                  <div>
                    <span className="font-bold block">{book.title}</span>
                    <span className="text-xs text-gray-500">{book.author}</span>
                  </div>
                </td>
                <td className="p-4 font-bold">฿{book.price.toLocaleString()}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${book.isAvailable ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {book.isAvailable ? 'พร้อมให้เช่า' : 'ไม่ว่าง'}
                  </span>
                </td>
                <td className="p-4">
                  <button onClick={() => toggleBookStatus(book)}
                    className="text-xs font-bold bg-gray-800 dark:bg-white dark:text-black text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all shadow-md">
                    สลับสถานะ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default AdminInventory;
import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import BookCard from '../components/BookCard';
import Pagination from '../components/Pagination';
import { apiGetBooks } from '../services/api';
import { BookGridSkeleton } from '../components/Skeleton';

const PER_PAGE = 12;

const Home: React.FC = () => {
  const location = useLocation();
  const query    = new URLSearchParams(location.search).get('search')?.toLowerCase().trim() || '';
  const [books, setBooks] = useState<any[]>([]);
  const [pages, setPages] = useState<Record<string, number>>({ cartoon: 1, fiction: 1, general: 1 });

  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
  setLoading(true);
  const data = await apiGetBooks();
  setBooks(data);
  setLoading(false);
}, []);
  

  useEffect(() => {
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, [load]);

  // reset หน้าเมื่อ search เปลี่ยน
  useEffect(() => setPages({ cartoon: 1, fiction: 1, general: 1 }), [query]);

  const searched = books.filter(b => {
    if (!b || !query) return true;
    return (b.title || '').toLowerCase().includes(query) ||
           (b.author || '').toLowerCase().includes(query) ||
           (b.category || '').toLowerCase().includes(query);
  });

  const inCat = (b: any, ...keys: string[]) =>
    keys.some(k => (b.category || '').toLowerCase().includes(k));

  const cartoonAll = searched.filter(b => inCat(b, 'cartoon', 'การ์ตูน', 'มังงะ'));
  const fictionAll = searched.filter(b => inCat(b, 'fiction', 'นิยาย'));
  const generalAll = searched.filter(b => inCat(b, 'general') || !inCat(b, 'cartoon', 'การ์ตูน', 'มังงะ', 'fiction', 'นิยาย'));

  const paginate = (arr: any[], key: string) => {
    const p = pages[key];
    return arr.slice((p - 1) * PER_PAGE, p * PER_PAGE);
  };

  const setPage = (key: string, p: number) => {
    setPages(prev => ({ ...prev, [key]: p }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const SECTIONS = [
    { key: 'cartoon', label: 'การ์ตูนยอดฮิต', icon: 'auto_stories',   all: cartoonAll },
    { key: 'fiction', label: 'นิยายแนะนำ',    icon: 'menu_book',       all: fictionAll },
    { key: 'general', label: 'หนังสือทั่วไป', icon: 'import_contacts', all: generalAll },
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <main className="max-w-[1400px] mx-auto pb-20">

        {!query && (
          <section className="p-4 md:p-10">
            <div className="relative overflow-hidden rounded-[3rem] min-h-[400px] flex flex-col justify-end p-8 md:p-12 text-white bg-cover bg-center"
              style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.5)), url("https://picsum.photos/id/24/1200/600")' }}>
              <div className="max-w-2xl">
                <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter text-white">ยินดีต้อนรับสู่ RentBook</h1>
                <p className="text-lg opacity-80 mb-6 text-white">เช่าหนังสือออนไลน์ ง่ายๆ แค่ปลายนิ้ว รักษ์โลก และประหยัดกว่า</p>
              </div>
            </div>
          </section>
        )}

        {query && (
          <div className="px-4 md:px-10 py-10">
            <h1 className="text-3xl font-black">ผลการค้นหาสำหรับ "{query}"</h1>
            {searched.length === 0 && (
              <div className="mt-10 text-center py-20 opacity-30">
                <span className="material-symbols-outlined text-6xl">search_off</span>
                <p className="mt-2">ไม่พบหนังสือที่คุณกำลังตามหา</p>
              </div>
            )}
          </div>
        )}

        {SECTIONS.map(({ key, label, icon, all }) => all.length === 0 ? null : (
          <section key={key} className="px-4 md:px-10 py-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">{icon}</span>{label}
              </h2>
              <span className="text-xs text-gray-400">{all.length} เล่ม</span>
            </div>
            {loading
            ? <BookGridSkeleton count={6} />
            : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {paginate(all, key).map(book => <BookCard key={book.id} {...book} />)}
              </div>
            }
            <Pagination
              currentPage={pages[key]}
              totalPages={Math.ceil(all.length / PER_PAGE)}
              onChange={p => setPage(key, p)}
            />
          </section>
        ))}

      </main>
    </div>
  );
};

export default Home;
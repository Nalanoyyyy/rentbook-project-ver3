import React, { useState, useEffect, useCallback } from 'react';
import BookCard from '../components/BookCard';
import Pagination from '../components/Pagination';
import { getInventory } from '../services/inventoryService';
import { BookGridSkeleton } from '../components/Skeleton';

const PER_PAGE = 12;
const SUB_CATEGORIES = ['ทั้งหมด', 'จิตวิทยา', 'ธุรกิจ', 'อาหาร', 'ภาษา', 'ประวัติศาสตร์'];

const GeneralBooks: React.FC = () => {
  const [books,    setBooks]    = useState<any[]>([]);
  const [category, setCategory] = useState('ทั้งหมด');
  const [page,     setPage]     = useState(1);

  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {
  setLoading(true);
  setBooks(getInventory());
  setLoading(false);
}, []);

  const generalBooks = books.filter(b => {
    const cat = (b.category || '').toLowerCase();
    return cat.includes('general') || !['cartoon','การ์ตูน','มังงะ','fiction','นิยาย'].some(k => cat.includes(k));
  });
  const filtered = category === 'ทั้งหมด'
    ? generalBooks
    : generalBooks.filter(b => (b.category || '').split(',').map((s: string) => s.trim()).includes(category));

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <main className="max-w-[1200px] mx-auto px-4 md:px-10 py-6">
      <div className="mb-8 flex justify-between items-end border-b border-gray-100 dark:border-white/5 pb-6">
        <div><h1 className="text-3xl font-bold mb-2">หนังสือทั่วไป</h1><p className="text-gray-500">ความรู้และแรงบันดาลใจเพื่อการพัฒนาตนเอง</p></div>
        <div className="bg-primary/5 px-4 py-2 rounded-2xl text-primary text-sm font-bold">{filtered.length} รายการ</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-[#e7f3ec] dark:border-[#1a3324] shadow-sm">
            <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full" />หมวดหมู่ย่อย
            </h3>
            <div className="flex flex-col gap-2">
              {SUB_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`text-left px-5 py-3 rounded-2xl text-sm transition-all duration-300 ${category === cat ? 'bg-primary text-white font-bold shadow-xl shadow-primary/20 scale-[1.02]' : 'hover:bg-primary/10 text-gray-600 dark:text-gray-400'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="p-6 bg-accent/10 rounded-3xl border border-accent/20">
            <p className="text-xs font-bold text-primary mb-1">Read More</p>
            <p className="text-sm font-bold text-[#0d1b13] dark:text-white">ยิ่งอ่านยิ่งได้ กับ RentBook</p>
            <p className="text-xs text-gray-500">เมื่อเช่าหนังสือกับเรา</p>
          </div>
        </aside>

        <section className="lg:col-span-3">
          {loading
          ? <BookGridSkeleton count={8} />
          : paged.length > 0
        ? <>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {paged.map(book => <BookCard key={book.id} {...book} />)}
        </div>
        <Pagination currentPage={page} totalPages={totalPages} onChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
      </>
    : (
      <div className="text-center py-24 bg-gray-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-gray-200 dark:border-[#1a3324]">
        <span className="material-symbols-outlined text-5xl text-gray-300 mb-4 block">auto_stories</span>
        <p className="text-gray-400">ไม่พบการ์ตูนในหมวด {category}</p>
      </div>
    )
}
        </section>
      </div>
    </main>
  );
};

export default GeneralBooks;
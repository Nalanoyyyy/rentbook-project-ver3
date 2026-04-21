import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BookCard from '../components/BookCard';
import Pagination from '../components/Pagination';
import { getInventory } from '../services/inventoryService';

const PER_PAGE = 12;

const SORT_OPTIONS = [
  { value: 'relevant', label: 'ความเกี่ยวข้อง' },
  { value: 'price_asc',  label: 'ราคา: ต่ำ → สูง' },
  { value: 'price_desc', label: 'ราคา: สูง → ต่ำ' },
  { value: 'title_asc',  label: 'ชื่อ A → Z'      },
];

const SearchResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query    = new URLSearchParams(location.search).get('search')?.trim() || '';

  const [books,      setBooks]      = useState<any[]>([]);
  const [sort,       setSort]       = useState('relevant');
  const [filterAvail,setFilterAvail]= useState(false);
  const [page,       setPage]       = useState(1);

  const load = useCallback(() => setBooks(getInventory()), []);

  useEffect(() => {
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, [load]);

  // reset เมื่อ query หรือ filter เปลี่ยน
  useEffect(() => setPage(1), [query, sort, filterAvail]);

  // ── Filter + sort ─────────────────────────────────────────────────────────

  const q = query.toLowerCase();
  let results = books.filter(b =>
    (b.title   || '').toLowerCase().includes(q) ||
    (b.author  || '').toLowerCase().includes(q) ||
    (b.category|| '').toLowerCase().includes(q)
  );

  if (filterAvail) results = results.filter(b => b.isAvailable && b.stock > 0);

  results = [...results].sort((a, b) => {
    if (sort === 'price_asc')  return a.price - b.price;
    if (sort === 'price_desc') return b.price - a.price;
    if (sort === 'title_asc')  return (a.title || '').localeCompare(b.title || '');
    return 0; // relevant — ลำดับเดิมจาก inventory
  });

  const totalPages = Math.ceil(results.length / PER_PAGE);
  const paged      = results.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const changePage = (p: number) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  if (!query) { navigate('/'); return null; }

  return (
    <main className="max-w-6xl mx-auto px-4 py-12 min-h-[85vh]">

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-gray-400 mb-1">ผลการค้นหา</p>
        <h1 className="text-3xl font-black">"{query}"</h1>
        <p className="text-gray-500 mt-1 text-sm">
          {results.length > 0 ? `พบ ${results.length} รายการ` : 'ไม่พบหนังสือที่ตรงกัน'}
        </p>
      </div>

      {results.length === 0 ? (
        /* Empty state */
        <div className="text-center py-24 bg-gray-50 dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-white/10">
          <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 block">search_off</span>
          <p className="text-gray-500 font-bold text-lg mb-2">ไม่พบหนังสือที่ตรงกับ "{query}"</p>
          <p className="text-gray-400 text-sm mb-6">ลองค้นหาด้วยคำอื่น หรือดูหนังสือทั้งหมดของเรา</p>
          <button onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            ดูหนังสือทั้งหมด
          </button>
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* Available filter */}
            <button onClick={() => setFilterAvail(p => !p)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                filterAvail
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                  : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-primary/50'
              }`}>
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              พร้อมให้เช่าเท่านั้น
            </button>

            {/* Sort */}
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="ml-auto px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <p className="text-xs text-gray-400 whitespace-nowrap">
              หน้า {page} / {totalPages}
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paged.map(book => <BookCard key={book.id} {...book} />)}
          </div>

          <Pagination currentPage={page} totalPages={totalPages} onChange={changePage} />
        </>
      )}

    </main>
  );
};

export default SearchResults;
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard';
import { getInventory } from '../services/inventoryService';

const WishlistPage: React.FC = () => {
  const [books,    setBooks]    = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const load = useCallback(() => {
    try {
      const ids = JSON.parse(localStorage.getItem('wishlist') || '[]') as string[];
      setWishlist(ids);
      const all = getInventory() as any[];
      setBooks(all.filter(b => ids.includes(String(b.id))));
    } catch { setBooks([]); setWishlist([]); }
  }, []);

  useEffect(() => {
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, [load]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-12 min-h-[85vh]">
      <div className="flex items-center gap-3 mb-8">
        <span className="material-symbols-outlined text-4xl text-red-500">favorite</span>
        <div>
          <h1 className="text-3xl font-black">รายการโปรดของฉัน</h1>
          <p className="text-gray-400 text-sm">{wishlist.length} รายการ</p>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-24 bg-gray-50 dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-white/10">
          <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 block">favorite_border</span>
          <p className="text-gray-500 font-bold text-lg mb-2">ยังไม่มีหนังสือในรายการโปรด</p>
          <p className="text-gray-400 text-sm mb-6">กดไอคอนหัวใจบนหนังสือที่ชอบเพื่อเพิ่มได้เลย</p>
          <Link to="/" className="inline-block px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            ไปเลือกหนังสือ
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {books.map(book => <BookCard key={book.id} {...book} />)}
        </div>
      )}
    </main>
  );
};

export default WishlistPage;
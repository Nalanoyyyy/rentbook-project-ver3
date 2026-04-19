import React, { useState } from 'react';
import BookCard from '../components/BookCard';
import { allBooks } from '../data/allBooks';

const GeneralBooks: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');

  // 1. กรองเฉพาะหนังสือที่อยู่ในหมวด 'ทั่วไป'
  const baseBooks = allBooks.filter(book => book.category.includes('general'));
  
  const filteredBooks = selectedCategory === 'ทั้งหมด' 
    ? baseBooks 
    : baseBooks.filter(book => book.category.includes(selectedCategory));

  return (
    <main className="max-w-[1200px] mx-auto px-4 md:px-10 py-6">
      {/* Header Section */}
      <div className="mb-8 flex justify-between items-end border-b border-gray-100 dark:border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">หนังสือทั่วไป</h1>
          <p className="text-gray-500">ความรู้และแรงบันดาลใจเพื่อการพัฒนาตนเอง</p>
        </div>
        <div className="bg-primary/5 px-4 py-2 rounded-2xl text-primary text-sm font-bold">
          {filteredBooks.length} รายการ
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filter */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-[#e7f3ec] dark:border-[#1a3324] shadow-sm">
            <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>หมวดหมู่ย่อย
            </h3>
            <div className="flex flex-col gap-2">
              {['ทั้งหมด', 'จิตวิทยา', 'ธุรกิจ', 'อาหาร', 'ภาษา', 'ประวัติศาสตร์'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-left px-5 py-3 rounded-2xl text-sm transition-all duration-300 ${
                    selectedCategory === cat 
                    ? 'bg-primary text-white font-bold shadow-xl shadow-primary/20 scale-[1.02]' 
                    : 'hover:bg-primary/10 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Banner เสริมเพื่อความสวยงาม */}
          <div className="p-6 bg-accent/10 rounded-3xl border border-accent/20">
            <p className="text-xs font-bold text-primary mb-1">Read More</p>
            <p className="text-sm font-bold text-[#0d1b13]">ยิ่งอ่านยิ่งได้ กับ RentBook</p>
            <p className="text-xs text-gray-500">เมื่อเช่าหนังสือกับเรา</p>
          </div>
        </aside>

        {/* Book Grid */}
        <section className="lg:col-span-3">
          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map(book => (
                <BookCard key={book.id} {...book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-gray-50 dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-[#1a3324]">
               <span className="material-symbols-outlined text-6xl text-gray-200 mb-4">import_contacts</span>
               <p className="text-gray-400 font-medium">ไม่มีหนังสือในหมวด {selectedCategory} ในขณะนี้</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default GeneralBooks;
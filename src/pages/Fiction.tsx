import React, { useState } from 'react';
import BookCard from '../components/BookCard';
import { allBooks } from '../data/allBooks'; // ดึงข้อมูลจากไฟล์กลางที่เราทำไว้

const Fiction: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');

  // กรองข้อมูลเฉพาะหนังสือที่อยู่ในหมวด 'นิยาย' 
  // และกรองตามแนว (Sub-category) ที่เลือก
  const fictionBooks = allBooks.filter(book => book.category.includes('fiction'));
  
  const filteredBooks = selectedCategory === 'ทั้งหมด' 
    ? fictionBooks 
    : fictionBooks.filter(book => book.category.includes(selectedCategory));

  return (
    <main className="max-w-[1200px] mx-auto px-4 md:px-10 py-6">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">หนังสือนิยาย</h1>
          <p className="text-gray-500">รวมนิยายขายดีและวรรณกรรมน่าอ่าน</p>
        </div>
        <div className="text-sm text-gray-400">
          พบหนังสือ {filteredBooks.length} เล่ม
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filter */}
        <aside className="lg:col-span-1 space-y-8">
          <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-[#e7f3ec] dark:border-[#1a3324]">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>แนวหนังสือ
            </h3>
            <div className="flex flex-col gap-2">
              {['ทั้งหมด', 'สืบสวน', 'โรแมนติก', 'แฟนตาซี', 'ดราม่า', 'วรรณกรรมเยาวชน', 'ไซไฟ'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-left px-4 py-2.5 rounded-xl text-sm transition-all ${
                    selectedCategory === cat 
                    ? 'bg-primary text-white font-bold shadow-lg shadow-primary/20' 
                    : 'hover:bg-primary/10 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* ตกแต่งเพิ่ม: Banner เล็กๆ ใน Sidebar */}
          <div className="p-6 bg-accent/10 rounded-3xl border border-accent/20">
            <p className="text-xs font-bold text-primary mb-1">PROMOTION</p>
            <p className="text-sm font-bold text-[#0d1b13]">เช่า 3 เล่มขึ้นไป</p>
            <p className="text-xs text-gray-500">ส่งฟรีทุกรายการ!</p>
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
            <div className="text-center py-24 bg-gray-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-gray-200 dark:border-[#1a3324]">
               <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">menu_book</span>
               <p className="text-gray-400">ไม่พบนิยายในหมวด {selectedCategory}</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Fiction;
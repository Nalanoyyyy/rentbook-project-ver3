import React from 'react';
import { useLocation } from 'react-router-dom'; // แก้ไขจุดที่ 1: เพิ่มการ Import
import BookCard from '../components/BookCard';
import { allBooks } from '../data/allBooks'; 

// แก้ไขจุดที่ 2: ลบ interface Book ออกจากหน้านี้ 
// เพราะมันถูกดึงมาจากไฟล์ allBooks แล้ว (ถ้าคุณ export ไว้)

const Home: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('search')?.toLowerCase() || '';

  // 2. กรองตามคำค้นหา (ถ้ามี)
  const searchedBooks = allBooks.filter(book => 
    book.title.toLowerCase().includes(query) || 
    book.author.toLowerCase().includes(query) ||
    book.category.toLowerCase().includes(query) // แถม: ให้ค้นจากหมวดหมู่ได้ด้วย
  );

  // 3. แยกหมวดหมู่จากรายการที่กรองแล้ว
  const cartoonBooks = searchedBooks.filter(b => b.category.toLowerCase().includes('cartoon'));
  const fictionBooks = searchedBooks.filter(b => b.category.toLowerCase().includes('fiction'));
  const generalBooks = searchedBooks.filter(b => b.category.toLowerCase().includes('general'));

  const hasResults = searchedBooks.length > 0;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <main className="max-w-[1400px] mx-auto pb-20">
        
        {/* --- Hero Section (ปรับปรุงให้รูปพื้นหลังกลับมา) --- */}
        {!query && (
        <section className="p-4 md:p-10">
        <div 
          className="relative overflow-hidden rounded-[3rem] min-h-[400px] flex flex-col justify-end p-8 md:p-12 text-white bg-cover bg-center"
          // เปลี่ยนจาก 'linear-gradient(rgba(0,0,0,0.3)...' เป็นสีที่เข้ากับเว็บและรูปหนังสือเดิม
          style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.5)), url("https://picsum.photos/id/24/1200/600")' }}
        >
        <div className="max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter text-white">
          ยินดีต้อนรับสู่ RentBook
        </h1>
        <p className="text-lg opacity-80 mb-6 text-white">
          เช่าหนังสือออนไลน์ ง่ายๆ แค่ปลายนิ้ว รักษ์โลก และประหยัดกว่า
        </p>
      </div>
      </div>
      </section>
)}

        {/* ส่วนแสดงผลการค้นหา */}
        {query && (
          <div className="px-4 md:px-10 py-10">
            <h1 className="text-3xl font-black">ผลการค้นหาสำหรับ "{query}"</h1>
            {!hasResults && (
              <div className="mt-10 text-center py-20 opacity-30">
                <span className="material-symbols-outlined text-6xl">search_off</span>
                <p className="mt-2">ไม่พบหนังสือที่คุณกำลังตามหา</p>
              </div>
            )}
          </div>
        )}

        {/* หมวดการ์ตูน */}
        {cartoonBooks.length > 0 && (
          <section className="px-4 md:px-10 py-10">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">auto_stories</span>
              การ์ตูนยอดฮิต
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {cartoonBooks.map(book => <BookCard key={book.id} {...book} />)}
            </div>
          </section>
        )}

        {/* หมวดนิยาย */}
        {fictionBooks.length > 0 && (
          <section className="px-4 md:px-10 py-10">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">menu_book</span>
              นิยายแนะนำ
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {fictionBooks.map(book => <BookCard key={book.id} {...book} />)}
            </div>
          </section>
        )}

        {/* หมวดหนังสือทั่วไป */}
        {generalBooks.length > 0 && (
          <section className="px-4 md:px-10 py-10">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">import_contacts</span>
              หนังสือทั่วไป
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {generalBooks.map(book => <BookCard key={book.id} {...book} />)}
            </div>
          </section>
        )}

      </main>
    </div>
  );
};

export default Home;
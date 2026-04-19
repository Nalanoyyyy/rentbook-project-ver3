import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { allBooks } from '../data/allBooks'; 

const BookDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. ค้นหาหนังสือจาก ID ที่ส่งมาใน URL
  const book = allBooks.find(b => b.id === Number(id));

  // 2. ฟังก์ชันเพิ่มลงตะกร้า
  const handleAddToCart = () => {
    if (!book || !book.isAvailable) return;

    // ดึงตะกร้าปัจจุบันจาก localStorage
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // เช็คว่ามีหนังสือเล่มนี้ในตะกร้าหรือยัง
    const isExist = currentCart.find((item: any) => item.id === book.id);

    if (!isExist) {
      // เพิ่มเล่มใหม่ (กำหนดวันเช่าเริ่มต้น 7 วัน)
      const newCart = [...currentCart, { ...book, rentDays: 7 }];
      localStorage.setItem('cart', JSON.stringify(newCart));
      
      // แจ้ง Navbar ให้เลข Badge อัปเดต (window event)
      window.dispatchEvent(new Event("storage"));
      
      alert(`เพิ่ม ${book.title} ลงในตะกร้าเรียบร้อยแล้ว!`);
    } else {
      alert("หนังสือเล่มนี้อยู่ในตะกร้าของคุณแล้ว");
    }
  };

  

  if (!book) {
    return (
      <div className="text-center py-40">
        <span className="material-symbols-outlined text-6xl text-gray-200">search_off</span>
        <h2 className="text-2xl font-bold mt-4 mb-4">ไม่พบข้อมูลหนังสือ</h2>
        <button onClick={() => navigate('/')} className="text-primary font-bold hover:underline">กลับหน้าแรก</button>
      </div>
    );
  }

  return (
    <main className="max-w-[1000px] mx-auto px-4 py-12 mt-10">
      {/* ปุ่มย้อนกลับ */}
      <button 
        onClick={() => navigate(-1)} 
        className="mb-8 flex items-center gap-2 text-primary hover:underline font-bold"
      >
        <span className="material-symbols-outlined">arrow_back</span> กลับ
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* ฝั่งซ้าย: รูปภาพหนังสือ */}
        <div className="rounded-[2.5rem] overflow-hidden shadow-2xl bg-white dark:bg-white/5 p-4 border border-gray-100 dark:border-white/5">
          <img 
            src={book.image} 
            alt={book.title} 
            className="w-full h-auto object-cover rounded-[1.5rem]" 
          />
        </div>

        {/* ฝั่งขวา: รายละเอียดและการกดเช่า */}
        <div className="flex flex-col">
          <div className="mb-6">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4 uppercase tracking-wider">
              {book.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">{book.title}</h1>
            <p className="text-xl text-gray-400">ผู้เขียน: <span className="text-gray-800 dark:text-white font-bold">{book.author}</span></p>
          </div>
          
          <div className="bg-white dark:bg-[#1a3324]/30 border border-[#e7f3ec] dark:border-[#1a3324] p-8 rounded-[2.5rem] mb-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-500 font-bold">ราคาเช่าต่อสัปดาห์</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-primary">฿{book.price}</span>
              </div>
            </div>

            {/* สถานะความพร้อม */}
            <div className="flex items-center gap-3 mb-8 p-4 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-white/5">
              <span className={`w-3 h-3 rounded-full ${book.isAvailable ? 'bg-accent animate-pulse' : 'bg-red-500'}`}></span>
              <span className="text-sm font-bold">
                {book.isAvailable ? 'พร้อมให้เช่าในขณะนี้' : 'ถูกเช่าอยู่ (ไม่พร้อมบริการ)'}
              </span>
            </div>
            
            {/* ปุ่มเพิ่มลงตะกร้า (อัปเดตใหม่) */}
            <button 
              onClick={handleAddToCart}
              disabled={!book.isAvailable}
              className={`w-full py-5 rounded-[1.5rem] font-bold text-xl transition-all flex items-center justify-center gap-3 shadow-xl ${
                book.isAvailable 
                ? 'bg-accent text-[#0d1b13] hover:scale-[1.03] hover:shadow-accent/30 active:scale-95' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
              }`}
            >
              <span className="material-symbols-outlined text-2xl font-bold">shopping_basket</span>
              {book.isAvailable ? 'เพิ่มลงในตะกร้า' : 'หนังสือไม่พร้อมเช่า'}
            </button>
          </div>

          {/* เรื่องย่อ */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>
              เรื่องย่อโดยสังเขป
            </h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-lg">
              ขออภัย ขณะนี้ข้อมูลเนื้อหาโดยสังเขปของหนังสือเล่มนี้กำลังอยู่ในระหว่างการอัปเดต 
              คุณสามารถกดเช่าเพื่อติดตามเนื้อหาที่น่าสนใจด้านในได้ทันที
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BookDetail;
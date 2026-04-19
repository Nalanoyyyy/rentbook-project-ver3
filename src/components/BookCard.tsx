import React from 'react';
import { useNavigate } from 'react-router-dom';
import { type Book } from '../data/allBooks';

const BookCard: React.FC<Book> = (book) => {
  const { id, title, author, image, price, isAvailable } = book;
  const navigate = useNavigate();

  // --- ฟังก์ชันเพิ่มลงตะกร้า (แก้ไขให้เหลืออันเดียวและใช้ rentweeks) ---
  const addToCart = (e: React.MouseEvent) => {
    // ป้องกันไม่ให้การคลิกปุ่มไปโดน onClick ของการ์ด
    e.stopPropagation(); 

    if (!isAvailable) return;

    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const isExist = currentCart.find((item: any) => item.id === id);

    if (!isExist) {
      // ใช้ rentweeks: 1 เพื่อให้ตรงกับหน้า Cart.tsx ที่เราทำไปล่าสุด
      const newCart = [...currentCart, { ...book, rentweeks: 1 }]; 
      localStorage.setItem('cart', JSON.stringify(newCart));
      
      // แจ้ง Navbar ให้เลข Badge อัปเดต
      window.dispatchEvent(new Event("storage")); 
      alert(`เพิ่ม ${title} ลงในตะกร้าแล้ว!`);
    } else {
      alert('หนังสือเล่มนี้อยู่ในตะกร้าของคุณแล้ว');
    }
  };

  return (
    <div 
      onClick={() => navigate(`/book/${id}`)} 
      className="group bg-white dark:bg-[#1a3324] rounded-2xl overflow-hidden border border-[#e7f3ec] dark:border-[#2a4d36] shadow-sm hover:shadow-md transition-all flex flex-col h-full relative cursor-pointer"
    >
      {/* ส่วนรูปภาพ */}
      <div className="aspect-[3/4] overflow-hidden relative">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
        />
        
        <div className={`absolute top-2 right-2 px-2 py-1 text-[10px] font-bold rounded shadow-sm ${isAvailable ? 'bg-accent text-[#0d1b13]' : 'bg-red-500 text-white'}`}>
          {isAvailable ? 'พร้อมเช่า' : 'ถูกเช่าอยู่'}
        </div>
      </div>

      {/* รายละเอียด */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-sm mb-1 truncate">{title}</h3>
        <p className="text-xs text-gray-500 mb-2">{author}</p>
        
        <div className="mt-auto">
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-primary font-bold">฿{price}</span>
            <span className="text-[10px] text-gray-400">/ สัปดาห์</span>
          </div>
          
          <button 
            disabled={!isAvailable}
            onClick={addToCart} 
            className={`w-full font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 ${
              isAvailable 
              ? 'bg-accent hover:bg-accent/90 text-[#0d1b13]' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-sm">shopping_cart</span>
            {isAvailable ? 'เพิ่มลงตะกร้า' : 'ไม่พร้อมเช่า'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
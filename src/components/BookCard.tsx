import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Book } from '../data/allBooks';
import WishlistButton from './WishlistButton';

const ss     = sessionStorage;
const isAuth = () => ss.getItem('isLoggedIn') === 'true' || ss.getItem('isAuthenticated') === 'true';

const BookCard: React.FC<Book> = (book) => {
  const { id, title, author, image, price, isAvailable, status } = book;
  const navigate = useNavigate();
  const [toast,    setToast]    = useState('');
  const [imgError, setImgError] = useState(false);

  const isAvail = !(status === 'rented' || status === 'ไม่ว่าง' || status === 'ถูกเช่าอยู่' || isAvailable === false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const addToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAvail) return;
    if (!isAuth()) { navigate('/login'); return; }
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.find((i: any) => String(i.id) === String(id))) { showToast('หนังสือเล่มนี้อยู่ในตะกร้าแล้ว'); return; }
    localStorage.setItem('cart', JSON.stringify([...cart, { ...book, rentweeks: 1 }]));
    window.dispatchEvent(new Event('storage'));
    showToast(`เพิ่ม "${title}" ลงตะกร้าแล้ว`);
  };

  return (
    <div onClick={() => navigate(`/book/${id}`)}
      className="group bg-white dark:bg-[#1a3324] rounded-2xl overflow-hidden border border-[#e7f3ec] dark:border-[#2a4d36] shadow-sm hover:shadow-md transition-all flex flex-col h-full relative cursor-pointer">

      {toast && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl whitespace-nowrap shadow-lg animate-in fade-in duration-200">
          {toast}
        </div>
      )}

      <div className="aspect-[3/4] overflow-hidden relative bg-gray-100 dark:bg-white/5">
        {image && !imgError
          ? <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" onError={() => setImgError(true)} />
          : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-4xl text-gray-300">image</span></div>}

        {/* Status badge */}
        <div className={`absolute top-2 right-2 px-2 py-1 text-[10px] font-bold rounded shadow-sm ${isAvail ? 'bg-accent text-[#0d1b13]' : 'bg-red-500 text-white'}`}>
          {isAvail ? 'พร้อมเช่า' : 'ไม่ว่าง'}
        </div>

        {/* Wishlist button */}
        <WishlistButton bookId={id} className="absolute top-2 left-2" />
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-sm mb-1 truncate">{title}</h3>
        <p className="text-xs text-gray-500 mb-2 truncate">{author}</p>
        <div className="mt-auto">
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-primary font-bold">฿{price.toLocaleString()}</span>
            <span className="text-[10px] text-gray-400">/ สัปดาห์</span>
          </div>
          <button disabled={!isAvail} onClick={addToCart}
            className={`w-full font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 ${isAvail ? 'bg-accent hover:bg-accent/90 text-[#0d1b13]' : 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-200 dark:border-white/5'}`}>
            <span className="material-symbols-outlined text-sm">shopping_cart</span>
            {isAvail ? 'เพิ่มลงตะกร้า' : 'ไม่พร้อมเช่า'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
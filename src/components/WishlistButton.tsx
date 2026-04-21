import React, { useState, useEffect, useCallback } from 'react';
import { apiGetWishlist, apiAddWishlist, apiRemoveWishlist } from '../services/api';

const ss = sessionStorage;
const isAuth = () => ss.getItem('isLoggedIn') === 'true' || ss.getItem('isAuthenticated') === 'true';

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState<string[]>([]);

  const load = useCallback(async () => {
    if (!isAuth()) return;
    try {
      const data = await apiGetWishlist();
      setWishlist(data.map((b: any) => String(b.id)));
    } catch { setWishlist([]); }
  }, []);

  useEffect(() => {
    load();
    window.addEventListener('wishlistChange', load);
    return () => window.removeEventListener('wishlistChange', load);
  }, [load]);

  const toggle = useCallback(async (id: string | number) => {
    if (!isAuth()) return false;
    const sid = String(id);
    const isIn = wishlist.includes(sid);
    try {
      if (isIn) await apiRemoveWishlist(id);
      else await apiAddWishlist(id);
      await load();
      window.dispatchEvent(new Event('wishlistChange'));
      return !isIn;
    } catch { return false; }
  }, [wishlist, load]);

  const isWished = useCallback((id: string | number) => wishlist.includes(String(id)), [wishlist]);

  return { wishlist, toggle, isWished };
};

type Props = { bookId: string | number; className?: string };

const WishlistButton: React.FC<Props> = ({ bookId, className = '' }) => {
  const { isWished, toggle } = useWishlist();
  const wished = isWished(bookId);
  const [pop, setPop] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle(bookId);
    setPop(true);
    setTimeout(() => setPop(false), 300);
  };

  return (
    <button onClick={handleClick} aria-label={wished ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
      className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${pop ? 'scale-125' : 'scale-100'} ${wished ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-white/80 dark:bg-black/30 text-gray-400 hover:text-red-400 backdrop-blur-sm'} ${className}`}>
      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: wished ? "'FILL' 1" : "'FILL' 0" }}>
        favorite
      </span>
    </button>
  );
};

export default WishlistButton;
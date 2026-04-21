import React, { useState, useEffect, useCallback } from 'react';

// ── useWishlist hook ──────────────────────────────────────────────────────────

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState<string[]>([]);

  const load = useCallback(() => {
    try { setWishlist(JSON.parse(localStorage.getItem('wishlist') || '[]')); }
    catch { setWishlist([]); }
  }, []);

  useEffect(() => {
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, [load]);

  const toggle = useCallback((id: string | number) => {
    const sid  = String(id);
    const list = JSON.parse(localStorage.getItem('wishlist') || '[]') as string[];
    const next = list.includes(sid) ? list.filter(i => i !== sid) : [sid, ...list];
    localStorage.setItem('wishlist', JSON.stringify(next));
    setWishlist(next);
    window.dispatchEvent(new Event('storage'));
    return !list.includes(sid); // true = added
  }, []);

  const isWished = useCallback((id: string | number) => wishlist.includes(String(id)), [wishlist]);

  return { wishlist, toggle, isWished };
};

// ── WishlistButton ────────────────────────────────────────────────────────────

type Props = { bookId: string | number; className?: string };

const WishlistButton: React.FC<Props> = ({ bookId, className = '' }) => {
  const { isWished, toggle } = useWishlist();
  const wished = isWished(bookId);
  const [pop,  setPop]  = useState(false);

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
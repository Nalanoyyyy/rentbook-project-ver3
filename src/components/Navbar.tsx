import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { allBooks, type Book } from '../data/allBooks';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  
  // --- 1. States ---
  const [isMenuOpen, setIsMenuOpen] = useState(false); // สำหรับ Dropdown โปรไฟล์
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false); // สำหรับเมนูมือถือ (Hamburger)
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Book[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // --- 2. User Context ---
  const userNickname = localStorage.getItem('userNickname') || localStorage.getItem('userName') || 'สมาชิก';
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  // --- 3. Handlers & Logic ---
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'text-primary dark:text-accent font-bold border-b-2 border-primary dark:border-accent pb-1'
        : 'hover:text-primary dark:hover:text-accent text-gray-600 dark:text-gray-300'
    }`;

  const handleLogout = () => {
    localStorage.clear();
    setIsMenuOpen(false);
    navigate('/');
    window.location.reload();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${searchQuery}`);
      setShowSuggestions(false);
      setIsMobileNavOpen(false); // ปิดเมนูมือถือเมื่อค้นหา
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim().length > 0) {
      const filtered = allBooks.filter((book) =>
        book.title.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.length);
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    return () => window.removeEventListener('storage', updateCartCount);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-[#e7f3ec] dark:border-[#1a3324] px-4 md:px-10 py-3">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">

        {/* --- ฝั่งซ้าย: Hamburger & Logo --- */}
        <div className="flex items-center gap-4">
          {/* ปุ่ม Hamburger (แสดงเฉพาะมือถือ) */}
          <button 
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="xl:hidden flex items-center justify-center p-2 text-primary active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-3xl font-bold">
              {isMobileNavOpen ? 'close' : 'menu'}
            </span>
          </button>

          <Link to="/" className="flex items-center gap-2 text-primary dark:text-accent group">
            <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform font-bold">auto_stories</span>
            <h2 className="text-xl font-bold dark:text-white block">RentBook</h2>
          </Link>

          {/* Desktop Nav (ซ่อนบนมือถือ) */}
          <nav className="hidden xl:flex items-center gap-8 ml-4">
            <NavLink to="/" className={navLinkClass}>หน้าแรก</NavLink>
            <NavLink to="/cartoon" className={navLinkClass}>การ์ตูน</NavLink>
            <NavLink to="/fiction" className={navLinkClass}>นิยาย</NavLink>
            <NavLink to="/general-books" className={navLinkClass}>หนังสือทั่วไป</NavLink>
            <NavLink to="/how-to-rent" className={navLinkClass}>วิธีการเช่า</NavLink>
          </nav>
        </div>

        {/* --- ฝั่งขวา: Search, Profile & Cart --- */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Search Box (Desktop Only) */}
          <div className="relative hidden lg:block">
            <form onSubmit={handleSearch} className="flex items-center bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-xl border border-transparent focus-within:border-primary/30 transition-all">
              <span className="material-symbols-outlined text-gray-400 text-xl">search</span>
              <input
                type="text"
                placeholder="ค้นหา..."
                value={searchQuery}
                onChange={handleInputChange}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="bg-transparent border-none outline-none px-2 text-sm w-32 xl:w-48 focus:w-64 transition-all"
              />
            </form>
            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-12 left-0 right-0 bg-white dark:bg-[#1a3324] border border-[#e7f3ec] dark:border-[#1a3324] rounded-2xl shadow-2xl overflow-hidden z-[60]">
                {suggestions.map((book) => (
                  <button key={book.id} onClick={() => { setSearchQuery(book.title); navigate(`/?search=${book.title}`); setShowSuggestions(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 text-left border-b last:border-none border-gray-50 dark:border-white/5">
                    <img src={book.image} alt="" className="w-8 h-10 object-cover rounded shadow-sm" />
                    <span className="text-xs font-bold truncate">{book.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Profile Section */}
          <div className="relative">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold hidden md:block text-primary">คุณ {userNickname}</span>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white border-2 border-white dark:border-[#1a3324] shadow-md hover:scale-105 transition-transform"
                >
                  <span className="material-symbols-outlined">person</span>
                </button>

                {/* Dropdown โปรไฟล์ พร้อมไอคอนหน้าที่แก้ไขแล้ว */}
                {isMenuOpen && (
                  <div className="absolute right-0 top-12 w-56 bg-white dark:bg-[#102218] rounded-2xl border border-[#e7f3ec] dark:border-[#1a3324] shadow-2xl py-2 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-primary/10 transition-colors text-sm font-bold text-gray-700 dark:text-gray-200">
                      <span className="material-symbols-outlined text-[20px]">edit</span> แก้ไขบัญชี
                    </Link>
                    <Link to="/rental-history" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-primary/10 transition-colors text-sm font-bold text-gray-700 dark:text-gray-200">
                      <span className="material-symbols-outlined text-[20px]">history</span> ประวัติการเช่า
                    </Link>
                    <Link to="/coupons" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between px-4 py-3 hover:bg-primary/10 transition-colors border-t border-gray-50 dark:border-white/5 text-sm font-bold text-gray-700 dark:text-gray-200">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[20px]">confirmation_number</span> คูปองของฉัน
                      </div>
                      <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">2</span>
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border-t border-gray-50 dark:border-white/5 text-left text-sm font-bold">
                      <span className="material-symbols-outlined text-[20px]">logout</span> ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center justify-center h-10 w-10 md:w-auto md:px-6 rounded-full bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                <span className="material-symbols-outlined md:hidden">login</span>
                <span className="hidden md:inline">เข้าสู่ระบบ</span>
              </Link>
            )}
          </div>

          {/* Cart Button */}
          <Link to="/cart" className="relative h-10 w-10 flex items-center justify-center rounded-full bg-[#e7f3ec] dark:bg-[#1a3324] text-primary hover:scale-105 transition-all">
            <span className="material-symbols-outlined">shopping_basket</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white dark:border-[#0f1712]">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* --- ส่วน Mobile Menu Drawer (แสดงเมื่อกด Hamburger) --- */}
      {isMobileNavOpen && (
        <div className="xl:hidden absolute top-full left-0 w-full bg-white dark:bg-[#0f1712] border-b border-gray-100 dark:border-white/10 shadow-2xl py-6 px-4 flex flex-col gap-2 z-40 animate-in slide-in-from-top duration-300">
          <NavLink to="/" onClick={() => setIsMobileNavOpen(false)} className="text-lg font-bold p-3 hover:bg-primary/5 rounded-xl transition-colors">หน้าแรก</NavLink>
          <NavLink to="/cartoon" onClick={() => setIsMobileNavOpen(false)} className="text-lg font-bold p-3 hover:bg-primary/5 rounded-xl transition-colors">การ์ตูน</NavLink>
          <NavLink to="/fiction" onClick={() => setIsMobileNavOpen(false)} className="text-lg font-bold p-3 hover:bg-primary/5 rounded-xl transition-colors">นิยาย</NavLink>
          <NavLink to="/general-books" onClick={() => setIsMobileNavOpen(false)} className="text-lg font-bold p-3 hover:bg-primary/5 rounded-xl transition-colors">หนังสือทั่วไป</NavLink>
          <NavLink to="/how-to-rent" onClick={() => setIsMobileNavOpen(false)} className="text-lg font-bold p-3 hover:bg-primary/5 rounded-xl transition-colors">วิธีการเช่า</NavLink>
          <hr className="my-2 opacity-50" />
          {/* ช่องค้นหาสำหรับมือถือ */}
          <div className="lg:hidden p-2">
            <form onSubmit={handleSearch} className="flex items-center bg-gray-100 dark:bg-white/5 px-4 py-3 rounded-xl">
              <span className="material-symbols-outlined text-gray-400 mr-2">search</span>
              <input 
                type="text" 
                placeholder="ค้นหาหนังสือ..." 
                value={searchQuery} 
                onChange={handleInputChange} 
                className="bg-transparent outline-none w-full font-medium" 
              />
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
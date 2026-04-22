import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { isAdmin } from '../services/authService';
import { apiGetBooks } from '../services/api';

const SESSION_KEYS = ['isLoggedIn','isAuthenticated','userRole','userEmail','userName','userNickname','userPhone','userAddress'];
const ss      = sessionStorage;
const sGet    = (k: string) => ss.getItem(k) || '';
const isAuth  = () => sGet('isLoggedIn') === 'true' || sGet('isAuthenticated') === 'true';
const getNick = () => sGet('userNickname') || sGet('userName') || 'สมาชิก';
const getCouponCount = () => 0;

const NAV = [['/', 'หน้าแรก'], ['/cartoon', 'การ์ตูน'], ['/fiction', 'นิยาย'], ['/general-books', 'หนังสือทั่วไป'], ['/how-to-rent', 'วิธีการเช่า']];
const MENU_ITEMS = isAdmin() ? [] : [
  { to: '/profile',        icon: 'edit',                label: 'แก้ไขบัญชี'     },
  { to: '/rental-history', icon: 'history',             label: 'ประวัติการเช่า' },
  { to: '/coupons',        icon: 'confirmation_number', label: 'คูปองของฉัน'    },
  { to: '/wishlist',       icon: 'favorite',            label: 'รายการโปรด'     },
];

// ย้าย SearchBox ออกมาข้างนอก Navbar
type SearchBoxProps = {
  mobile?: boolean;
  query: string;
  onQueryChange: (v: string) => void;
  onSubmit: () => void;
};

const SearchBox: React.FC<SearchBoxProps> = ({ mobile, query, onQueryChange, onSubmit }) => (
  <form onSubmit={e => { e.preventDefault(); onSubmit(); }}
    className={mobile ? 'flex items-center bg-gray-100 dark:bg-white/5 px-4 py-3 rounded-xl' : 'flex items-center bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-xl border border-transparent focus-within:border-primary/30 transition-all'}>
    <span className="material-symbols-outlined text-gray-400 text-xl mr-1">search</span>
    <input type="text" placeholder={mobile ? 'ค้นหาหนังสือ...' : 'ค้นหา...'} value={query}
      onChange={e => onQueryChange(e.target.value)}
      className={`bg-transparent border-none outline-none px-1 text-sm ${mobile ? 'w-full font-medium' : 'w-32 xl:w-48 focus:w-64 transition-all'}`} />
  </form>
);

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [query,       setQuery]       = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSug,     setShowSug]     = useState(false);
  const [cartCount,   setCartCount]   = useState(0);
  const [loggedIn,    setLoggedIn]    = useState(isAuth());
  const [admin,       setAdmin]       = useState(isAdmin());
  const [nick,        setNick]        = useState(getNick());
  const [allBooks,    setAllBooks]    = useState<any[]>([]);
  const [coupons,     setCoupons]     = useState(getCouponCount());

  const sync = useCallback(() => {
    setCartCount(JSON.parse(localStorage.getItem('cart') || '[]').length);
    setLoggedIn(isAuth()); setAdmin(isAdmin()); setNick(getNick()); setCoupons(getCouponCount());
  }, []);

  useEffect(() => {
    sync();
    apiGetBooks().then(setAllBooks).catch(() => {});
    ['storage', 'authChange'].forEach(e => window.addEventListener(e, sync));
    return () => ['storage', 'authChange'].forEach(e => window.removeEventListener(e, sync));
  }, [sync]);

  const logout = () => {
    SESSION_KEYS.forEach(k => ss.removeItem(k));
    setMenuOpen(false);
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  const doSearch = (q: string) => {
    if (!q.trim()) return;
    navigate(`/search?search=${encodeURIComponent(q.trim())}`);
    setShowSug(false); setMobileOpen(false);
  };

  const onQueryChange = (v: string) => {
    setQuery(v);
    if (v.trim()) {
      setSuggestions(allBooks.filter((b: any) => b.title?.toLowerCase().includes(v.toLowerCase())).slice(0, 5));
      setShowSug(true);
    } else {
      setSuggestions([]);
      setShowSug(false);
    }
  };

  const nlCls = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-all duration-200 ${isActive ? 'text-primary dark:text-accent font-bold border-b-2 border-primary dark:border-accent pb-1' : 'hover:text-primary dark:hover:text-accent text-gray-600 dark:text-gray-300'}`;

  return (
    <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-[#e7f3ec] dark:border-[#1a3324] px-4 md:px-10 py-3">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setMobileOpen(p => !p)} className="xl:hidden p-2 text-primary active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-3xl font-bold">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
          <Link to="/" className="flex items-center gap-2 text-primary dark:text-accent group">
            <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform font-bold">auto_stories</span>
            <h2 className="text-xl font-bold dark:text-white">RentBook</h2>
          </Link>
          <nav className="hidden xl:flex items-center gap-8 ml-4">
            {NAV.map(([to, label]) => <NavLink key={to} to={to} className={nlCls}>{label}</NavLink>)}
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative hidden lg:block">
            <SearchBox query={query} onQueryChange={onQueryChange} onSubmit={() => doSearch(query)} />
            {showSug && suggestions.length > 0 && (
              <div className="absolute top-12 left-0 right-0 bg-white dark:bg-[#1a3324] border border-[#e7f3ec] dark:border-[#1a3324] rounded-2xl shadow-2xl overflow-hidden z-[60]">
                {suggestions.map(b => (
                  <button key={b.id} onClick={() => { setQuery(b.title); doSearch(b.title); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 text-left border-b last:border-none border-gray-50 dark:border-white/5">
                    <img src={b.image} alt="" className="w-8 h-10 object-cover rounded shadow-sm" />
                    <span className="text-xs font-bold truncate">{b.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            {loggedIn ? (
              <div className="flex items-center gap-2">
                {admin && (
                  <Link to="/admin/dashboard" className="hidden md:flex items-center gap-1 text-[10px] font-black text-red-500 bg-red-50 px-3 py-1.5 rounded-full border border-red-100 mr-2">
                    <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>ADMIN
                  </Link>
                )}
                <span className="text-sm font-bold hidden md:block text-primary">คุณ {nick}</span>
                <button onClick={() => setMenuOpen(p => !p)}
                  className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white border-2 border-white dark:border-[#1a3324] shadow-md hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined">person</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-12 w-56 bg-white dark:bg-[#102218] rounded-2xl border border-[#e7f3ec] dark:border-[#1a3324] shadow-2xl py-2 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                    {admin && (
                      <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-500/10 text-sm font-bold text-red-500 border-b border-gray-50 dark:border-white/5">
                        <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>แผงควบคุม Admin
                      </Link>
                    )}
                    {!admin && MENU_ITEMS.map(({ to, icon, label }) => (
                      <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-3 hover:bg-primary/10 text-sm font-bold text-gray-700 dark:text-gray-200 border-t first:border-t-0 border-gray-50 dark:border-white/5">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[20px]">{icon}</span>{label}
                        </div>
                        {to === '/coupons' && coupons > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{coupons}</span>}
                      </Link>
                    ))}
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 border-t border-gray-50 dark:border-white/5 text-left text-sm font-bold">
                      <span className="material-symbols-outlined text-[20px]">logout</span>ออกจากระบบ
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

          <Link to={loggedIn ? '/cart' : '/login'}
            className="relative h-10 w-10 flex items-center justify-center rounded-full bg-[#e7f3ec] dark:bg-[#1a3324] text-primary hover:scale-105 transition-all">
            <span className="material-symbols-outlined">shopping_basket</span>
            {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white dark:border-[#0f1712]">{cartCount}</span>}
          </Link>
        </div>
      </div>

      {mobileOpen && (
        <div className="xl:hidden absolute top-full left-0 w-full bg-white dark:bg-[#0f1712] border-b border-gray-100 dark:border-white/10 shadow-2xl py-6 px-4 flex flex-col gap-2 z-40 animate-in slide-in-from-top duration-300">
          {NAV.map(([to, label]) => <NavLink key={to} to={to} onClick={() => setMobileOpen(false)} className="text-lg font-bold p-3 hover:bg-primary/5 rounded-xl transition-colors">{label}</NavLink>)}
          <hr className="my-2 opacity-50" />
          <SearchBox mobile query={query} onQueryChange={onQueryChange} onSubmit={() => doSearch(query)} />
        </div>
      )}
    </header>
  );
};

export default Navbar;
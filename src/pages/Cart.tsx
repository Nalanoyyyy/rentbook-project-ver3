import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ss     = sessionStorage;
const isAuth = () => ss.getItem('isLoggedIn') === 'true' || ss.getItem('isAuthenticated') === 'true';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuth()) { navigate('/login'); return; }
    const saved = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(saved.map((item: any) => ({
      ...item,
      rentweeks: item.rentweeks || (item.rentDays ? Math.ceil(item.rentDays / 7) : 1),
    })));
  }, [navigate]);

  const saveCart = useCallback((updated: any[]) => {
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  }, []);

  const updateWeeks = useCallback((id: any, newWeeks: number) => {
    if (newWeeks < 1) return;
    saveCart(cartItems.map(item => String(item.id) === String(id) ? { ...item, rentweeks: newWeeks } : item));
  }, [cartItems, saveCart]);

  const removeItem = useCallback((id: any) => {
    saveCart(cartItems.filter(item => String(item.id) !== String(id)));
  }, [cartItems, saveCart]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * (item.rentweeks || 1), 0);
  const shipping = cartItems.length > 0 ? 40 : 0;
  const total    = subtotal + shipping;

  return (
    <main className="max-w-6xl mx-auto px-4 py-20 mt-10">
      <h1 className="text-3xl font-black mb-10 flex items-center gap-3">
        <span className="material-symbols-outlined text-4xl text-primary">shopping_basket</span>ตะกร้าของฉัน
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-gray-200">
              <p className="text-gray-400 mb-4">ยังไม่มีหนังสือในตะกร้า</p>
              <Link to="/" className="text-primary font-bold hover:underline">ไปเลือกหนังสือกันเลย</Link>
            </div>
          ) : cartItems.map(item => (
            <div key={item.id} className="flex items-center gap-6 bg-white dark:bg-white/5 p-4 rounded-[2rem] border border-[#e7f3ec] dark:border-[#1a3324] shadow-sm hover:shadow-md transition-all">
              <img src={item.image} className="w-20 h-28 object-cover rounded-xl shadow-md" alt={item.title} />
              <div className="flex-1">
                <h3 className="font-bold text-lg leading-tight mb-1">{item.title}</h3>
                <p className="text-sm text-gray-400 mb-3">{item.author}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-100 dark:border-white/10 rounded-xl overflow-hidden bg-gray-50 dark:bg-black/20">
                    <button onClick={() => updateWeeks(item.id, (item.rentweeks || 1) - 1)} className="px-3 py-1 hover:bg-primary/10 hover:text-primary transition-colors font-bold">−</button>
                    <span className="px-4 text-sm font-bold min-w-[90px] text-center">{item.rentweeks || 1} สัปดาห์</span>
                    <button onClick={() => updateWeeks(item.id, (item.rentweeks || 1) + 1)} className="px-3 py-1 hover:bg-primary/10 hover:text-primary transition-colors font-bold">+</button>
                  </div>
                  <span className="text-xs text-gray-400">฿{item.price}/สัปดาห์</span>
                </div>
              </div>
              <div className="text-right pr-2">
                <p className="text-xl font-black text-primary mb-2">฿{(item.price * (item.rentweeks || 1)).toLocaleString()}</p>
                <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-[#1a3324] p-8 rounded-[2.5rem] border border-[#e7f3ec] dark:border-[#1a3324] shadow-xl h-fit sticky top-32">
          <h2 className="text-xl font-bold mb-6">สรุปคำสั่งเช่า</h2>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-gray-500"><span>ยอดรวมค่าเช่า</span><span className="font-bold text-gray-800 dark:text-white">฿{subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between text-gray-500"><span>ค่าจัดส่ง</span><span className="font-bold text-gray-800 dark:text-white">฿{shipping}</span></div>
            <hr className="border-gray-100 dark:border-white/5" />
            <div className="flex justify-between text-xl font-black"><span>ยอดสุทธิ</span><span className="text-primary">฿{total.toLocaleString()}</span></div>
          </div>
          <button onClick={() => navigate('/checkout')} disabled={cartItems.length === 0}
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-40 disabled:pointer-events-none">
            ดำเนินการชำระเงิน
          </button>
        </div>
      </div>
    </main>
  );
};

export default Cart;
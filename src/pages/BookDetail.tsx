import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiGetBook, apiAddReview } from '../services/api';
import { isAuthenticated } from '../services/authService';
import { PageSpinner } from '../components/Skeleton';
import NotifyMeButton from '../components/NotifyMeButton';
import WishlistButton from '../components/WishlistButton';

const ss   = sessionStorage;
const sGet = (k: string) => ss.getItem(k) || '';

type Review = { name: string; rating: number; comment: string; createdAt: string };

const StarRating: React.FC<{ value: number; onChange?: (v: number) => void }> = ({ value, onChange }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(s => (
      <button key={s} type="button" onClick={() => onChange?.(s)}
        className={`text-xl transition-transform ${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'} ${s <= value ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
    ))}
  </div>
);

const BookDetail: React.FC = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [book,      setBook]      = useState<any>(null);
  const [reviews,   setReviews]   = useState<Review[]>([]);
  const [related,   setRelated]   = useState<any[]>([]);
  const [weeks,     setWeeks]     = useState(1);
  const [inCart,    setInCart]    = useState(false);
  const [toast,     setToast]     = useState('');
  const [loading,   setLoading]   = useState(true);
  const [rating,    setRating]    = useState(5);
  const [comment,   setComment]   = useState('');
  const [reviewErr, setReviewErr] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await apiGetBook(id!);
      setBook(data); setReviews(data.reviews || []);
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setInCart(cart.some((i: any) => String(i.id) === String(id)));
    } catch { navigate('/'); }
    finally { setLoading(false); }
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const addToCart = () => {
    if (!isAuthenticated()) { navigate('/login'); return; }
    if (inCart) { navigate('/cart'); return; }
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    localStorage.setItem('cart', JSON.stringify([...cart, { ...book, rentweeks: weeks }]));
    window.dispatchEvent(new Event('storage'));
    setInCart(true); showToast('เพิ่มลงตะกร้าแล้ว!');
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated()) { navigate('/login'); return; }
    if (!comment.trim()) { setReviewErr('กรุณาเขียนความคิดเห็น'); return; }
    try {
      await apiAddReview(id!, { rating, comment: comment.trim(), name: sGet('userNickname') || sGet('userName') || 'ผู้ใช้งาน' });
      await load();
      setComment(''); setRating(5); setReviewErr('');
      showToast('ขอบคุณสำหรับรีวิว!');
    } catch (err: any) { setReviewErr(err.message || 'เกิดข้อผิดพลาด'); }
  };

  if (loading) return <PageSpinner />;
  if (!book)   return null;

  const isAvail   = book.isAvailable && book.stock > 0;
  const total     = book.price * weeks;
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      {toast && (
        <div className="fixed top-6 right-6 z-[200] bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <span className="material-symbols-outlined text-green-400 dark:text-green-600 text-[18px]">check_circle</span>{toast}
        </div>
      )}

      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
        <Link to="/" className="hover:text-primary transition-colors">หน้าแรก</Link>
        <span>/</span><span className="text-gray-600 dark:text-gray-200 font-medium truncate">{book.title}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div className="flex flex-col items-center gap-4">
          <div className="w-full max-w-sm aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl shadow-black/20 relative">
            {book.image ? <img src={book.image} alt={book.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100 dark:bg-white/5 flex items-center justify-center"><span className="material-symbols-outlined text-6xl text-gray-300">image</span></div>}
            <WishlistButton bookId={book.id} className="absolute top-3 right-3" />
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${isAvail ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              {isAvail ? `พร้อมให้เช่า · เหลือ ${book.stock} เล่ม` : 'ไม่ว่างในขณะนี้'}
            </span>
            <NotifyMeButton bookId={book.id} isAvailable={isAvail} />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap gap-2 mb-4">
            {(book.category || '').split(',').map((c: string) => (
              <span key={c} className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">{c.trim()}</span>
            ))}
          </div>
          <h1 className="text-3xl font-black mb-1 leading-tight">{book.title}</h1>
          <p className="text-gray-500 mb-3">โดย <span className="font-bold text-gray-700 dark:text-gray-200">{book.author}</span></p>
          {avgRating && (
            <div className="flex items-center gap-2 mb-4">
              <StarRating value={Math.round(Number(avgRating))} />
              <span className="font-black text-yellow-500">{avgRating}</span>
              <span className="text-xs text-gray-400">({reviews.length} รีวิว)</span>
            </div>
          )}
          <div className="flex items-baseline gap-2 my-6">
            <span className="text-4xl font-black text-primary">฿{book.price.toLocaleString()}</span>
            <span className="text-gray-400 text-sm">/ สัปดาห์</span>
          </div>
          <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-5 mb-6 border border-gray-100 dark:border-white/10">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">ระยะเวลาเช่า</p>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-black/20">
                <button onClick={() => setWeeks(w => Math.max(1, w - 1))} className="px-4 py-2 hover:bg-primary/10 hover:text-primary transition-colors font-bold text-lg">−</button>
                <span className="px-6 py-2 font-black text-lg min-w-[80px] text-center">{weeks}</span>
                <button onClick={() => setWeeks(w => w + 1)} className="px-4 py-2 hover:bg-primary/10 hover:text-primary transition-colors font-bold text-lg">+</button>
              </div>
              <span className="text-sm text-gray-500">สัปดาห์</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{weeks} สัปดาห์ × ฿{book.price.toLocaleString()}</span>
              <span className="font-black text-primary">฿{total.toLocaleString()}</span>
            </div>
          </div>
          <button onClick={addToCart} disabled={!isAvail}
            className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
              !isAvail ? 'bg-gray-200 text-gray-400 cursor-not-allowed' :
              inCart   ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20' :
                         'bg-primary text-white hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20'
            }`}>
            <span className="material-symbols-outlined">{inCart ? 'shopping_basket' : 'add_shopping_cart'}</span>
            {!isAvail ? 'ไม่พร้อมให้เช่า' : inCart ? 'ดูตะกร้าสินค้า' : `เพิ่มลงตะกร้า · ฿${total.toLocaleString()}`}
          </button>
        </div>
      </div>

      {/* Reviews */}
      <section>
        <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">reviews</span>รีวิวจากผู้เช่า
          {reviews.length > 0 && <span className="text-base font-medium text-gray-400">({reviews.length})</span>}
        </h2>
        <div className="bg-white dark:bg-white/5 rounded-[2rem] border border-gray-100 dark:border-white/5 p-6 mb-8 shadow-sm">
          <h3 className="font-bold mb-4">เขียนรีวิว</h3>
          {!isAuthenticated() ? (
            <p className="text-gray-400 text-sm"><Link to="/login" className="text-primary font-bold hover:underline">เข้าสู่ระบบ</Link> เพื่อเขียนรีวิว</p>
          ) : (
            <form onSubmit={submitReview} className="space-y-4">
              <div><p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">คะแนน</p><StarRating value={rating} onChange={setRating} /></div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">ความคิดเห็น</p>
                <textarea rows={3} value={comment} onChange={e => { setComment(e.target.value); setReviewErr(''); }}
                  placeholder="แชร์ประสบการณ์การอ่านของคุณ..."
                  className="w-full p-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
                {reviewErr && <p className="text-xs text-red-400 mt-1">{reviewErr}</p>}
              </div>
              <button type="submit" className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">ส่งรีวิว</button>
            </form>
          )}
        </div>
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-white/5 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-white/10">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2 block">rate_review</span>
            <p className="text-gray-400 text-sm">ยังไม่มีรีวิว เป็นคนแรกที่รีวิวหนังสือเล่มนี้</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r, i) => (
              <div key={i} className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-black text-primary text-sm">{r.name.charAt(0)}</span>
                    </div>
                    <div><p className="font-bold text-sm">{r.name}</p><p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
                  </div>
                  <StarRating value={r.rating} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default BookDetail;
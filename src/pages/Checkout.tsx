import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCreateOrder, apiVerifyCoupon } from '../services/api';
import { isAuthenticated } from '../services/authService';
import EmailNotificationModal from '../components/EmailNotificationModal';

const ss   = sessionStorage;
const sGet = (k: string) => ss.getItem(k) || '';

const getReturnDate = (items: any[]) => {
  const d = new Date();
  d.setDate(d.getDate() + Math.max(...items.map(i => i.rentweeks || 1), 1) * 7);
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
};

const SlipUpload: React.FC<{ slipImage: string | null; onUpload: (s: string) => void }> =
  ({ slipImage, onUpload }) => (
    <div className="mt-4 p-4 border-2 border-dashed border-gray-200 rounded-2xl text-center">
      <input type="file" accept="image/*" className="hidden" id="slip-upload"
        onChange={e => {
          const f = e.target.files?.[0]; if (!f) return;
          const r = new FileReader(); r.onloadend = () => onUpload(r.result as string); r.readAsDataURL(f);
        }} />
      <label htmlFor="slip-upload" className="cursor-pointer block">
        {slipImage ? <img src={slipImage} alt="slip" className="w-full h-24 object-contain rounded-lg" />
          : <div className="py-2"><span className="material-symbols-outlined text-gray-400">add_photo_alternate</span><p className="text-[10px] font-bold text-gray-500">แนบสลิปยืนยันการชำระเงิน</p></div>}
      </label>
    </div>
  );

const BANKS = [
  { id: 'kbank', name: 'กสิกรไทย',    color: '#138B2E', account: '123-4-56789-0', raw: '1234567890' },
  { id: 'scb',   name: 'ไทยพาณิชย์', color: '#4E2E7F', account: '987-6-54321-0', raw: '9876543210' },
];
const PAY_METHODS = [{ id: 'qr', icon: 'qr_code_2', label: 'Thai QR' }, { id: 'transfer', icon: 'account_balance', label: 'โอนเงิน' }];
const inputCls = "p-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 outline-none focus:border-primary transition-all";

const Checkout: React.FC = () => {
  const navigate = useNavigate();

  const [cartItems,  setCartItems]  = useState<any[]>([]);
  const [payMethod,  setPayMethod]  = useState('qr');
  const [bank,       setBank]       = useState<string | null>(null);
  const [slipImage,  setSlipImage]  = useState<string | null>(null);
  const [copied,     setCopied]     = useState(false);
  const [name,       setName]       = useState('');
  const [phone,      setPhone]      = useState('');
  const [address,    setAddress]    = useState('');
  const [note,       setNote]       = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discount,   setDiscount]   = useState(0);
  const [couponMsg,  setCouponMsg]  = useState<{ ok: boolean; text: string } | null>(null);
  const [formError,  setFormError]  = useState('');
  const [loading,    setLoading]    = useState(false);
  const [emailData,  setEmailData]  = useState<any | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) { navigate('/login'); return; }
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (!cart.length) { navigate('/cart'); return; }
    setCartItems(cart);
    setName(sGet('userName')); setPhone(sGet('userPhone')); setAddress(sGet('userAddress'));
  }, [navigate]);

  const subtotal   = cartItems.reduce((s, i) => s + i.price * (i.rentweeks || 1), 0);
  const finalTotal = Math.max(subtotal + 40 - discount, 0);

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) return;
    try {
      const { discount: d, coupon } = await apiVerifyCoupon(couponCode.trim().toUpperCase(), subtotal);
      setDiscount(d);
      setCouponMsg({ ok: true, text: `ใช้โค้ด ${coupon.code} ส่วนลด ฿${d.toLocaleString()} แล้ว!` });
    } catch (err: any) {
      setCouponMsg({ ok: false, text: err.message || 'ไม่พบโค้ดนี้' }); setDiscount(0);
    }
  }, [couponCode, subtotal]);

  const handleCopy = (text: string) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const handleConfirmOrder = useCallback(async () => {
    setFormError('');
    if (!name.trim() || !phone.trim() || !address.trim()) { setFormError('กรุณากรอกชื่อ, เบอร์โทร และที่อยู่ให้ครบ'); return; }
    if (!slipImage) { setFormError('กรุณาแนบสลิปก่อนยืนยัน'); return; }

    setLoading(true);
    try {
      const returnDate = getReturnDate(cartItems);
      const { orderId } = await apiCreateOrder({
        customerName: name.trim(), phone: phone.trim(), address: address.trim(), note: note.trim() || '-',
        total: finalTotal, returnDate, slip: slipImage,
        items: cartItems.map(i => ({ id: String(i.id), title: i.title, price: i.price * (i.rentweeks || 1), days: (i.rentweeks || 1) * 7, image: i.image || '' })),
      });
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('storage'));
      setEmailData({ to: sGet('userEmail') || '-', orderId, items: cartItems.map(i => ({ title: i.title, days: (i.rentweeks || 1) * 7 })), total: finalTotal, returnDate });
    } catch (err: any) { setFormError(err.message || 'เกิดข้อผิดพลาด'); }
    finally { setLoading(false); }
  }, [name, phone, address, note, slipImage, cartItems, finalTotal]);

  const activeBank = BANKS.find(b => b.id === bank);

  return (
    <>
      <main className="max-w-6xl mx-auto px-4 py-20 mt-10">
        {copied && (
          <div className="fixed top-6 right-6 z-[200] bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
            <span className="material-symbols-outlined text-green-400 text-[18px]">check_circle</span>คัดลอกเลขบัญชีแล้ว
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><span className="material-symbols-outlined text-primary">local_shipping</span>ข้อมูลการจัดส่ง</h2>
              <div className="grid gap-4">
                {[['ชื่อ-นามสกุล *', name, setName], ['เบอร์โทรศัพท์ *', phone, setPhone]].map(([ph, val, fn]: any) => (
                  <input key={ph} type="text" placeholder={ph} value={val} onChange={e => fn(e.target.value)} className={inputCls} />
                ))}
                <textarea placeholder="ที่อยู่จัดส่งโดยละเอียด *" rows={3} value={address} onChange={e => setAddress(e.target.value)} className={`${inputCls} resize-none`} />
                <textarea placeholder="หมายเหตุเพิ่มเติม" rows={2} value={note} onChange={e => setNote(e.target.value)} className={`${inputCls} resize-none`} />
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><span className="material-symbols-outlined text-primary">payments</span>ช่องทางการชำระเงิน</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {PAY_METHODS.map(m => (
                  <button key={m.id} onClick={() => setPayMethod(m.id)} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${payMethod === m.id ? 'border-primary bg-primary/5' : 'border-gray-50 dark:border-white/5'}`}>
                    <span className="material-symbols-outlined">{m.icon}</span><span className="text-sm font-bold">{m.label}</span>
                  </button>
                ))}
              </div>

              {payMethod === 'transfer' && (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-gray-400 ml-2 uppercase">เลือกธนาคาร</p>
                  <div className="grid grid-cols-2 gap-3">
                    {BANKS.map(b => (
                      <button key={b.id} onClick={() => setBank(b.id)} className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all ${bank === b.id ? 'border-primary bg-primary/5' : 'border-gray-50 dark:border-white/5 hover:border-gray-200'}`}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: b.color }}>Bank</div>
                        <span className="text-xs font-bold">{b.name}</span>
                      </button>
                    ))}
                  </div>
                  {activeBank && (
                    <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-200 animate-in zoom-in duration-200">
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">เลขบัญชีสำหรับโอน</p>
                      <div className="flex justify-between items-center">
                        <p className="text-xl font-black tracking-widest text-primary">{activeBank.account}</p>
                        <button onClick={() => handleCopy(activeBank.raw)} className="p-2 bg-white dark:bg-black/20 rounded-xl hover:scale-110 transition-all text-primary shadow-sm"><span className="material-symbols-outlined text-sm">content_copy</span></button>
                      </div>
                      <p className="text-xs font-bold mt-1 text-gray-600 dark:text-gray-300">ชื่อบัญชี: บจก. เรนท์บุ๊ค (RentBook Co., Ltd.)</p>
                      <div className="mt-4 pt-4 border-t border-dashed border-gray-300"><SlipUpload slipImage={slipImage} onUpload={setSlipImage} /></div>
                    </div>
                  )}
                </div>
              )}

              {payMethod === 'qr' && (
                <div className="p-6 bg-white rounded-3xl border border-gray-100 flex flex-col items-center">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAYMENT-${finalTotal}`} alt="QR" className="w-40 h-40 mb-2" />
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-4">Scan to Pay ฿{finalTotal.toLocaleString()}</p>
                  <SlipUpload slipImage={slipImage} onUpload={setSlipImage} />
                </div>
              )}
            </section>
          </div>

          <div className="bg-white dark:bg-[#1a3324] p-8 rounded-[3rem] border border-[#e7f3ec] dark:border-[#1a3324] shadow-2xl h-fit sticky top-32">
            <h2 className="text-xl font-bold mb-6">สรุปรายการเช่า</h2>
            <div className="max-h-[200px] overflow-y-auto mb-6 pr-2 space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex gap-4 items-center">
                  <img src={item.image} className="w-10 h-14 object-cover rounded-lg shadow-sm" alt="" />
                  <div className="flex-1 min-w-0"><p className="text-sm font-bold truncate">{item.title}</p><p className="text-[10px] text-gray-400">{item.rentweeks || 1} สัปดาห์</p></div>
                  <p className="text-sm font-bold">฿{(item.price * (item.rentweeks || 1)).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="mb-4 p-1 bg-gray-50 dark:bg-black/20 rounded-2xl flex items-center border border-gray-100 dark:border-white/5">
              <input type="text" placeholder="ใส่โค้ดส่วนลด..." value={couponCode} onChange={e => { setCouponCode(e.target.value); setCouponMsg(null); }} className="bg-transparent flex-1 px-4 py-2 outline-none text-sm font-bold uppercase" />
              <button onClick={handleApplyCoupon} className="px-6 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md">ใช้งาน</button>
            </div>
            {couponMsg && <p className={`text-[10px] mb-4 ml-2 font-bold ${couponMsg.ok ? 'text-green-500' : 'text-red-500'}`}>{couponMsg.text}</p>}

            <div className="border-t border-gray-50 dark:border-white/5 pt-6 space-y-3">
              {[['ยอดรวมค่าเช่า', subtotal], ['ค่าจัดส่ง', 40]].map(([label, val]) => (
                <div key={String(label)} className="flex justify-between text-sm text-gray-500">
                  <span>{label}</span><span className="font-bold">฿{Number(val).toLocaleString()}</span>
                </div>
              ))}
              {discount > 0 && <div className="flex justify-between text-sm text-red-500 font-bold"><span>ส่วนลดคูปอง</span><span>-฿{discount.toLocaleString()}</span></div>}
              <div className="flex justify-between text-2xl font-black pt-4 border-t border-dashed border-gray-100 dark:border-white/10">
                <span>ยอดสุทธิ</span><span className="text-primary">฿{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-1">info</span>
              <div>
                <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">กำหนดคืนหนังสือ</p>
                <p className="text-sm font-black text-gray-800 dark:text-white mb-2">ภายในวันที่ {cartItems.length ? getReturnDate(cartItems) : '-'}</p>
                <p className="text-[11px] text-gray-500 leading-relaxed">* คืนได้ที่จุดขนส่งใกล้บ้าน (Flash, Kerry, J&T)<br />* สอบถาม: <span className="font-bold text-primary">02-123-4567</span></p>
              </div>
            </div>

            {formError && (
              <div className="mt-4 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 text-red-600 dark:text-red-400 text-sm font-medium px-4 py-3 rounded-2xl">
                <span className="material-symbols-outlined text-[18px] flex-shrink-0">error</span>{formError}
              </div>
            )}

            <button onClick={handleConfirmOrder} disabled={loading}
              className="w-full mt-6 py-4 bg-primary text-white rounded-[1.5rem] font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2">
              {loading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? 'กำลังดำเนินการ...' : 'ยืนยันคำสั่งเช่า'}
            </button>
          </div>
        </div>
      </main>

      {emailData && <EmailNotificationModal data={emailData} onClose={() => { setEmailData(null); navigate('/rental-history'); }} />}
    </>
  );
};

export default Checkout;
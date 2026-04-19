import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { availableCoupons } from '../data/allBooks';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('qr');
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  const banks = [
    { id: 'kbank', name: 'กสิกรไทย', color: '#138B2E' },
    { id: 'scb', name: 'ไทยพาณิชย์', color: '#4E2E7F' },
  ];
  
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [appliedCode, setAppliedCode] = useState('');

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (savedCart.length === 0) {
      navigate('/cart');
    }
    setCartItems(savedCart);
  }, [navigate]);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * (item.rentweeks || 1)), 0);
  const shipping = 40;
  const totalBeforeDiscount = subtotal + shipping;
  const finalTotal = totalBeforeDiscount - discount;

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    const foundCoupon = availableCoupons.find(c => c.code === code);

    if (!foundCoupon) {
      setCouponError('ไม่พบโค้ดส่วนลดนี้ หรือโค้ดหมดอายุ');
      setDiscount(0);
      setAppliedCode('');
      return;
    }

    if (subtotal < foundCoupon.minSpend) {
      setCouponError(`โค้ดนี้ใช้ได้เมื่อเช่าขั้นต่ำ ฿${foundCoupon.minSpend}`);
      setDiscount(0);
      setAppliedCode('');
      return;
    }

    if (foundCoupon.type === 'PERCENT') {
      setDiscount(Math.floor(subtotal * (foundCoupon.discountValue / 100)));
    } else {
      setDiscount(foundCoupon.discountValue);
    }

    setAppliedCode(foundCoupon.code);
    setCouponError('');
    alert('ใช้งานคูปองสำเร็จ!');
  };

  const handleConfirmOrder = () => {
    // บันทึกออเดอร์ลงระบบ
    const newOrder = {
      orderId: `ORD-${Date.now()}`,
      customerName: localStorage.getItem('userNickname') || 'สมาชิก',
      items: cartItems,
      total: finalTotal,
      status: 'pending',
      orderDate: new Date().toLocaleDateString('th-TH'),
      returnDate: getReturnDate()
    };

    const allOrders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
    localStorage.setItem('admin_orders', JSON.stringify([newOrder, ...allOrders]));

    alert(`ยืนยันการเช่าเรียบร้อย! ยอดชำระสุทธิ: ฿${finalTotal.toLocaleString()}`);
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event("storage"));
    navigate('/rental-history'); 
  };

  const getReturnDate = () => {
    const maxWeeks = Math.max(...cartItems.map(item => item.rentweeks || 1), 1);
    const date = new Date();
    date.setDate(date.getDate() + (maxWeeks * 7));
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-20 mt-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* ฝั่งซ้าย: ข้อมูลการส่งและวิธีชำระเงิน */}
        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary font-bold">local_shipping</span>
              ข้อมูลการจัดส่ง
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <input type="text" placeholder="ชื่อ-นามสกุล" className="p-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 outline-none focus:border-primary transition-all" />
              <input type="text" placeholder="เบอร์โทรศัพท์" className="p-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 outline-none focus:border-primary transition-all" />
              <textarea placeholder="ที่อยู่จัดส่งโดยละเอียด" rows={3} className="p-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 outline-none focus:border-primary transition-all"></textarea>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary font-bold">payments</span>
              ช่องทางการชำระเงิน
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button onClick={() => setPaymentMethod('qr')} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'qr' ? 'border-primary bg-primary/5' : 'border-gray-50 dark:border-white/5'}`}>
                <span className="material-symbols-outlined">qr_code_2</span>
                <span className="text-sm font-bold">Thai QR</span>
              </button>
              <button onClick={() => setPaymentMethod('transfer')} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'transfer' ? 'border-primary bg-primary/5' : 'border-gray-50 dark:border-white/5'}`}>
                <span className="material-symbols-outlined">account_balance</span>
                <span className="text-sm font-bold">โอนเงิน</span>
              </button>
            </div>

            {/* ส่วนธนาคาร: ต้องอยู่ภายใต้วิธีชำระเงินเพื่อให้ลำดับ Grid ไม่พัง */}
            {paymentMethod === 'transfer' && (
              <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <p className="text-xs font-bold text-gray-400 ml-2 uppercase">เลือกธนาคารเพื่อรับเลขบัญชี</p>
                <div className="grid grid-cols-2 gap-3">
                  {banks.map((bank) => (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => setSelectedBank(bank.id)}
                      className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all ${selectedBank === bank.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-50 dark:border-white/5 hover:border-gray-200'}`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: bank.color }}>Bank</div>
                      <span className="text-xs font-bold">{bank.name}</span>
                    </button>
                  ))}
                </div>
                {selectedBank && (
                  <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-200 mt-4 animate-in zoom-in duration-200">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">เลขบัญชีสำหรับโอน</p>
                    <div className="flex justify-between items-center">
                      <p className="text-xl font-black tracking-widest text-primary">
                        {selectedBank === 'kbank' ? '123-4-56789-0' : '987-6-54321-0'}
                      </p>
                      <button type="button" onClick={() => { navigator.clipboard.writeText(selectedBank === 'kbank' ? '1234567890' : '9876543210'); alert('คัดลอกเลขบัญชีแล้ว'); }} className="p-2 bg-white dark:bg-black/20 rounded-xl hover:scale-110 transition-all text-primary shadow-sm">
                        <span className="material-symbols-outlined text-sm">content_copy</span>
                      </button>
                    </div>
                    <p className="text-xs font-bold mt-1 text-gray-600 dark:text-gray-300">ชื่อบัญชี: บจก. เรนท์บุ๊ค (RentBook Co., Ltd.)</p>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === 'qr' && (
              <div className="mt-6 p-6 bg-white rounded-3xl border border-gray-100 flex flex-col items-center shadow-sm">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAYMENT-${finalTotal}`} alt="QR Code" className="w-40 h-40 mb-2" />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Scan to Pay ฿{finalTotal.toLocaleString()}</p>
              </div>
            )}
          </section>
        </div>

        {/* ฝั่งขวา: สรุปรายการ (อยู่ที่เดิม ไม่เปลี่ยน) */}
        <div className="bg-white dark:bg-[#1a3324] p-8 rounded-[3rem] border border-[#e7f3ec] dark:border-[#1a3324] shadow-2xl h-fit sticky top-32">
          <h2 className="text-xl font-bold mb-6">สรุปรายการเช่า</h2>
          
          <div className="max-h-[200px] overflow-y-auto mb-6 pr-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 items-center">
                <img src={item.image} className="w-10 h-14 object-cover rounded-lg shadow-sm" alt="" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{item.title}</p>
                  <p className="text-[10px] text-gray-400">{item.rentweeks} สัปดาห์</p>
                </div>
                <p className="text-sm font-bold">฿{(item.price * item.rentweeks).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="mb-8 p-1 bg-gray-50 dark:bg-black/20 rounded-2xl flex items-center border border-gray-100 dark:border-white/5">
            <input type="text" placeholder="ใส่โค้ดส่วนลด..." value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="bg-transparent flex-1 px-4 py-2 outline-none text-sm font-bold uppercase" />
            <button onClick={handleApplyCoupon} className="px-6 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md">ใช้งาน</button>
          </div>
          {couponError && <p className="text-red-500 text-[10px] mb-4 ml-2 font-bold">{couponError}</p>}
          {appliedCode && <p className="text-green-500 text-[10px] mb-4 ml-2 font-bold italic">ใช้โค้ด {appliedCode} แล้ว!</p>}

          <div className="border-t border-gray-50 dark:border-white/5 pt-6 space-y-3">
            <div className="flex justify-between text-sm text-gray-500"><span>ยอดรวมค่าเช่า</span><span className="font-bold">฿{subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm text-gray-500"><span>ค่าจัดส่ง</span><span className="font-bold">฿{shipping}</span></div>
            {discount > 0 && <div className="flex justify-between text-sm text-red-500 font-bold"><span>ส่วนลดคูปอง</span><span>-฿{discount.toLocaleString()}</span></div>}
            <div className="flex justify-between text-2xl font-black pt-4 border-t border-dashed border-gray-100 dark:border-white/10"><span>ยอดสุทธิ</span><span className="text-primary">฿{finalTotal.toLocaleString()}</span></div>
          </div>

          {/* ส่วนข้อมูลการคืนหนังสือ */}
          <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10">
          <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-primary mt-1">info</span>
          <div>
          <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">กำหนดคืนหนังสือ</p>
          <p className="text-sm font-black text-gray-800 dark:text-white mb-2">ภายในวันที่ {getReturnDate()}</p>
          <p className="text-[11px] text-gray-500 leading-relaxed">
          * ท่านสามารถนำหนังสือไปคืนได้ที่ <span className="font-bold text-primary">จุดบริการขนส่งใกล้บ้านได้ทุกที่</span> (Flash, Kerry, J&T) โดยแจ้งว่าเป็นการคืนหนังสือจาก RentBook 
          <br></br>
          <br />* หากมีข้อสงสัยเพิ่มเติมเกี่ยวกับการคืนหนังสือ กรุณาติดต่อฝ่ายบริการลูกค้าของเราได้ที่ <span className="font-bold text-primary">02-123-4567</span>
          </p>
          </div>
          </div>
          </div>

          <button onClick={handleConfirmOrder} className="w-full mt-8 py-4 bg-primary text-white rounded-[1.5rem] font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20">ยืนยันคำสั่งเช่า</button>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
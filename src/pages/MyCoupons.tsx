import React from 'react';
import { availableCoupons } from '../data/allBooks';

const MyCoupons: React.FC = () => {
  // ดึงข้อมูลจากไฟล์กลางมาใช้
  const coupons = availableCoupons;

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`คัดลอกรหัส ${code} แล้ว! นำไปใช้ในหน้าชำระเงินได้เลย`);
  };

  return (
    <section className="max-w-4xl mx-auto mt-12 mb-20 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
          <span className="material-symbols-outlined text-primary">confirmation_number</span>
          คูปองของฉัน
        </h3>
        <span className="text-[11px] font-medium text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md">
          {coupons.length} ใบที่ใช้ได้
        </span>
      </div>

      {/* Coupon Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {coupons.map((coupon) => (
          <div 
            key={coupon.id} 
            className="relative flex bg-white dark:bg-white/5 border border-[#e7f3ec] dark:border-[#1a3324] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
          >
            {/* ฝั่งซ้าย (ตัวเลขส่วนลด) */}
            <div className="w-1/3 bg-primary/10 flex flex-col items-center justify-center p-4 border-r-2 border-dashed border-[#e7f3ec] dark:border-[#1a3324]">
              {/* แก้ไขเป็น coupon.displayDiscount เพื่อให้โชว์ 10% หรือ ฿50 ตามข้อมูลจริง */}
              <span className="text-2xl font-black text-primary">{coupon.displayDiscount}</span>
              <span className="text-[10px] font-bold text-primary/60 uppercase">OFF</span>
            </div>

            {/* ฝั่งขวา (รายละเอียด) */}
            <div className="flex-1 p-5">
              <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-1">{coupon.title}</h4>
              <p className="text-[10px] text-gray-400 mb-3">
                เมื่อเช่าขั้นต่ำ ฿{coupon.minSpend} • หมดอายุ {coupon.expiry}
              </p>
              
              <div className="flex items-center justify-between">
                <code className="bg-gray-50 dark:bg-black/20 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-primary border border-primary/20">
                  {coupon.code}
                </code>
                <button 
                  onClick={() => copyToClipboard(coupon.code)}
                  className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  คัดลอก
                </button>
              </div>
            </div>

            {/* รอยปรุตกแต่ง */}
            <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-background-light dark:bg-background-dark rounded-full border border-[#e7f3ec] dark:border-[#1a3324]"></div>
            <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-background-light dark:bg-background-dark rounded-full border border-[#e7f3ec] dark:border-[#1a3324]"></div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {coupons.length === 0 && (
        <div className="text-center py-16 bg-gray-50 dark:bg-white/5 rounded-[2.5rem] border-2 border-dashed border-gray-200">
          <p className="text-gray-400 text-sm">คุณยังไม่มีคูปองส่วนลดในขณะนี้</p>
        </div>
      )}
    </section>
  );
};

export default MyCoupons;
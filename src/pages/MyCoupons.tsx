import React, { useState, useEffect, useCallback } from 'react';
import { apiGetCoupons } from '../services/api';

const MyCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [copied,  setCopied]  = useState('');

  useEffect(() => {
    apiGetCoupons().then(setCoupons).catch(() => setCoupons([]));
  }, []);

  const handleCopy = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code); setTimeout(() => setCopied(''), 2000);
  }, []);

  return (
    <section className="max-w-4xl mx-auto mt-12 mb-20 px-4">
      {copied && (
        <div className="fixed top-6 right-6 z-[200] bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <span className="material-symbols-outlined text-green-400 dark:text-green-600 text-[18px]">check_circle</span>คัดลอกโค้ด {copied} แล้ว!
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">confirmation_number</span>คูปองของฉัน
        </h3>
        <span className="text-[11px] font-medium text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md">{coupons.length} ใบที่ใช้ได้</span>
      </div>

      {coupons.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-white/5 rounded-[2.5rem] border-2 border-dashed border-gray-200">
          <span className="material-symbols-outlined text-4xl text-gray-300 mb-2 block">confirmation_number</span>
          <p className="text-gray-400 text-sm">ยังไม่มีคูปองในขณะนี้</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coupons.map((c: any) => (
            <div key={c.id} className="relative flex bg-white dark:bg-white/5 border border-[#e7f3ec] dark:border-[#1a3324] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="w-1/3 bg-primary/10 flex flex-col items-center justify-center p-4 border-r-2 border-dashed border-[#e7f3ec] dark:border-[#1a3324]">
                <span className="text-2xl font-black text-primary">{c.displayDiscount}</span>
                <span className="text-[10px] font-bold text-primary/60 uppercase">OFF</span>
              </div>
              <div className="flex-1 p-5">
                <h4 className="text-sm font-bold mb-1">{c.title}</h4>
                <p className="text-[10px] text-gray-400 mb-3">
                  {c.minSpend > 0 ? `เมื่อเช่าขั้นต่ำ ฿${c.minSpend} • ` : ''}หมดอายุ {c.expiry}
                </p>
                <div className="flex items-center justify-between">
                  <code className="bg-gray-50 dark:bg-black/20 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-primary border border-primary/20">{c.code}</code>
                  <button onClick={() => handleCopy(c.code)} className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>คัดลอก
                  </button>
                </div>
              </div>
              <div className="absolute top-1/2 -left-2  -translate-y-1/2 w-4 h-4 bg-background-light dark:bg-background-dark rounded-full border border-[#e7f3ec] dark:border-[#1a3324]" />
              <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-background-light dark:bg-background-dark rounded-full border border-[#e7f3ec] dark:border-[#1a3324]" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default MyCoupons;
import React from 'react';

// --- จำลองข้อมูลให้ดูสมจริงขึ้น ---
const rentalData = [
  { id: 118, title: "Demon Slayer", author: "Koyoharu Gotouge",category: "การ์ตูน, แอคชั่น, แฟนตาซี, ดราม่า, ,มังงะ", image: "https://picsum.photos/seed/c18/300/400", price: 60, rentDate: "10 มี.ค. 2026",returnDate: "17 มี.ค. 2026", status: "คืนแล้ว" },
  { id: 113, title: "Death Note", author: "Tsugumi Ohba",category: "การ์ตูน, แฟนตาซี, มังงะ", image: "https://picsum.photos/seed/c13/300/400", price: 45, rentDate: "10 เม.ย. 2026",returnDate: "17 เม.ย. 2026", status: "กำลังเช่า" },
];

const RentalHistory: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto mt-12 mb-10 px-4">
      {/* ส่วนหัวส่วนประวัติ */}
     <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">history</span>
        ประวัติการเช่า
      </h3>
      {/* ... */}
    </div>

      {/* รายการประวัติแบบกระชับ (Compact List) */}
      <div className="grid grid-cols-1 gap-3">
        {rentalData.map((item) => (
          <div 
            key={item.id} 
            className="group flex items-center gap-4 bg-white dark:bg-[#121212] p-3 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-primary/30 transition-all shadow-sm hover:shadow-md"
          >
            {/* รูปหน้าปก (ขนาดเล็กแต่ชัดเจน) */}
            <div className="w-14 h-20 flex-shrink-0 rounded-lg overflow-hidden shadow-sm bg-gray-200">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </div>

            {/* ข้อมูลหนังสือ */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                  {item.category.split(',')[0]}
                </span>
              </div>
              <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                {item.title}
              </h4>
              
              {/* วันที่ (ใช้ไอคอนขนาดเล็ก) */}
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <span className="material-symbols-outlined text-[14px] opacity-70">calendar_today</span>
                  <span>{item.rentDate}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <span className="material-symbols-outlined text-[14px] opacity-70">event_repeat</span>
                  <span>{item.returnDate}</span>
                </div>
              </div>
            </div>

            {/* สถานะและราคา (จัดวางให้สมดุล) */}
            <div className="flex flex-col items-end gap-1.5 min-w-[70px]">
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                item.status === 'กำลังเช่า' 
                ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/10' 
                : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10'
              }`}>
                {item.status}
              </span>
              <p className="text-base font-black text-primary tracking-tight">
                ฿{item.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RentalHistory;
import React from 'react';
import { Link } from 'react-router-dom';

// ย้ายออกนอก component — ไม่ recreate ทุก render
const STEPS = [
  { id: '01', title: 'เลือกหนังสือที่ชอบ',   description: 'ค้นหาหนังสือจากการ์ตูน นิยาย หรือหนังสือทั่วไปที่คุณต้องการอ่านผ่านหน้าแรก',                     icon: 'menu_book',         color: 'bg-blue-500/10 text-blue-500'      },
  { id: '02', title: 'เพิ่มลงตะกร้า',         description: 'กดปุ่มเช่าหนังสือที่คุณต้องการ และเลือกจำนวนสัปดาห์ที่ต้องการเช่า',                              icon: 'shopping_basket',   color: 'bg-primary/10 text-primary'        },
  { id: '03', title: 'ชำระเงินและรอรับ',      description: 'ตรวจสอบที่อยู่จัดส่งและชำระเงิน ระบบจะดำเนินการจัดส่งหนังสือถึงบ้านคุณ',                         icon: 'local_shipping',    color: 'bg-amber-500/10 text-amber-500'    },
  { id: '04', title: 'อ่านและส่งคืน',         description: 'เมื่อครบกำหนดเวลาเช่า ให้ส่งคืนหนังสือผ่านจุดบริการขนส่งที่คุณสะดวก',                            icon: 'assignment_return', color: 'bg-emerald-500/10 text-emerald-500' },
];

const HowToRent: React.FC = () => (
  <main className="max-w-5xl mx-auto px-4 py-20 mt-10">

    {/* Header */}
    <div className="text-center mb-16">
      <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs">Rental Guide</span>
      <h1 className="text-4xl font-black mt-4 mb-6">วิธีการเช่าง่ายๆ เพียง 4 ขั้นตอน</h1>
      <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
        สัมผัสประสบการณ์การอ่านหนังสือที่คุณรักได้ที่บ้าน โดยไม่ต้องซื้อเล่มจริงในราคาเต็ม
        เรามีระบบจัดการที่รวดเร็วและปลอดภัย
      </p>
    </div>

    {/* Steps */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
      {STEPS.map(step => (
        <div key={step.id} className="relative group">
          <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 hover:border-primary/30 transition-all shadow-sm hover:shadow-xl hover:-translate-y-2 h-full text-center">
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-[#1a3324] border border-gray-100 dark:border-white/10 w-10 h-10 rounded-full flex items-center justify-center font-black text-xs text-primary shadow-sm">
              {step.id}
            </span>
            <div className={`w-16 h-16 rounded-2xl ${step.color} mx-auto mb-6 flex items-center justify-center`}>
              <span className="material-symbols-outlined text-3xl">{step.icon}</span>
            </div>
            <h3 className="text-lg font-bold mb-3">{step.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
          </div>
        </div>
      ))}
    </div>

    {/* CTA */}
    <div className="bg-primary rounded-[3rem] p-12 text-center text-white shadow-2xl shadow-primary/20">
      <h2 className="text-2xl font-bold mb-4">พร้อมที่จะเริ่มอ่านแล้วหรือยัง?</h2>
      <p className="opacity-80 mb-8 max-w-lg mx-auto text-sm">
        สมัครสมาชิกตอนนี้เพื่อรับคูปองส่วนลด 10% สำหรับการเช่าครั้งแรกของคุณ
      </p>
      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <Link to="/register" className="px-10 py-4 bg-white text-primary rounded-2xl font-bold hover:scale-105 transition-transform">
          สมัครสมาชิกเลย
        </Link>
        <Link to="/" className="px-10 py-4 bg-white/10 border border-white/20 rounded-2xl font-bold hover:bg-white/20 transition-all">
          {/* แก้จาก bg-primary-dark/20 → bg-white/10 ซึ่ง Tailwind รองรับ */}
          เลือกดูหนังสือ
        </Link>
      </div>
    </div>

  </main>
);

export default HowToRent;
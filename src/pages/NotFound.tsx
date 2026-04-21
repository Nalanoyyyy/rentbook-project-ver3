import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">

        {/* Illustration */}
        <div className="relative mx-auto w-48 h-48 mb-8">
          <div className="w-full h-full rounded-[3rem] bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-8xl text-primary/40">menu_book</span>
          </div>
          <div className="absolute -top-3 -right-3 w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
          </div>
        </div>

        <h1 className="text-6xl font-black text-primary mb-2">404</h1>
        <h2 className="text-2xl font-bold mb-3">ไม่พบหน้าที่คุณต้องการ</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          หน้านี้อาจถูกลบ ย้าย หรือพิมพ์ URL ผิดครับ<br />
          ลองกลับไปหน้าแรกแล้วเริ่มใหม่
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-gray-200 dark:border-white/10 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>กลับหน้าก่อนหน้า
          </button>
          <Link to="/"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-[20px]">home</span>กลับหน้าแรก
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-10 pt-8 border-t border-gray-100 dark:border-white/10">
          <p className="text-xs text-gray-400 mb-4 font-bold uppercase tracking-wider">หรือไปที่</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { to: '/cartoon',      label: 'การ์ตูน'      },
              { to: '/fiction',      label: 'นิยาย'        },
              { to: '/general-books',label: 'หนังสือทั่วไป'},
              { to: '/how-to-rent',  label: 'วิธีการเช่า'  },
            ].map(({ to, label }) => (
              <Link key={to} to={to}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
};

export default NotFound;
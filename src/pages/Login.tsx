import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();

  // --- 1. State Management ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // --- 2. Login Logic (ดึงชื่อเล่นจากประวัติการสมัคร) ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (email.trim() && password.trim()) {
      // ดึงข้อมูลที่เคยสมัครไว้ในเครื่องมาเช็ค
      const savedEmail = localStorage.getItem('userEmail');
      const savedNickname = localStorage.getItem('userNickname');
      
      let nameToShow = "";

      // เช็คว่า Email ที่กรอก ตรงกับที่เคยสมัครไว้ไหม?
      if (email === savedEmail && savedNickname) {
        // ถ้าอีเมลตรงกัน ให้ดึง "ชื่อเล่น" มาใช้
        nameToShow = savedNickname;
      } else {
        // ถ้าไม่ตรง หรือไม่เคยสมัคร ให้ตัดชื่อจากหน้า @ มาใช้เป็นชื่อชั่วคราว
        nameToShow = email.split('@')[0];
      }
      
      // บันทึกสถานะและชื่อที่จะใช้แสดงผลทั่วเว็บ
      localStorage.setItem('userName', nameToShow); 
      localStorage.setItem('isLoggedIn', 'true');
      
      // แจ้ง Navbar ให้เปลี่ยนสถานะ และไปหน้า Profile
      window.dispatchEvent(new Event("storage"));
      navigate('/profile');
    } else {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    }
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full bg-white dark:bg-white/5 p-8 md:p-12 rounded-[2.5rem] border border-[#e7f3ec] dark:border-[#1a3324] shadow-2xl">
        
        {/* ส่วนหัวหน้า Login */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary/10 rounded-[2rem] mx-auto mb-4 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-primary">login</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">เข้าสู่ระบบ</h1>
          <p className="text-gray-500 mt-2 text-sm">ล็อกอินเพื่อเริ่มเช่าหนังสือที่คุณชอบ</p>
        </div>

        {/* ฟอร์มกรอกข้อมูล */}
        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* ช่อง Email */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest ml-1 opacity-60">อีเมลผู้ใช้งาน</label>
            <input 
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              className="w-full h-14 px-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary/20 focus:ring-4 ring-primary/10 text-lg transition-all outline-none"
            />
          </div>

          {/* ช่อง Password */}
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-black uppercase tracking-widest opacity-60">รหัสผ่าน</label>
              <button type="button" className="text-xs text-primary font-bold hover:underline">ลืมรหัสผ่าน?</button>
            </div>
            
            <div className="relative w-full">
            <input
               type={showPassword ? "text" : "password"} // ใช้ State ควบคุมประเภท
              className="w-full p-4 pr-12 rounded-2xl bg-gray-50 border border-transparent focus:border-primary outline-none"
              placeholder="••••••"
            />
              
              {/* ปุ่มเปิด-ปิดตา (จัดการเรื่องไอคอนซ้อนแล้ว) */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-primary transition-colors select-none"
              >
                <span className="material-symbols-outlined !text-[24px]">
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
          </div>

          {/* ปุ่มตกลง */}
          <button 
            type="submit"
            className="w-full h-15 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 mt-4"
          >
            เข้าสู่ระบบเลย
          </button>
        </form>

        {/* ลิงก์ไปหน้าสมัครสมาชิก */}
        <div className="mt-10 pt-6 border-t border-gray-100 dark:border-white/5 text-center text-sm">
          <p className="text-gray-500">
            ยังไม่มีบัญชีสมาชิก? 
            <Link to="/register" className="text-primary font-bold hover:underline ml-1">
              สมัครสมาชิกใหม่ที่นี่
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
};

export default Login;
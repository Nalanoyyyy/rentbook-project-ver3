import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register: React.FC = () => {
  const navigate = useNavigate();

  // --- 1. State Management ---
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    phone: '', // เพิ่มเบอร์โทรศัพท์
    email: '',
    password: '',
    confirmPassword: '',
    address: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  // --- 2. Registration Logic ---
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
      return;
    }

    if (formData.name && formData.email && formData.phone) {
      // บันทึกข้อมูลลงเครื่องทั้งหมด
      localStorage.setItem('userName', formData.name);
      localStorage.setItem('userNickname', formData.nickname);
      localStorage.setItem('userPhone', formData.phone); // บันทึกเบอร์โทร
      localStorage.setItem('userAddress', formData.address);
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('isLoggedIn', 'true');
      
      window.dispatchEvent(new Event("storage"));
      
      alert(`ยินดีต้อนรับคุณ ${formData.nickname || formData.name}! สมัครสมาชิกสำเร็จ`);
      navigate('/profile'); 
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-20 bg-gray-50/30 dark:bg-transparent">
      <div className="max-w-xl w-full bg-white dark:bg-white/5 p-8 md:p-12 rounded-[3rem] border border-[#e7f3ec] dark:border-[#1a3324] shadow-2xl shadow-primary/5">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-accent/20 rounded-[2rem] mx-auto mb-4 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-4xl">person_add</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">สร้างบัญชีสมาชิก</h1>
          <p className="text-gray-500 mt-2 text-sm">กรอกข้อมูลเพื่อรับสิทธิพิเศษและเริ่มเช่าหนังสือ</p>
        </div>

        {/* Form Grid Layout */}
        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* ชื่อจริง - นามสกุล (เต็มความกว้าง) */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest ml-1 opacity-60">ชื่อ-นามสกุลจริง</label>
            <input 
              required
              type="text"
              placeholder="สมชาย รักการอ่าน"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full h-14 px-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary/20 focus:ring-4 ring-primary/10 transition-all outline-none"
            />
          </div>

        {/* ชื่อเล่น */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest ml-1 opacity-60">ชื่อเล่น</label>
            <input 
              required
              type="text"
              placeholder="เช่น ต้น"
              onChange={(e) => setFormData({...formData, nickname: e.target.value})}
              className="w-full h-14 px-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary/20 focus:ring-4 ring-primary/10 transition-all outline-none"
            />
          </div>

          {/* เบอร์โทรศัพท์ (คู่กับชื่อเล่น) */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest ml-1 opacity-60">เบอร์โทรศัพท์</label>
            <input 
              required
              type="tel"
              pattern="[0-9]{9,10}"
              placeholder="0812345678"
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full h-14 px-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary/20 focus:ring-4 ring-primary/10 transition-all outline-none"
            />
          </div>

          {/* อีเมล (เต็มความกว้าง) */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest ml-1 opacity-60">อีเมล</label>
            <input 
              required
              type="email"
              placeholder="example@mail.com"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full h-14 px-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary/20 focus:ring-4 ring-primary/10 transition-all outline-none"
            />
          </div>

          {/* รหัสผ่าน */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest ml-1 opacity-60">รหัสผ่าน</label>
            <div className="relative">
              <input 
                required
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full h-14 px-6 pr-12 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary/20 focus:ring-4 ring-primary/10 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined !text-[22px]">
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
          </div>

          {/* ยืนยันรหัสผ่าน */}
          <div className="space-y-1.5">
  <label className="text-xs font-black uppercase tracking-widest ml-1 opacity-60">ยืนยันรหัสผ่านอีกครั้ง</label>
  <div className="relative">
    <input 
      required
      type={showPassword ? "text" : "password"} // ใช้ state เดียวกันเพื่อให้เปิดดูพร้อมกัน
      placeholder="••••••••"
      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
      className="w-full h-14 px-6 pr-12 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary/20 focus:ring-4 ring-primary/10 transition-all outline-none"
    />
    {/* ปุ่มดวงตา (ช่องที่ 2) */}
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors select-none"
    >
      <span className="material-symbols-outlined !text-[22px]">
        {showPassword ? 'visibility' : 'visibility_off'}
      </span>
    </button>
  </div>
</div>

          {/* ปุ่มส่งข้อมูล */}
          <div className="md:col-span-2 mt-4">
            <button 
              type="submit"
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-primary/20"
            >
              สมัครสมาชิกเลย
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 text-center text-sm">
          มีบัญชีสมาชิกอยู่แล้ว? <Link to="/login" className="text-primary font-bold hover:underline ml-1">เข้าสู่ระบบที่นี่</Link>
        </div>

      </div>
    </main>
  );
};

export default Register;
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [fullName,  setFullName]  = useState('');
  const [nickname,  setNickname]  = useState('');
  const [email,     setEmail]     = useState('');
  const [phone,     setPhone]     = useState('');
  const [password,  setPassword]  = useState('');
  const [address,   setAddress]   = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error,     setError]     = useState(''); // แทน alert()

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const regEmail    = email.trim().toLowerCase();
    const regPassword = password.trim();

    // ── Validation ────────────────────────────────────────────────────────────
    if (!fullName.trim() || !nickname.trim() || !regEmail || !regPassword) {
      setError('กรุณากรอกข้อมูลสำคัญให้ครบถ้วน');
      return;
    }
    if (regPassword.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

    if (existingUsers.some((u: any) => u.email === regEmail)) {
      setError('อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น');
      return;
    }

    // ── Save ──────────────────────────────────────────────────────────────────
    existingUsers.push({
      email:    regEmail,
      password: regPassword,
      fullName: fullName.trim(),
      nickname: nickname.trim(),
      phone:    phone.trim(),
      address:  address.trim(),
    });
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

    // navigate ทันที ไม่ต้อง alert block UI
    navigate('/login', { state: { registered: true } });
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      <div className="max-w-xl w-full bg-white dark:bg-[#0f1712] p-8 md:p-12 rounded-[2.5rem] border border-[#e7f3ec] dark:border-[#1a3324] shadow-2xl">

        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary/10 rounded-[2rem] mx-auto mb-4 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-primary">person_add</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">สร้างบัญชีใหม่</h1>
          <p className="text-gray-500 mt-2 text-sm">สมัครสมาชิกเพื่อเช่าหนังสือและรับสิทธิพิเศษ</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'ชื่อ-นามสกุล', value: fullName,  set: setFullName,  placeholder: 'สมชาย ใจดี',   required: true  },
              { label: 'ชื่อเล่น',      value: nickname,  set: setNickname,  placeholder: 'สมชาย',        required: true  },
              { label: 'อีเมล',         value: email,     set: setEmail,     placeholder: 'example@mail.com', required: true, type: 'email' },
              { label: 'เบอร์โทรศัพท์', value: phone,     set: setPhone,     placeholder: '08X-XXX-XXXX', required: false, type: 'tel'   },
            ].map(({ label, value, set, placeholder, required, type = 'text' }) => (
              <div key={label} className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest ml-1 opacity-60">
                  {label}{required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                <input required={required} type={type} value={value}
                  onChange={e => set(e.target.value)} placeholder={placeholder}
                  className="w-full h-14 px-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary/20 outline-none transition-all" />
              </div>
            ))}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest ml-1 opacity-60">
              รหัสผ่าน <span className="text-red-500">*</span>
            </label>
            <div className="relative w-full">
              <input required type={showPassword ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)} minLength={6}
                className="w-full h-14 px-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary/20 outline-none transition-all"
                placeholder="อย่างน้อย 6 ตัวอักษร" />
              <button type="button" onClick={() => setShowPassword(p => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined !text-[24px]">{showPassword ? 'visibility' : 'visibility_off'}</span>
              </button>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2 pb-2">
            <label className="text-xs font-black uppercase tracking-widest ml-1 opacity-60">ที่อยู่จัดส่ง (กรอกภายหลังได้)</label>
            <textarea rows={2} value={address} onChange={e => setAddress(e.target.value)}
              placeholder="บ้านเลขที่ หมู่ ซอย ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
              className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary/20 outline-none transition-all resize-none" />
          </div>

          {/* Error inline — แทน alert() */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 text-red-600 dark:text-red-400 text-sm font-medium px-4 py-3 rounded-2xl">
              <span className="material-symbols-outlined text-[18px] flex-shrink-0">error</span>
              {error}
            </div>
          )}

          <button type="submit"
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 mt-6">
            ยืนยันการสมัครสมาชิก
          </button>

        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 text-center text-sm">
          <p className="text-gray-500">
            มีบัญชีผู้ใช้งานอยู่แล้ว?
            <Link to="/login" className="text-primary font-bold hover:underline ml-1">เข้าสู่ระบบเลย</Link>
          </p>
        </div>

      </div>
    </main>
  );
};

export default Register;
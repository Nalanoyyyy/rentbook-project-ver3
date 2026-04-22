import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRegister } from '../services/api';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ fullName: '', nickname: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (form.password.length < 6)              { setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return; }
    if (form.password !== form.confirmPassword) { setError('รหัสผ่านทั้งสองช่องไม่ตรงกัน'); return; }
    setLoading(true);
    try {
      await apiRegister({ email: form.email.trim().toLowerCase(), password: form.password, fullName: form.fullName.trim(), nickname: form.nickname.trim(), phone: form.phone.trim() });
      navigate('/login', { state: { registered: true } });
    } catch (err: any) { setError(err.message || 'เกิดข้อผิดพลาด'); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full h-14 px-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary/20 outline-none transition-all";
  const FIELDS: { key: keyof typeof form; label: string; type?: string; ph: string }[] = [
    { key: 'fullName',        label: 'ชื่อ-นามสกุลจริง', ph: 'กรอกชื่อ-นามสกุล'        },
    { key: 'nickname',        label: 'ชื่อเล่น',          ph: 'กรอกชื่อเล่น'             },
    { key: 'email',           label: 'อีเมล',             type: 'email',    ph: 'example@mail.com'      },
    { key: 'phone',           label: 'เบอร์โทรศัพท์',    type: 'tel',      ph: '08X-XXX-XXXX'          },
    { key: 'password',        label: 'รหัสผ่าน',        ph: 'อย่างน้อย 6 ตัวอักษร' },
    { key: 'confirmPassword', label: 'ยืนยันรหัสผ่าน',    ph: 'กรอกรหัสผ่านอีกครั้ง' },
  ];

  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full bg-white dark:bg-white/5 p-8 md:p-12 rounded-[2.5rem] border border-[#e7f3ec] dark:border-[#1a3324] shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary/10 rounded-[2rem] mx-auto mb-4 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-primary">person_add</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">สมัครสมาชิก</h1>
          <p className="text-gray-500 mt-2 text-sm">สร้างบัญชีเพื่อเริ่มเช่าหนังสือ</p>
        </div>
        <form onSubmit={handleRegister} className="space-y-5">
          {FIELDS.map(({ key, label, type = 'text', ph }) => (
        <div key={key} className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest ml-1 opacity-60">{label}</label>
        <div className="relative">
        <input
        required
        type={
          key === 'password' ? (showPassword ? 'text' : 'password') :
          key === 'confirmPassword' ? (showConfirm ? 'text' : 'password') :
          type
        }
        placeholder={ph}
        value={form[key]}
        onChange={e => set(key, e.target.value)}
        className={inputCls + ' pr-14'}
      />
      {(key === 'password' || key === 'confirmPassword') && (
        <button
          type="button"
          onClick={() => key === 'password' ? setShowPassword(p => !p) : setShowConfirm(p => !p)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <span className="material-symbols-outlined text-[22px]">
            {key === 'password' ? (showPassword ? 'visibility_off' : 'visibility') : (showConfirm ? 'visibility_off' : 'visibility')}
          </span>
        </button>
      )}
    </div>
  </div>
))}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 text-red-600 dark:text-red-400 text-sm font-medium px-4 py-3 rounded-2xl">
              <span className="material-symbols-outlined text-[18px] flex-shrink-0">error</span>{error}
            </div>
          )}
          <button type="submit" disabled={loading}
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2">
            {loading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิกเลย'}
          </button>
        </form>
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 text-center text-sm">
          <p className="text-gray-500">มีบัญชีอยู่แล้ว? <Link to="/login" className="text-primary font-bold hover:underline ml-1">เข้าสู่ระบบ</Link></p>
        </div>
      </div>
    </main>
  );
};

export default Register;
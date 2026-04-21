import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiForgotPassword, apiResetPassword } from '../services/api';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step,            setStep]            = useState(1);
  const [email,           setEmail]           = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error,           setError]           = useState('');
  const [loading,         setLoading]         = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await apiForgotPassword(email.trim().toLowerCase());
      setEmail(email.trim().toLowerCase());
      setStep(2);
    } catch (err: any) { setError(err.message || 'ไม่พบอีเมลนี้ในระบบ'); }
    finally { setLoading(false); }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (newPassword.length < 6)          { setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return; }
    if (newPassword !== confirmPassword)  { setError('รหัสผ่านทั้งสองช่องไม่ตรงกัน'); return; }
    setLoading(true);
    try {
      await apiResetPassword(email, newPassword);
      navigate('/login', { state: { passwordReset: true } });
    } catch (err: any) { setError(err.message || 'เกิดข้อผิดพลาด'); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full h-14 px-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary/20 outline-none transition-all";

  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full bg-white dark:bg-white/5 p-8 md:p-12 rounded-[2.5rem] border border-[#e7f3ec] dark:border-[#1a3324] shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary/10 rounded-[2rem] mx-auto mb-4 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-4xl">lock_reset</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">ลืมรหัสผ่าน?</h1>
          <p className="text-gray-500 mt-2 text-sm">
            {step === 1 ? 'ใส่อีเมลของคุณเพื่อทำการรีเซ็ตรหัสผ่าน' : 'ตั้งค่ารหัสผ่านใหม่ของคุณ'}
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 text-red-600 dark:text-red-400 text-sm font-medium px-4 py-3 rounded-2xl">
            <span className="material-symbols-outlined text-[18px] flex-shrink-0">error</span>{error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest ml-1 opacity-60">อีเมลที่ใช้สมัคร</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@mail.com" className={inputCls} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? 'กำลังตรวจสอบ...' : 'ตรวจสอบอีเมล'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            {[
              { label: 'รหัสผ่านใหม่',       value: newPassword,     set: setNewPassword,     ph: 'อย่างน้อย 6 ตัวอักษร'   },
              { label: 'ยืนยันรหัสผ่านใหม่', value: confirmPassword, set: setConfirmPassword, ph: 'กรอกรหัสผ่านใหม่อีกครั้ง' },
            ].map(({ label, value, set, ph }) => (
              <div key={label} className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest ml-1 opacity-60">{label}</label>
                <input required type="password" value={value} onChange={e => set(e.target.value)} placeholder={ph} className={inputCls} />
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="w-full h-14 bg-green-500 text-white rounded-2xl font-bold text-lg hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 text-center text-sm">
          <Link to="/login" className="text-gray-500 hover:text-primary font-bold flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;
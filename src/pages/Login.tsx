import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { apiLogin } from '../services/api';
import { setSession } from '../services/authService';

const Login: React.FC = () => {
  const navigate  = useNavigate();
  const { state } = useLocation();

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);

  const successMsg =
    state?.registered    ? 'สมัครสมาชิกสำเร็จ! ยินดีต้อนรับ 🎉' :
    state?.passwordReset ? 'เปลี่ยนรหัสผ่านสำเร็จแล้ว' : '';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { token, user } = await apiLogin(email.trim().toLowerCase(), password.trim());
      setSession(token, user);
      window.dispatchEvent(new Event('authChange'));
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/');
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full h-14 px-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary/20 focus:ring-4 ring-primary/10 text-lg transition-all outline-none";

  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full bg-white dark:bg-white/5 p-8 md:p-12 rounded-[2.5rem] border border-[#e7f3ec] dark:border-[#1a3324] shadow-2xl">

        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary/10 rounded-[2rem] mx-auto mb-4 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-primary">login</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">เข้าสู่ระบบ</h1>
          <p className="text-gray-500 mt-2 text-sm">ล็อกอินเพื่อเริ่มเช่าหนังสือที่คุณชอบ</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest ml-1 opacity-60">อีเมลผู้ใช้งาน</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="example@mail.com" className={inputCls} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-black uppercase tracking-widest opacity-60">รหัสผ่าน</label>
              <Link to="/forgot-password" className="text-xs text-primary font-bold hover:underline">ลืมรหัสผ่าน?</Link>
            </div>
            <div className="relative">
              <input required type={showPassword ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)} placeholder="••••••" className={inputCls} />
              <button type="button" onClick={() => setShowPassword(p => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[24px]">{showPassword ? 'visibility' : 'visibility_off'}</span>
              </button>
            </div>
          </div>

          {successMsg && (
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/30 text-green-600 dark:text-green-400 text-sm font-medium px-4 py-3 rounded-2xl">
              <span className="material-symbols-outlined text-[18px] flex-shrink-0">check_circle</span>{successMsg}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 text-red-600 dark:text-red-400 text-sm font-medium px-4 py-3 rounded-2xl">
              <span className="material-symbols-outlined text-[18px] flex-shrink-0">error</span>{error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2">
            {loading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบเลย'}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-gray-100 dark:border-white/5 text-center text-sm">
          <p className="text-gray-500">
            ยังไม่มีบัญชีสมาชิก?
            <Link to="/register" className="text-primary font-bold hover:underline ml-1">สมัครสมาชิกใหม่ที่นี่</Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;
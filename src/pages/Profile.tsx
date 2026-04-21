import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const SESSION_KEYS = ['isLoggedIn','isAuthenticated','userRole','userEmail','userName','userNickname','userPhone','userAddress'];
const ss   = sessionStorage;
const sGet = (k: string) => ss.getItem(k) || '';

type UserData = { name: string; nickname: string; email: string; phone: string; address: string };

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [userData,  setUserData]  = useState<UserData>({ name: '', nickname: '', email: '', phone: '', address: '' });
  const [toast,     setToast]     = useState('');

  useEffect(() => {
    setUserData({
      name:     sGet('userName'),
      nickname: sGet('userNickname'),
      email:    sGet('userEmail'),
      phone:    sGet('userPhone'),
      address:  sGet('userAddress'),
    });
  }, []);

  const set = (k: keyof UserData, v: string) => setUserData(p => ({ ...p, [k]: v }));
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleSave = useCallback(() => {
    const t: UserData = {
      name:     userData.name.trim(),
      nickname: userData.nickname.trim(),
      email:    userData.email.trim().toLowerCase(),
      phone:    userData.phone.trim(),
      address:  userData.address.trim(),
    };

    // sync กับ registeredUsers
    const oldEmail = sGet('userEmail');
    const users: any[] = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    localStorage.setItem('registeredUsers', JSON.stringify(
      users.map(u => u.email === oldEmail ? { ...u, email: t.email, fullName: t.name, nickname: t.nickname, phone: t.phone, address: t.address } : u)
    ));

    // save ลง sessionStorage
    ss.setItem('userName',     t.name);
    ss.setItem('userNickname', t.nickname);
    ss.setItem('userEmail',    t.email);
    ss.setItem('userPhone',    t.phone);
    ss.setItem('userAddress',  t.address);

    setUserData(t);
    window.dispatchEvent(new Event('authChange'));
    setIsEditing(false);
    showToast('บันทึกข้อมูลเรียบร้อยแล้ว');
  }, [userData]);

  const handleLogout = () => {
    SESSION_KEYS.forEach(k => ss.removeItem(k));
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  const FIELDS: { key: keyof UserData; label: string; type?: string }[] = [
    { key: 'name',     label: 'ชื่อ-นามสกุลจริง' },
    { key: 'nickname', label: 'ชื่อเล่น'           },
    { key: 'email',    label: 'อีเมล',    type: 'email' },
    { key: 'phone',    label: 'เบอร์โทรศัพท์', type: 'tel' },
  ];

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      {toast && (
        <div className="fixed top-6 right-6 z-[200] bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <span className="material-symbols-outlined text-green-400 dark:text-green-600 text-[18px]">check_circle</span>{toast}
        </div>
      )}

      <div className="bg-white dark:bg-white/5 rounded-[3rem] border border-[#e7f3ec] dark:border-[#1a3324] overflow-hidden shadow-xl">
        <div className="bg-gradient-to-r from-primary to-[#1a3324] p-10 text-white flex justify-between items-end">
          <div>
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 border-4 border-white/30">
              <span className="material-symbols-outlined text-5xl">person</span>
            </div>
            <h1 className="text-3xl font-bold">คุณ {userData.nickname || userData.name}</h1>
            <p className="opacity-70 text-sm">จัดการข้อมูลส่วนตัวและที่อยู่จัดส่งของคุณ</p>
          </div>
          <div className="flex gap-3">
            {isEditing && (
              <button onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-2xl font-bold bg-white/10 hover:bg-white/20 transition-all">ยกเลิก</button>
            )}
            <button onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className={`px-8 py-3 rounded-2xl font-bold transition-all ${isEditing ? 'bg-white text-primary hover:scale-105' : 'bg-white/10 hover:bg-white/20'}`}>
              {isEditing ? 'บันทึกข้อมูล' : 'แก้ไขข้อมูล'}
            </button>
          </div>
        </div>

        <div className="p-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FIELDS.map(({ key, label, type = 'text' }) => (
              <div key={key} className="space-y-2">
                <label className="text-xs font-black uppercase opacity-40 ml-1 tracking-widest">{label}</label>
                <input disabled={!isEditing} type={type} value={userData[key]} onChange={e => set(key, e.target.value)}
                  className="w-full h-14 px-6 rounded-2xl bg-gray-50 dark:bg-white/5 border-none focus:ring-2 ring-primary/20 disabled:opacity-50 transition-all outline-none" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase opacity-40 ml-1 tracking-widest">ที่อยู่จัดส่ง</label>
            <textarea disabled={!isEditing} value={userData.address} rows={3} onChange={e => set('address', e.target.value)}
              className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border-none focus:ring-2 ring-primary/20 disabled:opacity-50 transition-all outline-none resize-none" />
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-500/10 px-6 py-3 rounded-xl transition-colors">
          <span className="material-symbols-outlined">logout</span>ออกจากระบบ
        </button>
      </div>
    </main>
  );
};

export default Profile;
import React, { useState, useEffect } from 'react';

const Profile: React.FC = () => {
  // --- 1. State สำหรับเก็บข้อมูลที่ดึงมาจากเครื่อง ---
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    nickname: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });

  // --- 2. ดึงข้อมูลจาก localStorage มาโชว์ตอนโหลดหน้าแรก ---
  useEffect(() => {
    setUserData({
      name: localStorage.getItem('userName') || '',
      nickname: localStorage.getItem('userNickname') || '',
      email: localStorage.getItem('userEmail') || '',
      phone: localStorage.getItem('userPhone') || '',
      address: localStorage.getItem('userAddress') || '',
      password: '••••••••' // เพื่อความปลอดภัยเราจะไม่ดึงรหัสจริงมาโชว์ในช่อง input
    });
  }, []);

  // --- 3. ฟังก์ชันบันทึกข้อมูลที่แก้ไข ---
  const handleSave = () => {
    localStorage.setItem('userName', userData.name);
    localStorage.setItem('userNickname', userData.nickname);
    localStorage.setItem('userEmail', userData.email);
    localStorage.setItem('userPhone', userData.phone);
    localStorage.setItem('userAddress', userData.address);
    
    // แจ้งเตือนและปิดโหมดแก้ไข
    alert('บันทึกข้อมูลเรียบร้อยแล้ว!');
    setIsEditing(false);
    window.dispatchEvent(new Event("storage")); // อัปเดตชื่อบน Navbar ทันที
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-white/5 rounded-[3rem] border border-[#e7f3ec] dark:border-[#1a3324] overflow-hidden shadow-xl">

      
        
        {/* Header สีเขียว Gradient */}
        <div className="bg-gradient-to-r from-primary to-[#1a3324] p-10 text-white flex justify-between items-end">
          <div>
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 border-4 border-white/30">
              <span className="material-symbols-outlined text-5xl">person</span>
            </div>
            <h1 className="text-3xl font-bold">คุณ {userData.nickname}</h1>
            <p className="opacity-70 text-sm">จัดการข้อมูลส่วนตัวและที่อยู่จัดส่งของคุณ</p>
          </div>
          
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={`px-8 py-3 rounded-2xl font-bold transition-all ${
              isEditing ? 'bg-accent text-primary hover:scale-105' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            {isEditing ? 'บันทึกข้อมูล' : 'แก้ไขข้อมูล'}
          </button>
        </div>

        {/* Form ข้อมูลส่วนตัว */}
        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* ช่องชื่อจริง */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase opacity-40 ml-1 tracking-widest">ชื่อ-นามสกุลจริง</label>
            <input 
              disabled={!isEditing}
              value={userData.name}
              onChange={(e) => setUserData({...userData, name: e.target.value})}
              className="w-full h-14 px-6 rounded-2xl bg-gray-50 dark:bg-white/5 border-none focus:ring-2 ring-primary/20 disabled:opacity-50 transition-all"
            />
          </div>

          {/* ช่องชื่อเล่น */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase opacity-40 ml-1 tracking-widest">ชื่อเล่น</label>
            <input 
              disabled={!isEditing}
              value={userData.nickname}
              onChange={(e) => setUserData({...userData, nickname: e.target.value})}
              className="w-full h-14 px-6 rounded-2xl bg-gray-50 dark:bg-white/5 border-none focus:ring-2 ring-primary/20 disabled:opacity-50 transition-all"
            />
          </div>

          {/* ช่องอีเมล */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase opacity-40 ml-1 tracking-widest">อีเมล</label>
            <input 
              disabled={!isEditing}
              value={userData.email}
              onChange={(e) => setUserData({...userData, email: e.target.value})}
              className="w-full h-14 px-6 rounded-2xl bg-gray-50 dark:bg-white/5 border-none focus:ring-2 ring-primary/20 disabled:opacity-50 transition-all"
            />
          </div>

          {/* ช่องเบอร์โทร */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase opacity-40 ml-1 tracking-widest">เบอร์โทรศัพท์</label>
            <input 
              disabled={!isEditing}
              value={userData.phone}
              onChange={(e) => setUserData({...userData, phone: e.target.value})}
              className="w-full h-14 px-6 rounded-2xl bg-gray-50 dark:bg-white/5 border-none focus:ring-2 ring-primary/20 disabled:opacity-50 transition-all"
            />
          </div>

        </div>
      </div>

      {/* ปุ่มออกจากระบบ */}
      <div className="mt-8 flex justify-center">
        <button 
          onClick={() => { localStorage.clear(); window.location.href = '/'; }}
          className="flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-500/10 px-6 py-3 rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined">logout</span> ออกจากระบบ
        </button>
      </div>
    </main>
  );
};

export default Profile;
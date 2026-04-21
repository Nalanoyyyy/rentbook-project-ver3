import React, { useState, useEffect, useCallback } from 'react';

// เก็บ list ของ bookId ที่ user ขอแจ้งเตือนไว้ใน localStorage key 'notifyList'

type Props = { bookId: string | number; isAvailable: boolean };

const NotifyMeButton: React.FC<Props> = ({ bookId, isAvailable }) => {
  const [notified, setNotified] = useState(false);
  const [toast,    setToast]    = useState('');

  const load = useCallback(() => {
    const list: string[] = JSON.parse(localStorage.getItem('notifyList') || '[]');
    setNotified(list.includes(String(bookId)));
  }, [bookId]);

  useEffect(() => { load(); }, [load]);

  // เมื่อหนังสือว่างแล้ว ให้แสดง toast แจ้งเตือน
  useEffect(() => {
    if (!isAvailable) return;
    const list: string[] = JSON.parse(localStorage.getItem('notifyList') || '[]');
    if (list.includes(String(bookId))) {
      setToast('หนังสือเล่มนี้พร้อมให้เช่าแล้ว!');
      // ลบออกจาก list หลังแจ้งแล้ว
      localStorage.setItem('notifyList', JSON.stringify(list.filter(id => id !== String(bookId))));
      setTimeout(() => setToast(''), 4000);
    }
  }, [isAvailable, bookId]);

  if (isAvailable) return null; // ไม่แสดงถ้าว่างแล้ว

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const list: string[] = JSON.parse(localStorage.getItem('notifyList') || '[]');
    const sid = String(bookId);
    if (list.includes(sid)) {
      localStorage.setItem('notifyList', JSON.stringify(list.filter(id => id !== sid)));
      setNotified(false);
      setToast('ยกเลิกการแจ้งเตือนแล้ว');
    } else {
      localStorage.setItem('notifyList', JSON.stringify([sid, ...list]));
      setNotified(true);
      setToast('จะแจ้งเตือนเมื่อหนังสือว่าง');
    }
    setTimeout(() => setToast(''), 2500);
  };

  return (
    <div className="relative">
      {toast && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl whitespace-nowrap shadow-lg animate-in fade-in duration-200">
          {toast}
        </div>
      )}
      <button onClick={handleToggle}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
          notified
            ? 'bg-primary text-white shadow-lg shadow-primary/20'
            : 'bg-gray-100 dark:bg-white/10 text-gray-500 hover:bg-primary/10 hover:text-primary'
        }`}>
        <span className="material-symbols-outlined text-[14px]">{notified ? 'notifications_active' : 'notification_add'}</span>
        {notified ? 'แจ้งเตือนแล้ว' : 'แจ้งเตือนเมื่อว่าง'}
      </button>
    </div>
  );
};

export default NotifyMeButton;
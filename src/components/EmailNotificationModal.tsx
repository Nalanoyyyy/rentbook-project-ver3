import React, { useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

type EmailData = {
  to:         string;
  orderId:    string;
  items:      { title: string; days: number }[];
  total:      number;
  returnDate: string;
};

// ── EmailModal ────────────────────────────────────────────────────────────────

const EmailNotificationModal: React.FC<{ data: EmailData; onClose: () => void }> = ({ data, onClose }) => {
  const [tab, setTab] = useState<'preview' | 'raw'>('preview');

  const rawText = `
เรียนคุณลูกค้า

ขอบคุณที่ใช้บริการ RentBook!
รหัสคำสั่งเช่า: ${data.orderId}

รายการหนังสือ:
${data.items.map(i => `- ${i.title} (${i.days / 7} สัปดาห์)`).join('\n')}

ยอดชำระ: ฿${data.total.toLocaleString()}
กำหนดคืน: ${data.returnDate}

ทีมงาน RentBook
  `.trim();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#0f1712] w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-green-50 dark:bg-green-900/20 p-6 border-b border-green-100 dark:border-green-700/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-500">mark_email_read</span>
            </div>
            <div>
              <p className="font-black text-green-700 dark:text-green-400">ส่งอีเมลยืนยันแล้ว!</p>
              <p className="text-xs text-green-600/70 dark:text-green-500/70">จำลองการส่ง — ไม่มีการส่งจริง</p>
            </div>
            <button onClick={onClose} className="ml-auto w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-white/10 hover:bg-red-500 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Meta */}
          <div className="bg-white dark:bg-black/20 rounded-xl p-3 space-y-1 text-xs">
            {[
              ['จาก',   'no-reply@rentbook.com'],
              ['ถึง',   data.to],
              ['หัวข้อ', `ยืนยันคำสั่งเช่า ${data.orderId}`],
            ].map(([l, v]) => (
              <div key={l} className="flex gap-2">
                <span className="text-gray-400 w-12 flex-shrink-0">{l}:</span>
                <span className="font-medium text-gray-700 dark:text-gray-200 truncate">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-white/10">
          {(['preview', 'raw'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-bold transition-colors ${tab === t ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}>
              {t === 'preview' ? 'ตัวอย่างอีเมล' : 'Plain Text'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {tab === 'preview' ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">เรียนคุณลูกค้า</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                ขอบคุณที่ใช้บริการ <span className="font-black text-primary">RentBook</span>! คำสั่งเช่าของคุณได้รับการยืนยันเรียบร้อยแล้ว
              </p>

              {/* Order summary box */}
              <div className="bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                <div className="bg-primary px-4 py-2">
                  <p className="text-white text-xs font-bold uppercase tracking-wider">สรุปคำสั่งเช่า · {data.orderId}</p>
                </div>
                <div className="p-4 space-y-2">
                  {data.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300 truncate flex-1 mr-4">{item.title}</span>
                      <span className="text-gray-400 whitespace-nowrap">{item.days / 7} สัปดาห์</span>
                    </div>
                  ))}
                  <div className="pt-2 mt-2 border-t border-gray-100 dark:border-white/10 flex justify-between font-black">
                    <span>ยอดชำระ</span>
                    <span className="text-primary">฿{data.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Return date */}
              <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-700/30 rounded-xl p-3">
                <span className="material-symbols-outlined text-red-500">event</span>
                <div>
                  <p className="text-xs font-bold text-red-500 uppercase">กำหนดคืนหนังสือ</p>
                  <p className="font-black text-sm text-red-600 dark:text-red-400">{data.returnDate}</p>
                </div>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                หากมีข้อสงสัย ติดต่อเราได้ที่ <span className="text-primary font-bold">support@rentbook.com / Line: @rentbookpage / เพจ: RentBook บริการเช่าหนังสือออนไลน์</span> หรือโทร <span className="font-bold">02-123-4567</span>
              </p>
              <p className="text-xs text-gray-400">ขอบคุณที่ใช้บริการ<br /><span className="font-bold text-gray-600 dark:text-gray-200">ทีมงาน RentBook</span></p>
            </div>
          ) : (
            <pre className="text-xs text-gray-500 dark:text-gray-400 whitespace-pre-wrap font-mono leading-relaxed bg-gray-50 dark:bg-black/20 p-4 rounded-xl">
              {rawText}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex justify-end gap-3">
          <button onClick={onClose}
            className="px-6 py-2 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 text-sm">
            รับทราบ
          </button>
        </div>

      </div>
    </div>
  );
};

export default EmailNotificationModal;
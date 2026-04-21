import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdmin, isAuthenticated } from '../../services/authService';
import { getCoupons, saveCoupons, type CouponWithMeta } from '../../services/couponService';
import AdminNav from './AdminNav';

// ── Types & constants ─────────────────────────────────────────────────────────

type FormState = Omit<CouponWithMeta, 'id' | 'isActive' | 'usageCount' | 'totalDiscount'>;

const EMPTY_FORM: FormState = { code: '', title: '', type: 'PERCENT', discountValue: 0, displayDiscount: '', minSpend: 0, expiry: '' };

const toDisplay = (type: string, val: number) => type === 'PERCENT' ? `${val}%` : `฿${val}`;

const inputCls = "w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

// ── Shared UI ─────────────────────────────────────────────────────────────────

const Field: React.FC<{ label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode }> =
  ({ label, required, error, hint, children }) => (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint  && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );

const ModalShell: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white dark:bg-[#0f1712] w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
      {children}
    </div>
  </div>
);

// ── CouponFormModal ───────────────────────────────────────────────────────────

const CouponFormModal: React.FC<{ coupon: CouponWithMeta | null; onClose: () => void; onSave: (d: FormState, id?: number) => void }> =
  ({ coupon, onClose, onSave }) => {
    const isEdit = coupon !== null;
    const [form, setForm] = useState<FormState>(
      isEdit ? { code: coupon.code, title: coupon.title, type: coupon.type, discountValue: coupon.discountValue, displayDiscount: coupon.displayDiscount, minSpend: coupon.minSpend, expiry: coupon.expiry }
             : EMPTY_FORM
    );
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

    // set + auto-update displayDiscount ในครั้งเดียว
    const set = (k: keyof FormState, v: any) =>
      setForm(p => {
        const next = { ...p, [k]: v };
        if ((k === 'type' || k === 'discountValue') && next.discountValue)
          next.displayDiscount = toDisplay(next.type, next.discountValue);
        return next;
      });

    const handleSubmit = () => {
      const e: typeof errors = {};
      if (!form.code.trim())       e.code          = 'กรุณากรอกรหัสคูปอง';
      if (!form.title.trim())      e.title         = 'กรุณากรอกชื่อคูปอง';
      if (form.discountValue <= 0) e.discountValue = 'ส่วนลดต้องมากกว่า 0';
      if (form.type === 'PERCENT' && form.discountValue > 100) e.discountValue = 'เปอร์เซ็นต์ต้องไม่เกิน 100';
      if (!form.expiry.trim())     e.expiry        = 'กรุณากรอกวันหมดอายุ';
      if (Object.keys(e).length) { setErrors(e); return; }
      onSave(form, coupon?.id);
    };

    return (
      <ModalShell onClose={onClose}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">{isEdit ? 'edit' : 'add_circle'}</span>
            {isEdit ? 'แก้ไขคูปอง' : 'เพิ่มคูปองใหม่'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-white/10 hover:bg-red-500 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <Field label="รหัสคูปอง" required error={errors.code} hint="ตัวพิมพ์ใหญ่ ไม่มีช่องว่าง">
              <input type="text" className={inputCls} placeholder="SUMMER20"
                value={form.code} onChange={e => set('code', e.target.value.toUpperCase().replace(/\s/g, ''))} />
            </Field>
            <Field label="ประเภทส่วนลด" required>
              <select className={inputCls} value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="PERCENT">เปอร์เซ็นต์ (%)</option>
                <option value="FIXED">ลดตายตัว (฿)</option>
              </select>
            </Field>
          </div>

          <Field label="ชื่อคูปอง" required error={errors.title}>
            <input type="text" className={inputCls} placeholder="ส่วนลดสมาชิกใหม่"
              value={form.title} onChange={e => set('title', e.target.value)} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label={`ส่วนลด (${form.type === 'PERCENT' ? '%' : '฿'})`} required error={errors.discountValue}>
              <input type="number" min={0} max={form.type === 'PERCENT' ? 100 : undefined} className={inputCls}
                placeholder="0" value={form.discountValue || ''}
                onChange={e => set('discountValue', Number(e.target.value))} />
            </Field>
            <Field label="ยอดขั้นต่ำ (฿)" hint="0 = ไม่กำหนด">
              <input type="number" min={0} className={inputCls} placeholder="0"
                value={form.minSpend || ''} onChange={e => set('minSpend', Number(e.target.value))} />
            </Field>
          </div>

          <Field label="วันหมดอายุ" required error={errors.expiry} hint='เช่น "31 ธ.ค. 2026"'>
            <input type="text" className={inputCls} placeholder="31 ธ.ค. 2026"
              value={form.expiry} onChange={e => set('expiry', e.target.value)} />
          </Field>

          {form.code && (
            <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">confirmation_number</span>
              <div>
                <p className="font-black text-sm">{form.code}</p>
                <p className="text-xs text-gray-500">
                  {form.title} — ลด {form.displayDiscount || '...'}
                  {form.minSpend > 0 ? ` (ขั้นต่ำ ฿${form.minSpend.toLocaleString()})` : ''}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 rounded-xl font-bold border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm">ยกเลิก</button>
          <button onClick={handleSubmit} className="px-6 py-2 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 text-sm">
            {isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มคูปอง'}
          </button>
        </div>
      </ModalShell>
    );
  };

// ── DeleteConfirmModal ────────────────────────────────────────────────────────

const DeleteConfirmModal: React.FC<{ coupon: CouponWithMeta; onClose: () => void; onConfirm: () => void }> =
  ({ coupon, onClose, onConfirm }) => (
    <ModalShell onClose={onClose}>
      <div className="p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-red-500 text-3xl">delete_forever</span>
        </div>
        <h3 className="text-xl font-black mb-2">ยืนยันการลบ?</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          จะลบคูปอง <span className="font-black text-gray-800 dark:text-white">{coupon.code}</span> ออกจากระบบ<br />
          การกระทำนี้ไม่สามารถย้อนกลับได้
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="px-6 py-2 rounded-xl font-bold border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">ยกเลิก</button>
          <button onClick={onConfirm} className="px-6 py-2 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">ลบคูปอง</button>
        </div>
      </div>
    </ModalShell>
  );

// ── AdminCoupons ──────────────────────────────────────────────────────────────

const AdminCoupons: React.FC = () => {
  const navigate = useNavigate();
  const [coupons,      setCoupons]      = useState<CouponWithMeta[]>([]);
  const [formTarget,   setFormTarget]   = useState<CouponWithMeta | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CouponWithMeta | null>(null);
  const [toast,        setToast]        = useState<string | null>(null);

  const load = useCallback(() => setCoupons(getCoupons()), []);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) { navigate('/'); return; }
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, [navigate, load]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const save = (list: CouponWithMeta[]) => { saveCoupons(list); setCoupons(list); };

  const handleSave = useCallback((data: FormState, id?: number) => {
    save(id !== undefined
      ? coupons.map(c => c.id === id ? { ...c, ...data } : c)
      : [...coupons, { id: Date.now(), ...data, isActive: true, usageCount: 0, totalDiscount: 0 }]
    );
    showToast(id !== undefined ? 'แก้ไขคูปองเรียบร้อยแล้ว' : 'เพิ่มคูปองใหม่เรียบร้อยแล้ว');
    setFormTarget(null);
  }, [coupons]);

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    save(coupons.filter(c => c.id !== deleteTarget.id));
    showToast(`ลบคูปอง ${deleteTarget.code} เรียบร้อยแล้ว`);
    setDeleteTarget(null);
  }, [coupons, deleteTarget]);

  const toggleActive = useCallback((id: number) =>
    save(coupons.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c))
  , [coupons]);

  const STATS = [
    { label: 'คูปองทั้งหมด', value: coupons.length,                                                                    icon: 'confirmation_number', color: 'text-blue-500',   bg: 'bg-blue-100 dark:bg-blue-900/30'    },
    { label: 'ใช้งานได้',    value: coupons.filter(c => c.isActive).length,                                             icon: 'check_circle',        color: 'text-green-500',  bg: 'bg-green-100 dark:bg-green-900/30'  },
    { label: 'ปิด/หมดอายุ', value: coupons.filter(c => !c.isActive).length,                                            icon: 'cancel',              color: 'text-red-500',    bg: 'bg-red-100 dark:bg-red-900/30'      },
    { label: 'ส่วนลดรวม',   value: `฿${coupons.reduce((s,c) => s + c.totalDiscount, 0).toLocaleString()}`,             icon: 'savings',             color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  ];

  const typeCls = (t: string) => t === 'PERCENT'
    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';

  return (
    <main className="max-w-6xl mx-auto px-4 py-12 min-h-[80vh]">
      {toast && (
        <div className="fixed top-6 right-6 z-[200] bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <span className="material-symbols-outlined text-green-400 dark:text-green-600 text-[18px]">check_circle</span>{toast}
        </div>
      )}

      <h1 className="text-3xl font-black mb-2">ระบบจัดการร้าน (Admin)</h1>
      <AdminNav />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {STATS.map(s => (
          <div key={s.label} className="bg-white dark:bg-[#1a3324] p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
              <span className={`material-symbols-outlined text-xl ${s.color}`}>{s.icon}</span>
            </div>
            <div><p className="text-lg font-black">{s.value}</p><p className="text-[11px] text-gray-500">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1a3324] rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 dark:border-white/5">
        <div className="p-5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
          <h2 className="font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">confirmation_number</span>คูปองทั้งหมด
          </h2>
          <button onClick={() => setFormTarget('new')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 text-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>เพิ่มคูปอง
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-black/20 text-xs uppercase tracking-widest text-gray-500">
                {['รหัส / ชื่อ', 'ส่วนลด', 'ขั้นต่ำ', 'หมดอายุ', 'ใช้ไป', 'สถานะ', 'จัดการ'].map((h, i) => (
                  <th key={h} className={`p-4 font-bold ${i >= 2 && i <= 5 ? 'text-center' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center text-gray-400">
                  <span className="material-symbols-outlined text-4xl mb-2 block">confirmation_number</span>ยังไม่มีคูปองในระบบ
                </td></tr>
              ) : coupons.map(c => (
                <tr key={c.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4"><p className="font-black text-sm tracking-wider">{c.code}</p><p className="text-xs text-gray-400">{c.title}</p></td>
                  <td className="p-4"><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${typeCls(c.type)}`}>{c.displayDiscount}</span></td>
                  <td className="p-4 text-center text-sm text-gray-500">{c.minSpend > 0 ? `฿${c.minSpend.toLocaleString()}` : '-'}</td>
                  <td className="p-4 text-center text-sm text-gray-500">{c.expiry}</td>
                  <td className="p-4 text-center"><p className="font-bold text-sm">{c.usageCount} ครั้ง</p><p className="text-xs text-gray-400">฿{c.totalDiscount.toLocaleString()}</p></td>
                  <td className="p-4 text-center">
                    <button onClick={() => toggleActive(c.id)} className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                      c.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 dark:bg-white/10 text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20'
                    }`}>{c.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setFormTarget(c)} className="text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors">แก้ไข</button>
                      <button onClick={() => setDeleteTarget(c)} className="text-xs font-bold bg-red-50 dark:bg-red-900/20 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-colors">ลบ</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {formTarget !== null && <CouponFormModal coupon={formTarget === 'new' ? null : formTarget} onClose={() => setFormTarget(null)} onSave={handleSave} />}
      {deleteTarget && <DeleteConfirmModal coupon={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />}
    </main>
  );
};

export default AdminCoupons;
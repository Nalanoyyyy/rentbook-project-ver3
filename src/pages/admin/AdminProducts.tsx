import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdmin, isAuthenticated } from '../../services/authService';
import { getInventory, saveInventory } from '../../services/inventoryService';
import AdminNav from './AdminNav';

// ── Types & constants ─────────────────────────────────────────────────────────

export type Book = {
  id: number | string; title: string; author: string; category: string;
  price: number; stock: number; image: string; isAvailable: boolean; status?: string;
};

type FormState = Omit<Book, 'id' | 'isAvailable' | 'status'>;

const CATEGORIES = ['นิยาย', 'การ์ตูน', 'วิทยาศาสตร์', 'ประวัติศาสตร์', 'ธุรกิจ', 'จิตวิทยา', 'อื่นๆ'];
const EMPTY_FORM: FormState = { title: '', author: '', category: CATEGORIES[0], price: 0, stock: 1, image: '' };

const inputCls = "w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

const applyAvail = (b: Omit<Book, 'isAvailable' | 'status'>): Book => ({
  ...b, isAvailable: b.stock > 0, status: b.stock > 0 ? 'พร้อมให้เช่า' : 'ไม่ว่าง',
});

// ── Shared UI ─────────────────────────────────────────────────────────────────

const Field: React.FC<{ label: string; required?: boolean; error?: string; children: React.ReactNode }> =
  ({ label, required, error, children }) => (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );

const ModalShell: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white dark:bg-[#0f1712] w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
      {children}
    </div>
  </div>
);

const ModalHeader: React.FC<{ icon: string; title: string; onClose: () => void }> = ({ icon, title, onClose }) => (
  <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
    <h3 className="text-xl font-bold flex items-center gap-2">
      <span className="material-symbols-outlined text-primary">{icon}</span>{title}
    </h3>
    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-white/10 hover:bg-red-500 hover:text-white transition-colors">
      <span className="material-symbols-outlined text-[20px]">close</span>
    </button>
  </div>
);

// shared footer for all modals
const ModalFooter: React.FC<{ onClose: () => void; onConfirm: () => void; confirmLabel: string; danger?: boolean }> =
  ({ onClose, onConfirm, confirmLabel, danger }) => (
    <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex justify-end gap-3">
      <button onClick={onClose} className="px-5 py-2 rounded-xl font-bold border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm">ยกเลิก</button>
      <button onClick={onConfirm} className={`px-6 py-2 rounded-xl font-bold text-white transition-colors shadow-lg text-sm ${danger ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-primary hover:bg-primary/90 shadow-primary/20'}`}>
        {confirmLabel}
      </button>
    </div>
  );

// ── BookFormModal ─────────────────────────────────────────────────────────────

const BookFormModal: React.FC<{ book: Book | null; onClose: () => void; onSave: (d: FormState, id?: string) => void }> =
  ({ book, onClose, onSave }) => {
    const isEdit = book !== null;
    const [form, setForm] = useState<FormState>(
      isEdit ? { title: book.title, author: book.author, category: book.category, price: book.price, stock: book.stock, image: book.image } : EMPTY_FORM
    );
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
    const [previewError, setPreviewError] = useState(false);
    const set = (k: keyof FormState, v: string | number) => setForm(p => ({ ...p, [k]: v }));

    const handleSubmit = () => {
      const e: typeof errors = {};
      if (!form.title.trim())  e.title  = 'กรุณากรอกชื่อหนังสือ';
      if (!form.author.trim()) e.author = 'กรุณากรอกชื่อผู้แต่ง';
      if (form.price <= 0)     e.price  = 'ราคาต้องมากกว่า 0';
      if (form.stock < 0)      e.stock  = 'จำนวนสต็อกต้องไม่ติดลบ';
      if (Object.keys(e).length) { setErrors(e); return; }
      onSave(form, book?.id?.toString());
    };

    return (
      <ModalShell onClose={onClose}>
        <ModalHeader icon={isEdit ? 'edit' : 'add_circle'} title={isEdit ? 'แก้ไขหนังสือ' : 'เพิ่มหนังสือใหม่'} onClose={onClose} />
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-5">
          <div className="flex gap-4 items-start">
            <div className="w-20 h-28 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
              {form.image && !previewError
                ? <img src={form.image} alt="preview" className="w-full h-full object-cover" onError={() => setPreviewError(true)} />
                : <span className="material-symbols-outlined text-gray-300 text-3xl">image</span>}
            </div>
            <Field label="URL รูปภาพปก">
              <input type="url" className={inputCls} placeholder="https://..." value={form.image}
                onChange={e => { set('image', e.target.value); setPreviewError(false); }} />
              <p className="text-xs text-gray-400 mt-1">วางลิงก์รูปภาพ จะแสดง preview ทางซ้าย</p>
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['title', 'author'] as const).map(k => (
              <Field key={k} label={k === 'title' ? 'ชื่อหนังสือ' : 'ผู้แต่ง'} required error={errors[k]}>
                <input type="text" className={inputCls} placeholder={k === 'title' ? 'ชื่อหนังสือ' : 'ชื่อผู้แต่ง'}
                  value={String(form[k])} onChange={e => set(k, e.target.value)} />
              </Field>
            ))}
          </div>
          <Field label="หมวดหมู่" required>
            <select className={inputCls} value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            {([['price', 'ราคาเช่า (฿ / สัปดาห์)', 0], ['stock', 'จำนวนสต็อก', 0]] as const).map(([k, label, min]) => (
              <Field key={k} label={label} required error={errors[k]}>
                <input type="number" min={min} className={inputCls} placeholder="0"
                  value={form[k] || ''} onChange={e => set(k, Number(e.target.value))} />
              </Field>
            ))}
          </div>
        </div>
        <ModalFooter onClose={onClose} onConfirm={handleSubmit} confirmLabel={isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มหนังสือ'} />
      </ModalShell>
    );
  };

// ── DeleteConfirmModal ────────────────────────────────────────────────────────

const DeleteConfirmModal: React.FC<{ book: Book; onClose: () => void; onConfirm: () => void }> =
  ({ book, onClose, onConfirm }) => (
    <ModalShell onClose={onClose}>
      <div className="p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-red-500 text-3xl">delete_forever</span>
        </div>
        <h3 className="text-xl font-black mb-2">ยืนยันการลบ?</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          จะลบ <span className="font-bold text-gray-800 dark:text-white">"{book.title}"</span> ออกจากระบบ<br />
          การกระทำนี้ไม่สามารถย้อนกลับได้
        </p>
      </div>
      <ModalFooter onClose={onClose} onConfirm={onConfirm} confirmLabel="ลบหนังสือ" danger />
    </ModalShell>
  );

// ── AdminProducts ─────────────────────────────────────────────────────────────

const AdminProducts: React.FC = () => {
  const navigate = useNavigate();
  const [books,        setBooks]        = useState<Book[]>([]);
  const [search,       setSearch]       = useState('');
  const [filterCat,    setFilterCat]    = useState('ทั้งหมด');
  const [formTarget,   setFormTarget]   = useState<Book | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [toast,        setToast]        = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) { navigate('/'); return; }
    setBooks(getInventory() as Book[]);
  }, [navigate]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const save = useCallback((list: Book[]) => { saveInventory(list); setBooks(list); }, []);

  const handleSave = useCallback((data: FormState, id?: string) => {
    save(id
      ? books.map(b => String(b.id) === String(id) ? applyAvail({ ...b, ...data }) : b)
      : [applyAvail({ id: `book_${Date.now()}`, ...data }), ...books]
    );
    showToast(id ? 'แก้ไขหนังสือเรียบร้อยแล้ว' : 'เพิ่มหนังสือใหม่เรียบร้อยแล้ว');
    setFormTarget(null);
  }, [books, save]);

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    save(books.filter(b => b.id !== deleteTarget.id));
    showToast(`ลบ "${deleteTarget.title}" เรียบร้อยแล้ว`);
    setDeleteTarget(null);
  }, [books, deleteTarget, save]);

  const filtered = books.filter(b =>
    (b.title + b.author).toLowerCase().includes(search.toLowerCase()) &&
    (filterCat === 'ทั้งหมด' || b.category === filterCat)
  );

  const availCount = books.filter(b => b.isAvailable).length;
  const STATS = [
    { label: 'หนังสือทั้งหมด', value: books.length,              icon: 'library_books' },
    { label: 'พร้อมให้เช่า',   value: availCount,                icon: 'check_circle'  },
    { label: 'ไม่ว่าง',        value: books.length - availCount, icon: 'cancel'        },
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 py-12 min-h-[80vh]">
      {toast && (
        <div className="fixed top-6 right-6 z-[200] bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <span className="material-symbols-outlined text-green-400 dark:text-green-600 text-[18px]">check_circle</span>{toast}
        </div>
      )}

      <h1 className="text-3xl font-black mb-2">ระบบจัดการร้าน (Admin)</h1>
      <AdminNav />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
          <input type="text" placeholder="ค้นหาชื่อหนังสือ หรือผู้แต่ง..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="ทั้งหมด">ทุกหมวดหมู่</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={() => setFormTarget('new')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 text-sm whitespace-nowrap">
          <span className="material-symbols-outlined text-[18px]">add</span>เพิ่มหนังสือ
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {STATS.map(s => (
          <div key={s.label} className="bg-white dark:bg-[#1a3324] rounded-2xl border border-gray-100 dark:border-white/5 p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">{s.icon}</span>
            <div><p className="text-2xl font-black">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1a3324] rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 dark:border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-black/20 text-xs uppercase tracking-widest text-gray-500">
                {['หนังสือ', 'หมวดหมู่', 'ราคา', 'สต็อก', 'สถานะ', 'จัดการ'].map((h, i) => (
                  <th key={h} className={`p-4 font-bold ${i === 2 ? 'text-right' : i >= 3 ? 'text-center' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-gray-400">
                  <span className="material-symbols-outlined text-4xl mb-2 block">search_off</span>
                  {search || filterCat !== 'ทั้งหมด' ? 'ไม่พบหนังสือที่ค้นหา' : 'ยังไม่มีหนังสือในระบบ'}
                </td></tr>
              ) : filtered.map(book => (
                <tr key={book.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-white/5 flex-shrink-0 flex items-center justify-center">
                        {book.image ? <img src={book.image} alt={book.title} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-gray-300 text-lg">image</span>}
                      </div>
                      <div><p className="font-bold text-sm">{book.title}</p><p className="text-xs text-gray-400">{book.author}</p></div>
                    </div>
                  </td>
                  <td className="p-4"><span className="text-xs font-medium bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full">{book.category}</span></td>
                  <td className="p-4 text-right font-bold">฿{book.price.toLocaleString()}</td>
                  <td className={`p-4 text-center font-bold text-sm ${book.stock === 0 ? 'text-red-500' : book.stock <= 2 ? 'text-yellow-500' : 'text-gray-700 dark:text-gray-200'}`}>{book.stock}</td>
                  <td className="p-4 text-center">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${book.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {book.isAvailable ? 'พร้อมให้เช่า' : 'ไม่ว่าง'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setFormTarget(book)} className="text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors">แก้ไข</button>
                      <button onClick={() => setDeleteTarget(book)} className="text-xs font-bold bg-red-50 dark:bg-red-900/20 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-colors">ลบ</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {formTarget !== null && <BookFormModal book={formTarget === 'new' ? null : formTarget} onClose={() => setFormTarget(null)} onSave={handleSave} />}
      {deleteTarget && <DeleteConfirmModal book={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />}
    </main>
  );
};

export default AdminProducts;
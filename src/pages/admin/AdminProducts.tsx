import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdmin, isAuthenticated } from '../../services/authService';
import { apiGetBooks, apiCreateBook, apiUpdateBook, apiDeleteBook } from '../../services/api';
import { supabase } from '../../services/supabase';
import AdminNav from './AdminNav';

type Book = { id: number; title: string; author: string; category: string; price: number; stock: number; image: string; isAvailable: boolean; status?: string };
type FormState = Omit<Book, 'id' | 'isAvailable' | 'status'>;

const CATEGORIES = ['นิยาย','การ์ตูน','ภาษา','ประวัติศาสตร์','วิทยาศาสตร์','ธุรกิจ','อาหาร','จิตวิทยา','สยองขวัญ','แฟนตาซี','โรแมนติก','วรรณกรรมเยาวชน','ผจญภัย','แอคชั่น','ดราม่า','สืบสวน','มังงะ','ไซไฟ'];
const EMPTY_FORM: FormState = { title: '', author: '', category: '', price: 0, stock: 1, image: '' };
const inputCls = "w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

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
    <div className="relative bg-white dark:bg-[#0f1712] w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">{children}</div>
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

const ModalFooter: React.FC<{ onClose: () => void; onConfirm: () => void; confirmLabel: string; danger?: boolean; disabled?: boolean }> =
  ({ onClose, onConfirm, confirmLabel, danger, disabled }) => (
    <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex justify-end gap-3">
      <button onClick={onClose} className="px-5 py-2 rounded-xl font-bold border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm">ยกเลิก</button>
      <button onClick={onConfirm} disabled={disabled}
        className={`px-6 py-2 rounded-xl font-bold text-white transition-colors shadow-lg text-sm disabled:opacity-50 disabled:pointer-events-none ${danger ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-primary hover:bg-primary/90 shadow-primary/20'}`}>
        {confirmLabel}
      </button>
    </div>
  );

// ── BookFormModal ─────────────────────────────────────────────────────────────

const BookFormModal: React.FC<{ book: Book | null; onClose: () => void; onSave: (d: FormState, id?: number) => void }> =
  ({ book, onClose, onSave }) => {
    const isEdit = book !== null;
    const [form,         setForm]         = useState<FormState>(isEdit ? { title: book.title, author: book.author, category: book.category, price: book.price, stock: book.stock, image: book.image } : EMPTY_FORM);
    const [errors,       setErrors]       = useState<Partial<Record<keyof FormState, string>>>({});
    const [previewError, setPreviewError] = useState(false);
    const [uploading,    setUploading]    = useState(false);

    const set = (k: keyof FormState, v: string | number) => setForm(p => ({ ...p, [k]: v }));

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const ext      = file.name.split('.').pop();
        const filename = `${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('book-images').upload(filename, file);
        if (error) throw error;
        const { data } = supabase.storage.from('book-images').getPublicUrl(filename);
        set('image', data.publicUrl);
        setPreviewError(false);
      } catch (err: any) {
        alert('อัปโหลดไม่สำเร็จ: ' + err.message);
      } finally { setUploading(false); }
    };

    const handleSubmit = () => {
      const e: typeof errors = {};
      if (!form.title.trim())        e.title  = 'กรุณากรอกชื่อหนังสือ';
      if (!form.author.trim())       e.author = 'กรุณากรอกชื่อผู้แต่ง';
      if (!form.category.trim())     e.category = 'กรุณาเลือกหมวดหมู่อย่างน้อย 1 หมวด';
      if (form.price <= 0)           e.price  = 'ราคาต้องมากกว่า 0';
      if (form.stock < 0)            e.stock  = 'จำนวนสต็อกต้องไม่ติดลบ';
      if (Object.keys(e).length) { setErrors(e); return; }
      onSave(form, book?.id);
    };

    return (
      <ModalShell onClose={onClose}>
        <ModalHeader icon={isEdit ? 'edit' : 'add_circle'} title={isEdit ? 'แก้ไขหนังสือ' : 'เพิ่มหนังสือใหม่'} onClose={onClose} />
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-5">

          {/* รูปภาพ */}
          <div className="flex gap-4 items-start">
            <div className="w-20 h-28 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
              {form.image && !previewError
                ? <img src={form.image} alt="preview" className="w-full h-full object-cover" onError={() => setPreviewError(true)} />
                : <span className="material-symbols-outlined text-gray-300 text-3xl">image</span>}
            </div>
            <div className="flex-1 space-y-3">
              <Field label="URL รูปภาพปก">
                <input type="url" className={inputCls} placeholder="https://..." value={form.image}
                  onChange={e => { set('image', e.target.value); setPreviewError(false); }} />
                <p className="text-xs text-gray-400 mt-1">วางลิงก์รูปภาพ หรืออัปโหลดไฟล์</p>
              </Field>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">อัปโหลดไฟล์ PNG / JPG</p>
                <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed cursor-pointer transition-colors text-sm ${
                  uploading
                    ? 'opacity-50 pointer-events-none border-gray-200 text-gray-400'
                    : 'border-gray-300 dark:border-white/20 text-gray-500 hover:border-primary/50 hover:text-primary'
                }`}>
                  <span className="material-symbols-outlined text-[18px]">{uploading ? 'hourglass_empty' : 'upload_file'}</span>
                  {uploading ? 'กำลังอัปโหลด...' : 'เลือกไฟล์รูปภาพ'}
                  <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden"
                    onChange={handleFileUpload} disabled={uploading} />
                </label>
              </div>
            </div>
          </div>

          {/* ชื่อ + ผู้แต่ง */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['title', 'author'] as const).map(k => (
              <Field key={k} label={k === 'title' ? 'ชื่อหนังสือ' : 'ผู้แต่ง'} required error={errors[k]}>
                <input type="text" className={inputCls}
                  placeholder={k === 'title' ? 'ชื่อหนังสือ' : 'ชื่อผู้แต่ง'}
                  value={String(form[k])} onChange={e => set(k, e.target.value)} />
              </Field>
            ))}
          </div>

          {/* หมวดหมู่ */}
          <Field label="หมวดหมู่" required error={errors.category}>
            <div className="flex flex-wrap gap-2 mt-1">
              {CATEGORIES.map(c => (
                <label key={c} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border cursor-pointer text-sm font-medium transition-all ${
                  form.category.split(',').map((s: string) => s.trim()).includes(c)
                    ? 'bg-primary text-white border-primary'
                    : 'border-gray-200 dark:border-white/10 hover:border-primary/50'
                }`}>
                  <input type="checkbox" className="hidden"
                    checked={form.category.split(',').map((s: string) => s.trim()).includes(c)}
                    onChange={e => {
                      const list = form.category ? form.category.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
                      const next = e.target.checked ? [...list, c] : list.filter((x: string) => x !== c);
                      set('category', next.join(', '));
                    }} />
                  {c}
                </label>
              ))}
            </div>
          </Field>

          {/* ราคา + สต็อก */}
          <div className="grid grid-cols-2 gap-4">
            {([['price', 'ราคาเช่า (฿ / สัปดาห์)', 0], ['stock', 'จำนวนสต็อก', 0]] as const).map(([k, label, min]) => (
              <Field key={k} label={label} required error={errors[k]}>
                <input type="number" min={min} className={inputCls} placeholder="0"
                  value={form[k] || ''} onChange={e => set(k, Number(e.target.value))} />
              </Field>
            ))}
          </div>

        </div>
        <ModalFooter onClose={onClose} onConfirm={handleSubmit}
          confirmLabel={isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มหนังสือ'}
          disabled={uploading} />
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

  const load = useCallback(async () => {
    try { setBooks(await apiGetBooks()); }
    catch { navigate('/'); }
  }, [navigate]);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) { navigate('/'); return; }
    load();
  }, [navigate, load]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleSave = useCallback(async (data: FormState, id?: number) => {
    try {
      if (id) await apiUpdateBook(id, data);
      else    await apiCreateBook(data);
      await load();
      showToast(id ? 'แก้ไขหนังสือเรียบร้อยแล้ว' : 'เพิ่มหนังสือใหม่เรียบร้อยแล้ว');
      setFormTarget(null);
    } catch (err: any) { showToast(err.message || 'เกิดข้อผิดพลาด'); }
  }, [load]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await apiDeleteBook(deleteTarget.id);
      await load();
      showToast(`ลบ "${deleteTarget.title}" เรียบร้อยแล้ว`);
      setDeleteTarget(null);
    } catch (err: any) { showToast(err.message || 'เกิดข้อผิดพลาด'); }
  }, [deleteTarget, load]);

  const filtered   = books.filter(b => (b.title + b.author).toLowerCase().includes(search.toLowerCase()) && (filterCat === 'ทั้งหมด' || b.category.includes(filterCat)));
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

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
          <input type="text" placeholder="ค้นหาชื่อหนังสือ หรือผู้แต่ง..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm focus:outline-none transition-all"
          value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="ทั้งหมด">ทุกหมวดหมู่</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={() => setFormTarget('new')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 text-sm whitespace-nowrap">
          <span className="material-symbols-outlined text-[18px]">add</span>เพิ่มหนังสือ
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {STATS.map(s => (
          <div key={s.label} className="bg-white dark:bg-[#1a3324] rounded-2xl border border-gray-100 dark:border-white/5 p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">{s.icon}</span>
            <div><p className="text-2xl font-black">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#1a3324] rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 dark:border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-black/20 text-xs uppercase tracking-widest text-gray-500">
                {['หนังสือ','หมวดหมู่','ราคา','สต็อก','สถานะ','จัดการ'].map((h, i) => (
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
                        {book.image
                          ? <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
                          : <span className="material-symbols-outlined text-gray-300 text-lg">image</span>}
                      </div>
                      <div><p className="font-bold text-sm">{book.title}</p><p className="text-xs text-gray-400">{book.author}</p></div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {book.category.split(',').map((c: string) => (
                        <span key={c} className="text-xs font-medium bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">{c.trim()}</span>
                      ))}
                    </div>
                  </td>
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
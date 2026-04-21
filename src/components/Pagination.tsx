import React from 'react';

type Props = {
  currentPage: number;
  totalPages:  number;
  onChange:    (page: number) => void;
};

const Pagination: React.FC<Props> = ({ currentPage, totalPages, onChange }) => {
  if (totalPages <= 1) return null;

  // แสดงเลขหน้า: เสมอมี first/last + หน้าปัจจุบัน ± 1
  const pages: (number | '...')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  const btnCls = (active: boolean, disabled?: boolean) =>
    `w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
      disabled ? 'opacity-30 cursor-not-allowed' :
      active   ? 'bg-primary text-white shadow-lg shadow-primary/20' :
                 'hover:bg-primary/10 hover:text-primary text-gray-500 dark:text-gray-400'
    }`;

  return (
    <div className="flex items-center justify-center gap-1 mt-10">
      {/* Prev */}
      <button onClick={() => onChange(currentPage - 1)} disabled={currentPage === 1}
        className={btnCls(false, currentPage === 1)}>
        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
      </button>

      {/* Pages */}
      {pages.map((p, i) =>
        p === '...'
          ? <span key={`dot-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>
          : <button key={p} onClick={() => onChange(p)} className={btnCls(p === currentPage)}>{p}</button>
      )}

      {/* Next */}
      <button onClick={() => onChange(currentPage + 1)} disabled={currentPage === totalPages}
        className={btnCls(false, currentPage === totalPages)}>
        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
      </button>
    </div>
  );
};

export default Pagination;
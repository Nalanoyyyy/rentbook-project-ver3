import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV = [
  { path: '/admin/dashboard', label: 'แดชบอร์ด'      },
  { path: '/admin/orders',    label: 'จัดการออเดอร์'  },
  { path: '/admin/returns',   label: 'รับคืนหนังสือ'  },
  { path: '/admin/inventory', label: 'จัดการสต็อก'    },
  { path: '/admin/products',  label: 'จัดการหนังสือ'  },
  { path: '/admin/coupons',   label: 'จัดการคูปอง'    },
  { path: '/admin/customers', label: 'จัดการลูกค้า' },
];

type Props = { pendingReturns?: number };

const AdminNav: React.FC<Props> = ({ pendingReturns = 0 }) => {
  const { pathname } = useLocation();
  return (
    <div className="flex flex-wrap gap-6 md:gap-8 mb-8 border-b border-gray-200 dark:border-white/10">
      {NAV.map(({ path, label }) => (
        <Link key={path} to={path} className={`pb-4 text-sm font-bold transition-all border-b-2 tracking-wide flex items-center gap-1.5 ${
          pathname === path
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
        }`}>
          {label}
          {path === '/admin/returns' && pendingReturns > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
              {pendingReturns}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
};

export default AdminNav;
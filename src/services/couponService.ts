import { availableCoupons, type Coupon } from '../data/allBooks';

export type CouponWithMeta = Coupon & {
  isActive: boolean;
  usageCount: number;
  totalDiscount: number;
};

const KEY = 'couponsData';

const withMeta = (c: Coupon): CouponWithMeta => ({ ...c, isActive: true, usageCount: 0, totalDiscount: 0 });

export const getCoupons = (): CouponWithMeta[] => {
  try {
    const saved = localStorage.getItem(KEY);
    return saved ? JSON.parse(saved) : availableCoupons.map(withMeta);
  } catch { return []; }
};

export const saveCoupons = (coupons: CouponWithMeta[]) => {
  localStorage.setItem(KEY, JSON.stringify(coupons));
  window.dispatchEvent(new Event('storage'));
};
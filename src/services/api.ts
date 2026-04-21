// src/services/api.ts
// แทนที่การใช้ localStorage ด้วย fetch เรียก backend

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => sessionStorage.getItem('token') || '';

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`,
});

// ── helper ────────────────────────────────────────────────────────────────────

const req = async (method: string, path: string, body?: any) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด');
  return data;
};

// ── Auth ──────────────────────────────────────────────────────────────────────

export const apiLogin = (email: string, password: string) =>
  req('POST', '/auth/login', { email, password });

export const apiRegister = (data: { email: string; password: string; fullName: string; nickname?: string; phone?: string; address?: string }) =>
  req('POST', '/auth/register', data);

export const apiForgotPassword = (email: string) =>
  req('POST', '/auth/forgot-password', { email });

export const apiResetPassword = (email: string, newPassword: string) =>
  req('POST', '/auth/reset-password', { email, newPassword });

// ── Books ─────────────────────────────────────────────────────────────────────

export const apiGetBooks   = ()     => req('GET',    '/books');
export const apiGetBook    = (id: string | number) => req('GET', `/books/${id}`);
export const apiCreateBook = (data: any) => req('POST',   '/books', data);
export const apiUpdateBook = (id: string | number, data: any) => req('PUT', `/books/${id}`, data);
export const apiDeleteBook = (id: string | number) => req('DELETE', `/books/${id}`);
export const apiAddReview  = (bookId: string | number, data: { rating: number; comment: string; name: string }) =>
  req('POST', `/books/${bookId}/reviews`, data);

// ── Orders ────────────────────────────────────────────────────────────────────

export const apiGetOrders      = ()     => req('GET',  '/orders');
export const apiCreateOrder    = (data: any) => req('POST', '/orders', data);
export const apiUpdateOrderStatus = (id: string, status: string) =>
  req('PUT', `/orders/${id}/status`, { status });

// ── Coupons ───────────────────────────────────────────────────────────────────

export const apiGetCoupons    = ()     => req('GET',    '/coupons');
export const apiGetAllCoupons = ()     => req('GET',    '/coupons/all');
export const apiVerifyCoupon  = (code: string, subtotal: number) =>
  req('POST', '/coupons/verify', { code, subtotal });
export const apiCreateCoupon  = (data: any) => req('POST',   '/coupons', data);
export const apiUpdateCoupon  = (id: number, data: any) => req('PUT', `/coupons/${id}`, data);
export const apiDeleteCoupon  = (id: number) => req('DELETE', `/coupons/${id}`);

// ── Users ─────────────────────────────────────────────────────────────────────

export const apiGetMe         = ()     => req('GET',  '/users/me');
export const apiUpdateMe      = (data: any) => req('PUT', '/users/me', data);
export const apiChangePassword = (newPassword: string) =>
  req('PUT', '/users/me/password', { newPassword });
export const apiGetUsers      = ()     => req('GET',  '/users');
export const apiBlacklistUser = (id: number, isBlacklisted: boolean, reason?: string) =>
  req('PUT', `/users/${id}/blacklist`, { isBlacklisted, reason });

// ── Wishlist ──────────────────────────────────────────────────────────────────

export const apiGetWishlist    = ()     => req('GET',    '/users/me/wishlist');
export const apiAddWishlist    = (bookId: string | number) => req('POST',   `/users/me/wishlist/${bookId}`);
export const apiRemoveWishlist = (bookId: string | number) => req('DELETE',  `/users/me/wishlist/${bookId}`);
// src/services/authService.ts
// ใช้ sessionStorage สำหรับ session — แยกต่อ tab ทำให้ Admin/User เปิดพร้อมกันได้

export const SESSION_KEYS = [
  'isLoggedIn', 'isAuthenticated', 'userRole',
  'userEmail',  'userName',        'userNickname',
  'userPhone',  'userAddress',
];

const ss = sessionStorage; // shorthand

export const login = (email: string, role: 'admin' | 'user') => {
  ss.setItem('isLoggedIn',      'true');
  ss.setItem('isAuthenticated', 'true');
  ss.setItem('userRole',        role);
  ss.setItem('userEmail',       email);
};

export const logout = () => {
  SESSION_KEYS.forEach(k => ss.removeItem(k));
  window.dispatchEvent(new Event('authChange'));
};

export const isAdmin = () => ss.getItem('userRole') === 'admin';

export const isAuthenticated = () =>
  ss.getItem('isLoggedIn') === 'true' || ss.getItem('isAuthenticated') === 'true';
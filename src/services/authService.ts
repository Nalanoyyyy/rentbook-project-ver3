// src/services/authService.ts
const ss = sessionStorage;

export const SESSION_KEYS = [
  'token','isLoggedIn','isAuthenticated','userRole',
  'userEmail','userName','userNickname','userPhone','userAddress','userId',
];

export const setSession = (token: string, user: any) => {
  ss.setItem('token',          token);
  ss.setItem('isLoggedIn',     'true');
  ss.setItem('isAuthenticated','true');
  ss.setItem('userRole',       user.role);
  ss.setItem('userEmail',      user.email);
  ss.setItem('userName',       user.fullName  || '');
  ss.setItem('userNickname',   user.nickname  || '');
  ss.setItem('userPhone',      user.phone     || '');
  ss.setItem('userAddress',    user.address   || '');
  ss.setItem('userId',         String(user.id || ''));
};

export const logout = () => {
  SESSION_KEYS.forEach(k => ss.removeItem(k));
  window.dispatchEvent(new Event('authChange'));
};

export const isAdmin         = () => ss.getItem('userRole')    === 'admin';
export const isAuthenticated = () => ss.getItem('isLoggedIn')  === 'true' || ss.getItem('isAuthenticated') === 'true';
export const getToken        = () => ss.getItem('token')        || '';
import { allBooks } from '../data/allBooks';

export const STORAGE_KEY = 'inventory';

const withStock = (books: any[]) => books.map(b => ({ stock: 1, ...b, isAvailable: true }));

export const getInventory = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : withStock(allBooks);
  } catch {
    return withStock(allBooks);
  }
};

export const saveInventory = (books: any[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  window.dispatchEvent(new Event('storage'));
};

export const updateBookStock = (id: number, updates: any) => {
  const updated = getInventory().map((b: any) => b.id === id ? { ...b, ...updates } : b);
  saveInventory(updated);
};
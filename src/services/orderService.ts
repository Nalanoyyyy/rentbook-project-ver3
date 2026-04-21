const parse = (k: string): any[] => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch { return []; } };

const dispatch = () => window.dispatchEvent(new Event('storage'));

// ดึงจากทั้ง 2 กล่อง + deduplicate
export const getAllOrders = (): any[] => {
  const seen = new Set();
  return [...parse('admin_orders'), ...parse('allOrders')]
    .filter(o => { const id = o.id || o.orderId; return id && !seen.has(id) && seen.add(id); });
};

// บันทึกลงทั้ง 2 กล่อง
export const saveNewOrder = (order: any) => {
  ['admin_orders', 'allOrders'].forEach(k =>
    localStorage.setItem(k, JSON.stringify([order, ...parse(k)]))
  );
  dispatch();
};

// อัปเดตทั้ง 2 กล่อง + เช็คทั้ง id และ orderId
export const updateOrderStatus = (orderId: string, status: string) => {
  ['admin_orders', 'allOrders'].forEach(k =>
    localStorage.setItem(k, JSON.stringify(
      parse(k).map((o: any) => (o.id === orderId || o.orderId === orderId) ? { ...o, status } : o)
    ))
  );
  dispatch();
};
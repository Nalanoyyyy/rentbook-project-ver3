// backend/src/routes/orders.ts
import { Router, Response } from 'express';
import prisma from '../db';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/orders
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const orders = req.user!.role === 'admin'
      ? await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } })
      : await prisma.order.findMany({ where: { userId: req.user!.id }, include: { items: true }, orderBy: { createdAt: 'desc' } });
    res.json(orders);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// POST /api/orders
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { customerName, phone, address, note, total, returnDate, slip, items } = req.body;
    if (!customerName || !phone || !address || !total || !items?.length) return res.status(400).json({ error: 'ข้อมูลไม่ครบ' });

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (user?.isBlacklisted) return res.status(403).json({ error: 'ไม่สามารถทำรายการได้ กรุณาติดต่อเจ้าหน้าที่' });

    const orderId = `ORD-${Date.now()}`;
    const order = await prisma.order.create({
      data: {
        id: orderId, userId: req.user!.id, customerName, phone,
        email: req.user!.email, address, note: note || '-',
        total: Number(total), slip: slip || null, returnDate: returnDate || null,
        date: new Date().toLocaleDateString('th-TH'),
        items: {
          create: items.map((item: any) => ({
            bookId: Number(item.id), title: item.title,
            price: Number(item.price), days: Number(item.days) || 7, image: item.image || ''
          }))
        }
      }
    });

    // ลด stock
    for (const item of items) {
      await prisma.book.update({
        where: { id: Number(item.id) },
        data: {
          stock: { decrement: 1 },
          isAvailable: { set: true },
        }
      });
      const book = await prisma.book.findUnique({ where: { id: Number(item.id) } });
      if (book && book.stock <= 0) {
        await prisma.book.update({ where: { id: book.id }, data: { isAvailable: false, status: 'ไม่ว่าง' } });
      }
    }

    res.status(201).json({ message: 'สร้าง order สำเร็จ', orderId: order.id });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// PUT /api/orders/:id/status
router.put('/:id/status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const isAdmin = req.user!.role === 'admin';

    // ผู้ใช้ทั่วไปทำได้แค่ "รอรับคืน" เท่านั้น
    if (!isAdmin && status !== 'รอรับคืน') {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์อัปเดตสถานะนี้' });
    }

    await prisma.order.update({ where: { id: req.params.id }, data: { status } });

    // คืน stock ถ้า admin รับคืนหนังสือ
    if (status === 'คืนหนังสือแล้ว') {
      const items = await prisma.orderItem.findMany({ where: { orderId: req.params.id } });
      for (const item of items) {
        await prisma.book.update({
          where: { id: item.bookId },
          data: { stock: { increment: 1 }, isAvailable: true, status: 'พร้อมให้เช่า' }
        });
      }
    }
    res.json({ message: 'อัปเดตสถานะสำเร็จ' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
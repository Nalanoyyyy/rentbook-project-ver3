import { Router, Request, Response } from 'express';
import prisma from '../db';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/coupons — active and unused by current user
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const coupons = await prisma.coupon.findMany({ where: { isActive: true } });

    const usedOrders = await prisma.order.findMany({
      where: { userId: req.user!.id, couponCode: { not: null } },
      select: { couponCode: true }
    });
    const usedCodes = new Set(usedOrders.map(o => o.couponCode));
    const available = coupons.filter(c => !usedCodes.has(c.code));

    res.json(available);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// GET /api/coupons/all — admin
router.get('/all', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(coupons);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// POST /api/coupons/verify
router.post('/verify', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { code, subtotal } = req.body;
    const coupon = await prisma.coupon.findFirst({ where: { code: code?.toUpperCase(), isActive: true } });
    if (!coupon) return res.status(404).json({ error: 'ไม่พบโค้ดนี้ หรือโค้ดถูกปิดการใช้งาน' });
    if (subtotal < coupon.minSpend) return res.status(400).json({ error: `ใช้ได้เมื่อเช่าขั้นต่ำ ฿${coupon.minSpend}` });

    const alreadyUsed = await prisma.order.findFirst({
      where: { userId: req.user!.id, couponCode: coupon.code }
    });
    if (alreadyUsed) return res.status(400).json({ error: 'คุณเคยใช้คูปองนี้แล้ว' });

    const discount = coupon.type === 'PERCENT'
      ? Math.floor(subtotal * coupon.discountValue / 100)
      : coupon.discountValue;
    res.json({ discount, coupon });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// POST /api/coupons
router.post('/', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { code, title, type, discountValue, displayDiscount, minSpend, expiry } = req.body;
    await prisma.coupon.create({ data: { code, title, type, discountValue: Number(discountValue), displayDiscount, minSpend: Number(minSpend) || 0, expiry } });
    res.status(201).json({ message: 'เพิ่มคูปองสำเร็จ' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// PUT /api/coupons/:id
router.put('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { code, title, type, discountValue, displayDiscount, minSpend, expiry, isActive } = req.body;
    await prisma.coupon.update({
      where: { id: Number(req.params.id) },
      data: { code, title, type, discountValue: Number(discountValue), displayDiscount, minSpend: Number(minSpend), expiry, isActive: Boolean(isActive) }
    });
    res.json({ message: 'แก้ไขคูปองสำเร็จ' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/coupons/:id
router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    await prisma.coupon.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'ลบคูปองสำเร็จ' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
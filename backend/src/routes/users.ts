// backend/src/routes/users.ts
import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/users/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, fullName: true, nickname: true, phone: true, address: true, role: true }
    });
    res.json(user);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// PUT /api/users/me
router.put('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, nickname, phone, address, email } = req.body;
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { fullName, nickname, phone, address, email: email?.toLowerCase() }
    });
    res.json({ message: 'บันทึกข้อมูลสำเร็จ' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// PUT /api/users/me/password
router.put('/me/password', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
    await prisma.user.update({ where: { id: req.user!.id }, data: { password: bcrypt.hashSync(newPassword, 10) } });
    res.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// GET /api/users — admin
router.get('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'user' },
      select: { id: true, email: true, fullName: true, nickname: true, phone: true, role: true, isBlacklisted: true, blacklistReason: true, createdAt: true }
    });
    res.json(users);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// PUT /api/users/:id/blacklist
router.put('/:id/blacklist', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { isBlacklisted, reason } = req.body;
    await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { isBlacklisted: Boolean(isBlacklisted), blacklistReason: reason || null }
    });
    res.json({ message: isBlacklisted ? 'เพิ่มใน Blacklist แล้ว' : 'นำออกจาก Blacklist แล้ว' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// GET /api/users/me/wishlist
router.get('/me/wishlist', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user!.id },
      include: { book: true }
    });
    res.json(wishlist.map(w => w.book));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// POST /api/users/me/wishlist/:bookId
router.post('/me/wishlist/:bookId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.wishlist.create({ data: { userId: req.user!.id, bookId: Number(req.params.bookId) } });
    res.json({ message: 'เพิ่มในรายการโปรดแล้ว' });
  } catch { res.status(409).json({ error: 'มีอยู่แล้ว' }); }
});

// DELETE /api/users/me/wishlist/:bookId
router.delete('/me/wishlist/:bookId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.wishlist.delete({ where: { userId_bookId: { userId: req.user!.id, bookId: Number(req.params.bookId) } } });
    res.json({ message: 'นำออกจากรายการโปรดแล้ว' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
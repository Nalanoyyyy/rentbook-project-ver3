// backend/src/routes/auth.ts
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db';

const router = Router();
const SECRET = process.env.JWT_SECRET || 'rentbook_secret_2024';

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, nickname, phone, address } = req.body;
    if (!email || !password || !fullName) return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });

    const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (exists) return res.status(409).json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' });

    const hash = bcrypt.hashSync(password, 10);
    const user = await prisma.user.create({
      data: { email: email.toLowerCase(), password: hash, fullName, nickname: nickname || '', phone: phone || '', address: address || '' }
    });
    res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ', userId: user.id });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบ' });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });

    if (user.isBlacklisted) return res.status(403).json({ error: 'ไม่สามารถเข้าสู่ระบบได้ กรุณาติดต่อเจ้าหน้าที่' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, fullName: user.fullName, nickname: user.nickname, phone: user.phone, address: user.address, role: user.role } });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.body.email?.toLowerCase() } });
    if (!user) return res.status(404).json({ error: 'ไม่พบอีเมลนี้ในระบบ' });
    res.json({ message: 'พบอีเมลในระบบ' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ error: 'ข้อมูลไม่ครบ' });
    const hash = bcrypt.hashSync(newPassword, 10);
    await prisma.user.update({ where: { email: email.toLowerCase() }, data: { password: hash } });
    res.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
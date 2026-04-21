// backend/src/routes/books.ts
import { Router, Request, Response } from 'express';
import prisma from '../db';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/books
router.get('/', async (req: Request, res: Response) => {
  try {
    const books = await prisma.book.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(books);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// GET /api/books/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const book = await prisma.book.findUnique({
      where: { id: Number(req.params.id) },
      include: { reviews: { orderBy: { createdAt: 'desc' } } }
    });
    if (!book) return res.status(404).json({ error: 'ไม่พบหนังสือ' });
    res.json(book);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// POST /api/books
router.post('/', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { title, author, category, price, stock, image } = req.body;
    if (!title || !author || !category || !price) return res.status(400).json({ error: 'ข้อมูลไม่ครบ' });
    const book = await prisma.book.create({
      data: { title, author, category, price: Number(price), stock: Number(stock) || 1, image: image || '', isAvailable: Number(stock) > 0, status: Number(stock) > 0 ? 'พร้อมให้เช่า' : 'ไม่ว่าง' }
    });
    res.status(201).json({ message: 'เพิ่มหนังสือสำเร็จ', id: book.id });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// PUT /api/books/:id
router.put('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { title, author, category, price, stock, image } = req.body;
    const isAvailable = Number(stock) > 0;
    await prisma.book.update({
      where: { id: Number(req.params.id) },
      data: { title, author, category, price: Number(price), stock: Number(stock), image, isAvailable, status: isAvailable ? 'พร้อมให้เช่า' : 'ไม่ว่าง' }
    });
    res.json({ message: 'แก้ไขหนังสือสำเร็จ' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/books/:id
router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    await prisma.book.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'ลบหนังสือสำเร็จ' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// POST /api/books/:id/reviews
router.post('/:id/reviews', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { rating, comment, name } = req.body;
    if (!comment || !rating) return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบ' });
    await prisma.review.create({
      data: { bookId: Number(req.params.id), userId: req.user!.id, name: name || 'ผู้ใช้งาน', rating: Number(rating), comment }
    });
    res.status(201).json({ message: 'เพิ่มรีวิวสำเร็จ' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
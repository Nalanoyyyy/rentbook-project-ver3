import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Seed admin account
const seedAdmin = async () => {
  const exists = await prisma.user.findUnique({ where: { email: 'admin@rentbook.com' } });
  if (!exists) {
    const hash = bcrypt.hashSync('123456', 10);
    await prisma.user.create({
      data: { email: 'admin@rentbook.com', password: hash, fullName: 'Admin Manager', nickname: 'Admin', role: 'admin' }
    });
    console.log('✅ Admin account created');
  }
};

seedAdmin().catch(console.error);

export default prisma;
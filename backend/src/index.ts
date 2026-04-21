import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import './db';

import authRouter    from './routes/auth';
import booksRouter   from './routes/books';
import ordersRouter  from './routes/orders';
import couponsRouter from './routes/coupons';
import usersRouter   from './routes/users';

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth',    authRouter);
app.use('/api/books',   booksRouter);
app.use('/api/orders',  ordersRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/users',   usersRouter);

app.get('/', (_, res) => res.json({ message: 'RentBook API is running 📚' }));

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
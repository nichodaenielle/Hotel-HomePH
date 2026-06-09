import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? '*' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'HH Project backend is running' });
});

app.use('/api/users', userRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

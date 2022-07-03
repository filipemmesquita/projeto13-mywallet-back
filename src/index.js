import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import walletRouter from './routes/walletRouter.js';
import authRouter from './routes/authRouter.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use(authRouter);
app.use(walletRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server Online'));

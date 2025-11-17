import express from 'express';
import cors from 'cors';
import allRoutes from './src/routes/index.js';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use('/api', allRoutes);

app.listen(port, () => {
  console.log(`🚀 API Node.js (Prisma) démarrée sur http://localhost:${port}`);
});
import express from 'express';
import cors from 'cors';
import interviewRoutes from './routes/interview';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/interview', interviewRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`IntervAI running on http://localhost:${PORT}`);
});

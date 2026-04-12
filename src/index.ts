import express from 'express';
import cors from 'cors';
import interviewRoutes from './routes/interview';
import { API } from './config';

const app = express();

app.use(cors({ origin: API.ORIGIN_URL }));
app.use(express.json());

app.use('/interview', interviewRoutes);

const PORT = API.PORT;

app.listen(PORT, () => {
  console.log(`IntervAI running on http://localhost:${PORT}`);
});

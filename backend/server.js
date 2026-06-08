import express from 'express';
import cors from 'cors';
import auditRoutes from './routes/audit.js';

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());
app.use('/api/audit', auditRoutes);

app.get('/', (req, res) => {
  res.json({
    name: 'JD Deck Audit API',
    status: 'running',
    version: '1.0.0'
  });
});

app.listen(PORT, () => {
  console.log(`JD Deck Audit backend running on http://localhost:${PORT}`);
});

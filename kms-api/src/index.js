import express from 'express';
import morgan from 'morgan';
import kmsRouter from './routes/kms.js';
import { apiKeyAuth } from './middleware/auth.js';
import { errorHandler } from './utils/errors.js';
import { PORT } from './config/env.js';

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/v1', apiKeyAuth, kmsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`KMS API listening on http://localhost:${PORT}`);
});

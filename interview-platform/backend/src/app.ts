import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import candidatesRoutes from './routes/candidates.routes';
import sessionsRoutes from './routes/sessions.routes';
import feedbackRoutes from './routes/feedback.routes';
import reportsRoutes from './routes/reports.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidatesRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/reports', reportsRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

export default app;
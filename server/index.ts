import express from 'express';
import cors from 'cors';
import { initDatabase } from './db';
import authRouter, { authMiddleware } from './routes/auth';
import customersRouter from './routes/customers';
import incomeRouter from './routes/income';
import expensesRouter from './routes/expenses';
import reportsRouter from './routes/reports';

const PORT = process.env.PORT || 3001;

function main() {
    // Initialize SQLite database and tables
    initDatabase();

    const app = express();

    // Middleware
    const allowedOrigin = process.env.ALLOWED_ORIGIN;
    app.use(cors({
        origin: allowedOrigin ? [allowedOrigin, 'http://localhost:5173'] : true,
        credentials: true,
    }));
    app.use(express.json());

    // Auth routes (public)
    app.use('/api/auth', authRouter);

    // Protected routes
    app.use('/api/customers', authMiddleware, customersRouter);
    app.use('/api/income', authMiddleware, incomeRouter);
    app.use('/api/expenses', authMiddleware, expensesRouter);
    app.use('/api/reports', authMiddleware, reportsRouter);

    // Health check
    app.get('/api/health', (_req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    app.listen(PORT, () => {
        console.log(`🚀 BudgetX API running on http://localhost:${PORT}`);
    });
}

main();

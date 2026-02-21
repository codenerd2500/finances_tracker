import { Router, Request, Response } from 'express';
import { getDb } from '../db';

const router = Router();

// GET monthly report
router.get('/monthly', (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const month = Number(req.query.month);
        const year = Number(req.query.year);

        if (!month || !year) {
            res.status(400).json({ message: 'month and year are required' });
            return;
        }

        const db = getDb();

        const incomeTotal = db.prepare(
            'SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE user_id = ? AND month = ? AND year = ?'
        ).get(userId, month, year) as any;

        const expenseTotal = db.prepare(
            'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = ? AND month = ? AND year = ?'
        ).get(userId, month, year) as any;

        const incomeBySource = db.prepare(
            'SELECT source, SUM(amount) as total FROM income WHERE user_id = ? AND month = ? AND year = ? GROUP BY source ORDER BY total DESC'
        ).all(userId, month, year);

        const expensesByPerson = db.prepare(
            'SELECT person_name, SUM(amount) as total FROM expenses WHERE user_id = ? AND month = ? AND year = ? GROUP BY person_name ORDER BY total DESC'
        ).all(userId, month, year);

        const totalIncome = Number(incomeTotal.total);
        const totalExpenses = Number(expenseTotal.total);

        res.json({
            month,
            year,
            total_income: totalIncome,
            total_expenses: totalExpenses,
            net_profit: totalIncome - totalExpenses,
            income_by_source: incomeBySource,
            expenses_by_person: expensesByPerson,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to generate monthly report' });
    }
});

// GET yearly report
router.get('/yearly', (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const year = Number(req.query.year);

        if (!year) {
            res.status(400).json({ message: 'year is required' });
            return;
        }

        const db = getDb();

        const incomeTotal = db.prepare(
            'SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE user_id = ? AND year = ?'
        ).get(userId, year) as any;

        const expenseTotal = db.prepare(
            'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = ? AND year = ?'
        ).get(userId, year) as any;

        const monthlyIncome = db.prepare(
            'SELECT month, SUM(amount) as total FROM income WHERE user_id = ? AND year = ? GROUP BY month'
        ).all(userId, year) as any[];

        const monthlyExpenses = db.prepare(
            'SELECT month, SUM(amount) as total FROM expenses WHERE user_id = ? AND year = ? GROUP BY month'
        ).all(userId, year) as any[];

        const incomeMap: Record<number, number> = {};
        const expenseMap: Record<number, number> = {};
        monthlyIncome.forEach(r => { incomeMap[r.month] = Number(r.total); });
        monthlyExpenses.forEach(r => { expenseMap[r.month] = Number(r.total); });

        const monthly_breakdown = [];
        for (let m = 1; m <= 12; m++) {
            monthly_breakdown.push({ month: m, income: incomeMap[m] || 0, expenses: expenseMap[m] || 0 });
        }

        const incomeBySource = db.prepare(
            'SELECT source, SUM(amount) as total FROM income WHERE user_id = ? AND year = ? GROUP BY source ORDER BY total DESC'
        ).all(userId, year);

        const expensesByPerson = db.prepare(
            'SELECT person_name, SUM(amount) as total FROM expenses WHERE user_id = ? AND year = ? GROUP BY person_name ORDER BY total DESC'
        ).all(userId, year);

        const totalIncome = Number(incomeTotal.total);
        const totalExpenses = Number(expenseTotal.total);

        res.json({
            year,
            total_income: totalIncome,
            total_expenses: totalExpenses,
            net_profit: totalIncome - totalExpenses,
            monthly_breakdown,
            income_by_source: incomeBySource,
            expenses_by_person: expensesByPerson,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to generate yearly report' });
    }
});

export default router;

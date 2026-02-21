import { Router, Request, Response } from 'express';
import { getDb } from '../db';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { month, year, person_name } = req.query;

        let sql = 'SELECT * FROM expenses WHERE user_id = ?';
        const params: any[] = [userId];

        if (month) { sql += ' AND month = ?'; params.push(Number(month)); }
        if (year) { sql += ' AND year = ?'; params.push(Number(year)); }
        if (person_name) { sql += ' AND person_name = ?'; params.push(person_name); }

        sql += ' ORDER BY year DESC, month DESC, created_at DESC';

        const rows = getDb().prepare(sql).all(...params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch expenses' });
    }
});

router.post('/', (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { person_name, category, amount, month, year, description } = req.body;
        const result = getDb().prepare(
            'INSERT INTO expenses (user_id, person_name, category, amount, month, year, description) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).run(userId, person_name, category || 'Miscellaneous', amount, month, year, description || '');
        res.json({ id: result.lastInsertRowid, ...req.body, user_id: userId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create expense' });
    }
});

router.put('/:id', (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { id } = req.params;
        const { person_name, category, amount, month, year, description } = req.body;
        getDb().prepare(
            'UPDATE expenses SET person_name = ?, category = ?, amount = ?, month = ?, year = ?, description = ? WHERE id = ? AND user_id = ?'
        ).run(person_name, category || 'Miscellaneous', amount, month, year, description || '', id, userId);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update expense' });
    }
});

router.delete('/:id', (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { id } = req.params;
        getDb().prepare('DELETE FROM expenses WHERE id = ? AND user_id = ?').run(id, userId);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete expense' });
    }
});

export default router;

import { Router, Request, Response } from 'express';
import { getDb } from '../db';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { month, year, customer_id } = req.query;

        let sql = `
      SELECT i.*, c.name as customer_name
      FROM income i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.user_id = ?
    `;
        const params: any[] = [userId];

        if (month) { sql += ' AND i.month = ?'; params.push(Number(month)); }
        if (year) { sql += ' AND i.year = ?'; params.push(Number(year)); }
        if (customer_id) { sql += ' AND i.customer_id = ?'; params.push(Number(customer_id)); }

        sql += ' ORDER BY i.year DESC, i.month DESC, i.created_at DESC';

        const rows = getDb().prepare(sql).all(...params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch income' });
    }
});

router.post('/', (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { customer_id, source, amount, month, year, description } = req.body;
        const result = getDb().prepare(
            'INSERT INTO income (user_id, customer_id, source, amount, month, year, description) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).run(userId, customer_id || null, source, amount, month, year, description || '');
        res.json({ id: result.lastInsertRowid, ...req.body, user_id: userId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create income' });
    }
});

router.put('/:id', (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { id } = req.params;
        const { customer_id, source, amount, month, year, description } = req.body;
        getDb().prepare(
            'UPDATE income SET customer_id = ?, source = ?, amount = ?, month = ?, year = ?, description = ? WHERE id = ? AND user_id = ?'
        ).run(customer_id || null, source, amount, month, year, description || '', id, userId);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update income' });
    }
});

router.delete('/:id', (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { id } = req.params;
        getDb().prepare('DELETE FROM income WHERE id = ? AND user_id = ?').run(id, userId);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete income' });
    }
});

export default router;

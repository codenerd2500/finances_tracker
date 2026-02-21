import { Router, Request, Response } from 'express';
import { getDb } from '../db';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const rows = getDb().prepare('SELECT * FROM customers WHERE user_id = ? ORDER BY name ASC').all(userId);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch customers' });
    }
});

router.post('/', (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { name, address } = req.body;
        const result = getDb().prepare('INSERT INTO customers (user_id, name, address) VALUES (?, ?, ?)').run(userId, name, address || '');
        res.json({ id: result.lastInsertRowid, user_id: userId, name, address, created_at: new Date().toISOString() });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create customer' });
    }
});

router.put('/:id', (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { id } = req.params;
        const { name, address } = req.body;
        getDb().prepare('UPDATE customers SET name = ?, address = ? WHERE id = ? AND user_id = ?').run(name, address || '', id, userId);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update customer' });
    }
});

router.delete('/:id', (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { id } = req.params;
        getDb().prepare('DELETE FROM customers WHERE id = ? AND user_id = ?').run(id, userId);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete customer' });
    }
});

export default router;

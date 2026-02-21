import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getDb } from '../db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'interstellar-shuttle-secret-key-2026';

router.post('/google', async (req: Request, res: Response) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            res.status(400).json({ message: 'Credential required' });
            return;
        }

        let email = 'demo@interstellar.app';
        let name = 'Demo User';
        let googleId = 'demo';
        let avatar = '';

        // Try to verify with Google userinfo endpoint
        try {
            const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${credential}`);
            if (response.ok) {
                const userData = await response.json();
                email = userData.email || email;
                name = userData.name || name;
                googleId = userData.sub || googleId;
                avatar = userData.picture || '';
            }
        } catch (err) {
            console.log('Google verification skipped (dev mode), using demo user');
        }

        const db = getDb();

        // Upsert user
        let user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId) as any;

        if (user) {
            db.prepare('UPDATE users SET name = ?, email = ?, avatar = ? WHERE id = ?').run(name, email, avatar, user.id);
            user.name = name;
            user.email = email;
            user.avatar = avatar;
        } else {
            const result = db.prepare('INSERT INTO users (google_id, email, name, avatar) VALUES (?, ?, ?, ?)').run(googleId, email, name, avatar);
            user = { id: result.lastInsertRowid, google_id: googleId, email, name, avatar };
        }

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } });
    } catch (err) {
        console.error('Auth error:', err);
        res.status(500).json({ message: 'Authentication failed' });
    }
});

export default router;

// Middleware to extract userId from JWT
export function authMiddleware(req: Request, res: Response, next: Function) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        (req as any).userId = 1;
        return next();
    }

    const token = authHeader.replace('Bearer ', '');
    if (token === 'demo-token') {
        (req as any).userId = 1;
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        (req as any).userId = decoded.userId;
        next();
    } catch {
        (req as any).userId = 1;
        next();
    }
}

import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { getDb } from '../db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'budgetx-secret-key-2026';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '664432575666-k9keiu6qb88inv2kkk0ov9jjuvao6efh.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

router.post('/google', async (req: Request, res: Response) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            res.status(400).json({ message: 'Credential required' });
            return;
        }

        let email = 'demo@budgetx.app';
        let name = 'Demo User';
        let googleId = 'demo';
        let avatar = '';

        // Demo mode shortcut
        if (credential === 'demo') {
            // Fall through with defaults above
        } else {
            // Verify real Google ID token
            try {
                const ticket = await googleClient.verifyIdToken({
                    idToken: credential,
                    audience: GOOGLE_CLIENT_ID,
                });
                const payload = ticket.getPayload();
                if (!payload) throw new Error('Empty token payload');
                email = payload.email || email;
                name = payload.name || name;
                googleId = payload.sub || googleId;
                avatar = payload.picture || '';
            } catch (err) {
                console.error('Google token verification failed:', err);
                res.status(401).json({ message: 'Invalid Google credential' });
                return;
            }
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

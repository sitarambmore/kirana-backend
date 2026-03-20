import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

// Extend Express Request to include our custom user object
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: string;
            };
        }
    }
}

export const protect = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        let token: string | undefined;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            res.status(401).json({ status: 'fail', message: 'You are not logged in. Please log in to get access.' });
            return;
        }

        // Verify token
        const decoded = jwt.verify(token, config.jwt.secret) as { id: string; role: string };

        // Attach user information to request object
        req.user = { id: decoded.id, role: decoded.role };

        next();
    } catch (error) {
        res.status(401).json({ status: 'fail', message: 'Invalid or expired token.' });
    }
};

// Middleware to restrict access based on roles
export const restrictTo = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({
                status: 'fail',
                message: 'You do not have permission to perform this action.'
            });
            return;
        }
        next();
    };
};

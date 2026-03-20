import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export const generateToken = (userId: string, role: string): string => {
    return jwt.sign({ id: userId, role }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn as any,
    });
};

export const verifyToken = (token: string): any => {
    return jwt.verify(token, config.jwt.secret);
};

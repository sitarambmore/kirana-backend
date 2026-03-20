"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            res.status(401).json({ status: 'fail', message: 'You are not logged in. Please log in to get access.' });
            return;
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwt.secret);
        // Attach user information to request object
        req.user = { id: decoded.id, role: decoded.role };
        next();
    }
    catch (error) {
        res.status(401).json({ status: 'fail', message: 'Invalid or expired token.' });
    }
};
exports.protect = protect;
// Middleware to restrict access based on roles
const restrictTo = (...roles) => {
    return (req, res, next) => {
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
exports.restrictTo = restrictTo;

import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

export const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. No token provided.',
                statusCode: 401
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', decoded.id)
            .single();

        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid token. User not found.',
                statusCode: 401
            });
        }

        req.user = user;
        req.userId = user.id;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Invalid token.',
                statusCode: 401
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expired.',
                statusCode: 401
            });
        }
        return res.status(500).json({
            success: false,
            error: 'Authentication error.',
            statusCode: 500
        });
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized. Please log in.',
                statusCode: 401
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden. Insufficient permissions.',
                statusCode: 403
            });
        }

        next();
    };
};

// Middleware to check if user is admin or HR
export const isAdminOrHR = authorize('admin', 'hr');

// Middleware to check if user is admin
export const isAdmin = authorize('admin');
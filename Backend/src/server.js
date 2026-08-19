import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { supabase, testConnection } from './config/supabase.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

// Security
app.use(helmet());

// CORS
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
}));

// Rate limiting - increased for development
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 100, // allow 100 requests per minute
    message: {
        success: false,
        error: 'Too many requests, please try again later.'
    }
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        message: 'NexusHR API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// ============================================
// TEST DATABASE CONNECTION
// ============================================
app.get('/api/test-db', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('count', { count: 'exact', head: true });

        if (error) {
            return res.status(500).json({
                success: false,
                error: error.message,
                hint: 'Make sure you have run the schema SQL in Supabase'
            });
        }

        res.json({
            success: true,
            message: 'Database connected successfully!',
            data: { tablesExist: true }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api', settingsRoutes);

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Route not found: ${req.method} ${req.path}`,
        statusCode: 404
    });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================
const startServer = async () => {
    try {
        await testConnection();
        
        app.listen(PORT, () => {
            console.log(`🚀 NexusHR Backend running on port ${PORT}`);
            console.log(`📍 API URL: http://localhost:${PORT}/api`);
            console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();

export default app;
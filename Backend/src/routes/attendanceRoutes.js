import express from 'express';
import {
    getAttendance,
    getTodayAttendance,
    checkIn,
    checkOut,
    manualMarkAttendance
} from '../controllers/attendanceController.js';
import { authenticate, isAdminOrHR } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getAttendance);
router.get('/today', authenticate, getTodayAttendance);
router.post('/check-in', authenticate, checkIn);
router.post('/check-out', authenticate, checkOut);
router.post('/manual', authenticate, isAdminOrHR, manualMarkAttendance);

export default router;
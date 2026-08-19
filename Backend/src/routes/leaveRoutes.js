import express from 'express';
import {
    getLeaves,
    applyLeave,
    approveLeave,
    rejectLeave,
    cancelLeave,
    getLeaveBalance
} from '../controllers/leaveController.js';
import { authenticate, isAdminOrHR } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getLeaves);
router.get('/balance/:employeeId', authenticate, getLeaveBalance);
router.post('/', authenticate, applyLeave);
router.patch('/:id/approve', authenticate, isAdminOrHR, approveLeave);
router.patch('/:id/reject', authenticate, isAdminOrHR, rejectLeave);
router.patch('/:id/cancel', authenticate, cancelLeave);

export default router;
import express from 'express';
import {
    getPayroll,
    generatePayroll,
    markPayrollAsPaid,
    markAllPayrollAsPaid,
    addAdjustment
} from '../controllers/payrollController.js';
import { authenticate, isAdminOrHR } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getPayroll);
router.post('/generate', authenticate, isAdminOrHR, generatePayroll);
router.patch('/:id/paid', authenticate, isAdminOrHR, markPayrollAsPaid);
router.patch('/:month/paid-all', authenticate, isAdminOrHR, markAllPayrollAsPaid);
router.post('/:id/adjustment', authenticate, isAdminOrHR, addAdjustment);

export default router;
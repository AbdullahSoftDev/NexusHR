import express from 'express';
import {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    archiveEmployee,
    exportEmployees,
    getPendingEmployees,
    approveEmployee,
    rejectEmployee
} from '../controllers/employeeController.js';
import { authenticate, isAdminOrHR, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getEmployees);
router.get('/pending', authenticate, isAdmin, getPendingEmployees);
router.get('/export', authenticate, isAdminOrHR, exportEmployees);
router.get('/:id', authenticate, getEmployeeById);
router.post('/', authenticate, isAdminOrHR, createEmployee);
router.put('/:id', authenticate, isAdminOrHR, updateEmployee);
router.delete('/:id', authenticate, isAdminOrHR, deleteEmployee);
router.patch('/:id/archive', authenticate, isAdminOrHR, archiveEmployee);
router.patch('/:userId/approve', authenticate, isAdmin, approveEmployee);
router.patch('/:userId/reject', authenticate, isAdmin, rejectEmployee);

export default router;
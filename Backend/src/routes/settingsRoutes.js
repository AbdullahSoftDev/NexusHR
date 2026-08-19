import express from 'express';
import {
    getSettings,
    updateSettings,
    getDepartments,
    createDepartment,
    deleteDepartment,
    getDashboardStats
} from '../controllers/settingsController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/settings', authenticate, getSettings);
router.put('/settings', authenticate, isAdmin, updateSettings);
router.get('/departments', authenticate, getDepartments);
router.post('/departments', authenticate, isAdmin, createDepartment);
router.delete('/departments/:id', authenticate, isAdmin, deleteDepartment);
router.get('/dashboard/stats', authenticate, getDashboardStats);

export default router;
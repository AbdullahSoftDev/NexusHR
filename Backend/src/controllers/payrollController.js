import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get payroll records
// @route   GET /api/payroll
export const getPayroll = asyncHandler(async (req, res) => {
    const { month, employeeId } = req.query;

    let query = supabase.from('payroll').select(`
        *,
        employees (
            first_name,
            last_name,
            department,
            position,
            employee_id
        )
    `);

    if (month) {
        query = query.eq('month', month);
    }

    if (employeeId && employeeId !== 'ALL') {
        query = query.eq('employee_id', employeeId);
    }

    const { data: payroll, error } = await query.order('created_at', { ascending: false });

    if (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch payroll: ' + error.message
        });
    }

    res.json({
        success: true,
        data: payroll,
        count: payroll.length
    });
});

// @desc    Generate monthly payroll
// @route   POST /api/payroll/generate
export const generatePayroll = asyncHandler(async (req, res) => {
    const { month } = req.body;

    if (!month) {
        return res.status(400).json({
            success: false,
            error: 'Please provide month (YYYY-MM)'
        });
    }

    // Only admin/hr can generate payroll
    if (!['admin', 'hr'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            error: 'Only Admin or HR can generate payroll'
        });
    }

    // Get all active employees
    const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('*')
        .eq('status', 'active');

    if (empError) {
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch employees'
        });
    }

    // Check if payroll already exists for this month
    const { data: existing } = await supabase
        .from('payroll')
        .select('employee_id')
        .eq('month', month)
        .limit(1);

    if (existing && existing.length > 0) {
        return res.status(400).json({
            success: false,
            error: `Payroll for ${month} already exists. Delete existing records to regenerate.`
        });
    }

    const payrollRecords = employees.map(emp => {
        const monthlySalary = Math.round(emp.salary / 12);
        const tax = Math.round(monthlySalary * 0.22);
        const healthInsurance = 350;
        const netSalary = monthlySalary - tax - healthInsurance;

        return {
            employee_id: emp.id,
            month: month,
            base_salary: monthlySalary,
            working_days: 22,
            present_days: 22,
            unpaid_leave_days: 0,
            overtime_hours: 0,
            overtime_pay: 0,
            bonuses: [],
            deductions: [],
            tax: tax,
            health_insurance: healthInsurance,
            net_salary: netSalary,
            status: 'draft',
            payment_method: 'Direct Deposit (ACH)'
        };
    });

    const { data: created, error } = await supabase
        .from('payroll')
        .insert(payrollRecords)
        .select();

    if (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to generate payroll: ' + error.message
        });
    }

    res.status(201).json({
        success: true,
        data: created,
        count: created.length,
        message: `Payroll generated for ${month} (${created.length} employees)`
    });
});

// @desc    Mark payroll as paid
// @route   PATCH /api/payroll/:id/paid
export const markPayrollAsPaid = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!['admin', 'hr'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            error: 'Only Admin or HR can mark payroll as paid'
        });
    }

    const { data: payroll, error } = await supabase
        .from('payroll')
        .update({
            status: 'paid',
            payment_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', id)
        .select()
        .single();

    if (error || !payroll) {
        return res.status(404).json({
            success: false,
            error: 'Payroll record not found'
        });
    }

    res.json({
        success: true,
        data: payroll,
        message: 'Payroll marked as paid'
    });
});

// @desc    Mark all payroll for month as paid
// @route   PATCH /api/payroll/:month/paid-all
export const markAllPayrollAsPaid = asyncHandler(async (req, res) => {
    const { month } = req.params;

    if (!['admin', 'hr'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            error: 'Only Admin or HR can mark payroll as paid'
        });
    }

    const { data: payroll, error } = await supabase
        .from('payroll')
        .update({
            status: 'paid',
            payment_date: new Date().toISOString().split('T')[0]
        })
        .eq('month', month)
        .eq('status', 'draft')
        .select();

    if (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to update payroll: ' + error.message
        });
    }

    res.json({
        success: true,
        data: payroll,
        count: payroll.length,
        message: `All payroll records for ${month} marked as paid`
    });
});

// @desc    Add bonus or deduction to payroll
// @route   POST /api/payroll/:id/adjustment
export const addAdjustment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { type, title, amount } = req.body;

    if (!['bonus', 'deduction'].includes(type) || !title || !amount) {
        return res.status(400).json({
            success: false,
            error: 'Please provide type (bonus/deduction), title, and amount'
        });
    }

    const { data: existing, error: findError } = await supabase
        .from('payroll')
        .select('bonuses, deductions, base_salary, overtime_pay, tax, health_insurance, net_salary')
        .eq('id', id)
        .single();

    if (findError || !existing) {
        return res.status(404).json({
            success: false,
            error: 'Payroll record not found'
        });
    }

    let bonuses = existing.bonuses || [];
    let deductions = existing.deductions || [];

    if (type === 'bonus') {
        bonuses.push({ id: `b_${Date.now()}`, title, amount });
    } else {
        deductions.push({ id: `d_${Date.now()}`, title, amount });
    }

    const totalBonuses = bonuses.reduce((sum, b) => sum + b.amount, 0);
    const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
    const newNetSalary = existing.base_salary + existing.overtime_pay + totalBonuses - existing.tax - existing.health_insurance - totalDeductions;

    const { data: updated, error } = await supabase
        .from('payroll')
        .update({
            bonuses: bonuses,
            deductions: deductions,
            net_salary: newNetSalary
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to add adjustment: ' + error.message
        });
    }

    res.json({
        success: true,
        data: updated,
        message: `${type} "${title}" of $${amount} added to payroll`
    });
});
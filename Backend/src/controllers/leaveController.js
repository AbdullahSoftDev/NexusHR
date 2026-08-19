import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get all leave requests
// @route   GET /api/leaves
export const getLeaves = asyncHandler(async (req, res) => {
    const { status, department, employeeId } = req.query;

    let query = supabase.from('leaves').select(`
        *,
        employees (
            first_name,
            last_name,
            department,
            employee_id
        )
    `);

    if (status && status !== 'all') {
        query = query.eq('status', status);
    }

    if (department && department !== 'ALL') {
        query = query.eq('employees.department', department);
    }

    if (employeeId && employeeId !== 'ALL') {
        query = query.eq('employee_id', employeeId);
    }

    const { data: leaves, error } = await query.order('created_at', { ascending: false });

    if (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch leaves: ' + error.message
        });
    }

    // Format the data for frontend compatibility
    const formattedLeaves = leaves.map(leave => ({
        id: leave.id,
        employeeId: leave.employees?.employee_id || leave.employee_id,
        employeeName: leave.employees ? `${leave.employees.first_name} ${leave.employees.last_name}` : 'Unknown',
        department: leave.employees?.department || leave.department || 'N/A',
        leaveType: leave.leave_type,
        startDate: leave.start_date,
        endDate: leave.end_date,
        totalDays: leave.total_days,
        reason: leave.reason,
        status: leave.status,
        appliedDate: leave.applied_date,
        reviewedBy: leave.reviewed_by,
        reviewedDate: leave.reviewed_date,
        reviewNotes: leave.review_notes
    }));

    res.json({
        success: true,
        data: formattedLeaves,
        count: formattedLeaves.length
    });
});

// @desc    Apply for leave
// @route   POST /api/leaves
export const applyLeave = asyncHandler(async (req, res) => {
    const { leaveType, startDate, endDate, totalDays, reason } = req.body;
    const userId = req.userId;

    if (!leaveType || !startDate || !endDate || !totalDays || !reason) {
        return res.status(400).json({
            success: false,
            error: 'Please provide all required fields'
        });
    }

    // Get employee
    const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('id, employee_id, first_name, last_name, department')
        .eq('user_id', userId)
        .single();

    if (empError || !employee) {
        return res.status(404).json({
            success: false,
            error: 'Employee record not found'
        });
    }

    const { data: leave, error } = await supabase
        .from('leaves')
        .insert({
            employee_id: employee.id,
            leave_type: leaveType,
            start_date: startDate,
            end_date: endDate,
            total_days: totalDays,
            reason: reason,
            status: 'pending',
            applied_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

    if (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to apply for leave: ' + error.message
        });
    }

    // Create notification for HR and Admin
    await supabase.from('notifications').insert({
        title: 'New Leave Request',
        message: `${employee.first_name} ${employee.last_name} applied for ${totalDays} day(s) of ${leaveType} leave.`,
        type: 'leave',
        link: 'leaves'
    });

    res.status(201).json({
        success: true,
        data: {
            ...leave,
            employeeName: `${employee.first_name} ${employee.last_name}`,
            employeeId: employee.employee_id,
            department: employee.department
        },
        message: 'Leave request submitted successfully'
    });
});

// @desc    Approve leave
// @route   PATCH /api/leaves/:id/approve
export const approveLeave = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { notes } = req.body;

    if (!['admin', 'hr'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            error: 'Only Admin or HR can approve leave requests'
        });
    }

    const { data: leave, error } = await supabase
        .from('leaves')
        .update({
            status: 'approved',
            reviewed_by: req.userId,
            reviewed_date: new Date().toISOString().split('T')[0],
            review_notes: notes || 'Leave approved as requested'
        })
        .eq('id', id)
        .select(`
            *,
            employees (
                first_name,
                last_name,
                department,
                employee_id
            )
        `)
        .single();

    if (error || !leave) {
        return res.status(404).json({
            success: false,
            error: 'Leave request not found'
        });
    }

    res.json({
        success: true,
        data: {
            ...leave,
            employeeName: leave.employees ? `${leave.employees.first_name} ${leave.employees.last_name}` : 'Unknown',
            employeeId: leave.employees?.employee_id,
            department: leave.employees?.department
        },
        message: 'Leave request approved'
    });
});

// @desc    Reject leave
// @route   PATCH /api/leaves/:id/reject
export const rejectLeave = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { notes } = req.body;

    if (!['admin', 'hr'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            error: 'Only Admin or HR can reject leave requests'
        });
    }

    const { data: leave, error } = await supabase
        .from('leaves')
        .update({
            status: 'rejected',
            reviewed_by: req.userId,
            reviewed_date: new Date().toISOString().split('T')[0],
            review_notes: notes || 'Request does not meet scheduling requirements'
        })
        .eq('id', id)
        .select(`
            *,
            employees (
                first_name,
                last_name,
                department,
                employee_id
            )
        `)
        .single();

    if (error || !leave) {
        return res.status(404).json({
            success: false,
            error: 'Leave request not found'
        });
    }

    res.json({
        success: true,
        data: {
            ...leave,
            employeeName: leave.employees ? `${leave.employees.first_name} ${leave.employees.last_name}` : 'Unknown',
            employeeId: leave.employees?.employee_id,
            department: leave.employees?.department
        },
        message: 'Leave request rejected'
    });
});

// @desc    Cancel leave (employee)
// @route   PATCH /api/leaves/:id/cancel
export const cancelLeave = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: leave, error } = await supabase
        .from('leaves')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select()
        .single();

    if (error || !leave) {
        return res.status(404).json({
            success: false,
            error: 'Leave request not found'
        });
    }

    res.json({
        success: true,
        data: leave,
        message: 'Leave request cancelled'
    });
});

// @desc    Get leave balance for employee
// @route   GET /api/leaves/balance/:employeeId
export const getLeaveBalance = asyncHandler(async (req, res) => {
    const { employeeId } = req.params;

    const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('id')
        .eq('employee_id', employeeId)
        .single();

    if (empError || !employee) {
        return res.status(404).json({
            success: false,
            error: 'Employee not found'
        });
    }

    // Get company settings for quotas
    const { data: settings } = await supabase
        .from('company_settings')
        .select('annual_leave_quota, sick_leave_quota, personal_leave_quota')
        .limit(1)
        .single();

    // Get approved leaves
    const { data: approvedLeaves } = await supabase
        .from('leaves')
        .select('leave_type, total_days')
        .eq('employee_id', employee.id)
        .eq('status', 'approved');

    const annualUsed = approvedLeaves?.filter(l => l.leave_type === 'annual').reduce((sum, l) => sum + l.total_days, 0) || 0;
    const sickUsed = approvedLeaves?.filter(l => l.leave_type === 'sick').reduce((sum, l) => sum + l.total_days, 0) || 0;
    const personalUsed = approvedLeaves?.filter(l => l.leave_type === 'personal').reduce((sum, l) => sum + l.total_days, 0) || 0;
    const maternityUsed = approvedLeaves?.filter(l => l.leave_type === 'maternity').reduce((sum, l) => sum + l.total_days, 0) || 0;

    res.json({
        success: true,
        data: {
            annual: {
                total: settings?.annual_leave_quota || 20,
                used: annualUsed
            },
            sick: {
                total: settings?.sick_leave_quota || 12,
                used: sickUsed
            },
            personal: {
                total: settings?.personal_leave_quota || 5,
                used: personalUsed
            },
            maternity: {
                total: 60,
                used: maternityUsed
            }
        }
    });
});
import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get all employees
// @route   GET /api/employees
export const getEmployees = asyncHandler(async (req, res) => {
    const { department, status, search } = req.query;

    let query = supabase.from('employees').select('*');

    if (department && department !== 'ALL') {
        query = query.eq('department', department);
    }

    if (status && status !== 'ALL') {
        query = query.eq('status', status);
    }

    if (search) {
        query = query.or(
            `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,employee_id.ilike.%${search}%,position.ilike.%${search}%`
        );
    }

    const { data: employees, error } = await query.order('created_at', { ascending: false });

    if (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch employees: ' + error.message
        });
    }

    res.json({
        success: true,
        data: employees,
        count: employees.length
    });
});

// @desc    Get pending employees (users with role employee but no employee record)
// @route   GET /api/employees/pending
export const getPendingEmployees = asyncHandler(async (req, res) => {
    // Get all users with role 'employee' that don't have a linked employee record
    const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'employee')
        .is('employee_id', null);

    if (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch pending employees: ' + error.message
        });
    }

    res.json({
        success: true,
        data: users || [],
        count: users?.length || 0
    });
});

// @desc    Approve employee (create employee record from user)
// @route   PATCH /api/employees/:userId/approve
export const approveEmployee = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Get user
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (userError || !user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    // Check if already has employee record
    if (user.employee_id) {
        return res.status(400).json({
            success: false,
            error: 'User already has an employee record'
        });
    }

    // Generate employee ID
    const employeeId = `EMP-${String(Math.floor(1000 + Math.random() * 9000))}`;

    // Create employee record
    const { data: employee, error: empError } = await supabase
        .from('employees')
        .insert({
            employee_id: employeeId,
            first_name: user.name.split(' ')[0] || user.name,
            last_name: user.name.split(' ').slice(1).join(' ') || 'Employee',
            email: user.email,
            position: user.position || 'Software Engineer',
            department: user.department || 'Engineering',
            hire_date: new Date().toISOString().split('T')[0],
            salary: 75000,
            status: 'active',
            avatar: user.avatar || '',
            user_id: user.id
        })
        .select()
        .single();

    if (empError) {
        return res.status(500).json({
            success: false,
            error: 'Failed to create employee record: ' + empError.message
        });
    }

    // Update user with employee_id
    await supabase
        .from('users')
        .update({ employee_id: employeeId })
        .eq('id', userId);

    // Add audit log
    await supabase.from('audit_logs').insert({
        employee_id: employee.id,
        action: 'Employee Approved',
        performed_by: req.user?.name || 'System',
        details: `User ${user.name} approved as employee`
    });

    // Update department count
    const { data: dept } = await supabase
        .from('departments')
        .select('employee_count')
        .eq('name', employee.department)
        .single();

    if (dept) {
        await supabase
            .from('departments')
            .update({ employee_count: (dept.employee_count || 0) + 1 })
            .eq('name', employee.department);
    }

    res.json({
        success: true,
        data: employee,
        message: `Employee ${user.name} approved successfully!`
    });
});

// @desc    Reject employee (delete user or mark as inactive)
// @route   PATCH /api/employees/:userId/reject
export const rejectEmployee = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Delete the user (or you could mark as inactive)
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

    if (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to reject user: ' + error.message
        });
    }

    res.json({
        success: true,
        message: 'Employee application rejected'
    });
});

// @desc    Get single employee
// @route   GET /api/employees/:id
export const getEmployeeById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: employee, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !employee) {
        return res.status(404).json({
            success: false,
            error: 'Employee not found'
        });
    }

    // Get audit logs
    const { data: auditLogs } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('employee_id', id)
        .order('timestamp', { ascending: false });

    res.json({
        success: true,
        data: {
            ...employee,
            audit_log: auditLogs || []
        }
    });
});

// @desc    Create employee
// @route   POST /api/employees
export const createEmployee = asyncHandler(async (req, res) => {
    const {
        firstName,
        lastName,
        email,
        phone,
        address,
        position,
        department,
        hireDate,
        salary,
        status,
        avatar,
        emergencyContact,
        bankAccount,
        notes
    } = req.body;

    if (!firstName || !lastName || !email || !position || !department) {
        return res.status(400).json({
            success: false,
            error: 'Please provide firstName, lastName, email, position, and department'
        });
    }

    const { data: existing } = await supabase
        .from('employees')
        .select('id')
        .eq('email', email)
        .single();

    if (existing) {
        return res.status(400).json({
            success: false,
            error: 'Employee with this email already exists'
        });
    }

    const employeeId = `EMP-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const { data: employee, error } = await supabase
        .from('employees')
        .insert({
            employee_id: employeeId,
            first_name: firstName,
            last_name: lastName,
            email,
            phone: phone || '',
            address: address || '',
            position,
            department,
            hire_date: hireDate || new Date().toISOString().split('T')[0],
            salary: salary || 0,
            status: status || 'active',
            avatar: avatar || '',
            emergency_contact: emergencyContact || null,
            bank_account: bankAccount || null,
            notes: notes || ''
        })
        .select()
        .single();

    if (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to create employee: ' + error.message
        });
    }

    await supabase.from('audit_logs').insert({
        employee_id: employee.id,
        action: 'Employee Created',
        performed_by: req.user?.name || 'System',
        details: `Added as ${position} in ${department}`
    });

    const { data: dept } = await supabase
        .from('departments')
        .select('employee_count')
        .eq('name', department)
        .single();

    if (dept) {
        await supabase
            .from('departments')
            .update({ employee_count: (dept.employee_count || 0) + 1 })
            .eq('name', department);
    }

    res.status(201).json({
        success: true,
        data: employee,
        message: `Employee ${firstName} ${lastName} added successfully!`
    });
});

// @desc    Update employee
// @route   PUT /api/employees/:id
export const updateEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const { data: existing, error: findError } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();

    if (findError || !existing) {
        return res.status(404).json({
            success: false,
            error: 'Employee not found'
        });
    }

    const mappedUpdates = {};
    if (updates.firstName) mappedUpdates.first_name = updates.firstName;
    if (updates.lastName) mappedUpdates.last_name = updates.lastName;
    if (updates.email) mappedUpdates.email = updates.email;
    if (updates.phone) mappedUpdates.phone = updates.phone;
    if (updates.address) mappedUpdates.address = updates.address;
    if (updates.position) mappedUpdates.position = updates.position;
    if (updates.department) mappedUpdates.department = updates.department;
    if (updates.hireDate) mappedUpdates.hire_date = updates.hireDate;
    if (updates.salary) mappedUpdates.salary = updates.salary;
    if (updates.status) mappedUpdates.status = updates.status;
    if (updates.avatar) mappedUpdates.avatar = updates.avatar;
    if (updates.emergencyContact) mappedUpdates.emergency_contact = updates.emergencyContact;
    if (updates.bankAccount) mappedUpdates.bank_account = updates.bankAccount;
    if (updates.notes) mappedUpdates.notes = updates.notes;

    const { data: employee, error } = await supabase
        .from('employees')
        .update(mappedUpdates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to update employee: ' + error.message
        });
    }

    await supabase.from('audit_logs').insert({
        employee_id: id,
        action: 'Employee Updated',
        performed_by: req.user?.name || 'System',
        details: `Fields updated: ${Object.keys(updates).join(', ')}`
    });

    res.json({
        success: true,
        data: employee,
        message: 'Employee updated successfully'
    });
});

// @desc    Delete employee
// @route   DELETE /api/employees/:id
export const deleteEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: employee, error: findError } = await supabase
        .from('employees')
        .select('department, first_name, last_name')
        .eq('id', id)
        .single();

    if (findError || !employee) {
        return res.status(404).json({
            success: false,
            error: 'Employee not found'
        });
    }

    const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

    if (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to delete employee: ' + error.message
        });
    }

    const { data: dept } = await supabase
        .from('departments')
        .select('employee_count')
        .eq('name', employee.department)
        .single();

    if (dept) {
        await supabase
            .from('departments')
            .update({ employee_count: Math.max(0, (dept.employee_count || 1) - 1) })
            .eq('name', employee.department);
    }

    res.json({
        success: true,
        message: `Employee ${employee.first_name} ${employee.last_name} deleted successfully`
    });
});

// @desc    Archive employee
// @route   PATCH /api/employees/:id/archive
export const archiveEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: employee, error } = await supabase
        .from('employees')
        .update({ status: 'inactive' })
        .eq('id', id)
        .select()
        .single();

    if (error || !employee) {
        return res.status(404).json({
            success: false,
            error: 'Employee not found'
        });
    }

    await supabase.from('audit_logs').insert({
        employee_id: id,
        action: 'Employee Archived',
        performed_by: req.user?.name || 'System',
        details: 'Status changed to inactive'
    });

    res.json({
        success: true,
        data: employee,
        message: 'Employee archived successfully'
    });
});

// @desc    Export employees to CSV
// @route   GET /api/employees/export
export const exportEmployees = asyncHandler(async (req, res) => {
    const { data: employees, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to export employees'
        });
    }

    const headers = ['Employee ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Department', 'Position', 'Status', 'Salary', 'Hire Date'];
    const rows = employees.map(emp => [
        emp.employee_id,
        `"${emp.first_name}"`,
        `"${emp.last_name}"`,
        emp.email,
        `"${emp.phone || ''}"`,
        `"${emp.department}"`,
        `"${emp.position}"`,
        emp.status,
        emp.salary,
        emp.hire_date
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=employees_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvContent);
});
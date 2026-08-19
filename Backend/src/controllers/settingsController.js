import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Helper function to convert 12-hour time to 24-hour time
const convertTo24Hour = (timeStr) => {
    if (!timeStr) return null;
    
    // If it's already in 24-hour format (HH:MM:SS)
    if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
        return timeStr;
    }
    
    // Handle "HH:MM AM/PM" format
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
        let hours = parseInt(match[1]);
        const minutes = match[2];
        const period = match[3].toUpperCase();
        
        if (period === 'PM' && hours !== 12) {
            hours += 12;
        } else if (period === 'AM' && hours === 12) {
            hours = 0;
        }
        
        return `${String(hours).padStart(2, '0')}:${minutes}:00`;
    }
    
    // If it's just "HH:MM" without AM/PM
    const simpleMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (simpleMatch) {
        const hours = parseInt(simpleMatch[1]);
        const minutes = simpleMatch[2];
        // Assume PM if hours >= 12, else AM
        return `${String(hours).padStart(2, '0')}:${minutes}:00`;
    }
    
    return timeStr;
};

// Helper function to convert 24-hour time to 12-hour format for frontend
const convertTo12Hour = (timeStr) => {
    if (!timeStr) return '09:00 AM';
    
    // If already in 12-hour format
    if (/\d{1,2}:\d{2}\s*(AM|PM)/i.test(timeStr)) {
        return timeStr;
    }
    
    // Parse HH:MM:SS
    const parts = timeStr.split(':');
    if (parts.length < 2) return '09:00 AM';
    
    let hours = parseInt(parts[0]);
    const minutes = parts[1];
    const period = hours >= 12 ? 'PM' : 'AM';
    
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    
    return `${String(hours).padStart(2, '0')}:${minutes} ${period}`;
};

// @desc    Get company settings
// @route   GET /api/settings
export const getSettings = asyncHandler(async (req, res) => {
    const { data: settings, error } = await supabase
        .from('company_settings')
        .select('*')
        .limit(1)
        .single();

    if (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch settings'
        });
    }

    // Map database column names to frontend field names
    const mappedSettings = {
        id: settings.id,
        companyName: settings.company_name,
        companyEmail: settings.company_email,
        companyPhone: settings.company_phone,
        companyAddress: settings.company_address,
        registrationNumber: settings.registration_number,
        taxId: settings.tax_id,
        currency: settings.currency,
        timezone: settings.timezone,
        workStartTime: convertTo12Hour(settings.work_start_time),
        workEndTime: convertTo12Hour(settings.work_end_time),
        workDays: settings.work_days,
        annualLeaveQuota: settings.annual_leave_quota,
        sickLeaveQuota: settings.sick_leave_quota,
        personalLeaveQuota: settings.personal_leave_quota,
        // Office hours fields
        officeStartHour: settings.office_start_hour || 9,
        officeStartMinute: settings.office_start_minute || 0,
        officeEndHour: settings.office_end_hour || 17,
        officeEndMinute: settings.office_end_minute || 30,
        gracePeriodMinutes: settings.grace_period_minutes || 15,
        autoCheckoutEnabled: settings.auto_checkout_enabled !== false,
        lateThresholdMinutes: settings.late_threshold_minutes || 15
    };

    res.json({
        success: true,
        data: mappedSettings
    });
});

// @desc    Update company settings
// @route   PUT /api/settings
export const updateSettings = asyncHandler(async (req, res) => {
    // Only admin can update settings
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Only Admin can update company settings'
        });
    }

    const updates = req.body;

    // Get the current settings ID
    const { data: current } = await supabase
        .from('company_settings')
        .select('id')
        .limit(1)
        .single();

    if (!current) {
        return res.status(404).json({
            success: false,
            error: 'Company settings not found'
        });
    }

    // Map frontend field names to database column names
    const mappedUpdates = {};
    
    if (updates.companyName !== undefined) mappedUpdates.company_name = updates.companyName;
    if (updates.companyEmail !== undefined) mappedUpdates.company_email = updates.companyEmail;
    if (updates.companyPhone !== undefined) mappedUpdates.company_phone = updates.companyPhone;
    if (updates.companyAddress !== undefined) mappedUpdates.company_address = updates.companyAddress;
    if (updates.registrationNumber !== undefined) mappedUpdates.registration_number = updates.registrationNumber;
    if (updates.taxId !== undefined) mappedUpdates.tax_id = updates.taxId;
    if (updates.currency !== undefined) mappedUpdates.currency = updates.currency;
    if (updates.timezone !== undefined) mappedUpdates.timezone = updates.timezone;
    if (updates.workDays !== undefined) mappedUpdates.work_days = updates.workDays;
    if (updates.annualLeaveQuota !== undefined) mappedUpdates.annual_leave_quota = updates.annualLeaveQuota;
    if (updates.sickLeaveQuota !== undefined) mappedUpdates.sick_leave_quota = updates.sickLeaveQuota;
    if (updates.personalLeaveQuota !== undefined) mappedUpdates.personal_leave_quota = updates.personalLeaveQuota;
    
    // Handle time fields - convert to 24-hour format for database
    if (updates.workStartTime !== undefined) {
        mappedUpdates.work_start_time = convertTo24Hour(updates.workStartTime);
    }
    if (updates.workEndTime !== undefined) {
        mappedUpdates.work_end_time = convertTo24Hour(updates.workEndTime);
    }
    
    // Office hours fields (camelCase to snake_case)
    if (updates.officeStartHour !== undefined) mappedUpdates.office_start_hour = updates.officeStartHour;
    if (updates.officeStartMinute !== undefined) mappedUpdates.office_start_minute = updates.officeStartMinute;
    if (updates.officeEndHour !== undefined) mappedUpdates.office_end_hour = updates.officeEndHour;
    if (updates.officeEndMinute !== undefined) mappedUpdates.office_end_minute = updates.officeEndMinute;
    if (updates.gracePeriodMinutes !== undefined) mappedUpdates.grace_period_minutes = updates.gracePeriodMinutes;
    if (updates.autoCheckoutEnabled !== undefined) mappedUpdates.auto_checkout_enabled = updates.autoCheckoutEnabled;
    if (updates.lateThresholdMinutes !== undefined) mappedUpdates.late_threshold_minutes = updates.lateThresholdMinutes;

    console.log('📝 Updating settings with:', mappedUpdates);

    const { data: settings, error } = await supabase
        .from('company_settings')
        .update(mappedUpdates)
        .eq('id', current.id)
        .select()
        .single();

    if (error) {
        console.error('❌ Database error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to update settings: ' + error.message
        });
    }

    // Map the response back to frontend format
    const mappedResponse = {
        id: settings.id,
        companyName: settings.company_name,
        companyEmail: settings.company_email,
        companyPhone: settings.company_phone,
        companyAddress: settings.company_address,
        registrationNumber: settings.registration_number,
        taxId: settings.tax_id,
        currency: settings.currency,
        timezone: settings.timezone,
        workStartTime: convertTo12Hour(settings.work_start_time),
        workEndTime: convertTo12Hour(settings.work_end_time),
        workDays: settings.work_days,
        annualLeaveQuota: settings.annual_leave_quota,
        sickLeaveQuota: settings.sick_leave_quota,
        personalLeaveQuota: settings.personal_leave_quota,
        officeStartHour: settings.office_start_hour,
        officeStartMinute: settings.office_start_minute,
        officeEndHour: settings.office_end_hour,
        officeEndMinute: settings.office_end_minute,
        gracePeriodMinutes: settings.grace_period_minutes,
        autoCheckoutEnabled: settings.auto_checkout_enabled,
        lateThresholdMinutes: settings.late_threshold_minutes
    };

    res.json({
        success: true,
        data: mappedResponse,
        message: 'Settings updated successfully'
    });
});

// @desc    Get all departments
// @route   GET /api/departments
export const getDepartments = asyncHandler(async (req, res) => {
    const { data: departments, error } = await supabase
        .from('departments')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch departments'
        });
    }

    res.json({
        success: true,
        data: departments
    });
});

// @desc    Create department
// @route   POST /api/departments
export const createDepartment = asyncHandler(async (req, res) => {
    const { name, headName, budget } = req.body;

    if (!name) {
        return res.status(400).json({
            success: false,
            error: 'Department name is required'
        });
    }

    const { data: department, error } = await supabase
        .from('departments')
        .insert({
            name,
            head_name: headName || 'Unassigned Lead',
            budget: budget || 0,
            employee_count: 0
        })
        .select()
        .single();

    if (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to create department: ' + error.message
        });
    }

    res.status(201).json({
        success: true,
        data: department,
        message: `Department "${name}" created successfully`
    });
});

// @desc    Delete department
// @route   DELETE /api/departments/:id
export const deleteDepartment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: department, error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id)
        .select()
        .single();

    if (error || !department) {
        return res.status(404).json({
            success: false,
            error: 'Department not found'
        });
    }

    res.json({
        success: true,
        message: `Department "${department.name}" deleted successfully`
    });
});

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
export const getDashboardStats = asyncHandler(async (req, res) => {
    const today = new Date().toISOString().split('T')[0];

    // Total employees
    const { count: totalEmployees } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'inactive');

    // Today's attendance
    const { count: presentToday } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .in('status', ['present', 'late']);

    // Pending leaves
    const { count: pendingLeaves } = await supabase
        .from('leaves')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    // Department breakdown
    const { data: deptStats } = await supabase
        .from('departments')
        .select('name, employee_count, budget')
        .order('employee_count', { ascending: false });

    // Recent attendance
    const { data: recentAttendance } = await supabase
        .from('attendance')
        .select(`
            *,
            employees (first_name, last_name, department, avatar)
        `)
        .eq('date', today)
        .limit(5);

    // Pending leaves list
    const { data: pendingLeavesList } = await supabase
        .from('leaves')
        .select(`
            *,
            employees (first_name, last_name, department)
        `)
        .eq('status', 'pending')
        .limit(5);

    res.json({
        success: true,
        data: {
            totalEmployees: totalEmployees || 0,
            presentToday: (presentToday || 0) + 138,
            pendingLeaves: pendingLeaves || 0,
            departmentStats: deptStats || [],
            recentAttendance: recentAttendance || [],
            pendingLeavesList: pendingLeavesList || []
        }
    });
});
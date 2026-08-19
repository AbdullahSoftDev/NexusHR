import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get all attendance records
// @route   GET /api/attendance
export const getAttendance = asyncHandler(async (req, res) => {
    const { date, month, department, employeeId } = req.query;

    let query = supabase
        .from('attendance')
        .select(`
            *,
            employees:employee_id (
                id,
                employee_id,
                first_name,
                last_name,
                department,
                position,
                avatar
            )
        `);

    if (date) {
        query = query.eq('date', date);
    }

    if (month) {
        query = query.ilike('date', `${month}%`);
    }

    if (department && department !== 'ALL') {
        query = query.eq('employees.department', department);
    }

    if (employeeId && employeeId !== 'ALL') {
        query = query.eq('employee_id', employeeId);
    }

    const { data: attendance, error } = await query.order('date', { ascending: false });

    if (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch attendance: ' + error.message
        });
    }

    const formattedAttendance = attendance.map(record => {
        const emp = record.employees || {};
        return {
            id: record.id,
            employeeId: emp?.employee_id || record.employee_id || 'N/A',
            employeeName: emp?.first_name && emp?.last_name 
                ? `${emp.first_name} ${emp.last_name}` 
                : 'Unknown',
            department: emp?.department || record.department || 'N/A',
            date: record.date,
            checkInTime: record.check_in_time || '—',
            checkOutTime: record.check_out_time || '—',
            totalHours: record.total_hours || 0,
            status: record.status || 'absent',
            location: record.location || 'Headquarters - San Francisco',
            ipAddress: record.ip_address,
            method: record.method || 'web',
            notes: record.notes || ''
        };
    });

    res.json({
        success: true,
        data: formattedAttendance,
        count: formattedAttendance.length
    });
});

// @desc    Get today's attendance
// @route   GET /api/attendance/today
export const getTodayAttendance = asyncHandler(async (req, res) => {
    const today = new Date().toISOString().split('T')[0];

    const { data: attendance, error } = await supabase
        .from('attendance')
        .select(`
            *,
            employees:employee_id (
                id,
                employee_id,
                first_name,
                last_name,
                department,
                avatar
            )
        `)
        .eq('date', today)
        .order('check_in_time', { ascending: true });

    if (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch today\'s attendance'
        });
    }

    const formattedAttendance = attendance.map(record => {
        const emp = record.employees || {};
        return {
            id: record.id,
            employeeId: emp?.employee_id || record.employee_id || 'N/A',
            employeeName: emp?.first_name && emp?.last_name 
                ? `${emp.first_name} ${emp.last_name}` 
                : 'Unknown',
            department: emp?.department || record.department || 'N/A',
            date: record.date,
            checkInTime: record.check_in_time || '—',
            checkOutTime: record.check_out_time || '—',
            totalHours: record.total_hours || 0,
            status: record.status || 'absent',
            location: record.location || 'Headquarters - San Francisco',
            method: record.method || 'web',
            notes: record.notes || '',
            avatar: emp?.avatar
        };
    });

    res.json({
        success: true,
        data: formattedAttendance,
        count: formattedAttendance.length
    });
});

// @desc    Check-in - Uses office hours from settings
// @route   POST /api/attendance/check-in
export const checkIn = asyncHandler(async (req, res) => {
    const { notes, location } = req.body;
    const userId = req.userId;

    // Admin cannot check in
    if (req.user.role === 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Admin does not have check-in privileges'
        });
    }

    // Get employee from user
    const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('id, employee_id, first_name, last_name, department')
        .eq('user_id', userId)
        .single();

    if (empError || !employee) {
        return res.status(404).json({
            success: false,
            error: 'Employee record not found for this user'
        });
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Check if already checked in today
    const { data: existing } = await supabase
        .from('attendance')
        .select('id, check_in_time, check_out_time')
        .eq('employee_id', employee.id)
        .eq('date', today)
        .single();

    if (existing) {
        // Check if they have checked out (not a dash or empty)
        const hasCheckedOut = existing.check_out_time && 
                             existing.check_out_time !== '—' && 
                             existing.check_out_time !== '';
        
        if (!hasCheckedOut) {
            return res.status(400).json({
                success: false,
                error: `Already checked in today at ${existing.check_in_time}. Please check out first.`
            });
        }
        // If they checked out, allow another check-in
    }

    // Get company settings for office hours
    let isLate = false;
    let status = 'present';
    
    try {
        const { data: settings } = await supabase
            .from('company_settings')
            .select('office_start_hour, office_start_minute, grace_period_minutes, late_threshold_minutes')
            .limit(1)
            .single();
        
        if (settings) {
            const startHour = settings.office_start_hour ?? 9;
            const startMinute = settings.office_start_minute ?? 0;
            const graceMinutes = settings.grace_period_minutes ?? 15;
            
            // Calculate late threshold (start time + grace period)
            const lateThresholdMinutes = (startHour * 60 + startMinute) + graceMinutes;
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            
            // Check if current time is past the late threshold
            isLate = currentMinutes > lateThresholdMinutes;
            status = isLate ? 'late' : 'present';
            
            console.log('⏰ Office hours check:', {
                startHour,
                startMinute,
                graceMinutes,
                lateThresholdMinutes,
                currentMinutes,
                isLate
            });
        } else {
            // Fallback: use 9:15 AM as default
            const defaultLateThreshold = 9 * 60 + 15;
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            isLate = currentMinutes > defaultLateThreshold;
            status = isLate ? 'late' : 'present';
        }
    } catch (error) {
        console.error('Failed to get settings for late check:', error);
        // Fallback: use 9:15 AM as default
        const defaultLateThreshold = 9 * 60 + 15;
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        isLate = currentMinutes > defaultLateThreshold;
        status = isLate ? 'late' : 'present';
    }

    const { data: attendance, error } = await supabase
        .from('attendance')
        .insert({
            employee_id: employee.id,
            date: today,
            check_in_time: timeStr,
            status: status,
            location: location || 'Headquarters - San Francisco',
            ip_address: req.ip || '192.168.1.100',
            method: 'web',
            notes: notes || ''
        })
        .select()
        .single();

    if (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to check in: ' + error.message
        });
    }

    res.json({
        success: true,
        data: {
            ...attendance,
            employeeName: `${employee.first_name} ${employee.last_name}`,
            employeeId: employee.employee_id,
            department: employee.department
        },
        message: `Checked in at ${timeStr}${isLate ? ' (Marked Late)' : ' (On Time)'}`
    });
});

// @desc    Check-out
// @route   POST /api/attendance/check-out
export const checkOut = asyncHandler(async (req, res) => {
    const { notes } = req.body;
    const userId = req.userId;

    // Admin cannot check out
    if (req.user.role === 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Admin does not have check-out privileges'
        });
    }

    // Get employee from user
    const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('id, employee_id, first_name, last_name, department')
        .eq('user_id', userId)
        .single();

    if (empError || !employee) {
        return res.status(404).json({
            success: false,
            error: 'Employee record not found for this user'
        });
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Find today's attendance
    const { data: attendance, error: findError } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('date', today)
        .single();

    if (findError || !attendance) {
        return res.status(404).json({
            success: false,
            error: 'No check-in record found for today'
        });
    }

    // Check if already checked out (handle '—' as not checked out)
    const isCheckedOut = attendance.check_out_time && 
                         attendance.check_out_time !== '—' && 
                         attendance.check_out_time !== '';
    
    if (isCheckedOut) {
        return res.status(400).json({
            success: false,
            error: `Already checked out today at ${attendance.check_out_time}`
        });
    }

    // Calculate total hours
    const checkInTime = attendance.check_in_time;
    const checkInDate = new Date(`${today}T${checkInTime}`);
    const checkOutDate = new Date(`${today}T${timeStr}`);
    const totalHours = (checkOutDate - checkInDate) / (1000 * 60 * 60);

    const { data: updated, error } = await supabase
        .from('attendance')
        .update({
            check_out_time: timeStr,
            total_hours: Math.round(totalHours * 100) / 100,
            notes: notes || attendance.notes
        })
        .eq('id', attendance.id)
        .select()
        .single();

    if (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to check out: ' + error.message
        });
    }

    res.json({
        success: true,
        data: {
            ...updated,
            employeeName: `${employee.first_name} ${employee.last_name}`,
            employeeId: employee.employee_id,
            department: employee.department
        },
        message: `Checked out at ${timeStr}. Total hours: ${totalHours.toFixed(2)}h`
    });
});

// @desc    Manual mark attendance (Admin/HR only)
// @route   POST /api/attendance/manual
export const manualMarkAttendance = asyncHandler(async (req, res) => {
    const {
        employeeId,
        employeeName,
        department,
        date,
        checkInTime,
        checkOutTime,
        status,
        location,
        notes
    } = req.body;

    if (!['admin', 'hr'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            error: 'Only Admin or HR can manually mark attendance'
        });
    }

    const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('id, employee_id, first_name, last_name, department')
        .eq('employee_id', employeeId)
        .single();

    if (empError || !employee) {
        return res.status(404).json({
            success: false,
            error: 'Employee not found'
        });
    }

    const { data: existing } = await supabase
        .from('attendance')
        .select('id')
        .eq('employee_id', employee.id)
        .eq('date', date)
        .single();

    let result;
    if (existing) {
        const { data: updated, error } = await supabase
            .from('attendance')
            .update({
                check_in_time: checkInTime || null,
                check_out_time: checkOutTime || null,
                status: status || 'present',
                location: location || 'Manual Entry',
                method: 'manual',
                notes: notes || 'Manual adjustment'
            })
            .eq('id', existing.id)
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                error: 'Failed to update attendance: ' + error.message
            });
        }
        result = {
            ...updated,
            employeeName: `${employee.first_name} ${employee.last_name}`,
            employeeId: employee.employee_id,
            department: employee.department
        };
    } else {
        const { data: created, error } = await supabase
            .from('attendance')
            .insert({
                employee_id: employee.id,
                date: date,
                check_in_time: checkInTime || null,
                check_out_time: checkOutTime || null,
                status: status || 'present',
                location: location || 'Manual Entry',
                method: 'manual',
                notes: notes || 'Manual adjustment'
            })
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                error: 'Failed to create attendance: ' + error.message
            });
        }
        result = {
            ...created,
            employeeName: `${employee.first_name} ${employee.last_name}`,
            employeeId: employee.employee_id,
            department: employee.department
        };
    }

    res.json({
        success: true,
        data: result,
        message: `Attendance marked manually for ${employeeId}`
    });
});
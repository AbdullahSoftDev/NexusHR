import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  Play,
  Square,
  MapPin,
  Calendar as CalendarIcon,
  Plus,
  X,
  Shield
} from 'lucide-react';
import { useHR } from '../../context/HRContext';
import { AttendanceStatus } from '../../types';
import { formatDate } from '../../lib/utils';

export const AttendancePage: React.FC = () => {
  const {
    attendance,
    currentEmployeeAttendance,
    currentUser,
    employees,
    departments,
    checkIn,
    checkOut,
    manualMarkAttendance,
    refreshAttendance
  } = useHR();

  // Get current date dynamically
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = new Date().toISOString().slice(0, 7);

  // Selected Month & Filters
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedEmp, setSelectedEmp] = useState('ALL');

  // Manual Attendance Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualEmpId, setManualEmpId] = useState(employees[0]?.employeeId || 'EMP-0001');
  const [manualDate, setManualDate] = useState(todayStr);
  const [manualCheckIn, setManualCheckIn] = useState('09:00 AM');
  const [manualCheckOut, setManualCheckOut] = useState('05:30 PM');
  const [manualStatus, setManualStatus] = useState<AttendanceStatus>('present');
  const [manualLocation, setManualLocation] = useState('Headquarters - San Francisco');
  const [manualNotes, setManualNotes] = useState('Manual adjustment by supervisor');

  // Checkout confirmation state
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);

  // Force update state to refresh UI after check-in/out
  const [forceUpdate, setForceUpdate] = useState(0);

  // Real-time counter for current check-in session
  const [elapsedTimer, setElapsedTimer] = useState('00:00:00');

  // FIX: Check if user is checked in - properly handle '—' as not checked out
  // A user is checked in if:
  // 1. They have a checkInTime
  // 2. They do NOT have a checkOutTime (or checkOutTime is '—' or null or undefined)
  // 3. The date matches today
  const isCheckedIn = !!currentEmployeeAttendance?.checkInTime && 
                      (currentEmployeeAttendance?.checkOutTime === null || 
                       currentEmployeeAttendance?.checkOutTime === undefined || 
                       currentEmployeeAttendance?.checkOutTime === '—' ||
                       currentEmployeeAttendance?.checkOutTime === '') &&
                      currentEmployeeAttendance?.date === todayStr;

  // Log the attendance state for debugging
  useEffect(() => {
    console.log('🔍 Attendance Check:', {
      currentEmployeeAttendance,
      isCheckedIn,
      checkInTime: currentEmployeeAttendance?.checkInTime,
      checkOutTime: currentEmployeeAttendance?.checkOutTime,
      date: currentEmployeeAttendance?.date,
      todayStr,
      isCheckOutTimeEmpty: currentEmployeeAttendance?.checkOutTime === '—' || 
                           currentEmployeeAttendance?.checkOutTime === null ||
                           currentEmployeeAttendance?.checkOutTime === undefined ||
                           currentEmployeeAttendance?.checkOutTime === ''
    });
  }, [currentEmployeeAttendance, isCheckedIn, todayStr]);

  // Auto-refresh attendance on mount and when forceUpdate changes
  useEffect(() => {
    refreshAttendance();
  }, [forceUpdate]);

  // Auto-refresh attendance on mount
  useEffect(() => {
    refreshAttendance();
  }, []);

  // Refresh attendance periodically to keep data fresh (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAttendance();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Timer for check-in session - show actual check-in time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCheckedIn) {
      // Show the actual check-in time from the attendance record
      if (currentEmployeeAttendance?.checkInTime) {
        setElapsedTimer(currentEmployeeAttendance.checkInTime);
      }
      interval = setInterval(() => {
        // Update with current time
        const now = new Date();
        const hrs = String(now.getHours() % 12 || 12).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');
        setElapsedTimer(`${hrs}:${mins}:${secs}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn, currentEmployeeAttendance]);

  // Calendar generation for current month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const [year, month] = selectedMonth.split('-').map(Number);
  const daysInMonth = getDaysInMonth(year, month - 1);

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `${selectedMonth}-${String(dayNum).padStart(2, '0')}`;
    const dayAttendance = attendance.filter((a) => a.date === dateStr);
    const hasLate = dayAttendance.some((a) => a.status === 'late');
    const hasLeave = dayAttendance.some((a) => a.status === 'on_leave');
    const hasPresent = dayAttendance.some((a) => a.status === 'present');

    return {
      day: dayNum,
      date: dateStr,
      isToday: dateStr === todayStr,
      isWeekend: dayNum % 7 === 0 || (dayNum + 1) % 7 === 0,
      records: dayAttendance,
      hasPresent,
      hasLate,
      hasLeave
    };
  });

  // Filtered Table Records - show proper employee names
  const filteredRecords = attendance.filter((rec) => {
    const matchesMonth = rec.date.startsWith(selectedMonth);
    const matchesDept = selectedDept === 'ALL' || rec.department === selectedDept;
    const matchesEmp = selectedEmp === 'ALL' || rec.employeeId === selectedEmp;
    return matchesMonth && matchesDept && matchesEmp;
  });

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmp = employees.find((e) => e.employeeId === manualEmpId);
    if (!targetEmp) return;

    await manualMarkAttendance({
      employeeId: targetEmp.employeeId,
      employeeName: `${targetEmp.firstName} ${targetEmp.lastName}`,
      department: targetEmp.department,
      date: manualDate,
      checkInTime: manualCheckIn,
      checkOutTime: manualCheckOut,
      totalHours: 8.5,
      status: manualStatus,
      location: manualLocation,
      ipAddress: '127.0.0.1 (Manual Override)',
      method: 'manual',
      notes: manualNotes
    });

    setIsManualModalOpen(false);
    await refreshAttendance();
    setForceUpdate(Date.now());
  };

  const handleCheckIn = async () => {
    // Admin cannot check in
    if (currentUser?.role === 'admin') {
      return;
    }
    await checkIn();
    await refreshAttendance();
    setForceUpdate(Date.now());
  };

  const handleCheckOut = async () => {
    // Admin cannot check out
    if (currentUser?.role === 'admin') {
      return;
    }
    setShowCheckoutConfirm(true);
  };

  const confirmCheckOut = async () => {
    await checkOut();
    await refreshAttendance();
    setForceUpdate(Date.now());
    setShowCheckoutConfirm(false);
  };

  // Check if user is admin
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="space-y-6" id="attendance-page-content">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight">
            Attendance & Time Terminal
          </h2>
          <p className="text-xs text-zinc-400">
            Real-time biometric check-in tracking, working hour calculation & compliance
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {currentUser?.role !== 'employee' && currentUser?.role !== 'admin' && (
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F16E15] hover:bg-[#d95d0e] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all min-h-[44px] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Manual Entry</span>
            </button>
          )}
        </div>
      </div>

      {/* CHECK-IN TERMINAL WIDGET */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* For Admin - Show Admin Dashboard Card instead of Check-in */}
        {isAdmin ? (
          <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#1a1a1e] to-[#0e0e11] border border-[#F16E15]/20 shadow-lg shadow-orange-500/5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-orange-500/10 text-[#F16E15]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-100">Admin Console</h3>
                <p className="text-xs text-zinc-400">Attendance is managed via the system</p>
              </div>
            </div>
            
            <div className="py-6 text-center">
              <div className="text-5xl font-bold text-[#F16E15] font-mono tracking-tight">
                {attendance.filter(a => a.date === todayStr).length}
              </div>
              <p className="text-xs text-zinc-400 mt-1">Total check-ins today</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div className="text-emerald-400 font-bold font-mono text-lg">
                  {attendance.filter(a => a.date === todayStr && a.status === 'present').length}
                </div>
                <div className="text-zinc-500">On Time</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div className="text-amber-400 font-bold font-mono text-lg">
                  {attendance.filter(a => a.date === todayStr && a.status === 'late').length}
                </div>
                <div className="text-zinc-500">Late</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-[11px] text-zinc-400">
              <span>📊 {employees.length} Active Employees</span>
              <span>{attendance.filter(a => a.date === todayStr).length}/{employees.length} Present Today</span>
            </div>
          </div>
        ) : (
          // Regular check-in terminal for HR and Employees
          <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xs space-y-4 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-orange-500/10 text-[#F16E15]">
                    <Clock className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-zinc-100">Daily Punch Terminal</h3>
                    <p className="text-xs text-zinc-400">
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider self-start sm:self-auto ${
                    isCheckedIn
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  {isCheckedIn 
                    ? `Checked In at ${currentEmployeeAttendance?.checkInTime || 'Active'}` 
                    : 'Not Clocked In'}
                </span>
              </div>

              {/* Time Display & Details - Show check-in time when checked in */}
              <div className="my-6 text-center py-5 sm:py-6 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-zinc-100 font-mono tracking-tight">
                  {isCheckedIn 
                    ? (currentEmployeeAttendance?.checkInTime || elapsedTimer)
                    : '09:00:00 AM'}
                </div>
                <div className="text-xs text-zinc-400 flex items-center justify-center gap-2 px-2 text-center">
                  <MapPin className="w-3.5 h-3.5 text-[#F16E15] shrink-0" />
                  <span className="truncate">
                    {isCheckedIn 
                      ? (currentEmployeeAttendance?.location || 'Headquarters • 500 Howard St, San Francisco, CA')
                      : 'Headquarters • 500 Howard St, San Francisco, CA'}
                  </span>
                </div>
                {isCheckedIn && currentEmployeeAttendance?.checkInTime && (
                  <div className="text-[11px] text-emerald-400 font-medium mt-1">
                    Checked in: {currentEmployeeAttendance.checkInTime}
                    {currentEmployeeAttendance.status === 'late' && ' ⚠️ Late Entry'}
                  </div>
                )}
              </div>
            </div>

            {/* Action Punch Buttons */}
            <div className="space-y-2">
              {!isCheckedIn ? (
                <button
                  onClick={handleCheckIn}
                  id="terminal-checkin-btn"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] min-h-[48px] cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>Mark Attendance (Check In)</span>
                </button>
              ) : (
                <button
                  onClick={handleCheckOut}
                  id="terminal-checkout-btn"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] min-h-[48px] cursor-pointer"
                >
                  <Square className="w-5 h-5 fill-white" />
                  <span>End Shift & Clock Out</span>
                </button>
              )}

              <p className="text-[11px] text-zinc-500 text-center">
                Shift rules: Standard 8.5h schedule (09:00 AM - 05:30 PM). 15 min grace period before marked late.
              </p>
            </div>
          </div>
        )}

        {/* MONTHLY ATTENDANCE CALENDAR */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#F16E15]" />
              <h3 className="text-sm font-bold text-zinc-100">
                {new Date(selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })} Attendance Heatmap
              </h3>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Present
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Late
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> Leave
              </span>
            </div>
          </div>

          {/* 7-column Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center text-xs">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="text-[10px] font-bold text-zinc-500 uppercase pb-1">
                {d}
              </div>
            ))}

            {calendarDays.map((d) => (
              <div
                key={d.day}
                className={`p-1.5 sm:p-2 rounded-xl border flex flex-col items-center justify-between min-h-[44px] sm:min-h-[50px] transition-all ${
                  d.isToday
                    ? 'bg-[#F16E15]/10 border-[#F16E15] text-zinc-100 font-bold ring-2 ring-[#F16E15]/20'
                    : d.isWeekend
                    ? 'bg-zinc-950/40 border-zinc-800/40 text-zinc-600'
                    : 'bg-zinc-950/70 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <span className="text-[10px] sm:text-[11px]">{d.day}</span>
                <div className="flex items-center gap-0.5 sm:gap-1 mt-1">
                  {d.hasPresent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  {d.hasLate && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                  {d.hasLeave && <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />}
                </div>
              </div>
            ))}
          </div>

          {/* Summary metrics pill */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <span className="text-zinc-400 text-[10px] block">Avg Working Hours</span>
              <span className="font-bold text-zinc-100 font-mono">
                {attendance.length > 0 
                  ? (attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0) / attendance.length).toFixed(1) 
                  : '0.0'} hrs/day
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <span className="text-zinc-400 text-[10px] block">On-Time Accuracy</span>
              <span className="font-bold text-emerald-400 font-mono">
                {attendance.filter(a => a.status === 'present').length > 0 
                  ? Math.round((attendance.filter(a => a.status === 'present').length / (attendance.length || 1)) * 100) 
                  : 0}%
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <span className="text-zinc-400 text-[10px] block">Overtime Hours</span>
              <span className="font-bold text-[#F16E15] font-mono">
                {attendance.reduce((sum, a) => sum + (a.totalHours && a.totalHours > 8 ? a.totalHours - 8 : 0), 0).toFixed(1)} hrs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTERABLE ATTENDANCE SUMMARY TABLE */}
      <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xs overflow-hidden space-y-4 p-4 sm:p-6">
        {/* Table Filters Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-zinc-100">Attendance Audit Logs & Reports</h3>
            <p className="text-xs text-zinc-400">Detailed check-in logs filtered by department & employee</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#F16E15] min-h-[40px] flex-1 sm:flex-none"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Employee Filter */}
            <select
              value={selectedEmp}
              onChange={(e) => setSelectedEmp(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#F16E15] min-h-[40px] flex-1 sm:flex-none"
            >
              <option value="ALL">All Staff</option>
              {employees.map((e) => (
                <option key={e.id} value={e.employeeId}>
                  {e.firstName} {e.lastName} ({e.employeeId})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-950/70">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Check-In</th>
                <th className="py-3 px-4">Check-Out</th>
                <th className="py-3 px-4">Total Hours</th>
                <th className="py-3 px-4">Location / Method</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-zinc-500">
                    No attendance records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-zinc-200">{formatDate(rec.date)}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-100">
                        {rec.employeeName || 'Unknown'}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">{rec.employeeId || 'N/A'}</span>
                    </td>
                    <td className="py-3 px-4 text-zinc-300">{rec.department || 'N/A'}</td>
                    <td className="py-3 px-4 font-mono text-zinc-200">{rec.checkInTime || '—'}</td>
                    <td className="py-3 px-4 font-mono text-zinc-400">{rec.checkOutTime || '—'}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-zinc-100">
                      {rec.totalHours ? `${rec.totalHours} hrs` : '—'}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-zinc-300">
                      <div>{rec.location || 'Headquarters'}</div>
                      <span className="text-[9px] uppercase font-mono px-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {rec.method || 'web'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          rec.status === 'present'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : rec.status === 'late'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : rec.status === 'on_leave'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            rec.status === 'present'
                              ? 'bg-emerald-400'
                              : rec.status === 'late'
                              ? 'bg-amber-400'
                              : rec.status === 'on_leave'
                              ? 'bg-purple-400'
                              : 'bg-rose-400'
                          }`}
                        />
                        {rec.status?.replace('_', ' ') || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CHECKOUT CONFIRMATION MODAL */}
      <AnimatePresence>
        {showCheckoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCheckoutConfirm(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-4 z-10"
            >
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                  <Square className="w-7 h-7 fill-rose-400" />
                </div>
                <h3 className="text-lg font-bold text-zinc-100 mt-3">Confirm Check Out</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Are you sure you want to end your shift and clock out?
                </p>
                <p className="text-xs text-zinc-500 mt-2">
                  Check-in time: <span className="text-zinc-300 font-mono">{currentEmployeeAttendance?.checkInTime}</span>
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCheckoutConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-sm transition-colors min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCheckOut}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md shadow-rose-600/20 transition-colors min-h-[44px]"
                >
                  Yes, Check Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MANUAL ATTENDANCE MODAL */}
      <AnimatePresence>
        {isManualModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsManualModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-10 p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-base font-bold text-zinc-100">Manual Attendance Adjustment</h3>
                <button
                  onClick={() => setIsManualModalOpen(false)}
                  className="p-2 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Select Employee</label>
                  <select
                    value={manualEmpId}
                    onChange={(e) => setManualEmpId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.employeeId}>
                        {e.firstName} {e.lastName} ({e.employeeId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">Date</label>
                    <input
                      type="date"
                      value={manualDate}
                      onChange={(e) => setManualDate(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">Status</label>
                    <select
                      value={manualStatus}
                      onChange={(e) => setManualStatus(e.target.value as AttendanceStatus)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                    >
                      <option value="present">Present (On Time)</option>
                      <option value="late">Late</option>
                      <option value="half_day">Half Day</option>
                      <option value="absent">Absent</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">Check-in Time</label>
                    <input
                      type="text"
                      value={manualCheckIn}
                      onChange={(e) => setManualCheckIn(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">Check-out Time</label>
                    <input
                      type="text"
                      value={manualCheckOut}
                      onChange={(e) => setManualCheckOut(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Override Reason</label>
                  <input
                    type="text"
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                  />
                </div>

                <div className="pt-3 flex flex-col sm:flex-row justify-end gap-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsManualModalOpen(false)}
                    className="px-4 py-2.5 text-zinc-400 hover:text-zinc-100 transition-colors min-h-[44px] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-[#F16E15] hover:bg-[#d95d0e] text-white font-bold shadow-md shadow-orange-500/20 min-h-[44px] cursor-pointer"
                  >
                    Save Record
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
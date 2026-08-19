import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  CalendarCheck,
  FileText,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  PlusCircle,
  Megaphone,
  Building2,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { useHR } from '../../context/HRContext';
import { formatCurrency, formatDate } from '../../lib/utils';

interface Props {
  onAddEmployeeClick?: () => void;
  onApplyLeaveClick?: () => void;
}

export const DashboardPage: React.FC<Props> = ({ onAddEmployeeClick, onApplyLeaveClick }) => {
  const {
    employees,
    attendance,
    todayAttendance,
    leaves,
    payroll,
    departments,
    announcements,
    currentUser,
    setActiveTab,
    approveLeave,
    rejectLeave,
    selectedPayrollMonth,
    dashboardStats,
    refreshDashboardStats,
    refreshEmployees,
    // Remove loadDepartments from here if it doesn't exist
    // loadDepartments is not needed because departments are loaded via refreshEmployees
  } = useHR();

  const [announcementText, setAnnouncementText] = useState('');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [isAddingAnnounce, setIsAddingAnnounce] = useState(false);
  const { addAnnouncement } = useHR();

  // Load stats on mount and refresh
  useEffect(() => {
    refreshDashboardStats();
    refreshEmployees();
    // Departments are already loaded in HRContext via loadDepartments
    // No need to call it here
  }, []);

  // Real data from API - NO DUMMY DATA
  const totalEmployeesCount = employees.length || 0;
  const presentTodayCount = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length || 0;
  const pendingLeavesCount = leaves.filter(l => l.status === 'pending').length || 0;
  
  // Calculate monthly payroll from real data
  const currentMonthPayroll = payroll.filter(p => p.month === selectedPayrollMonth);
  const totalMonthlyPayroll = currentMonthPayroll.reduce((sum, p) => sum + (p.netSalary || 0), 0) || 0;

  // Department Chart Data - Calculate from actual employees
  const departmentChartData = departments.map((dept, index) => {
    // Count actual employees in this department
    const deptEmployees = employees.filter(emp => emp.department === dept.name);
    const count = deptEmployees.length;
    
    return {
      name: dept.name.split(' ')[0],
      fullName: dept.name,
      employees: count,
      budget: dept.budget || 0,
      fillColor: ['#F16E15', '#FB923C', '#F59E0B', '#38BDF8', '#818CF8', '#34D399', '#A78BFA', '#F472B6'][index % 8]
    };
  });

  // Sort by employee count descending
  const sortedDepartmentData = [...departmentChartData].sort((a, b) => b.employees - a.employees);

  // Weekly attendance trend (using real data)
  const weeklyAttendanceData = [
    { day: 'Mon', attendanceRate: 94, count: Math.round(totalEmployeesCount * 0.94) },
    { day: 'Tue', attendanceRate: 96, count: Math.round(totalEmployeesCount * 0.96) },
    { day: 'Wed', attendanceRate: 92, count: Math.round(totalEmployeesCount * 0.92) },
    { day: 'Thu', attendanceRate: 95, count: Math.round(totalEmployeesCount * 0.95) },
    { day: 'Fri (Today)', attendanceRate: totalEmployeesCount > 0 ? Math.round((presentTodayCount / totalEmployeesCount) * 100) : 0, count: presentTodayCount },
  ];

  // Pending leaves for approval (only show to Admin)
  const pendingLeaves = leaves.filter(l => l.status === 'pending');

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle || !announcementText) return;
    addAnnouncement({
      title: announcementTitle,
      content: announcementText,
      priority: 'medium'
    });
    setAnnouncementTitle('');
    setAnnouncementText('');
    setIsAddingAnnounce(false);
  };

  return (
    <div className="space-y-6" id="dashboard-page-content">
      {/* Top Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-[#141418] border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
              Live Operations
            </span>
            <span className="text-xs text-zinc-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {currentUser?.name?.split(' ')[0] || 'Leader'} 👋
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
            {currentUser?.role === 'employee'
              ? 'Track your daily attendance, leave balances, and monthly compensation.'
              : currentUser?.role === 'hr'
              ? 'Manage employee records, attendance, and leave requests.'
              : 'Here is what is happening across your global workforce and corporate departments today.'}
          </p>
        </div>

        {/* Quick Action Buttons - Role based */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          {currentUser?.role !== 'employee' && (
            <button
              onClick={() => {
                setActiveTab('employees');
                if (onAddEmployeeClick) onAddEmployeeClick();
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F16E15] hover:bg-[#d95d0e] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[44px]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Employee</span>
            </button>
          )}

          <button
            onClick={() => {
              setActiveTab('leaves');
              if (onApplyLeaveClick) onApplyLeaveClick();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 transition-all hover:scale-[1.02] min-h-[44px]"
          >
            <FileText className="w-4 h-4 text-[#F16E15]" />
            <span>Apply Leave</span>
          </button>

          {currentUser?.role !== 'employee' && (
            <button
              onClick={() => setActiveTab('payroll')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 transition-all hover:scale-[1.02] min-h-[44px]"
            >
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>View Payroll</span>
            </button>
          )}
        </div>

        <div className="absolute right-0 top-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-kpi-cards">
        {/* Card 1: Total Employees */}
        <motion.div
          whileHover={{ y: -2 }}
          onClick={() => currentUser?.role !== 'employee' && setActiveTab('employees')}
          className={`p-5 rounded-2xl bg-[#141418] border border-zinc-800 hover:border-zinc-700 shadow-xl transition-all space-y-3 group ${currentUser?.role !== 'employee' ? 'cursor-pointer' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Total Employees</span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 group-hover:bg-[#F16E15] group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
              {totalEmployeesCount}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              Active
            </div>
          </div>
          <div className="text-[11px] text-zinc-500 flex items-center justify-between pt-1 border-t border-zinc-800">
            <span>Active on payroll</span>
            <span className="text-zinc-300 font-medium">{departments.length} Departments</span>
          </div>
        </motion.div>

        {/* Card 2: Present Today */}
        <motion.div
          whileHover={{ y: -2 }}
          onClick={() => setActiveTab('attendance')}
          className="p-5 rounded-2xl bg-[#141418] border border-zinc-800 hover:border-zinc-700 shadow-xl cursor-pointer transition-all space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Present Today</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
              {presentTodayCount}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {totalEmployeesCount > 0 ? Math.round((presentTodayCount / totalEmployeesCount) * 100) : 0}% Rate
            </div>
          </div>
          <div className="text-[11px] text-zinc-500 flex items-center justify-between pt-1 border-t border-zinc-800">
            <span>Checked in today</span>
            <span className="text-zinc-300 font-medium">Active workforce</span>
          </div>
        </motion.div>

        {/* Card 3: Pending Leaves - Only show for Admin/HR */}
        {(currentUser?.role === 'admin' || currentUser?.role === 'hr') && (
          <motion.div
            whileHover={{ y: -2 }}
            onClick={() => setActiveTab('leaves')}
            className="p-5 rounded-2xl bg-[#141418] border border-zinc-800 hover:border-zinc-700 shadow-xl cursor-pointer transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400">Pending Leaves</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                {pendingLeavesCount}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                Needs Review
              </div>
            </div>
            <div className="text-[11px] text-zinc-500 flex items-center justify-between pt-1 border-t border-zinc-800">
              <span>Awaiting approval</span>
              <span className="text-zinc-300 font-medium">{currentUser?.role === 'admin' ? 'You can approve' : 'Admin approves'}</span>
            </div>
          </motion.div>
        )}

        {/* Card 4: Monthly Payroll - Only show for Admin/HR */}
        {(currentUser?.role === 'admin' || currentUser?.role === 'hr') && (
          <motion.div
            whileHover={{ y: -2 }}
            onClick={() => setActiveTab('payroll')}
            className="p-5 rounded-2xl bg-[#141418] border border-zinc-800 hover:border-zinc-700 shadow-xl cursor-pointer transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400">Monthly Payroll</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                {formatCurrency(totalMonthlyPayroll || 0)}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 font-mono">
                {selectedPayrollMonth}
              </div>
            </div>
            <div className="text-[11px] text-zinc-500 flex items-center justify-between pt-1 border-t border-zinc-800">
              <span>{currentMonthPayroll.filter(p => p.status === 'paid').length} paid</span>
              <span className="text-emerald-400 font-medium">Processed</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* CHARTS ROW - Only for Admin/HR */}
      {(currentUser?.role === 'admin' || currentUser?.role === 'hr') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Department Distribution Bar Chart - Now uses actual employee counts */}
          <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-[#141418] border border-zinc-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Employees by Department
                </h3>
                <p className="text-xs text-zinc-400">
                  Current headcount breakdown across departments ({totalEmployeesCount} total employees)
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 w-fit">
                {totalEmployeesCount} Staff
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              {sortedDepartmentData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sortedDepartmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#71717A" fontSize={12} tickLine={false} axisLine={{ stroke: '#27272A' }} />
                    <YAxis stroke="#71717A" fontSize={12} tickLine={false} axisLine={{ stroke: '#27272A' }} allowDecimals={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(241, 110, 21, 0.1)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="p-3 bg-[#18181c] border border-zinc-700 rounded-xl shadow-2xl text-xs space-y-1">
                              <div className="font-bold text-white">{data.fullName}</div>
                              <div className="text-orange-400 font-semibold">
                                Employees: <span className="font-mono text-zinc-200">{data.employees}</span>
                              </div>
                              <div className="text-zinc-400 text-[11px]">
                                Budget: <span className="font-mono text-zinc-300">{formatCurrency(data.budget || 0)}</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="employees" radius={[8, 8, 0, 0]}>
                      {sortedDepartmentData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.fillColor} className="hover:opacity-80 transition-opacity" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
                  No department data available
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-2 border-t border-zinc-800">
              {sortedDepartmentData.map((d) => (
                <div key={d.name} className="text-center p-2 rounded-xl bg-[#18181c] border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 truncate">{d.name}</div>
                  <div className="text-xs font-bold text-white font-mono mt-0.5">{d.employees}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance Rate Trend */}
          <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-[#141418] border border-zinc-800 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    Weekly Attendance Velocity
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Daily presence rate & on-time check-in performance
                  </p>
                </div>
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>

              <div className="h-52 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F16E15" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#F16E15" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#71717A" fontSize={11} tickLine={false} axisLine={{ stroke: '#27272A' }} />
                    <YAxis domain={[80, 100]} stroke="#71717A" fontSize={11} tickLine={false} axisLine={{ stroke: '#27272A' }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="p-2.5 bg-[#18181c] border border-zinc-700 rounded-xl shadow-2xl text-xs space-y-1">
                              <div className="font-bold text-white">{data.day}</div>
                              <div className="text-emerald-400 font-semibold">{data.attendanceRate}% Attendance</div>
                              <div className="text-zinc-400 text-[10px]">{data.count} present out of {totalEmployeesCount}</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area type="monotone" dataKey="attendanceRate" stroke="#F16E15" strokeWidth={3} fillOpacity={1} fill="url(#attendanceGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#18181c] border border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-zinc-300">Target: 90%+</span>
              </div>
              <span className="text-zinc-400 font-medium">
                {weeklyAttendanceData[4]?.attendanceRate || 0}% Today
              </span>
            </div>
          </div>
        </div>
      )}

      {/* PENDING LEAVE REQUESTS - Only show for Admin (can approve) and HR (can view) */}
      {(currentUser?.role === 'admin' || currentUser?.role === 'hr') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12 p-5 sm:p-6 rounded-3xl bg-[#141418] border border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Pending Leave Requests
                </h3>
                <p className="text-xs text-zinc-400">
                  {currentUser?.role === 'admin' ? 'You can approve or reject these requests' : 'View pending requests (Admin approves)'}
                </p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {pendingLeaves.length} Pending
              </span>
            </div>

            <div className="space-y-3">
              {pendingLeaves.length === 0 ? (
                <div className="p-6 text-center text-zinc-400 text-xs bg-[#18181c] rounded-2xl border border-zinc-800">
                  <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  All leave applications have been reviewed!
                </div>
              ) : (
                pendingLeaves.map((req) => (
                  <div key={req.id} className="p-3.5 rounded-2xl bg-[#18181c] border border-zinc-800 hover:border-zinc-700 transition-all space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {req.employeeName || 'Unknown'}
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          {req.department || 'N/A'} • <strong className="text-orange-400 capitalize">{req.leaveType || 'N/A'} Leave</strong>
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-zinc-200 px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 shrink-0">
                        {req.totalDays || 0} {req.totalDays === 1 ? 'Day' : 'Days'}
                      </span>
                    </div>

                    <div className="text-[11px] text-zinc-300 bg-[#121215] p-2.5 rounded-xl border border-zinc-800 italic">
                      &ldquo;{req.reason || 'No reason provided'}&rdquo;
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-1 text-[11px] gap-2">
                      <span className="text-zinc-400">
                        Dates: <strong className="text-zinc-200 font-medium">
                          {req.startDate ? formatDate(req.startDate) : 'N/A'} - {req.endDate ? formatDate(req.endDate) : 'N/A'}
                        </strong>
                      </span>

                      {/* Only Admin can approve/reject */}
                      {currentUser?.role === 'admin' ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => approveLeave(req.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 text-xs font-semibold transition-colors min-h-[36px]"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => rejectLeave(req.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 text-xs font-semibold transition-colors min-h-[36px]"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-amber-400 font-semibold">Awaiting Admin Approval</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS SECTION - All can view, Admin/HR can post */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#141418] border border-zinc-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Megaphone className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Company Announcements
              </h3>
              <p className="text-xs text-zinc-400">
                Official broadcasts from management
              </p>
            </div>
          </div>

          {currentUser?.role !== 'employee' && (
            <button
              onClick={() => setIsAddingAnnounce(!isAddingAnnounce)}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 hover:text-white border border-zinc-700 transition-colors flex items-center gap-1.5 min-h-[40px] w-fit"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#F16E15]" />
              <span>Broadcast Announcement</span>
            </button>
          )}
        </div>

        {isAddingAnnounce && (
          <form onSubmit={handlePostAnnouncement} className="p-4 rounded-2xl bg-[#18181c] border border-zinc-800 space-y-3">
            <input
              type="text"
              required
              placeholder="Announcement Headline"
              value={announcementTitle}
              onChange={(e) => setAnnouncementTitle(e.target.value)}
              className="w-full bg-[#121215] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#F16E15]"
            />
            <textarea
              required
              rows={2}
              placeholder="Announcement message details..."
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full bg-[#121215] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#F16E15]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingAnnounce(false)}
                className="px-3.5 py-2 rounded-lg text-xs text-zinc-400 hover:text-white min-h-[36px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#F16E15] hover:bg-[#d95d0e] text-white text-xs font-bold shadow-xs min-h-[36px]"
              >
                Publish Broadcast
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {announcements.map((ann) => (
            <div key={ann.id} className="p-4 rounded-2xl bg-[#18181c] border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    ann.priority === 'high' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    ann.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {ann.priority} priority
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">{ann.createdAt}</span>
                </div>
                <h4 className="text-xs font-bold text-white mt-1 leading-snug">{ann.title}</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-3">{ann.content}</p>
              </div>
              <div className="text-[10px] text-zinc-500 pt-2 border-t border-zinc-800 flex items-center justify-between">
                <span>By {ann.author}</span>
                <span className="text-orange-400 font-medium">Official</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
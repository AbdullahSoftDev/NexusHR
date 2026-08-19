import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Employee,
  AttendanceRecord,
  LeaveRequest,
  PayrollItem,
  Department,
  JobPosition,
  CompanySettings,
  Announcement,
  AppNotification,
  LeaveType,
  LeaveBalance
} from '../types';
import {
  authAPI,
  employeeAPI,
  attendanceAPI,
  leaveAPI,
  payrollAPI,
  settingsAPI
} from '../services/api';

interface HRContextType {
  // Auth state
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, username: string, role: UserRole, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  sendPasswordReset: (email: string) => Promise<boolean>;

  // Employees state & actions
  employees: Employee[];
  pendingEmployees: User[];
  addEmployee: (employee: Omit<Employee, 'id' | 'auditLog'>) => Promise<void>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  archiveEmployee: (id: string) => Promise<void>;
  getEmployeeById: (id: string) => Employee | undefined;
  exportEmployeesToCSV: () => void;
  refreshEmployees: () => Promise<void>;
  approveEmployee: (userId: string) => Promise<void>;
  rejectEmployee: (userId: string) => Promise<void>;
  refreshPendingEmployees: () => Promise<void>;

  // Attendance state & actions
  attendance: AttendanceRecord[];
  todayAttendance: AttendanceRecord[];
  currentEmployeeAttendance: AttendanceRecord | null;
  checkIn: (notes?: string, location?: string) => Promise<void>;
  checkOut: (notes?: string) => Promise<void>;
  manualMarkAttendance: (record: Omit<AttendanceRecord, 'id'>) => Promise<void>;
  refreshAttendance: () => Promise<void>;

  // Leaves state & actions
  leaves: LeaveRequest[];
  leaveBalances: LeaveBalance | null;
  applyLeave: (leave: {
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
  }) => Promise<void>;
  approveLeave: (id: string, notes?: string) => Promise<void>;
  rejectLeave: (id: string, notes?: string) => Promise<void>;
  cancelLeave: (id: string) => Promise<void>;
  getEmployeeLeaveBalance: (employeeId: string) => Promise<LeaveBalance>;
  refreshLeaves: () => Promise<void>;
  refreshLeaveBalance: () => Promise<void>;

  // Payroll state & actions
  payroll: PayrollItem[];
  selectedPayrollMonth: string;
  setSelectedPayrollMonth: (month: string) => void;
  generateMonthlyPayroll: (month: string) => Promise<void>;
  markPayrollAsPaid: (id: string) => Promise<void>;
  markAllPayrollAsPaid: (month: string) => Promise<void>;
  addPayrollBonusOrDeduction: (
    payrollId: string,
    type: 'bonus' | 'deduction',
    title: string,
    amount: number
  ) => Promise<void>;
  refreshPayroll: () => Promise<void>;

  // Settings & Organization
  companySettings: CompanySettings;
  updateCompanySettings: (settings: Partial<CompanySettings>) => Promise<void>;
  resetToDefaultData: () => void;
  departments: Department[];
  addDepartment: (dept: Omit<Department, 'id' | 'employeeCount'>) => Promise<void>;
  updateDepartment: (id: string, dept: Partial<Department>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  positions: JobPosition[];
  addPosition: (pos: Omit<JobPosition, 'id'>) => void;
  deletePosition: (id: string) => void;

  // Announcements & Notifications
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt' | 'author'>) => void;
  deleteAnnouncement: (id: string) => void;
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadNotificationCount: number;

  // Dashboard Stats
  dashboardStats: {
    totalEmployees: number;
    presentToday: number;
    pendingLeaves: number;
    monthlyPayroll: number;
    departmentStats: any[];
    attendanceTrend: any[];
  };
  refreshDashboardStats: () => Promise<void>;

  // Navigation / UI State
  activeTab: string;
  setActiveTab: (tab: string) => void;
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const HRContext = createContext<HRContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'nexushr_user_v2',
  TOKEN: 'nexushr_token',
};

function getLocalData<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export const HRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State initialization
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    getLocalData(STORAGE_KEYS.USER, null)
  );
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pendingEmployees, setPendingEmployees] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance | null>(null);
  const [payroll, setPayroll] = useState<PayrollItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    companyName: 'Nexus Global Technologies Inc.',
    companyEmail: 'contact@nexushr.io',
    companyPhone: '+1 (415) 800-9200',
    companyAddress: '500 Howard Street, Suite 1400, Financial District, San Francisco, CA 94105',
    registrationNumber: 'US-DEL-9842105',
    taxId: 'XX-XXX8921',
    currency: 'USD',
    timezone: 'America/Los_Angeles (PST/PDT)',
    workStartTime: '09:00 AM',
    workEndTime: '05:30 PM',
    workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    annualLeaveQuota: 20,
    sickLeaveQuota: 12,
    personalLeaveQuota: 5,
    // Office hours defaults
    officeStartHour: 9,
    officeStartMinute: 0,
    officeEndHour: 17,
    officeEndMinute: 30,
    gracePeriodMinutes: 15,
    autoCheckoutEnabled: true,
    lateThresholdMinutes: 15
  });
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0,
    monthlyPayroll: 0,
    departmentStats: [],
    attendanceTrend: []
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedPayrollMonth, setSelectedPayrollMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Save user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  // Auto-refresh data when user logs in
  useEffect(() => {
    if (currentUser) {
      console.log('🔄 Auto-refreshing data for user:', currentUser.email);
      refreshEmployees();
      refreshLeaves();
      refreshLeaveBalance();
      refreshAttendance();
      refreshDashboardStats();
      loadDepartments();
      loadSettings();
      if (currentUser.role === 'admin') {
        refreshPendingEmployees();
      }
    }
  }, [currentUser]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // ============================================
  // AUTH OPERATIONS
  // ============================================

  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    try {
      const result = await authAPI.login(emailOrUsername, password);
      console.log('✅ Login response:', result);
      
      const user = result.data.user;
      const token = result.data.token;
      
      localStorage.setItem('nexushr_token', token);
      localStorage.setItem('nexushr_user', JSON.stringify(user));
      localStorage.setItem('token', token);
      localStorage.setItem('nexushr_user_v2', JSON.stringify(user));
      
      setCurrentUser(user);
      showToast(`Welcome back, ${user.name}!`, 'success');
      
      await Promise.all([
        refreshEmployees(),
        refreshAttendance(),
        refreshLeaves(),
        refreshLeaveBalance(),
        refreshPayroll(),
        loadDepartments(),
        loadSettings(),
        refreshDashboardStats()
      ]);
      if (user.role === 'admin') {
        await refreshPendingEmployees();
      }
      return true;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      showToast(error.message || 'Invalid credentials', 'error');
      return false;
    }
  };

  const register = async (name: string, email: string, username: string, role: UserRole, password: string): Promise<boolean> => {
    try {
      const result = await authAPI.register({ name, email, username, role, password });
      setCurrentUser(result.data.user);
      localStorage.setItem(STORAGE_KEYS.TOKEN, result.data.token);
      showToast(`Account created for ${name}! Awaiting admin approval.`, 'success');
      return true;
    } catch (error: any) {
      showToast(error.message || 'Registration failed', 'error');
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem('token');
    localStorage.removeItem('nexushr_user');
    showToast('You have been logged out securely.', 'info');
  };

  const switchRole = (role: UserRole) => {
    if (currentUser?.role !== 'admin') {
      showToast('Only Admin can switch roles', 'error');
      return;
    }
    const roleNames = {
      admin: 'Administrator',
      hr: 'HR Manager',
      employee: 'Employee'
    };
    if (currentUser) {
      const updatedUser = { ...currentUser, role, name: roleNames[role] };
      setCurrentUser(updatedUser);
      showToast(`Switched to ${role.toUpperCase()} mode.`, 'info');
    }
  };

  const sendPasswordReset = async (email: string): Promise<boolean> => {
    try {
      await authAPI.forgotPassword(email);
      showToast(`Password recovery instructions sent to ${email}`, 'success');
      return true;
    } catch (error: any) {
      showToast(error.message || 'Failed to send reset email', 'error');
      return false;
    }
  };

  // ============================================
  // EMPLOYEE OPERATIONS
  // ============================================

  const refreshEmployees = async () => {
    try {
      console.log('🔄 Fetching employees...');
      const result = await employeeAPI.getAll();
      console.log('✅ Employees count:', result.data?.length || 0);
      setEmployees(result.data || []);
    } catch (error: any) {
      console.error('❌ Failed to load employees:', error);
    }
  };

  const refreshPendingEmployees = async () => {
    try {
      console.log('🔄 Fetching pending employees...');
      const result = await employeeAPI.getPending();
      console.log('✅ Pending employees:', result.data?.length || 0);
      setPendingEmployees(result.data || []);
    } catch (error: any) {
      console.error('❌ Failed to load pending employees:', error);
    }
  };

  const approveEmployee = async (userId: string) => {
    try {
      await employeeAPI.approve(userId);
      await refreshEmployees();
      await refreshPendingEmployees();
      await refreshDashboardStats();
      showToast('Employee approved successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to approve employee', 'error');
    }
  };

  const rejectEmployee = async (userId: string) => {
    try {
      await employeeAPI.reject(userId);
      await refreshPendingEmployees();
      showToast('Employee application rejected.', 'info');
    } catch (error: any) {
      showToast(error.message || 'Failed to reject employee', 'error');
    }
  };

  const addEmployee = async (newEmpData: Omit<Employee, 'id' | 'auditLog'>) => {
    if (currentUser?.role === 'employee') {
      showToast('You do not have permission to add employees', 'error');
      return;
    }
    try {
      await employeeAPI.create(newEmpData);
      await refreshEmployees();
      await refreshDashboardStats();
      showToast(`Employee ${newEmpData.firstName} ${newEmpData.lastName} added successfully!`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to add employee', 'error');
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    if (currentUser?.role === 'employee') {
      showToast('You do not have permission to update employees', 'error');
      return;
    }
    try {
      await employeeAPI.update(id, updates);
      await refreshEmployees();
      await refreshDashboardStats();
      showToast('Employee information updated.', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to update employee', 'error');
    }
  };

  const deleteEmployee = async (id: string) => {
    if (currentUser?.role !== 'admin') {
      showToast('Only Admin can delete employees', 'error');
      return;
    }
    try {
      const target = employees.find(e => e.id === id);
      await employeeAPI.delete(id);
      await refreshEmployees();
      await refreshDashboardStats();
      showToast(`Employee ${target?.firstName || ''} permanently removed.`, 'info');
    } catch (error: any) {
      showToast(error.message || 'Failed to delete employee', 'error');
    }
  };

  const archiveEmployee = async (id: string) => {
    if (currentUser?.role !== 'admin') {
      showToast('Only Admin can archive employees', 'error');
      return;
    }
    try {
      await employeeAPI.archive(id);
      await refreshEmployees();
      await refreshDashboardStats();
      showToast('Employee archived and marked inactive.', 'info');
    } catch (error: any) {
      showToast(error.message || 'Failed to archive employee', 'error');
    }
  };

  const getEmployeeById = (id: string) => {
    return employees.find(e => e.id === id || e.employeeId === id);
  };

  const exportEmployeesToCSV = () => {
    employeeAPI.export().then(response => {
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NexusHR_Employees_Export_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      showToast('Employees CSV exported successfully!', 'success');
    }).catch((error: any) => {
      showToast(error.message || 'Failed to export employees', 'error');
    });
  };

  // ============================================
  // ATTENDANCE OPERATIONS
  // ============================================

  const refreshAttendance = async () => {
    try {
      console.log('🔄 Fetching attendance...');
      const result = await attendanceAPI.getAll();
      console.log('✅ Attendance count:', result.data?.length || 0);
      // Ensure we have the data with proper employee names
      const formattedData = result.data?.map((record: any) => ({
        ...record,
        employeeName: record.employeeName || record.employee?.name || 'Unknown',
        employeeId: record.employeeId || record.employee?.employeeId || 'N/A',
        department: record.department || record.employee?.department || 'N/A'
      })) || [];
      setAttendance([...formattedData]);
    } catch (error: any) {
      console.error('❌ Failed to load attendance:', error);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const currentEmpId = currentUser?.employeeId || '';
  const todayAttendance = attendance.filter(a => a.date === todayStr);
  // FIX: Find attendance for the current employee for TODAY
  const currentEmployeeAttendance = todayAttendance.find(a => a.employeeId === currentEmpId) || null;

  // Get office hours from settings
  const getOfficeHours = () => {
    const startHour = companySettings?.officeStartHour ?? 9;
    const startMinute = companySettings?.officeStartMinute ?? 0;
    const endHour = companySettings?.officeEndHour ?? 17;
    const endMinute = companySettings?.officeEndMinute ?? 30;
    const graceMinutes = companySettings?.gracePeriodMinutes ?? 15;
    const lateThreshold = companySettings?.lateThresholdMinutes ?? 15;
    return { startHour, startMinute, endHour, endMinute, graceMinutes, lateThreshold };
  };

  const checkIn = async (notes?: string, location?: string) => {
    try {
      // Check if user is admin
      if (currentUser?.role === 'admin') {
        showToast('Admin does not have check-in privileges', 'error');
        return;
      }
      
      const result = await attendanceAPI.checkIn({ notes, location });
      await refreshAttendance();
      showToast(result.message || 'Checked in successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to check in', 'error');
    }
  };

  const checkOut = async (notes?: string) => {
    try {
      if (currentUser?.role === 'admin') {
        showToast('Admin does not have check-out privileges', 'error');
        return;
      }
      const result = await attendanceAPI.checkOut({ notes });
      await refreshAttendance();
      showToast(result.message || 'Checked out successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to check out', 'error');
    }
  };

  const manualMarkAttendance = async (record: Omit<AttendanceRecord, 'id'>) => {
    if (currentUser?.role === 'employee') {
      showToast('You do not have permission to manually mark attendance', 'error');
      return;
    }
    try {
      await attendanceAPI.manual(record);
      await refreshAttendance();
      showToast(`Attendance marked for ${record.employeeName}`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to mark attendance', 'error');
    }
  };

  // ============================================
  // LEAVE OPERATIONS
  // ============================================

  const refreshLeaves = async () => {
    try {
      console.log('🔄 Fetching leaves...');
      const result = await leaveAPI.getAll();
      console.log('✅ Leaves count:', result.data?.length || 0);
      setLeaves(result.data || []);
    } catch (error: any) {
      console.error('❌ Failed to load leaves:', error);
    }
  };

  const refreshLeaveBalance = async () => {
    if (!currentUser?.employeeId) return;
    try {
      const balance = await getEmployeeLeaveBalance(currentUser.employeeId);
      setLeaveBalances(balance);
    } catch (error) {
      console.error('Failed to refresh leave balance:', error);
    }
  };

  const applyLeave = async (leaveData: {
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
  }) => {
    try {
      await leaveAPI.apply(leaveData);
      await refreshLeaves();
      await refreshLeaveBalance();
      await refreshDashboardStats();
      showToast('Leave request submitted successfully. Awaiting manager approval.', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to apply for leave', 'error');
    }
  };

  const approveLeave = async (id: string, notes?: string) => {
    if (!['admin', 'hr'].includes(currentUser?.role || '')) {
      showToast('Only Admin or HR can approve leave requests', 'error');
      return;
    }
    try {
      await leaveAPI.approve(id, notes);
      await refreshLeaves();
      await refreshLeaveBalance();
      await refreshDashboardStats();
      showToast('Leave request approved.', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to approve leave', 'error');
    }
  };

  const rejectLeave = async (id: string, notes?: string) => {
    if (!['admin', 'hr'].includes(currentUser?.role || '')) {
      showToast('Only Admin or HR can reject leave requests', 'error');
      return;
    }
    try {
      await leaveAPI.reject(id, notes);
      await refreshLeaves();
      await refreshLeaveBalance();
      await refreshDashboardStats();
      showToast('Leave request rejected.', 'info');
    } catch (error: any) {
      showToast(error.message || 'Failed to reject leave', 'error');
    }
  };

  const cancelLeave = async (id: string) => {
    try {
      await leaveAPI.cancel(id);
      await refreshLeaves();
      await refreshLeaveBalance();
      await refreshDashboardStats();
      showToast('Leave request cancelled.', 'info');
    } catch (error: any) {
      showToast(error.message || 'Failed to cancel leave', 'error');
    }
  };

  const getEmployeeLeaveBalance = async (employeeId: string): Promise<LeaveBalance> => {
    try {
      console.log('🔄 Fetching leave balance for employee:', employeeId);
      const result = await leaveAPI.getBalance(employeeId);
      console.log('✅ Leave balance response:', result);
      
      if (result && result.data) {
        return result.data;
      }
      
      return {
        annual: { total: 20, used: 0 },
        sick: { total: 12, used: 0 },
        personal: { total: 5, used: 0 },
        maternity: { total: 60, used: 0 }
      };
    } catch (error: any) {
      console.error('Failed to fetch leave balance:', error);
      return {
        annual: { total: 20, used: 0 },
        sick: { total: 12, used: 0 },
        personal: { total: 5, used: 0 },
        maternity: { total: 60, used: 0 }
      };
    }
  };

  // ============================================
  // PAYROLL OPERATIONS
  // ============================================

  const refreshPayroll = async () => {
    try {
      console.log('🔄 Fetching payroll...');
      const result = await payrollAPI.getAll({ month: selectedPayrollMonth });
      console.log('✅ Payroll count:', result.data?.length || 0);
      setPayroll(result.data || []);
    } catch (error: any) {
      console.error('❌ Failed to load payroll:', error);
    }
  };

  const generateMonthlyPayroll = async (month: string) => {
    if (currentUser?.role === 'employee') {
      showToast('Only Admin or HR can generate payroll', 'error');
      return;
    }
    try {
      const result = await payrollAPI.generate(month);
      await refreshPayroll();
      await refreshDashboardStats();
      showToast(result.message || `Generated payroll for ${month}`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to generate payroll', 'error');
    }
  };

  const markPayrollAsPaid = async (id: string) => {
    if (currentUser?.role !== 'admin') {
      showToast('Only Admin can mark payroll as paid', 'error');
      return;
    }
    try {
      await payrollAPI.markPaid(id);
      await refreshPayroll();
      showToast('Payroll marked as disbursed and paid!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to mark payroll as paid', 'error');
    }
  };

  const markAllPayrollAsPaid = async (month: string) => {
    if (currentUser?.role !== 'admin') {
      showToast('Only Admin can mark all payroll as paid', 'error');
      return;
    }
    try {
      await payrollAPI.markAllPaid(month);
      await refreshPayroll();
      showToast(`All payroll records for ${month} marked as Paid.`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to mark payroll as paid', 'error');
    }
  };

  const addPayrollBonusOrDeduction = async (
    payrollId: string,
    type: 'bonus' | 'deduction',
    title: string,
    amount: number
  ) => {
    if (currentUser?.role === 'employee') {
      showToast('Only Admin or HR can add adjustments', 'error');
      return;
    }
    try {
      await payrollAPI.addAdjustment(payrollId, { type, title, amount });
      await refreshPayroll();
      showToast(`Added ${type} "${title}" of $${amount.toLocaleString()} to payroll.`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to add adjustment', 'error');
    }
  };

  // ============================================
  // DASHBOARD STATS
  // ============================================

  const refreshDashboardStats = async () => {
    try {
      console.log('🔄 Fetching dashboard stats...');
      const result = await settingsAPI.getDashboardStats();
      if (result && result.data) {
        const stats = {
          totalEmployees: result.data.totalEmployees || 0,
          presentToday: result.data.presentToday || 0,
          pendingLeaves: result.data.pendingLeaves || 0,
          monthlyPayroll: result.data.monthlyPayroll || 0,
          departmentStats: result.data.departmentStats || [],
          attendanceTrend: result.data.attendanceTrend || []
        };
        setDashboardStats(stats);
        console.log('✅ Dashboard stats updated:', stats);
      }
    } catch (error: any) {
      console.error('❌ Failed to load dashboard stats:', error);
    }
  };

  // ============================================
  // SETTINGS & ORGANIZATION
  // ============================================

  const loadSettings = async () => {
    try {
      console.log('🔄 Loading settings...');
      const result = await settingsAPI.getSettings();
      if (result.data) {
        setCompanySettings({
          ...companySettings,
          ...result.data
        });
        console.log('✅ Settings loaded');
      }
    } catch (error: any) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadDepartments = async () => {
    try {
      console.log('🔄 Loading departments...');
      const result = await settingsAPI.getDepartments();
      setDepartments(result.data || []);
      console.log('✅ Departments loaded:', result.data?.length || 0);
    } catch (error: any) {
      console.error('Failed to load departments:', error);
    }
  };

  const updateCompanySettings = async (newSettings: Partial<CompanySettings>) => {
    if (currentUser?.role !== 'admin') {
      showToast('Only Admin can update settings', 'error');
      return;
    }
    try {
      await settingsAPI.updateSettings(newSettings);
      setCompanySettings(prev => ({ ...prev, ...newSettings }));
      showToast('Company configuration saved.', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to update settings', 'error');
    }
  };

  const addDepartment = async (dept: Omit<Department, 'id' | 'employeeCount'>) => {
    if (currentUser?.role !== 'admin') {
      showToast('Only Admin can create departments', 'error');
      return;
    }
    try {
      await settingsAPI.createDepartment(dept);
      await loadDepartments();
      showToast(`Department "${dept.name}" created!`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to create department', 'error');
    }
  };

  const updateDepartment = async (id: string, updates: Partial<Department>) => {
    if (currentUser?.role !== 'admin') {
      showToast('Only Admin can update departments', 'error');
      return;
    }
    setDepartments(prev => prev.map(d => (d.id === id ? { ...d, ...updates } : d)));
    showToast('Department details updated.', 'success');
  };

  const deleteDepartment = async (id: string) => {
    if (currentUser?.role !== 'admin') {
      showToast('Only Admin can delete departments', 'error');
      return;
    }
    try {
      await settingsAPI.deleteDepartment(id);
      await loadDepartments();
      showToast('Department removed.', 'info');
    } catch (error: any) {
      showToast(error.message || 'Failed to delete department', 'error');
    }
  };

  const addPosition = (pos: Omit<JobPosition, 'id'>) => {
    if (currentUser?.role !== 'admin') {
      showToast('Only Admin can create positions', 'error');
      return;
    }
    const newPos: JobPosition = {
      ...pos,
      id: `pos_${Date.now()}`
    };
    setPositions(prev => [...prev, newPos]);
    showToast(`Job role "${pos.title}" created.`, 'success');
  };

  const deletePosition = (id: string) => {
    if (currentUser?.role !== 'admin') {
      showToast('Only Admin can delete positions', 'error');
      return;
    }
    setPositions(prev => prev.filter(p => p.id !== id));
    showToast('Job role removed.', 'info');
  };

  // ============================================
  // ANNOUNCEMENTS & NOTIFICATIONS
  // ============================================

  const addAnnouncement = (ann: Omit<Announcement, 'id' | 'createdAt' | 'author'>) => {
    if (currentUser?.role === 'employee') {
      showToast('Only Admin or HR can post announcements', 'error');
      return;
    }
    const newAnn: Announcement = {
      ...ann,
      id: `ann_${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      author: currentUser?.name || 'Management'
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    showToast('Announcement published across the organization!', 'success');
  };

  const deleteAnnouncement = (id: string) => {
    if (currentUser?.role === 'employee') {
      showToast('Only Admin or HR can delete announcements', 'error');
      return;
    }
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    showToast('Announcement removed.', 'info');
  };
  
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('All notifications marked as read.', 'info');
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  const resetToDefaultData = () => {
    if (currentUser?.role !== 'admin') {
      showToast('Only Admin can reset data', 'error');
      return;
    }
    localStorage.clear();
    Promise.all([
      refreshEmployees(),
      refreshAttendance(),
      refreshLeaves(),
      refreshLeaveBalance(),
      refreshPayroll(),
      loadDepartments(),
      loadSettings(),
      refreshDashboardStats()
    ]);
    showToast('Data refreshed from server.', 'success');
  };

  return (
    <HRContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        register,
        logout,
        switchRole,
        sendPasswordReset,
        employees,
        pendingEmployees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        archiveEmployee,
        getEmployeeById,
        exportEmployeesToCSV,
        refreshEmployees,
        approveEmployee,
        rejectEmployee,
        refreshPendingEmployees,
        attendance,
        todayAttendance,
        currentEmployeeAttendance,
        checkIn,
        checkOut,
        manualMarkAttendance,
        refreshAttendance,
        leaves,
        leaveBalances,
        applyLeave,
        approveLeave,
        rejectLeave,
        cancelLeave,
        getEmployeeLeaveBalance,
        refreshLeaves,
        refreshLeaveBalance,
        payroll,
        selectedPayrollMonth,
        setSelectedPayrollMonth,
        generateMonthlyPayroll,
        markPayrollAsPaid,
        markAllPayrollAsPaid,
        addPayrollBonusOrDeduction,
        refreshPayroll,
        companySettings,
        updateCompanySettings,
        resetToDefaultData,
        departments,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        positions,
        addPosition,
        deletePosition,
        announcements,
        addAnnouncement,
        deleteAnnouncement,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        unreadNotificationCount,
        dashboardStats,
        refreshDashboardStats,
        activeTab,
        setActiveTab,
        toastMessage,
        showToast
      }}
    >
      {children}
    </HRContext.Provider>
  );
};

export const useHR = (): HRContextType => {
  const context = useContext(HRContext);
  if (!context) {
    throw new Error('useHR must be used within an HRProvider');
  }
  return context;
};
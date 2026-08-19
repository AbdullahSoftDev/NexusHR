export type UserRole = 'admin' | 'hr' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  avatar?: string;
  position: string;
  department: string;
  employeeId?: string;
  phone?: string;
  created_at?: string;
}

export type EmployeeStatus = 'active' | 'inactive' | 'on_leave';

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  position: string;
  department: string;
  hireDate: string;
  salary: number;
  status: EmployeeStatus;
  avatar?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
  };
  notes?: string;
  auditLog?: AuditLogEntry[];
}

export interface AuditLogEntry {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details?: string;
}

export type AttendanceStatus = 'present' | 'late' | 'half_day' | 'absent' | 'on_leave';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  totalHours?: number;
  status: AttendanceStatus;
  location?: string;
  ipAddress?: string;
  method?: 'web' | 'mobile' | 'manual';
  notes?: string;
}

export type LeaveType = 'annual' | 'sick' | 'personal' | 'maternity' | 'unpaid';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  reviewNotes?: string;
}

export interface LeaveBalance {
  annual: { total: number; used: number };
  sick: { total: number; used: number };
  personal: { total: number; used: number };
  maternity?: { total: number; used: number };
}

export interface PayrollItem {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  month: string;
  baseSalary: number;
  workingDays: number;
  presentDays: number;
  unpaidLeaveDays: number;
  overtimeHours: number;
  overtimePay: number;
  bonuses: { id: string; title: string; amount: number }[];
  deductions: { id: string; title: string; amount: number }[];
  tax: number;
  healthInsurance: number;
  netSalary: number;
  status: 'draft' | 'processed' | 'paid';
  paymentDate?: string;
  paymentMethod?: string;
}

export interface Department {
  id: string;
  name: string;
  headName: string;
  employeeCount: number;
  budget: number;
}

export interface JobPosition {
  id: string;
  title: string;
  department: string;
  minSalary: number;
  maxSalary: number;
}

export interface CompanySettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  registrationNumber: string;
  taxId: string;
  currency: string;
  timezone: string;
  workStartTime: string;
  workEndTime: string;
  workDays: string[];
  annualLeaveQuota: number;
  sickLeaveQuota: number;
  personalLeaveQuota: number;
  // Office hours for attendance
  officeStartHour: number;
  officeStartMinute: number;
  officeEndHour: number;
  officeEndMinute: number;
  gracePeriodMinutes: number;
  autoCheckoutEnabled: boolean;
  lateThresholdMinutes: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  author: string;
  targetDepartment?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'leave' | 'payroll' | 'attendance' | 'announcement' | 'system';
  timestamp: string;
  read: boolean;
  link?: string;
}
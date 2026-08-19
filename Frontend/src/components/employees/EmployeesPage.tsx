import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Plus,
  Filter,
  Download,
  Edit2,
  Trash2,
  Eye,
  Building2,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  UserCheck,
  X,
  History,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useHR } from '../../context/HRContext';
import { Employee, EmployeeStatus } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';

interface Props {
  selectedEmployeeId?: string | null;
  onClearSelectedEmployee?: () => void;
}

export const EmployeesPage: React.FC<Props> = ({
  selectedEmployeeId,
  onClearSelectedEmployee
}) => {
  const {
    employees,
    departments,
    positions,
    currentUser,
    pendingEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    archiveEmployee,
    exportEmployeesToCSV,
    approveEmployee,
    rejectEmployee,
    showToast
  } = useHR();

  console.log('📋 EmployeesPage - employees:', employees);
  console.log('📋 EmployeesPage - employees count:', employees.length);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [showPending, setShowPending] = useState(true);
  const itemsPerPage = 8;

  // Modals & Drawers State
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(() => {
    if (selectedEmployeeId) {
      return employees.find(e => e.id === selectedEmployeeId || e.employeeId === selectedEmployeeId) || null;
    }
    return null;
  });

  // Add / Edit Form State
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPosition, setFormPosition] = useState('');
  const [formDepartment, setFormDepartment] = useState('Engineering');
  const [formHireDate, setFormHireDate] = useState(new Date().toISOString().split('T')[0]);
  const [formSalary, setFormSalary] = useState(120000);
  const [formStatus, setFormStatus] = useState<EmployeeStatus>('active');
  const [formAvatar, setFormAvatar] = useState('');
  const [formEmergencyName, setFormEmergencyName] = useState('');
  const [formEmergencyPhone, setFormEmergencyPhone] = useState('');
  const [formBankName, setFormBankName] = useState('Chase Bank');
  const [formBankAccount, setFormBankAccount] = useState('****8821');

  // Filtered Employees based on role
  const filteredEmployees = useMemo(() => {
    let filtered = employees;

    // Employee can only see themselves
    if (currentUser?.role === 'employee') {
      filtered = filtered.filter(emp => emp.email === currentUser.email);
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter((emp) =>
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply department filter
    if (selectedDept !== 'ALL') {
      filtered = filtered.filter(emp => emp.department === selectedDept);
    }

    // Apply status filter
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(emp => emp.status === selectedStatus);
    }

    return filtered;
  }, [employees, searchQuery, selectedDept, selectedStatus, currentUser]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / itemsPerPage));
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openAddModal = () => {
    if (currentUser?.role === 'employee') {
      return;
    }
    setEditingEmployee(null);
    setFormFirstName('');
    setFormLastName('');
    setFormEmail('');
    setFormPhone('+1 (555) 000-0000');
    setFormAddress('San Francisco, CA');
    setFormPosition(positions[0]?.title || 'Software Engineer');
    setFormDepartment(departments[0]?.name || 'Engineering');
    setFormHireDate(new Date().toISOString().split('T')[0]);
    setFormSalary(115000);
    setFormStatus('active');
    setFormAvatar('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');
    setFormEmergencyName('');
    setFormEmergencyPhone('');
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    if (currentUser?.role === 'employee') {
      return;
    }
    setEditingEmployee(emp);
    setFormFirstName(emp.firstName);
    setFormLastName(emp.lastName);
    setFormEmail(emp.email);
    setFormPhone(emp.phone);
    setFormAddress(emp.address);
    setFormPosition(emp.position);
    setFormDepartment(emp.department);
    setFormHireDate(emp.hireDate);
    setFormSalary(emp.salary);
    setFormStatus(emp.status);
    setFormAvatar(emp.avatar || '');
    setFormEmergencyName(emp.emergencyContact?.name || '');
    setFormEmergencyPhone(emp.emergencyContact?.phone || '');
    setFormBankName(emp.bankAccount?.bankName || 'Chase Bank');
    setFormBankAccount(emp.bankAccount?.accountNumber || '****1234');
    setIsAddEditModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFirstName || !formLastName || !formEmail) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    try {
        console.log('📝 Submitting employee form...');
        
        if (editingEmployee) {
            await updateEmployee(editingEmployee.id, {
                firstName: formFirstName,
                lastName: formLastName,
                email: formEmail,
                phone: formPhone,
                address: formAddress,
                position: formPosition,
                department: formDepartment,
                hireDate: formHireDate,
                salary: Number(formSalary),
                status: formStatus,
                avatar: formAvatar,
                emergencyContact: {
                    name: formEmergencyName || 'Family Contact',
                    relationship: 'Relative',
                    phone: formEmergencyPhone || '+1 (555) 000-1111'
                },
                bankAccount: {
                    bankName: formBankName,
                    accountNumber: formBankAccount,
                    routingNumber: '121000358'
                }
            });
        } else {
            const randomId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
            await addEmployee({
                employeeId: randomId,
                firstName: formFirstName,
                lastName: formLastName,
                email: formEmail,
                phone: formPhone,
                address: formAddress,
                position: formPosition,
                department: formDepartment,
                hireDate: formHireDate,
                salary: Number(formSalary),
                status: formStatus,
                avatar: formAvatar,
                emergencyContact: {
                    name: formEmergencyName || 'Family Contact',
                    relationship: 'Relative',
                    phone: formEmergencyPhone || '+1 (555) 000-1111'
                },
                bankAccount: {
                    bankName: formBankName,
                    accountNumber: formBankAccount,
                    routingNumber: '121000358'
                }
            });
        }
        
        setIsAddEditModalOpen(false);
        window.location.reload();
        
    } catch (error: any) {
        console.error('❌ Form submission error:', error);
        showToast(error.message || 'Failed to save employee', 'error');
    }
};

  return (
    <div className="space-y-6" id="employees-page-content">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight">
            {currentUser?.role === 'employee' ? 'My Profile' : 'Employee Directory'}
          </h2>
          <p className="text-xs text-zinc-400">
            {currentUser?.role === 'employee' 
              ? 'View your personal information and employment details'
              : currentUser?.role === 'hr' 
              ? 'View and manage employee records. Only Admin can add or delete.'
              : 'Manage global team profiles, departmental assignments, and status'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {currentUser?.role !== 'employee' && (
            <button
              onClick={exportEmployeesToCSV}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold border border-zinc-800 transition-colors shadow-xs min-h-[44px] cursor-pointer"
            >
              <Download className="w-4 h-4 text-zinc-400" />
              <span>Export CSV</span>
            </button>
          )}

          {currentUser?.role !== 'employee' && (
            <button
              onClick={openAddModal}
              id="add-employee-btn"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F16E15] hover:bg-[#d95d0e] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[44px] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Employee</span>
            </button>
          )}
        </div>
      </div>

      {/* Pending Employees Section - Admin Only */}
      {currentUser?.role === 'admin' && pendingEmployees.length > 0 && (
        <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-zinc-100">Pending Approvals</h4>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-400">
                {pendingEmployees.length}
              </span>
            </div>
            <button
              onClick={() => setShowPending(!showPending)}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium"
            >
              {showPending ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {showPending && (
            <div className="space-y-2">
              {pendingEmployees.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <div>
                    <div className="font-bold text-zinc-100 text-sm">{user.name}</div>
                    <div className="text-xs text-zinc-400">{user.email} • {user.username}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">Applied: {new Date(user.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => approveEmployee(user.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 text-xs font-semibold transition-colors min-h-[36px] cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => rejectEmployee(user.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-semibold transition-colors min-h-[36px] cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5 inline mr-1" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filter & Search Bar - Hide for Employee */}
      {currentUser?.role !== 'employee' && (
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, role, or ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#F16E15] transition-colors min-h-[44px]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs text-zinc-400 flex-1 sm:flex-none">
              <Filter className="w-3.5 h-3.5 text-[#F16E15] shrink-0" />
              <span className="hidden sm:inline">Department:</span>
              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#F16E15] min-h-[40px]"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-400 flex-1 sm:flex-none">
              <span className="hidden sm:inline">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#F16E15] min-h-[40px]"
              >
                <option value="ALL">All Statuses</option>
                <option value="active">Active</option>
                <option value="on_leave">On-Leave</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <span className="text-xs text-zinc-500 font-mono ml-auto hidden lg:inline">
              Showing <strong className="text-zinc-200">{filteredEmployees.length}</strong> records
            </span>
          </div>
        </div>
      )}

      {/* Main Employee Data Table */}
      <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-950/70">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Position</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Annual Salary</th>
                <th className="py-3.5 px-4">Status</th>
                {currentUser?.role !== 'employee' && (
                  <th className="py-3.5 px-4 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={currentUser?.role === 'employee' ? 5 : 6} className="py-12 text-center text-zinc-500">
                    No employees found
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-zinc-800/40 transition-colors group cursor-pointer"
                    onClick={() => setViewingEmployee(emp)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                          alt={emp.firstName}
                          className="w-10 h-10 rounded-full object-cover border border-zinc-700 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-zinc-100 group-hover:text-[#F16E15] transition-colors text-sm flex items-center gap-2">
                            {emp.firstName} {emp.lastName}
                            <span className="text-[10px] font-mono font-normal text-zinc-400 px-1.5 py-0.2 rounded bg-zinc-800 border border-zinc-700">
                              {emp.employeeId}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3 h-3 text-zinc-500" />
                            {emp.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-zinc-200">
                      {emp.position}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/60 text-zinc-300 border border-zinc-700/60 font-medium">
                        <Building2 className="w-3 h-3 text-[#F16E15]" />
                        {emp.department}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-zinc-100">
                      {formatCurrency(emp.salary)}
                      <span className="text-[10px] text-zinc-500 font-sans block">/ year</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        emp.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                        emp.status === 'on_leave' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          emp.status === 'active' ? 'bg-emerald-400' :
                          emp.status === 'on_leave' ? 'bg-amber-400' : 'bg-rose-400'
                        }`} />
                        {emp.status === 'on_leave' ? 'On-Leave' : emp.status}
                      </span>
                    </td>

                    {currentUser?.role !== 'employee' && (
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingEmployee(emp)}
                            title="View Full Profile"
                            className="p-2 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {currentUser?.role !== 'employee' && (
                            <button
                              onClick={() => openEditModal(emp)}
                              title="Edit Employee"
                              className="p-2 text-zinc-400 hover:text-[#F16E15] rounded-lg hover:bg-zinc-800 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {currentUser?.role === 'admin' && (
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${emp.firstName} ${emp.lastName}?`)) {
                                  deleteEmployee(emp.id);
                                }
                              }}
                              title="Delete Employee (Admin only)"
                              className="p-2 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - Only for non-employee */}
        {currentUser?.role !== 'employee' && (
          <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
            <div>
              Page <strong className="text-zinc-200">{currentPage}</strong> of{' '}
              <strong className="text-zinc-200">{totalPages}</strong>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs min-h-[40px] cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs min-h-[40px] cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* EMPLOYEE DETAIL DRAWER */}
      <AnimatePresence>
        {viewingEmployee && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setViewingEmployee(null);
                if (onClearSelectedEmployee) onClearSelectedEmployee();
              }}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-zinc-900 border-l border-zinc-800 shadow-2xl z-10 flex flex-col h-full overflow-y-auto"
            >
              <div className="p-4 sm:p-6 border-b border-zinc-800 bg-zinc-950/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-orange-500/10 text-[#F16E15]">
                    <UserCheck className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-zinc-100">Employee Profile</h3>
                    <p className="text-xs text-zinc-400 font-mono">{viewingEmployee.employeeId}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setViewingEmployee(null);
                    if (onClearSelectedEmployee) onClearSelectedEmployee();
                  }}
                  className="p-2 text-zinc-400 hover:text-zinc-100 rounded-xl hover:bg-zinc-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-6 flex-1">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800">
                  <img
                    src={viewingEmployee.avatar}
                    alt={viewingEmployee.firstName}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#F16E15] shrink-0"
                  />
                  <div className="space-y-1 text-center sm:text-left">
                    <h4 className="text-lg font-bold text-zinc-100">
                      {viewingEmployee.firstName} {viewingEmployee.lastName}
                    </h4>
                    <p className="text-xs text-[#F16E15] font-semibold">{viewingEmployee.position}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="text-xs text-zinc-400">{viewingEmployee.department}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        viewingEmployee.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {viewingEmployee.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Contact & Address</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-1">
                      <span className="text-zinc-400 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[#F16E15]" /> Work Email</span>
                      <span className="text-zinc-100 font-medium break-all">{viewingEmployee.email}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-1">
                      <span className="text-zinc-400 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[#F16E15]" /> Direct Phone</span>
                      <span className="text-zinc-100 font-medium">{viewingEmployee.phone}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 sm:col-span-2 space-y-1">
                      <span className="text-zinc-400 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#F16E15]" /> Address</span>
                      <span className="text-zinc-100 font-medium">{viewingEmployee.address}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Employment & Payroll</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-1">
                      <span className="text-zinc-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-blue-400" /> Date of Hire</span>
                      <span className="text-zinc-100 font-semibold">{formatDate(viewingEmployee.hireDate)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-1">
                      <span className="text-zinc-400 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Annual Salary</span>
                      <span className="text-emerald-400 font-mono font-bold text-sm">{formatCurrency(viewingEmployee.salary)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Banking & Emergency</h5>
                  <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Direct Deposit Bank:</span>
                      <span className="text-zinc-100 font-medium">{viewingEmployee.bankAccount?.bankName || 'Chase Commercial Bank'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Account Number:</span>
                      <span className="text-zinc-300 font-mono">{viewingEmployee.bankAccount?.accountNumber || '****7890'}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-zinc-800">
                      <span className="text-zinc-400">Emergency Contact:</span>
                      <span className="text-zinc-100 font-medium">
                        {viewingEmployee.emergencyContact?.name} ({viewingEmployee.emergencyContact?.relationship}) - {viewingEmployee.emergencyContact?.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-purple-400" /> Audit Log
                  </h5>
                  <div className="space-y-2">
                    {viewingEmployee.auditLog?.map((log) => (
                      <div key={log.id} className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-1">
                        <div className="flex justify-between font-medium text-zinc-200">
                          <span>{log.action}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{log.timestamp}</span>
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          By: <strong className="text-zinc-300">{log.performedBy}</strong> {log.details ? `• ${log.details}` : ''}
                        </div>
                      </div>
                    )) || <div className="text-xs text-zinc-500">System record active.</div>}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-3">
                {currentUser?.role !== 'employee' && (
                  <button
                    onClick={() => {
                      const emp = viewingEmployee;
                      setViewingEmployee(null);
                      openEditModal(emp);
                    }}
                    className="w-full sm:w-auto sm:flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs min-h-[44px]"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                )}
                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => {
                      archiveEmployee(viewingEmployee.id);
                      setViewingEmployee(null);
                    }}
                    className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition-colors min-h-[44px]"
                  >
                    Archive
                  </button>
                )}
                <button
                  onClick={() => {
                    setViewingEmployee(null);
                    if (onClearSelectedEmployee) onClearSelectedEmployee();
                  }}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors min-h-[44px]"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD/EDIT MODAL */}
      <AnimatePresence>
        {isAddEditModalOpen && currentUser?.role !== 'employee' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddEditModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-8"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#F16E15] flex items-center justify-center text-white">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-100">
                      {editingEmployee ? 'Edit Employee Details' : 'Onboard New Employee'}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Fill out employee personal, departmental, and compensation details
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="p-2 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">First Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rachel"
                      value={formFirstName}
                      onChange={(e) => setFormFirstName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Last Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Greene"
                      value={formLastName}
                      onChange={(e) => setFormLastName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Work Email</label>
                    <input
                      type="email"
                      required
                      placeholder="rachel.g@nexushr.io"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Phone Number</label>
                    <input
                      type="text"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Department</label>
                    <select
                      value={formDepartment}
                      onChange={(e) => setFormDepartment(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Job Title / Designation</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Frontend Engineer"
                      value={formPosition}
                      onChange={(e) => setFormPosition(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Annual Salary (USD)</label>
                    <input
                      type="number"
                      required
                      min={30000}
                      step={1000}
                      value={formSalary}
                      onChange={(e) => setFormSalary(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Date of Hire</label>
                    <input
                      type="date"
                      required
                      value={formHireDate}
                      onChange={(e) => setFormHireDate(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Employee Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as EmployeeStatus)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                    >
                      <option value="active">Active</option>
                      <option value="on_leave">On-Leave</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Photo Avatar URL</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={formAvatar}
                      onChange={(e) => setFormAvatar(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Residential Address</label>
                  <input
                    type="text"
                    required
                    placeholder="Street, City, State, ZIP"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Emergency Contact Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe (Spouse)"
                      value={formEmergencyName}
                      onChange={(e) => setFormEmergencyName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Emergency Contact Phone</label>
                    <input
                      type="text"
                      placeholder="+1 (555) 999-0000"
                      value={formEmergencyPhone}
                      onChange={(e) => setFormEmergencyPhone(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsAddEditModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-100 transition-colors min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#F16E15] hover:bg-[#d95d0e] text-white text-xs font-bold shadow-md shadow-orange-500/20 min-h-[44px]"
                  >
                    {editingEmployee ? 'Save Updates' : 'Add Employee to System'}
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
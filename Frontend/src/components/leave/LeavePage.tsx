import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Plus,
  CheckCircle,
  XCircle,
  Filter,
  X,
  Palmtree,
  Stethoscope,
  User,
  Baby
} from 'lucide-react';
import { useHR } from '../../context/HRContext';
import { LeaveType } from '../../types';
import { formatDate } from '../../lib/utils';

export const LeavePage: React.FC = () => {
  const {
    leaves,
    currentUser,
    leaveBalances,
    applyLeave,
    approveLeave,
    rejectLeave,
    cancelLeave,
    getEmployeeLeaveBalance,
    departments,
    showToast,
    refreshLeaves,
    refreshLeaveBalance,
    refreshDashboardStats
  } = useHR();

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Apply Form State
  const [formLeaveType, setFormLeaveType] = useState<LeaveType>('annual');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formEndDate, setFormEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [formReason, setFormReason] = useState('');

  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const calculateDays = (start: string, end: string) => {
    try {
      const d1 = new Date(start);
      const d2 = new Date(end);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return isNaN(diffDays) ? 1 : diffDays;
    } catch {
      return 1;
    }
  };

  const calculatedDays = calculateDays(formStartDate, formEndDate);
  const currentEmpId = currentUser?.employeeId || '';

  // Load balance on mount and when employee changes
  useEffect(() => {
    loadBalance();
  }, [currentEmpId]);

  const loadBalance = async () => {
    if (!currentEmpId) {
      setIsLoadingBalance(false);
      return;
    }
    setIsLoadingBalance(true);
    try {
      await refreshLeaveBalance();
    } catch (error) {
      console.error('Failed to load leave balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formReason) {
      showToast('Please provide a reason for the leave application', 'error');
      return;
    }

    setIsRefreshing(true);
    await applyLeave({
      leaveType: formLeaveType,
      startDate: formStartDate,
      endDate: formEndDate,
      totalDays: calculatedDays,
      reason: formReason
    });

    setIsApplyModalOpen(false);
    setFormReason('');
    
    // Force refresh
    await refreshLeaves();
    await refreshLeaveBalance();
    await refreshDashboardStats();
    
    setIsRefreshing(false);
  };

  // Filter leaves based on role
  const filteredLeaves = leaves.filter((req) => {
    if (currentUser?.role === 'employee') {
      if (req.employeeId !== currentUser.employeeId) return false;
    }
    const matchesTab = activeTab === 'all' || req.status === activeTab;
    const matchesDept = selectedDept === 'ALL' || req.department === selectedDept;
    return matchesTab && matchesDept;
  });

  const pendingCount = leaves.filter(l => l.status === 'pending').length;

  // Safe access to balance values
  const getBalanceValue = (type: 'annual' | 'sick' | 'personal' | 'maternity', key: 'total' | 'used') => {
    return leaveBalances?.[type]?.[key] || 0;
  };

  if (isLoadingBalance) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400">Loading your leave balance...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="leave-management-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight">
            Leave & Time-Off Management
          </h2>
          <p className="text-xs text-zinc-400">
            {currentUser?.role === 'employee' 
              ? 'Submit leave requests and track your PTO balances'
              : currentUser?.role === 'hr'
              ? 'View leave requests across departments. Admin approves/rejects.'
              : 'Manage leave requests, track PTO balances, and review approvals'}
          </p>
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F16E15] hover:bg-[#d95d0e] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[44px] cursor-pointer self-start sm:self-auto"
          disabled={isRefreshing}
        >
          <Plus className="w-4 h-4" />
          <span>{isRefreshing ? 'Processing...' : 'Apply for Leave'}</span>
        </button>
      </div>

      {/* LEAVE BALANCE CARDS - Updated dynamically */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="leave-balance-cards">
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Annual Paid Leave</span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-[#F16E15]">
              <Palmtree className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-extrabold text-zinc-100 font-mono">
              {getBalanceValue('annual', 'total') - getBalanceValue('annual', 'used')}{' '}
              <span className="text-xs font-normal text-zinc-500 font-sans">days left</span>
            </div>
            <span className="text-xs text-zinc-400">
              {getBalanceValue('annual', 'used')} of {getBalanceValue('annual', 'total')} used
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div 
              className="h-full bg-[#F16E15] rounded-full transition-all duration-500" 
              style={{ 
                width: `${getBalanceValue('annual', 'total') > 0 
                  ? (getBalanceValue('annual', 'used') / getBalanceValue('annual', 'total')) * 100 
                  : 0}%` 
              }} 
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Medical / Sick Leave</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-extrabold text-zinc-100 font-mono">
              {getBalanceValue('sick', 'total') - getBalanceValue('sick', 'used')}{' '}
              <span className="text-xs font-normal text-zinc-500 font-sans">days left</span>
            </div>
            <span className="text-xs text-zinc-400">
              {getBalanceValue('sick', 'used')} of {getBalanceValue('sick', 'total')} used
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
              style={{ 
                width: `${getBalanceValue('sick', 'total') > 0 
                  ? (getBalanceValue('sick', 'used') / getBalanceValue('sick', 'total')) * 100 
                  : 0}%` 
              }} 
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Personal / Casual</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-extrabold text-zinc-100 font-mono">
              {getBalanceValue('personal', 'total') - getBalanceValue('personal', 'used')}{' '}
              <span className="text-xs font-normal text-zinc-500 font-sans">days left</span>
            </div>
            <span className="text-xs text-zinc-400">
              {getBalanceValue('personal', 'used')} of {getBalanceValue('personal', 'total')} used
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-500" 
              style={{ 
                width: `${getBalanceValue('personal', 'total') > 0 
                  ? (getBalanceValue('personal', 'used') / getBalanceValue('personal', 'total')) * 100 
                  : 0}%` 
              }} 
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Parental / Family</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Baby className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-extrabold text-zinc-100 font-mono">
              {getBalanceValue('maternity', 'total')}{' '}
              <span className="text-xs font-normal text-zinc-500 font-sans">days quota</span>
            </div>
            <span className="text-xs text-emerald-400 font-medium font-mono">Eligible</span>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full w-1/4" />
          </div>
        </div>
      </div>

      {/* TABS & FILTER - Only show for Admin/HR */}
      {(currentUser?.role === 'admin' || currentUser?.role === 'hr') && (
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 md:flex-none px-3.5 py-2 rounded-lg text-xs font-bold capitalize transition-all min-h-[40px] flex items-center justify-center cursor-pointer ${
                  activeTab === tab
                    ? 'bg-zinc-800 text-zinc-100 shadow-xs border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab}
                {tab === 'pending' && pendingCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-[#F16E15] text-white text-[10px]">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Filter className="w-3.5 h-3.5 text-[#F16E15] shrink-0" />
            <span className="font-medium hidden sm:inline">Department:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#F16E15] min-h-[40px] w-full sm:w-auto"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* LEAVE TABLE - Shows proper employee names */}
      <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-950/70">
              <tr>
                <th className="py-4 px-4">Applicant</th>
                <th className="py-4 px-4">Leave Type</th>
                <th className="py-4 px-4">Duration & Dates</th>
                <th className="py-4 px-4">Days</th>
                <th className="py-4 px-4">Reason</th>
                <th className="py-4 px-4">Status</th>
                {currentUser?.role !== 'employee' && (
                  <th className="py-4 px-4 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={currentUser?.role === 'employee' ? 6 : 7} className="py-12 text-center text-zinc-500">
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((req) => (
                  <tr key={req.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-zinc-100 text-sm">{req.employeeName || 'Unknown'}</div>
                      <div className="text-[10px] text-zinc-400">
                        {req.department || 'N/A'} • <span className="font-mono">{req.employeeId || 'N/A'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="capitalize font-semibold text-zinc-200">{req.leaveType || 'N/A'} Leave</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono font-medium text-zinc-200">
                        {req.startDate ? `${formatDate(req.startDate)} - ${formatDate(req.endDate)}` : 'N/A'}
                      </div>
                      <div className="text-[10px] text-zinc-500">Applied: {req.appliedDate ? formatDate(req.appliedDate) : 'N/A'}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-zinc-200 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700">
                        {req.totalDays || 0} {req.totalDays === 1 ? 'day' : 'days'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate text-zinc-300 italic">
                      &ldquo;{req.reason || 'No reason provided'}&rdquo;
                      {req.reviewNotes && (
                        <div className="text-[10px] text-emerald-400 not-italic font-sans mt-0.5">
                          Note: {req.reviewNotes}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                        req.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                        req.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                        'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          req.status === 'approved' ? 'bg-emerald-400' :
                          req.status === 'pending' ? 'bg-amber-400' :
                          req.status === 'rejected' ? 'bg-rose-400' :
                          'bg-zinc-500'
                        }`} />
                        {req.status || 'N/A'}
                      </span>
                    </td>

                    {currentUser?.role !== 'employee' && (
                      <td className="py-3.5 px-4 text-right">
                        {req.status === 'pending' ? (
                          currentUser?.role === 'admin' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => approveLeave(req.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 font-semibold transition-colors flex items-center gap-1 min-h-[36px] cursor-pointer"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => rejectLeave(req.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 font-semibold transition-colors flex items-center gap-1 min-h-[36px] cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-amber-400 font-medium">Awaiting Admin Approval</span>
                          )
                        ) : (
                          <span className="text-[11px] text-zinc-400 font-mono">
                            {req.reviewedBy ? `by ${req.reviewedBy}` : 'Completed'}
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPLY LEAVE MODAL */}
      <AnimatePresence>
        {isApplyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsApplyModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-10 p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#F16E15] flex items-center justify-center text-white">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-100">Apply for Time-Off</h3>
                    <p className="text-xs text-zinc-400">Submit a formal request to your manager</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsApplyModalOpen(false)}
                  className="p-2 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold block">Leave Category</label>
                  <select
                    value={formLeaveType}
                    onChange={(e) => setFormLeaveType(e.target.value as LeaveType)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 text-xs focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                  >
                    <option value="annual">Annual Vacation Leave</option>
                    <option value="sick">Sick / Medical Leave</option>
                    <option value="personal">Personal / Casual Time-Off</option>
                    <option value="maternity">Parental / Maternity Leave</option>
                    <option value="unpaid">Unpaid Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-zinc-300 font-semibold block">Start Date</label>
                    <input
                      type="date"
                      required
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 text-xs focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-300 font-semibold block">End Date</label>
                    <input
                      type="date"
                      required
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 text-xs focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Total Working Days Requested:</span>
                  <span className="text-[#F16E15] font-mono font-bold text-sm">
                    {calculatedDays} {calculatedDays === 1 ? 'Day' : 'Days'}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold block">Reason / Details</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Briefly state the reason for absence and team coverage handover..."
                    value={formReason}
                    onChange={(e) => setFormReason(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#F16E15]"
                  />
                </div>

                <div className="pt-3 border-t border-zinc-800 flex flex-col sm:flex-row justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="px-4 py-2.5 text-zinc-400 hover:text-zinc-100 font-semibold transition-colors min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#F16E15] hover:bg-[#d95d0e] text-white font-bold shadow-md shadow-orange-500/20 min-h-[44px]"
                  >
                    Submit Application
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
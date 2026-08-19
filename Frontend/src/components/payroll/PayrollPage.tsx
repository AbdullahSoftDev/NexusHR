import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  Calendar,
  Download,
  Plus,
  TrendingUp,
  Percent,
  PlusCircle,
  FileText,
  X,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useHR } from '../../context/HRContext';
import { PayrollItem } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { PayslipModal } from '../common/PayslipModal';

// Safe currency formatter - prevents NaN
const safeCurrency = (value: any) => {
    const num = Number(value);
    if (isNaN(num) || num === 0) return '$0';
    return formatCurrency(num);
};

export const PayrollPage: React.FC = () => {
  const {
    payroll,
    selectedPayrollMonth,
    setSelectedPayrollMonth,
    generateMonthlyPayroll,
    markPayrollAsPaid,
    markAllPayrollAsPaid,
    addPayrollBonusOrDeduction,
    currentUser,
    showToast,
    employees,
    refreshPayroll
  } = useHR();

  const [selectedPayslipItem, setSelectedPayslipItem] = useState<PayrollItem | null>(null);
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustPayrollId, setAdjustPayrollId] = useState('');
  const [adjustType, setAdjustType] = useState<'bonus' | 'deduction'>('bonus');
  const [adjustTitle, setAdjustTitle] = useState('Performance Milestone Bonus');
  const [adjustAmount, setAdjustAmount] = useState(500);

  // Auto-refresh payroll on mount
  useEffect(() => {
    refreshPayroll();
  }, [selectedPayrollMonth]);

  // Filter payroll based on role
  const currentMonthPayroll = useMemo(() => {
    let filtered = payroll.filter((p) => p.month === selectedPayrollMonth);
    
    // Employee sees only their own payroll
    if (currentUser?.role === 'employee') {
      filtered = filtered.filter(p => p.employeeId === currentUser.employeeId);
    }
    
    return filtered;
  }, [payroll, selectedPayrollMonth, currentUser]);

  const hasPayroll = currentMonthPayroll.length > 0;

  const totalGrossPayroll = currentMonthPayroll.reduce(
    (sum, p) => sum + (p.baseSalary || 0) + (p.overtimePay || 0) + (p.bonuses?.reduce((b, a) => b + a.amount, 0) || 0),
    0
  );
  const totalNetPayroll = currentMonthPayroll.reduce((sum, p) => sum + (p.netSalary || 0), 0);
  const totalTaxesAndDeductions = currentMonthPayroll.reduce(
    (sum, p) => sum + (p.tax || 0) + (p.healthInsurance || 0) + (p.deductions?.reduce((b, a) => b + a.amount, 0) || 0),
    0
  );
  const paidCount = currentMonthPayroll.filter((p) => p.status === 'paid').length;
  const avgSalary = hasPayroll ? Math.round(totalNetPayroll / currentMonthPayroll.length) : 0;

  const handleGenerateClick = async () => {
    await generateMonthlyPayroll(selectedPayrollMonth);
    await refreshPayroll();
  };

  const handleDisburseAll = async () => {
    await markAllPayrollAsPaid(selectedPayrollMonth);
    await refreshPayroll();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleOpenPayslip = (item: PayrollItem) => {
    setSelectedPayslipItem(item);
    setIsPayslipOpen(true);
  };

  const handleOpenAdjust = (payrollId: string) => {
    setAdjustPayrollId(payrollId);
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustPayrollId || !adjustTitle || adjustAmount <= 0) return;
    await addPayrollBonusOrDeduction(adjustPayrollId, adjustType, adjustTitle, Number(adjustAmount));
    setIsAdjustModalOpen(false);
    await refreshPayroll();
  };

  const exportPayrollCSV = () => {
    const headers = [
      'Employee ID',
      'Employee Name',
      'Department',
      'Position',
      'Month',
      'Base Salary (USD)',
      'Overtime (USD)',
      'Taxes (USD)',
      'Health Ins (USD)',
      'Net Pay (USD)',
      'Status'
    ];
    const rows = currentMonthPayroll.map((p) => [
      p.employeeId,
      `"${p.employeeName}"`,
      `"${p.department}"`,
      `"${p.position}"`,
      p.month,
      p.baseSalary || 0,
      p.overtimePay || 0,
      p.tax || 0,
      p.healthInsurance || 0,
      p.netSalary || 0,
      p.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NexusHR_Payroll_${selectedPayrollMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Payroll report for ${selectedPayrollMonth} exported!`, 'success');
  };

  return (
    <div className="space-y-6" id="payroll-management-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight">
            {currentUser?.role === 'employee' ? 'My Payslips' : 'Payroll & Compensation Hub'}
          </h2>
          <p className="text-xs text-zinc-400">
            {currentUser?.role === 'employee' 
              ? 'View your monthly salary statements and payment history'
              : currentUser?.role === 'hr'
              ? 'View payroll records. Admin generates and approves.'
              : 'Automated salary calculations, statutory tax withholdings, and instant payslip generation'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 shadow-xs min-h-[44px]">
            <Calendar className="w-4 h-4 text-[#F16E15]" />
            <span className="font-semibold text-zinc-400">Period:</span>
            <select
              value={selectedPayrollMonth}
              onChange={(e) => {
                setSelectedPayrollMonth(e.target.value);
                refreshPayroll();
              }}
              className="bg-zinc-950 border border-zinc-800 text-zinc-100 font-bold rounded-lg px-2 py-1 focus:outline-none focus:border-[#F16E15]"
            >
              <option value="2026-08">August 2026</option>
              <option value="2026-07">July 2026</option>
              <option value="2026-06">June 2026</option>
              <option value="2026-05">May 2026</option>
            </select>
          </div>

          {currentUser?.role !== 'employee' && (
            <button
              onClick={exportPayrollCSV}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold border border-zinc-800 transition-colors shadow-xs min-h-[44px] cursor-pointer"
            >
              <Download className="w-4 h-4 text-zinc-400" />
              <span>Export CSV</span>
            </button>
          )}

          {currentUser?.role === 'admin' && (
            <>
              {!hasPayroll ? (
                <button
                  onClick={handleGenerateClick}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F16E15] hover:bg-[#d95d0e] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all min-h-[44px] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Generate {selectedPayrollMonth} Payroll</span>
                </button>
              ) : (
                <button
                  onClick={handleDisburseAll}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all min-h-[44px] cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Disburse All Direct Deposits</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* SUMMARY KPI CARDS - Hide for Employee */}
      {currentUser?.role !== 'employee' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="payroll-summary-cards">
          <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400">Total Net Disbursement</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100 font-mono tracking-tight">
              {safeCurrency(totalNetPayroll || 0)}
            </div>
            <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-800">
              <span>Gross: {safeCurrency(totalGrossPayroll || 0)}</span>
              <span className="text-emerald-400 font-semibold font-mono">Processed</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400">Average Take-Home Pay</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
              {safeCurrency(avgSalary || 0)}
            </div>
            <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-800">
              <span>Per employee / mo</span>
              <span className="text-zinc-300 font-medium font-mono">Competitive</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400">Employees Paid</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100 font-mono tracking-tight">
              {paidCount}{' '}
              <span className="text-sm font-normal text-zinc-500 font-sans">
                / {currentMonthPayroll.length || 0}
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-800">
              <span>Direct Deposit (ACH)</span>
              <span className="text-[#F16E15] font-semibold font-mono">100% On-Time</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400">Tax & Statutory Deductions</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100 font-mono tracking-tight">
              {safeCurrency(totalTaxesAndDeductions || 0)}
            </div>
            <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-800">
              <span>Federal + State + Health</span>
              <span className="text-emerald-400 font-medium font-mono">IRS Compliant</span>
            </div>
          </div>
        </div>
      )}

      {/* PAYROLL TABLE */}
      <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-zinc-100">
              {currentUser?.role === 'employee' ? 'My Salary Statement' : `Payroll Register — ${selectedPayrollMonth}`}
            </h3>
            <p className="text-xs text-zinc-400">
              {currentUser?.role === 'employee' 
                ? 'Your monthly compensation breakdown'
                : 'Comprehensive salary breakdown including base, overtime, bonuses, tax withholdings, and net pay'}
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 font-medium">
            {currentMonthPayroll.length} {currentMonthPayroll.length === 1 ? 'Record' : 'Records'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead className="border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-950/70">
              <tr>
                <th className="py-4 px-4">Employee</th>
                <th className="py-4 px-4">Base Salary</th>
                <th className="py-4 px-4">Overtime</th>
                <th className="py-4 px-4">Bonuses</th>
                <th className="py-4 px-4">Deductions & Tax</th>
                <th className="py-4 px-4">Net Salary</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
              {!hasPayroll ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500">
                    <p className="mb-3">No payroll records found for {selectedPayrollMonth}.</p>
                    {currentUser?.role === 'admin' && (
                      <button
                        onClick={handleGenerateClick}
                        className="px-4 py-2.5 rounded-xl bg-[#F16E15] hover:bg-[#d95d0e] text-white text-xs font-bold min-h-[44px] cursor-pointer"
                      >
                        Generate Payroll for {selectedPayrollMonth}
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                currentMonthPayroll.map((item) => {
                  const bonusSum = item.bonuses?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0;
                  const deductionSum = (item.tax || 0) + (item.healthInsurance || 0) + (item.deductions?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0);

                  return (
                    <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-zinc-100 text-sm">{item.employeeName || 'Unknown'}</div>
                        <div className="text-[10px] text-zinc-400">
                          {item.department || 'N/A'} • <span className="font-mono text-zinc-300">{item.employeeId || 'N/A'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-zinc-200">
                        {safeCurrency(item.baseSalary)}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-zinc-300">
                        {(item.overtimePay || 0) > 0 ? (
                          <span className="text-[#F16E15] font-semibold">+{safeCurrency(item.overtimePay)}</span>
                        ) : '—'}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        {bonusSum > 0 ? (
                          <span className="text-emerald-400 font-semibold">+{safeCurrency(bonusSum)}</span>
                        ) : <span className="text-zinc-600">—</span>}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-rose-400 font-medium">
                        -{safeCurrency(deductionSum)}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-100 text-sm">
                        {safeCurrency(item.netSalary)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'paid' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          {item.status || 'draft'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenPayslip(item)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-semibold transition-colors border border-zinc-700 min-h-[36px] cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#F16E15]" />
                            <span>Payslip</span>
                          </button>

                          {currentUser?.role !== 'employee' && (
                            <>
                              <button
                                onClick={() => handleOpenAdjust(item.id)}
                                className="p-1.5 text-zinc-400 hover:text-[#F16E15] rounded-lg hover:bg-zinc-800 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                              >
                                <PlusCircle className="w-4 h-4" />
                              </button>

                              {currentUser?.role === 'admin' && item.status !== 'paid' && (
                                <button
                                  onClick={async () => {
                                    await markPayrollAsPaid(item.id);
                                    await refreshPayroll();
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 font-semibold text-[11px] transition-colors min-h-[36px] cursor-pointer"
                                >
                                  Mark Paid
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAYSLIP MODAL */}
      <PayslipModal
        payrollItem={selectedPayslipItem}
        isOpen={isPayslipOpen}
        onClose={() => setIsPayslipOpen(false)}
      />

      {/* BONUS/DEDUCTION MODAL - Only for Admin/HR */}
      <AnimatePresence>
        {isAdjustModalOpen && currentUser?.role !== 'employee' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdjustModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-10 p-6 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-base font-bold text-zinc-100">Add Payroll Adjustment</h3>
                <button
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="p-2 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAdjustSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold block">Adjustment Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjustType('bonus')}
                      className={`py-2.5 rounded-xl border text-center font-bold transition-all min-h-[44px] cursor-pointer ${
                        adjustType === 'bonus'
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Bonus / Incentive (+)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustType('deduction')}
                      className={`py-2.5 rounded-xl border text-center font-bold transition-all min-h-[44px] cursor-pointer ${
                        adjustType === 'deduction'
                          ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Deduction (-)
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold block">Title / Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q3 Sales Achievement Award"
                    value={adjustTitle}
                    onChange={(e) => setAdjustTitle(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold block">Amount (USD)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                  />
                </div>

                <div className="pt-3 border-t border-zinc-800 flex flex-col sm:flex-row justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdjustModalOpen(false)}
                    className="px-4 py-2.5 text-zinc-400 hover:text-zinc-100 font-semibold transition-colors min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#F16E15] hover:bg-[#d95d0e] text-white font-bold shadow-md shadow-orange-500/20 min-h-[44px]"
                  >
                    Apply Adjustment
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
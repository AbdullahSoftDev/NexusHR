import React from 'react';
import { motion } from 'motion/react';
import { X, Printer, Download, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { PayrollItem, Employee } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { useHR } from '../../context/HRContext';

interface Props {
  payrollItem: PayrollItem | null;
  employee?: Employee;
  isOpen: boolean;
  onClose: () => void;
}

export const PayslipModal: React.FC<Props> = ({ payrollItem, employee, isOpen, onClose }) => {
  const { companySettings, showToast } = useHR();

  if (!isOpen || !payrollItem) return null;

  const totalBonuses = payrollItem.bonuses?.reduce((acc, b) => acc + (b.amount || 0), 0) || 0;
  const totalCustomDeductions = payrollItem.deductions?.reduce((acc, d) => acc + (d.amount || 0), 0) || 0;
  const grossEarnings = (payrollItem.baseSalary || 0) + (payrollItem.overtimePay || 0) + totalBonuses;
  const totalDeductions = (payrollItem.tax || 0) + (payrollItem.healthInsurance || 0) + totalCustomDeductions;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    showToast('Downloading encrypted PDF payslip document...', 'success');
  };

  // Safe currency helper
  const safeCurrency = (value: any) => {
    const num = Number(value);
    if (isNaN(num) || num === 0) return '$0';
    return formatCurrency(num);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm no-print"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-3xl bg-[#141418] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 my-4 sm:my-8 text-zinc-100 print:bg-white print:text-black print:border-none print:shadow-none print:m-0"
        id="payslip-modal-container"
      >
        {/* Top Action Bar (hidden in print) */}
        <div className="no-print flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-800 bg-[#0e0e11] gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-semibold text-white truncate">Statement of Earnings</h3>
              <p className="text-[11px] text-zinc-400 truncate">Period: {payrollItem.month}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 hover:text-white border border-zinc-700 transition-colors min-h-[36px]"
            >
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#F16E15] hover:bg-[#d95d0e] text-xs font-medium text-white shadow-md shadow-orange-500/20 transition-colors min-h-[36px]"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors ml-1 min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Payslip Document Content */}
        <div className="p-4 sm:p-8 space-y-6 print:p-0 max-h-[80vh] overflow-y-auto">
          {/* Header & Logo */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-zinc-800 print:border-gray-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F16E15] to-amber-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  N
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white print:text-black">
                  {companySettings.companyName || 'Nexus Global Technologies Inc.'}
                </h2>
              </div>
              <p className="text-xs text-zinc-400 print:text-gray-600 max-w-sm">
                {companySettings.companyAddress || '500 Howard Street, Suite 1400, San Francisco, CA 94105'}
              </p>
              <p className="text-xs text-zinc-400 print:text-gray-600">
                Tax ID: {companySettings.taxId || 'XX-XXX8921'} • Reg: {companySettings.registrationNumber || 'US-DEL-9842105'}
              </p>
            </div>

            <div className="text-left sm:text-right w-full sm:w-auto">
              <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 print:bg-gray-100 print:text-gray-800">
                {payrollItem.status === 'paid' ? 'PAID & DISBURSED' : 'PROCESSED STATEMENT'}
              </span>
              <div className="mt-2 text-xs text-zinc-400 print:text-gray-600 space-y-0.5">
                <div>Payslip ID: <span className="font-mono text-zinc-200 font-semibold print:text-black">{payrollItem.id}</span></div>
                <div>Disbursement Date: <span className="font-medium text-zinc-200 print:text-black">{payrollItem.paymentDate || 'End of Month'}</span></div>
                <div>Payment Method: <span className="text-zinc-200 print:text-black">{payrollItem.paymentMethod || 'Direct Deposit'}</span></div>
              </div>
            </div>
          </div>

          {/* Employee Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl bg-[#18181c] border border-zinc-800 print:bg-gray-50 print:border-gray-200 text-xs">
            <div>
              <span className="text-zinc-500 print:text-gray-500 block mb-0.5">Employee Name</span>
              <span className="font-semibold text-white print:text-black text-sm">{payrollItem.employeeName || 'Unknown'}</span>
            </div>
            <div>
              <span className="text-zinc-500 print:text-gray-500 block mb-0.5">Employee ID</span>
              <span className="font-mono font-semibold text-white print:text-black">{payrollItem.employeeId || 'N/A'}</span>
            </div>
            <div>
              <span className="text-zinc-500 print:text-gray-500 block mb-0.5">Designation</span>
              <span className="font-semibold text-white print:text-black">{payrollItem.position || 'N/A'}</span>
            </div>
            <div>
              <span className="text-zinc-500 print:text-gray-500 block mb-0.5">Department</span>
              <span className="font-semibold text-white print:text-black">{payrollItem.department || 'N/A'}</span>
            </div>
          </div>

          {/* Working Days Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-[#18181c] border border-zinc-800 print:border-gray-200">
              <span className="text-zinc-400 block text-[11px]">Working Days</span>
              <span className="font-bold text-white print:text-black text-sm">{payrollItem.workingDays || 0}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#18181c] border border-zinc-800 print:border-gray-200">
              <span className="text-zinc-400 block text-[11px]">Present Days</span>
              <span className="font-bold text-emerald-400 print:text-black text-sm">{payrollItem.presentDays || 0}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#18181c] border border-zinc-800 print:border-gray-200">
              <span className="text-zinc-400 block text-[11px]">Unpaid Leaves</span>
              <span className="font-bold text-rose-400 print:text-black text-sm">{payrollItem.unpaidLeaveDays || 0}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#18181c] border border-zinc-800 print:border-gray-200">
              <span className="text-zinc-400 block text-[11px]">Overtime Hours</span>
              <span className="font-bold text-orange-400 print:text-black text-sm">{payrollItem.overtimeHours || 0} hrs</span>
            </div>
          </div>

          {/* Earnings & Deductions Tables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Earnings Column */}
            <div className="rounded-xl border border-zinc-800 print:border-gray-200 overflow-hidden bg-[#18181c]">
              <div className="px-4 py-2.5 bg-zinc-800/80 print:bg-gray-100 font-semibold text-xs text-zinc-200 print:text-black flex justify-between">
                <span>EARNINGS</span>
                <span>AMOUNT</span>
              </div>
              <div className="p-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-zinc-400 print:text-gray-700">
                  <span>Basic Monthly Salary</span>
                  <span className="font-mono font-medium text-white">{safeCurrency(payrollItem.baseSalary)}</span>
                </div>
                {(payrollItem.overtimePay || 0) > 0 && (
                  <div className="flex justify-between text-zinc-400 print:text-gray-700">
                    <span>Overtime Allowance ({payrollItem.overtimeHours || 0}h)</span>
                    <span className="font-mono font-medium text-white">{safeCurrency(payrollItem.overtimePay)}</span>
                  </div>
                )}
                {payrollItem.bonuses?.map(b => (
                  <div key={b.id} className="flex justify-between text-zinc-400 print:text-gray-700">
                    <span>{b.title}</span>
                    <span className="font-mono font-medium text-white">{safeCurrency(b.amount)}</span>
                  </div>
                ))}
                <div className="pt-3 mt-3 border-t border-zinc-800 print:border-gray-200 flex justify-between font-semibold text-white print:text-black text-sm">
                  <span>Total Gross Earnings</span>
                  <span className="font-mono text-emerald-400 font-bold print:text-black">{safeCurrency(grossEarnings)}</span>
                </div>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="rounded-xl border border-zinc-800 print:border-gray-200 overflow-hidden bg-[#18181c]">
              <div className="px-4 py-2.5 bg-zinc-800/80 print:bg-gray-100 font-semibold text-xs text-zinc-200 print:text-black flex justify-between">
                <span>DEDUCTIONS & TAXES</span>
                <span>AMOUNT</span>
              </div>
              <div className="p-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-zinc-400 print:text-gray-700">
                  <span>Federal & State Income Tax</span>
                  <span className="font-mono font-medium text-white">{safeCurrency(payrollItem.tax)}</span>
                </div>
                <div className="flex justify-between text-zinc-400 print:text-gray-700">
                  <span>Medical & Dental Insurance</span>
                  <span className="font-mono font-medium text-white">{safeCurrency(payrollItem.healthInsurance)}</span>
                </div>
                {payrollItem.deductions?.map(d => (
                  <div key={d.id} className="flex justify-between text-zinc-400 print:text-gray-700">
                    <span>{d.title}</span>
                    <span className="font-mono font-medium text-white">{safeCurrency(d.amount)}</span>
                  </div>
                ))}
                <div className="pt-3 mt-3 border-t border-zinc-800 print:border-gray-200 flex justify-between font-semibold text-white print:text-black text-sm">
                  <span>Total Deductions</span>
                  <span className="font-mono text-rose-400 font-bold print:text-black">{safeCurrency(totalDeductions)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Take-Home Salary Highlight Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:bg-gray-100 print:border-gray-300">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-orange-400 print:text-black">
                Total Net Payable (Take Home)
              </span>
              <p className="text-xs text-zinc-400 print:text-gray-600 mt-0.5">
                Deposited to {payrollItem.paymentMethod || 'Primary Direct Deposit Account'}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight print:text-black">
                {safeCurrency(payrollItem.netSalary)}
              </span>
            </div>
          </div>

          {/* Legal / Confirmation Footer */}
          <div className="pt-4 border-t border-zinc-800 print:border-gray-200 flex flex-col sm:flex-row justify-between items-center text-[11px] text-zinc-500 print:text-gray-500 gap-2 text-center sm:text-left">
            <span>This is a computer-generated payroll advisory document. No physical signature is required.</span>
            <span>NexusHR Security Verified • 256-bit Encrypted</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
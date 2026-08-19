import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Users, CalendarCheck, FileText, Wallet, Settings, Building2, ArrowRight, X } from 'lucide-react';
import { useHR } from '../../context/HRContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmployee?: (empId: string) => void;
}

export const GlobalSearchModal: React.FC<Props> = ({ isOpen, onClose, onSelectEmployee }) => {
  const [query, setQuery] = useState('');
  const { employees, departments, setActiveTab } = useHR();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open via parent or event
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Safe filtering with optional chaining
  const filteredEmployees = (employees || []).filter(
    e =>
      e?.firstName?.toLowerCase().includes(query.toLowerCase()) ||
      e?.lastName?.toLowerCase().includes(query.toLowerCase()) ||
      e?.email?.toLowerCase().includes(query.toLowerCase()) ||
      e?.department?.toLowerCase().includes(query.toLowerCase()) ||
      e?.position?.toLowerCase().includes(query.toLowerCase()) ||
      e?.employeeId?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const filteredDepartments = (departments || []).filter(d =>
    d?.name?.toLowerCase().includes(query.toLowerCase())
  );

  const quickNav = [
    { title: 'Employee Directory', tab: 'employees', icon: Users, desc: 'Manage profiles, roles & teams' },
    { title: 'Attendance Terminal', tab: 'attendance', icon: CalendarCheck, desc: 'Live check-in, calendar logs' },
    { title: 'Leave Approvals', tab: 'leaves', icon: FileText, desc: 'Manage time-off requests & quotas' },
    { title: 'Payroll & Payslips', tab: 'payroll', icon: Wallet, desc: 'Salary disbursements & deductions' },
    { title: 'Company Settings', tab: 'settings', icon: Settings, desc: 'Departments, quotas, company profile' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        className="relative w-full max-w-2xl bg-[#141418] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10"
        id="global-search-modal"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-800 bg-[#0e0e11] gap-3">
          <Search className="w-5 h-5 text-[#F16E15]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search employees, positions, departments, or quick actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder:text-zinc-500 text-sm focus:outline-none min-h-[40px]"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 min-h-[36px] min-w-[36px] flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
            ESC
          </span>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {/* If query has employee results */}
          {query && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2 px-2">
                Employees ({filteredEmployees.length})
              </div>
              {filteredEmployees.length === 0 ? (
                <div className="p-3 text-sm text-zinc-400">No employees match &ldquo;{query}&rdquo;</div>
              ) : (
                <div className="space-y-1">
                  {filteredEmployees.map((emp) => (
                    <div
                      key={emp.id}
                      onClick={() => {
                        setActiveTab('employees');
                        if (onSelectEmployee) onSelectEmployee(emp.id);
                        onClose();
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/70 cursor-pointer transition-colors group min-h-[48px]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={emp.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(emp.firstName) + '&background=F16E15&color=fff&size=128'}
                          alt={emp.firstName}
                          className="w-9 h-9 rounded-full object-cover border border-zinc-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white group-hover:text-[#F16E15] transition-colors truncate">
                            {emp.firstName} {emp.lastName}
                          </div>
                          <div className="text-xs text-zinc-400 truncate">
                            {emp.position} • <span className="text-zinc-300 font-medium">{emp.department}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {emp.employeeId}
                        </span>
                        <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Navigation Suggestions */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2 px-2">
              {query ? 'Quick Navigation' : 'Suggested Destinations'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickNav.map((item) => (
                <div
                  key={item.tab}
                  onClick={() => {
                    setActiveTab(item.tab);
                    onClose();
                  }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-[#18181c] hover:bg-zinc-800/80 border border-zinc-800/80 cursor-pointer transition-all group min-h-[48px]"
                >
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 group-hover:bg-[#F16E15] group-hover:text-white transition-colors shrink-0">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Departments */}
          {filteredDepartments.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2 px-2">
                Departments
              </div>
              <div className="flex flex-wrap gap-2 px-2">
                {filteredDepartments.map((dept) => (
                  <button
                    key={dept.id}
                    onClick={() => {
                      setActiveTab('employees');
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700 transition-colors min-h-[36px]"
                  >
                    <Building2 className="w-3.5 h-3.5 text-[#F16E15]" />
                    {dept.name}
                    <span className="text-[10px] text-zinc-400 font-mono">({dept.employeeCount || 0})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-[#0e0e11] border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Navigate with ⬆⬇ and Enter</span>
          <span>NexusHR Unified Enterprise Search</span>
        </div>
      </motion.div>
    </div>
  );
};
import React, { useState } from 'react';
import {
  Building2,
  Users,
  Sliders,
  Clock,
  Shield,
  Database,
  Save,
  Plus,
  Trash2,
  Download,
  RotateCcw
} from 'lucide-react';
import { useHR } from '../../context/HRContext';
import { formatCurrency } from '../../lib/utils';

export const SettingsPage: React.FC = () => {
  const {
    companySettings,
    updateCompanySettings,
    departments,
    addDepartment,
    deleteDepartment,
    currentUser,
    switchRole,
    resetToDefaultData,
    showToast
  } = useHR();

  const [activeTab, setActiveTab] = useState<
    'company' | 'departments' | 'policies' | 'working_hours' | 'security' | 'backup'
  >('company');

  // Company Profile Form State
  const [compName, setCompName] = useState(companySettings.companyName);
  const [compTaxId, setCompTaxId] = useState(companySettings.taxId);
  const [compCurrency, setCompCurrency] = useState(companySettings.currency);
  const [compTimezone, setCompTimezone] = useState(companySettings.timezone);
  const [compAddress, setCompAddress] = useState(companySettings.companyAddress);
  const [compEmail, setCompEmail] = useState(companySettings.companyEmail);
  const [compPhone, setCompPhone] = useState(companySettings.companyPhone);

  // Departments State
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptManager, setNewDeptManager] = useState('');
  const [newDeptBudget, setNewDeptBudget] = useState(300000);

  // Leave Policies Form State
  const [annualQuota, setAnnualQuota] = useState(companySettings.annualLeaveQuota);
  const [sickQuota, setSickQuota] = useState(companySettings.sickLeaveQuota);
  const [personalQuota, setPersonalQuota] = useState(companySettings.personalLeaveQuota);
  const [parentalQuota, setParentalQuota] = useState(60);

  // Add these state variables in the SettingsPage component
const [workStartHour, setWorkStartHour] = useState(() => {
  const time = companySettings.workStartTime || '09:00 AM';
  const hour = parseInt(time.split(':')[0]);
  return hour;
});
const [workStartMinute, setWorkStartMinute] = useState(() => {
  const time = companySettings.workStartTime || '09:00 AM';
  const minute = parseInt(time.split(':')[1].split(' ')[0]);
  return minute;
});
const [workStartAmPm, setWorkStartAmPm] = useState(() => {
  const time = companySettings.workStartTime || '09:00 AM';
  return time.includes('PM') ? 'PM' : 'AM';
});

const [workEndHour, setWorkEndHour] = useState(() => {
  const time = companySettings.workEndTime || '05:30 PM';
  const hour = parseInt(time.split(':')[0]);
  return hour;
});
const [workEndMinute, setWorkEndMinute] = useState(() => {
  const time = companySettings.workEndTime || '05:30 PM';
  const minute = parseInt(time.split(':')[1].split(' ')[0]);
  return minute;
});
const [workEndAmPm, setWorkEndAmPm] = useState(() => {
  const time = companySettings.workEndTime || '05:30 PM';
  return time.includes('PM') ? 'PM' : 'AM';
});

const [gracePeriod, setGracePeriod] = useState(companySettings.gracePeriodMinutes || 15);
const [lateThreshold, setLateThreshold] = useState(companySettings.lateThresholdMinutes || 15);
const [autoCheckoutEnabled, setAutoCheckoutEnabled] = useState(companySettings.autoCheckoutEnabled !== false);
const [overtimeRate, setOvertimeRate] = useState(1.5);

  

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings({
      companyName: compName,
      taxId: compTaxId,
      currency: compCurrency,
      timezone: compTimezone,
      companyAddress: compAddress,
      companyEmail: compEmail,
      companyPhone: compPhone
    });
    showToast('Company details updated successfully!', 'success');
  };

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName) return;
    addDepartment({
      name: newDeptName,
      headName: newDeptManager || 'Unassigned Lead',
      budget: Number(newDeptBudget)
    });
    setNewDeptName('');
    setNewDeptManager('');
    setNewDeptBudget(300000);
    showToast(`Department "${newDeptName}" added!`, 'success');
  };

  const handleExportDataJSON = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      system: 'NexusHR Enterprise',
      version: '2.5.0',
      companySettings,
      departments,
      userRole: currentUser?.role
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `NexusHR_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('System snapshot exported successfully!', 'success');
  };

  return (
    <div className="space-y-6" id="settings-page-content">
      {/* Top Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight">
          System Administration & Settings
        </h2>
        <p className="text-xs text-zinc-400">
          Configure corporate policies, shift parameters, department budgets, and RBAC security
        </p>
      </div>

      {/* Main Grid: Left Navigation / Top Tabs on Mobile & Right Content Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Sidebar/Tabs */}
        <div className="lg:col-span-3 flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
          <button
            onClick={() => setActiveTab('company')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer whitespace-nowrap min-h-[44px] ${
              activeTab === 'company'
                ? 'bg-[#F16E15] text-white shadow-md shadow-orange-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span>Company Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('departments')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer whitespace-nowrap min-h-[44px] ${
              activeTab === 'departments'
                ? 'bg-[#F16E15] text-white shadow-md shadow-orange-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Departments & Budgets</span>
          </button>

          <button
            onClick={() => setActiveTab('policies')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer whitespace-nowrap min-h-[44px] ${
              activeTab === 'policies'
                ? 'bg-[#F16E15] text-white shadow-md shadow-orange-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <Sliders className="w-4 h-4 shrink-0" />
            <span>Leave Quotas & Policies</span>
          </button>

          <button
            onClick={() => setActiveTab('working_hours')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer whitespace-nowrap min-h-[44px] ${
              activeTab === 'working_hours'
                ? 'bg-[#F16E15] text-white shadow-md shadow-orange-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span>Shift & Punch Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer whitespace-nowrap min-h-[44px] ${
              activeTab === 'security'
                ? 'bg-[#F16E15] text-white shadow-md shadow-orange-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <Shield className="w-4 h-4 shrink-0" />
            <span>Roles & Access Control</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer whitespace-nowrap min-h-[44px] ${
              activeTab === 'backup'
                ? 'bg-[#F16E15] text-white shadow-md shadow-orange-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <Database className="w-4 h-4 shrink-0" />
            <span>Data & System Backup</span>
          </button>
        </div>

        {/* Right Content Panel */}
        <div className="lg:col-span-9 p-4 sm:p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xs">
          {/* TAB 1: Company Profile */}
          {activeTab === 'company' && (
            <form onSubmit={handleSaveCompany} className="space-y-6 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-4 gap-3">
                <div>
                  <h3 className="text-base font-bold text-zinc-100">Company Identity & Organization</h3>
                  <p className="text-zinc-400 text-xs">These parameters populate headers and official payslips</p>
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F16E15] hover:bg-[#d95d0e] text-white font-bold shadow-md shadow-orange-500/20 cursor-pointer min-h-[44px] self-start sm:self-auto"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold block">Legal Entity Name</label>
                  <input
                    type="text"
                    value={compName}
                    onChange={(e) => setCompName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold block">Corporate Tax ID / EIN</label>
                  <input
                    type="text"
                    value={compTaxId}
                    onChange={(e) => setCompTaxId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold block">Primary Currency</label>
                  <select
                    value={compCurrency}
                    onChange={(e) => setCompCurrency(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                  >
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                    <option value="SGD">SGD (S$) - Singapore Dollar</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold block">Primary Timezone</label>
                  <input
                    type="text"
                    value={compTimezone}
                    onChange={(e) => setCompTimezone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold block">Corporate Support Email</label>
                  <input
                    type="email"
                    value={compEmail}
                    onChange={(e) => setCompEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold block">Headquarters Phone</label>
                  <input
                    type="text"
                    value={compPhone}
                    onChange={(e) => setCompPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-zinc-300 font-semibold block">Headquarters Physical Address</label>
                  <input
                    type="text"
                    value={compAddress}
                    onChange={(e) => setCompAddress(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                  />
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: Departments Management */}
          {activeTab === 'departments' && (
            <div className="space-y-6 text-xs">
              <div className="border-b border-zinc-800 pb-4">
                <h3 className="text-base font-bold text-zinc-100">Department Structure & Budgets</h3>
                <p className="text-zinc-400 text-xs">Manage corporate divisions, managers, and allocated annual budgets</p>
              </div>

              {/* Add department form */}
              <form onSubmit={handleAddDept} className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-3">
                <h4 className="font-bold text-zinc-100 text-xs">Add New Department</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Department Name (e.g. Legal & Compliance)"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                  />
                  <input
                    type="text"
                    placeholder="Department Lead / VP"
                    value={newDeptManager}
                    onChange={(e) => setNewDeptManager(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                  />
                  <input
                    type="number"
                    min={50000}
                    step={10000}
                    placeholder="Annual Budget (USD)"
                    value={newDeptBudget}
                    onChange={(e) => setNewDeptBudget(Number(e.target.value))}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-[#F16E15] min-h-[44px]"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F16E15] hover:bg-[#d95d0e] text-white font-bold shadow-xs cursor-pointer min-h-[44px]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Department</span>
                  </button>
                </div>
              </form>

              {/* Departments list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 shadow-xs flex items-start justify-between"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-zinc-100 text-sm">{dept.name}</div>
                      <div className="text-zinc-400">
                        Lead: <strong className="text-zinc-200">{dept.headName}</strong>
                      </div>
                      <div className="text-emerald-400 font-mono font-medium">
                        Budget: {formatCurrency(dept.budget)}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteDepartment(dept.id)}
                      className="p-2 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Leave Quotas & Policies */}
          {activeTab === 'policies' && (
            <div className="space-y-6 text-xs">
              <div className="border-b border-zinc-800 pb-4">
                <h3 className="text-base font-bold text-zinc-100">Leave Quotas & Policy Framework</h3>
                <p className="text-zinc-400 text-xs">Annual paid time-off days credited to full-time staff</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2">
                  <label className="font-bold text-zinc-200 block">Annual Vacation Quota (Days)</label>
                  <input
                    type="number"
                    value={annualQuota}
                    onChange={(e) => setAnnualQuota(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 font-mono min-h-[44px]"
                  />
                  <p className="text-[11px] text-zinc-500">Standard PTO accrued monthly</p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2">
                  <label className="font-bold text-zinc-200 block">Medical / Sick Leave (Days)</label>
                  <input
                    type="number"
                    value={sickQuota}
                    onChange={(e) => setSickQuota(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 font-mono min-h-[44px]"
                  />
                  <p className="text-[11px] text-zinc-500">Doctor&apos;s note required for &gt; 3 days</p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2">
                  <label className="font-bold text-zinc-200 block">Personal / Casual Days</label>
                  <input
                    type="number"
                    value={personalQuota}
                    onChange={(e) => setPersonalQuota(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 font-mono min-h-[44px]"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2">
                  <label className="font-bold text-zinc-200 block">Maternity / Parental Quota (Days)</label>
                  <input
                    type="number"
                    value={parentalQuota}
                    onChange={(e) => setParentalQuota(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 font-mono min-h-[44px]"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    updateCompanySettings({
                      annualLeaveQuota: annualQuota,
                      sickLeaveQuota: sickQuota,
                      personalLeaveQuota: personalQuota
                    });
                    showToast('Leave quota policies updated successfully!', 'success');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#F16E15] hover:bg-[#d95d0e] text-white font-bold shadow-md shadow-orange-500/20 cursor-pointer min-h-[44px]"
                >
                  Apply Leave Policies
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Shift & Punch Rules */}
{activeTab === 'working_hours' && (
  <div className="space-y-6 text-xs">
    <div className="border-b border-zinc-800 pb-4">
      <h3 className="text-base font-bold text-zinc-100">Work Shift & Biometric Punch Rules</h3>
      <p className="text-zinc-400 text-xs">Configure standard operational shifts, late penalties, OT rates, and auto-checkout</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Office Start Time */}
      <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2">
        <label className="font-bold text-zinc-200 block">Office Start Time</label>
        <div className="flex items-center gap-2">
          <select
            value={workStartHour}
            onChange={(e) => setWorkStartHour(Number(e.target.value))}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 font-mono min-h-[44px]"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
              <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
            ))}
          </select>
          <span className="text-zinc-400 font-bold">:</span>
          <select
            value={workStartMinute}
            onChange={(e) => setWorkStartMinute(Number(e.target.value))}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 font-mono min-h-[44px]"
          >
            <option value={0}>00</option>
            <option value={15}>15</option>
            <option value={30}>30</option>
            <option value={45}>45</option>
          </select>
          <select
            value={workStartAmPm}
            onChange={(e) => setWorkStartAmPm(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 font-mono min-h-[44px]"
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
        <p className="text-[11px] text-zinc-500">When employees are expected to start work</p>
      </div>

      {/* Office End Time */}
      <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2">
        <label className="font-bold text-zinc-200 block">Office End Time</label>
        <div className="flex items-center gap-2">
          <select
            value={workEndHour}
            onChange={(e) => setWorkEndHour(Number(e.target.value))}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 font-mono min-h-[44px]"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
              <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
            ))}
          </select>
          <span className="text-zinc-400 font-bold">:</span>
          <select
            value={workEndMinute}
            onChange={(e) => setWorkEndMinute(Number(e.target.value))}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 font-mono min-h-[44px]"
          >
            <option value={0}>00</option>
            <option value={15}>15</option>
            <option value={30}>30</option>
            <option value={45}>45</option>
          </select>
          <select
            value={workEndAmPm}
            onChange={(e) => setWorkEndAmPm(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 font-mono min-h-[44px]"
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
        <p className="text-[11px] text-zinc-500">When employees are expected to end work</p>
      </div>

      {/* Grace Period */}
      <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2">
        <label className="font-bold text-zinc-200 block">Late Check-in Grace Period</label>
        <input
          type="number"
          value={gracePeriod}
          onChange={(e) => setGracePeriod(Number(e.target.value))}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 font-mono min-h-[44px]"
        />
        <p className="text-[11px] text-zinc-500">Minutes after start time before marked late</p>
      </div>

      {/* Late Threshold */}
      <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2">
        <label className="font-bold text-zinc-200 block">Late Threshold</label>
        <input
          type="number"
          value={lateThreshold}
          onChange={(e) => setLateThreshold(Number(e.target.value))}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 font-mono min-h-[44px]"
        />
        <p className="text-[11px] text-zinc-500">Minutes after grace period before considered absent</p>
      </div>

      {/* Auto Checkout Toggle */}
      <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2 col-span-1 sm:col-span-2">
        <div className="flex items-center justify-between">
          <label className="font-bold text-zinc-200 block">Auto Checkout</label>
          <button
            type="button"
            onClick={() => setAutoCheckoutEnabled(!autoCheckoutEnabled)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              autoCheckoutEnabled ? 'bg-emerald-500' : 'bg-zinc-700'
            }`}
          >
            <span
              className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform ${
                autoCheckoutEnabled ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>
        <p className="text-[11px] text-zinc-500">
          {autoCheckoutEnabled 
            ? 'Employees will be automatically checked out after work hours if they forget' 
            : 'Auto-checkout is disabled. Employees must manually check out'}
        </p>
      </div>

      {/* Overtime Rate */}
      <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2">
        <label className="font-bold text-zinc-200 block">Overtime Pay Rate Multiplier</label>
        <input
          type="number"
          step={0.1}
          value={overtimeRate}
          onChange={(e) => setOvertimeRate(Number(e.target.value))}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 font-mono min-h-[44px]"
        />
        <p className="text-[11px] text-zinc-500">Multiplier applied to hourly rate for overtime</p>
      </div>
    </div>

    <div className="flex justify-end">
      <button
        type="button"
        onClick={() => {
          // Convert 12-hour to 24-hour for storage
          let startHour24 = workStartHour;
          if (workStartAmPm === 'PM' && workStartHour !== 12) startHour24 = workStartHour + 12;
          if (workStartAmPm === 'AM' && workStartHour === 12) startHour24 = 0;
          
          let endHour24 = workEndHour;
          if (workEndAmPm === 'PM' && workEndHour !== 12) endHour24 = workEndHour + 12;
          if (workEndAmPm === 'AM' && workEndHour === 12) endHour24 = 0;
          
          updateCompanySettings({
            officeStartHour: startHour24,
            officeStartMinute: workStartMinute,
            officeEndHour: endHour24,
            officeEndMinute: workEndMinute,
            gracePeriodMinutes: gracePeriod,
            lateThresholdMinutes: lateThreshold,
            autoCheckoutEnabled: autoCheckoutEnabled,
            workStartTime: `${String(workStartHour).padStart(2, '0')}:${String(workStartMinute).padStart(2, '0')} ${workStartAmPm}`,
            workEndTime: `${String(workEndHour).padStart(2, '0')}:${String(workEndMinute).padStart(2, '0')} ${workEndAmPm}`
          });
          showToast('Shift schedule rules saved successfully!', 'success');
        }}
        className="px-5 py-2.5 rounded-xl bg-[#F16E15] hover:bg-[#d95d0e] text-white font-bold shadow-md shadow-orange-500/20 cursor-pointer min-h-[44px]"
      >
        Save Shift Settings
      </button>
    </div>
  </div>
)}

          {/* TAB 5: Roles & Access Control */}
          {activeTab === 'security' && (
            <div className="space-y-6 text-xs">
              <div className="border-b border-zinc-800 pb-4">
                <h3 className="text-base font-bold text-zinc-100">Role-Based Access Control (RBAC)</h3>
                <p className="text-zinc-400 text-xs">Manage system privileges across Admin, HR Manager, and Staff Employee</p>
              </div>

              {/* Current Active Persona Switcher */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-zinc-100">Active Session Persona:</h4>
                    <p className="text-zinc-400 text-[11px]">
                      Currently previewing the system as:{' '}
                      <strong className="text-[#F16E15] uppercase">{currentUser?.role}</strong> ({currentUser?.name})
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {(['admin', 'hr', 'employee'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => switchRole(r)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer min-h-[50px] ${
                        currentUser?.role === r
                          ? 'bg-orange-500/10 border-[#F16E15] text-[#F16E15] font-bold ring-2 ring-[#F16E15]/20'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                      }`}
                    >
                      <div className="capitalize font-bold text-sm">{r}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        {r === 'admin' ? 'Full System Control' : r === 'hr' ? 'HR & Approvals' : 'Employee Self-Service'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Security parameters */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-between shadow-xs">
                  <div>
                    <div className="font-bold text-zinc-100">24-Hour Session Inactivity Expiry (FR-06)</div>
                    <div className="text-zinc-400 text-[11px]">Automatically invalidate JWT tokens after idle time</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30">
                    Enabled
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-between shadow-xs">
                  <div>
                    <div className="font-bold text-zinc-100">Two-Factor Authentication (2FA)</div>
                    <div className="text-zinc-400 text-[11px]">Require authenticator TOTP code for administrative logins</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30">
                    Enforced for Admin
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Backup & System Restore */}
          {activeTab === 'backup' && (
            <div className="space-y-6 text-xs">
              <div className="border-b border-zinc-800 pb-4">
                <h3 className="text-base font-bold text-zinc-100">Database Backup & Recovery</h3>
                <p className="text-zinc-400 text-xs">Manage system snapshots, export datasets, or reset to factory defaults</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-[#F16E15]" />
                    <h4 className="font-bold text-zinc-100 text-sm">Export Full Backup (JSON)</h4>
                  </div>
                  <p className="text-zinc-400 text-xs">
                    Download an offline JSON copy containing all employee records, attendance punches, and payroll history.
                  </p>
                  <button
                    onClick={handleExportDataJSON}
                    className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold transition-colors cursor-pointer min-h-[44px]"
                  >
                    Download JSON Archive
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-5 h-5 text-rose-400" />
                    <h4 className="font-bold text-zinc-100 text-sm">Reset to Demo Dataset</h4>
                  </div>
                  <p className="text-zinc-400 text-xs">
                    Restore the initial demo dataset (workforce records, August 2026 attendance, and payroll).
                  </p>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to reset all data back to the demo defaults?')) {
                        resetToDefaultData();
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold transition-colors cursor-pointer min-h-[44px]"
                  >
                    Reset to Factory Defaults
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  FileText,
  Wallet,
  Settings,
  LogOut,
  ChevronRight,
  Shield,
  UserCheck,
  Briefcase,
  Sparkles,
  Building,
  X
} from 'lucide-react';
import { useHR } from '../../context/HRContext';
import { UserRole } from '../../types';

interface Props {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<Props> = ({ isMobileOpen, setIsMobileOpen }) => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    logout,
    switchRole,
    companySettings,
    unreadNotificationCount,
    leaves
  } = useHR();

  const pendingLeavesCount = leaves.filter(l => l.status === 'pending').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'hr', 'employee'] as UserRole[],
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: Users,
      roles: ['admin', 'hr'] as UserRole[],
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: CalendarCheck,
      roles: ['admin', 'hr', 'employee'] as UserRole[],
    },
    {
      id: 'leaves',
      label: 'Leaves',
      icon: FileText,
      badge: currentUser?.role !== 'employee' && pendingLeavesCount > 0 ? pendingLeavesCount : undefined,
      roles: ['admin', 'hr', 'employee'] as UserRole[],
    },
    {
      id: 'payroll',
      label: 'Payroll',
      icon: Wallet,
      roles: ['admin', 'hr'] as UserRole[],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      roles: ['admin'] as UserRole[],
    },
  ];

  const filteredNavItems = navItems.filter(
    item => currentUser && item.roles.includes(currentUser.role)
  );

  return (
    <>
      {/* Mobile Backdrop with Blur */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        id="main-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-64 bg-[#0c0c0e] border-r border-zinc-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F16E15] via-amber-500 to-orange-400 flex items-center justify-center text-white font-bold shadow-md shadow-orange-500/20">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                Nexus<span className="text-[#F16E15]">HR</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-semibold block uppercase tracking-wider">
                Enterprise Suite
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 lg:hidden transition-colors"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Quick Switcher - ONLY for Admin */}
        {currentUser?.role === 'admin' && (
          <div className="px-3.5 pt-3 pb-1">
            <div className="p-2.5 rounded-xl bg-[#141418] border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-[#F16E15]/20 text-[#F16E15]">
                  <Shield className="w-3.5 h-3.5" />
                </span>
                <div>
                  <div className="text-[9px] text-zinc-400 uppercase font-semibold">Switch Role</div>
                  <div className="text-xs font-bold text-zinc-200 capitalize">
                    {currentUser?.role || 'Guest'}
                  </div>
                </div>
              </div>

              <div className="flex bg-[#09090b] p-0.5 rounded-lg border border-zinc-800">
                <button
                  onClick={() => switchRole('admin')}
                  className={`px-1.5 py-1 text-[10px] font-semibold rounded transition-colors ${
                    currentUser?.role === 'admin'
                      ? 'bg-[#F16E15] text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  ADM
                </button>
                <button
                  onClick={() => switchRole('hr')}
                  className={`px-1.5 py-1 text-[10px] font-semibold rounded transition-colors ${
                    currentUser?.role === 'hr'
                      ? 'bg-[#F16E15] text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  HR
                </button>
                <button
                  onClick={() => switchRole('employee')}
                  className={`px-1.5 py-1 text-[10px] font-semibold rounded transition-colors ${
                    currentUser?.role === 'employee'
                      ? 'bg-[#F16E15] text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  EMP
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Role Indicator for non-Admin */}
        {currentUser?.role !== 'admin' && (
          <div className="px-3.5 pt-3 pb-1">
            <div className="p-2.5 rounded-xl bg-[#141418] border border-zinc-800 flex items-center gap-2">
              <span className="p-1 rounded-md bg-[#F16E15]/20 text-[#F16E15]">
                {currentUser?.role === 'hr' ? (
                  <Briefcase className="w-3.5 h-3.5" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5" />
                )}
              </span>
              <div>
                <div className="text-[9px] text-zinc-400 uppercase font-semibold">Your Role</div>
                <div className="text-xs font-bold text-zinc-200 capitalize">
                  {currentUser?.role || 'Guest'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            Main Menu
          </div>
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all group min-h-[44px] ${
                  isActive
                    ? 'bg-[#F16E15] text-white shadow-lg shadow-orange-500/25 font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-850 hover:bg-[#18181c]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4.5 h-4.5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-zinc-400 group-hover:text-[#F16E15]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      isActive
                        ? 'bg-white text-[#F16E15]'
                        : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Live Company Indicator & System Status */}
        <div className="px-3.5 py-2">
          <div className="p-3 rounded-xl bg-[#141418] border border-zinc-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-400">Live Workspace</span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </span>
            </div>
            <div className="text-xs font-medium text-zinc-200 truncate">
              {companySettings.companyName}
            </div>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-zinc-800 bg-[#0e0e11]">
          <div className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-zinc-800/60 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={currentUser?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser?.name || 'User') + '&background=F16E15&color=fff&size=128'}
                alt={currentUser?.name}
                className="w-8 h-8 rounded-full object-cover border border-zinc-700 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-zinc-200 truncate">
                  {currentUser?.name}
                </div>
                <div className="text-[10px] text-zinc-400 truncate">
                  {currentUser?.email}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign out of account"
              className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
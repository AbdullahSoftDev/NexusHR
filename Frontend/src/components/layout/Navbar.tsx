import React, { useState, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Clock,
  LogOut,
  UserCheck,
  Shield,
  Briefcase,
  ChevronDown,
  Sparkles,
  Play,
  Square
} from 'lucide-react';
import { useHR } from '../../context/HRContext';
import { NotificationDropdown } from '../common/NotificationDropdown';
import { GlobalSearchModal } from '../common/GlobalSearchModal';

interface Props {
  onToggleSidebar: () => void;
  onSelectEmployee?: (id: string) => void;
}

export const Navbar: React.FC<Props> = ({ onToggleSidebar, onSelectEmployee }) => {
  const {
    currentUser,
    activeTab,
    unreadNotificationCount,
    currentEmployeeAttendance,
    checkIn,
    checkOut,
    switchRole,
    logout
  } = useHR();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Executive Overview';
      case 'employees':
        return 'Employee Directory';
      case 'attendance':
        return 'Attendance & Time Terminal';
      case 'leaves':
        return 'Leave Management & Workflows';
      case 'payroll':
        return 'Compensation & Payroll';
      case 'settings':
        return 'System & Organization Settings';
      default:
        return 'Enterprise HRMS';
    }
  };

  // FIX: Same logic as AttendancePage - properly handle '—' as not checked out
  const todayStr = new Date().toISOString().split('T')[0];
  const isCheckedIn = !!currentEmployeeAttendance?.checkInTime && 
                      (currentEmployeeAttendance?.checkOutTime === null || 
                       currentEmployeeAttendance?.checkOutTime === undefined || 
                       currentEmployeeAttendance?.checkOutTime === '—' ||
                       currentEmployeeAttendance?.checkOutTime === '') &&
                      currentEmployeeAttendance?.date === todayStr;

  const handleCheckOutClick = () => {
    setShowCheckoutConfirm(true);
  };

  const confirmCheckOut = async () => {
    await checkOut();
    setShowCheckoutConfirm(false);
  };

  return (
    <>
      <header
        id="top-navbar"
        className="sticky top-0 z-30 h-16 bg-[#0c0c0e]/95 backdrop-blur-xl border-b border-zinc-800 px-3.5 sm:px-6 flex items-center justify-between gap-3 shadow-md"
      >
        {/* Left Side: Mobile toggle & Page Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            id="mobile-menu-btn"
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 lg:hidden transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-bold text-white tracking-tight flex items-center gap-2 truncate">
              {getPageTitle()}
            </h1>
            <p className="text-[10px] sm:text-[11px] text-zinc-400 hidden sm:block truncate">
              NexusHR Enterprise Cloud • San Francisco HQ
            </p>
          </div>
        </div>

        {/* Middle: Fast Universal Search Bar (Desktop) */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#141418] border border-zinc-800 hover:border-zinc-700 text-zinc-400 text-xs transition-all shadow-xs group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-zinc-500 group-hover:text-[#F16E15] transition-colors" />
              <span>Search employees, departments, leave records...</span>
            </div>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Quick Check-in / Check-out status button - Hidden for Admin */}
          {currentUser?.role !== 'admin' && (
            <div className="flex items-center">
              {isCheckedIn ? (
                <button
                  onClick={handleCheckOutClick}
                  title="Click to check out"
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition-all min-h-[38px] cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <Square className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                  <span className="hidden sm:inline">Check Out ({currentEmployeeAttendance?.checkInTime})</span>
                  <span className="sm:hidden text-xs">Out</span>
                </button>
              ) : (
                <button
                  onClick={() => checkIn()}
                  title="Click to check in for today"
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-all min-h-[38px] cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                  <span className="hidden sm:inline">Check In</span>
                  <span className="sm:hidden text-xs">In</span>
                </button>
              )}
            </div>
          )}

          {/* Real-time Clock display */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141418] border border-zinc-800 text-xs font-mono text-zinc-300">
            <Clock className="w-3.5 h-3.5 text-[#F16E15]" />
            <span>{currentTime}</span>
          </div>

          {/* Search Trigger for Mobile */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 md:hidden transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Search"
          >
            <Search className="w-4.5 h-4.5" />
          </button>

          {/* Notification Button & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              id="notifications-bell-btn"
              className="relative p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Notifications"
            >
              <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F16E15] ring-2 ring-[#0c0c0e]" />
              )}
            </button>

            <NotificationDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
          </div>

          {/* User Profile Pill & Quick Role Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 sm:pl-2 rounded-xl bg-[#141418] border border-zinc-800 hover:border-zinc-700 transition-colors min-h-[40px]"
            >
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={currentUser?.name}
                className="w-7 h-7 rounded-lg object-cover border border-zinc-700"
              />
              <div className="text-left hidden md:block pr-1">
                <div className="text-xs font-bold text-zinc-200 leading-tight">
                  {currentUser?.name}
                </div>
                <div className="text-[10px] text-[#F16E15] font-bold uppercase">
                  {currentUser?.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden sm:block" />
            </button>

            {isProfileMenuOpen && (
              <div
                onClick={() => setIsProfileMenuOpen(false)}
                className="fixed inset-0 z-40"
              />
            )}

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#141418] border border-zinc-800 rounded-2xl shadow-2xl z-50 p-2 text-xs space-y-1">
                <div className="px-3 py-2 border-b border-zinc-800 mb-1">
                  <div className="font-bold text-white">{currentUser?.name}</div>
                  <div className="text-[11px] text-zinc-400 truncate">{currentUser?.email}</div>
                  <div className="text-[10px] text-[#F16E15] font-mono mt-0.5 font-semibold">{currentUser?.employeeId}</div>
                </div>

                <div className="px-3 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Switch Persona Demo
                </div>
                <button
                  onClick={() => { switchRole('admin'); setIsProfileMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors font-medium min-h-[40px]"
                >
                  <Shield className="w-4 h-4 text-[#F16E15]" />
                  <span>Admin (Full Access)</span>
                </button>
                <button
                  onClick={() => { switchRole('hr'); setIsProfileMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors font-medium min-h-[40px]"
                >
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <span>HR Manager View</span>
                </button>
                <button
                  onClick={() => { switchRole('employee'); setIsProfileMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors font-medium min-h-[40px]"
                >
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Employee Self-Service</span>
                </button>

                <div className="border-t border-zinc-800 pt-1 mt-1">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-500/10 text-rose-400 font-medium transition-colors min-h-[40px]"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CHECKOUT CONFIRMATION MODAL */}
      {showCheckoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCheckoutConfirm(false)} />
          <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-4 z-10">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                <Square className="w-7 h-7 fill-rose-400" />
              </div>
              <h3 className="text-lg font-bold text-zinc-100 mt-3">Confirm Check Out</h3>
              <p className="text-sm text-zinc-400 mt-1">
                Are you sure you want to end your shift and clock out?
              </p>
              <p className="text-xs text-zinc-500 mt-2">
                Check-in time: <span className="text-zinc-300 font-mono">{currentEmployeeAttendance?.checkInTime}</span>
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowCheckoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-sm transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={confirmCheckOut}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md shadow-rose-600/20 transition-colors min-h-[44px]"
              >
                Yes, Check Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Search Dialog */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectEmployee={onSelectEmployee}
      />
    </>
  );
};
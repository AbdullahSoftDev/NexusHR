import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCheck, Calendar, Wallet, FileText, Megaphone, Info } from 'lucide-react';
import { useHR } from '../../context/HRContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<Props> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead, setActiveTab } = useHR();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'leave':
        return <FileText className="w-4 h-4 text-[#F16E15]" />;
      case 'payroll':
        return <Wallet className="w-4 h-4 text-emerald-400" />;
      case 'attendance':
        return <Calendar className="w-4 h-4 text-blue-400" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-amber-400" />;
      default:
        return <Info className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden"
          id="notification-dropdown-panel"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-800 bg-[#0e0e11]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#F16E15]" />
              <h4 className="text-sm font-semibold text-white">Notifications</h4>
              <span className="px-1.5 py-0.5 text-xs font-semibold rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                {notifications.filter(n => !n.read).length} new
              </span>
            </div>
            <button
              onClick={markAllNotificationsRead}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors font-medium min-h-[36px] px-2"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/60">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-sm">
                No notifications right now
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    markNotificationRead(notif.id);
                    if (notif.link) {
                      setActiveTab(notif.link);
                      onClose();
                    }
                  }}
                  className={`p-3.5 cursor-pointer transition-colors flex items-start gap-3 hover:bg-zinc-800/60 ${
                    !notif.read ? 'bg-orange-500/5' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-[#18181c] border border-zinc-800 shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className={`text-xs font-medium truncate ${!notif.read ? 'text-white font-bold' : 'text-zinc-300'}`}>
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-[#F16E15] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-zinc-500 mt-1 block">
                      {notif.timestamp}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-[#0e0e11] border-t border-zinc-800 text-center">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                onClose();
              }}
              className="text-xs text-[#F16E15] hover:text-[#ff8a3d] font-semibold min-h-[36px] px-3"
            >
              View System Announcements →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

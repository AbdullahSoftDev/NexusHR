import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Toast } from '../common/Toast';

interface Props {
  children: React.ReactNode;
  onSelectEmployee?: (id: string) => void;
}

export const AppLayout: React.FC<Props> = ({ children, onSelectEmployee }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-[#F16E15] selection:text-white">
      {/* Primary Sidebar */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 transition-all duration-300">
        <Navbar
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onSelectEmployee={onSelectEmployee}
        />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-4 sm:space-y-6">
          {children}
        </main>
      </div>

      {/* Global Toast notifications */}
      <Toast />
    </div>
  );
};

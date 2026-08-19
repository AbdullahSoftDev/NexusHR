import React, { useState } from 'react';
import { HRProvider, useHR } from './context/HRContext';
import { AuthPage } from './components/auth/AuthPage';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { EmployeesPage } from './components/employees/EmployeesPage';
import { AttendancePage } from './components/attendance/AttendancePage';
import { LeavePage } from './components/leave/LeavePage';
import { PayrollPage } from './components/payroll/PayrollPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { Toast } from './components/common/Toast';

const MainApp: React.FC = () => {
  const {
    isAuthenticated,
    activeTab,
    setActiveTab
  } = useHR();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <>
        <AuthPage />
        <Toast />
      </>
    );
  }

  return (
    <AppLayout>
      {activeTab === 'dashboard' && (
        <DashboardPage
          onAddEmployeeClick={() => setActiveTab('employees')}
          onApplyLeaveClick={() => setActiveTab('leaves')}
        />
      )}

      {activeTab === 'employees' && (
        <EmployeesPage
          selectedEmployeeId={selectedEmployeeId}
          onClearSelectedEmployee={() => setSelectedEmployeeId(null)}
        />
      )}

      {activeTab === 'attendance' && <AttendancePage />}

      {activeTab === 'leaves' && <LeavePage />}

      {activeTab === 'payroll' && <PayrollPage />}

      {activeTab === 'settings' && <SettingsPage />}

      {/* Global Toast Notification Overlay */}
      <Toast />
    </AppLayout>
  );
};

export default function App() {
  return (
    <HRProvider>
      <MainApp />
    </HRProvider>
  );
}


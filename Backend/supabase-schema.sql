-- ============================================
-- NEXUSHR - Supabase PostgreSQL Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE (Authentication)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'hr', 'employee')),
    name VARCHAR(100) NOT NULL,
    avatar VARCHAR(500),
    position VARCHAR(100),
    department VARCHAR(100),
    employee_id VARCHAR(20) UNIQUE,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. EMPLOYEES TABLE
-- ============================================
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    position VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    hire_date DATE NOT NULL,
    salary DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
    avatar VARCHAR(500),
    emergency_contact JSONB,
    bank_account JSONB,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- 3. ATTENDANCE TABLE
-- ============================================
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    total_hours DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'late', 'half_day', 'absent', 'on_leave')),
    location VARCHAR(255),
    ip_address VARCHAR(45),
    method VARCHAR(20) CHECK (method IN ('web', 'mobile', 'manual')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, date)
);

-- ============================================
-- 4. LEAVES TABLE
-- ============================================
CREATE TABLE leaves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(20) NOT NULL CHECK (leave_type IN ('annual', 'sick', 'personal', 'maternity', 'unpaid')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(5,1) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    applied_date DATE DEFAULT CURRENT_DATE,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_date DATE,
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. PAYROLL TABLE
-- ============================================
CREATE TABLE payroll (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    base_salary DECIMAL(12,2) NOT NULL,
    working_days INTEGER DEFAULT 22,
    present_days INTEGER DEFAULT 22,
    unpaid_leave_days INTEGER DEFAULT 0,
    overtime_hours DECIMAL(5,2) DEFAULT 0,
    overtime_pay DECIMAL(10,2) DEFAULT 0,
    bonuses JSONB DEFAULT '[]',
    deductions JSONB DEFAULT '[]',
    tax DECIMAL(10,2) DEFAULT 0,
    health_insurance DECIMAL(10,2) DEFAULT 0,
    net_salary DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'processed', 'paid')),
    payment_date DATE,
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, month)
);

-- ============================================
-- 6. DEPARTMENTS TABLE
-- ============================================
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    head_name VARCHAR(100),
    employee_count INTEGER DEFAULT 0,
    budget DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 7. COMPANY SETTINGS TABLE
-- ============================================
CREATE TABLE company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(200) NOT NULL DEFAULT 'Nexus Global Technologies Inc.',
    company_email VARCHAR(255),
    company_phone VARCHAR(20),
    company_address TEXT,
    registration_number VARCHAR(50),
    tax_id VARCHAR(50),
    currency VARCHAR(3) DEFAULT 'USD',
    timezone VARCHAR(100) DEFAULT 'America/Los_Angeles',
    work_start_time TIME DEFAULT '09:00:00',
    work_end_time TIME DEFAULT '17:30:00',
    work_days JSONB DEFAULT '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]',
    annual_leave_quota INTEGER DEFAULT 20,
    sick_leave_quota INTEGER DEFAULT 12,
    personal_leave_quota INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 8. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('leave', 'payroll', 'attendance', 'announcement', 'system')),
    read BOOLEAN DEFAULT FALSE,
    link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 9. AUDIT LOGS TABLE
-- ============================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 10. ANNOUNCEMENTS TABLE
-- ============================================
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    author VARCHAR(100) NOT NULL,
    target_department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_employees_employee_id ON employees(employee_id);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_attendance_employee_id ON attendance(employee_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_leaves_employee_id ON leaves(employee_id);
CREATE INDEX idx_leaves_status ON leaves(status);
CREATE INDEX idx_payroll_employee_id ON payroll(employee_id);
CREATE INDEX idx_payroll_month ON payroll(month);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leaves_updated_at BEFORE UPDATE ON leaves FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payroll_updated_at BEFORE UPDATE ON payroll FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Insert Departments
INSERT INTO departments (name, head_name, employee_count, budget) VALUES
('Executive Management', 'Alexander Hayes', 1, 240000),
('Human Resources', 'Elena Rostova', 12, 180000),
('Engineering', 'Marcus Vance', 45, 620000),
('Marketing & Brand', 'Sophia Lin', 28, 310000),
('Global Sales', 'David Sterling', 32, 450000),
('Finance & Accounting', 'Julian Meyer', 18, 290000),
('Operations & Logistics', 'Clara Oswald', 24, 340000);

-- Insert Company Settings (will be updated by admin)
INSERT INTO company_settings (id, company_name, company_email, company_phone, company_address, registration_number, tax_id, currency, timezone, work_start_time, work_end_time, work_days, annual_leave_quota, sick_leave_quota, personal_leave_quota)
VALUES (uuid_generate_v4(), 'Nexus Global Technologies Inc.', 'contact@nexushr.io', '+1 (415) 800-9200', '500 Howard Street, Suite 1400, Financial District, San Francisco, CA 94105', 'US-DEL-9842105', 'XX-XXX8921', 'USD', 'America/Los_Angeles (PST/PDT)', '09:00:00', '17:30:00', '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]', 20, 12, 5);

-- ============================================
-- SEED USERS (Passwords will be hashed by the app)
-- ============================================
-- Users will be inserted via the application using bcrypt
-- Default credentials:
-- admin@nexushr.io / admin123
-- hr@nexushr.io / hr123
-- employee@nexushr.io / emp123
import request from 'supertest';
import app from '../src/server.js';

// Test data
const testUser = {
    name: 'Test Employee',
    email: `test${Date.now()}@example.com`,
    username: `testuser${Date.now()}`,
    role: 'employee',
    password: 'Test@123456'
};

const testEmployee = {
    firstName: 'John',
    lastName: 'Doe',
    email: `john.doe${Date.now()}@example.com`,
    phone: '+1 (555) 123-4567',
    address: '123 Test Street, San Francisco, CA',
    position: 'Software Engineer',
    department: 'Engineering',
    hireDate: '2024-01-15',
    salary: 95000,
    status: 'active'
};

let authToken = '';
let employeeId = '';
let leaveId = '';
let payrollId = '';

// ============================================
// AUTHENTICATION TESTS
// ============================================

describe('🔐 Authentication Tests', () => {
    
    test('1. Register new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);
        
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('token');
        expect(res.body.data.user.email).toBe(testUser.email);
        
        authToken = res.body.data.token;
    });

    test('2. Login with existing user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                emailOrUsername: testUser.email,
                password: testUser.password
            });
        
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('token');
        expect(res.body.data.user.email).toBe(testUser.email);
    });

    test('3. Login with invalid credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                emailOrUsername: testUser.email,
                password: 'wrongpassword'
            });
        
        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toBe('Invalid credentials');
    });

    test('4. Get current user profile', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${authToken}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.email).toBe(testUser.email);
    });
});

// ============================================
// EMPLOYEE TESTS
// ============================================

describe('👥 Employee Tests', () => {

    test('5. Create new employee (Admin only)', async () => {
        // Login as admin first
        const adminLogin = await request(app)
            .post('/api/auth/login')
            .send({
                emailOrUsername: 'admin@nexushr.io',
                password: 'admin123'
            });
        
        const adminToken = adminLogin.body.data.token;
        
        const res = await request(app)
            .post('/api/employees')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(testEmployee);
        
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.first_name).toBe(testEmployee.firstName);
        expect(res.body.data.last_name).toBe(testEmployee.lastName);
        expect(res.body.data.email).toBe(testEmployee.email);
        
        employeeId = res.body.data.id;
    });

    test('6. Get all employees', async () => {
        const login = await request(app)
            .post('/api/auth/login')
            .send({
                emailOrUsername: 'admin@nexushr.io',
                password: 'admin123'
            });
        
        const token = login.body.data.token;
        
        const res = await request(app)
            .get('/api/employees')
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('7. Get employee by ID', async () => {
        const login = await request(app)
            .post('/api/auth/login')
            .send({
                emailOrUsername: 'admin@nexushr.io',
                password: 'admin123'
            });
        
        const token = login.body.data.token;
        
        const res = await request(app)
            .get(`/api/employees/${employeeId}`)
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe(employeeId);
    });

    test('8. Update employee', async () => {
        const login = await request(app)
            .post('/api/auth/login')
            .send({
                emailOrUsername: 'admin@nexushr.io',
                password: 'admin123'
            });
        
        const token = login.body.data.token;
        
        const res = await request(app)
            .put(`/api/employees/${employeeId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                position: 'Senior Software Engineer',
                salary: 105000
            });
        
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.position).toBe('Senior Software Engineer');
        expect(res.body.data.salary).toBe(105000);
    });
});

// ============================================
// ATTENDANCE TESTS
// ============================================

describe('⏰ Attendance Tests', () => {

    test('9. Check-in', async () => {
        const login = await request(app)
            .post('/api/auth/login')
            .send({
                emailOrUsername: 'employee@nexushr.io',
                password: 'emp123'
            });
        
        const token = login.body.data.token;
        
        const res = await request(app)
            .post('/api/attendance/check-in')
            .set('Authorization', `Bearer ${token}`)
            .send({
                location: 'Headquarters - San Francisco',
                notes: 'Test check-in'
            });
        
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('check_in_time');
        expect(res.body.data.status).toBeDefined();
    });

    test('10. Prevent duplicate check-in', async () => {
        const login = await request(app)
            .post('/api/auth/login')
            .send({
                emailOrUsername: 'employee@nexushr.io',
                password: 'emp123'
            });
        
        const token = login.body.data.token;
        
        const res = await request(app)
            .post('/api/attendance/check-in')
            .set('Authorization', `Bearer ${token}`)
            .send({
                location: 'Headquarters - San Francisco'
            });
        
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toContain('already checked in');
    });

    test('11. Check-out', async () => {
        const login = await request(app)
            .post('/api/auth/login')
            .send({
                emailOrUsername: 'employee@nexushr.io',
                password: 'emp123'
            });
        
        const token = login.body.data.token;
        
        const res = await request(app)
            .post('/api/attendance/check-out')
            .set('Authorization', `Bearer ${token}`)
            .send({
                notes: 'Test check-out'
            });
        
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('check_out_time');
        expect(res.body.data).toHaveProperty('total_hours');
    });

    test('12. Get today\'s attendance', async () => {
        const login = await request(app)
            .post('/api/auth/login')
            .send({
                emailOrUsername: 'admin@nexushr.io',
                password: 'admin123'
            });
        
        const token = login.body.data.token;
        
        const res = await request(app)
            .get('/api/attendance/today')
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});

// ============================================
// LEAVE TESTS
// ============================================

describe('📋 Leave Tests', () => {

    test('13. Apply for leave', async () => {
        const login = await request(app)
            .post('/api/auth/login')
            .send({
                emailOrUsername: 'employee@nexushr.io',
                password: 'emp123'
            });
        
        const token = login.body.data.token;
        
        const res = await request(app)
            .post('/api/leaves')
            .set('Authorization', `Bearer ${token}`)
            .send({
                leaveType: 'annual',
                startDate: '2024-12-01',
                endDate: '2024-12-05',
                totalDays: 5,
                reason: 'Annual vacation'
            });
        
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data.status).toBe('pending');
        
        leaveId = res.body.data.id;
    });

    test('14. Get leave balance', async () => {
        const login = await request(app)
            .post('/api/auth/login')
            .send({
                emailOrUsername: 'employee@nexushr.io',
                password: 'emp123'
            });
        
        const token = login.body.data.token;
        
        const res = await request(app)
            .get('/api/leaves/balance/EMP-1005')
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('annual');
        expect(res.body.data).toHaveProperty('sick');
        expect(res.body.data).toHaveProperty('personal');
    });

    test('15. Approve leave (Admin)', async () => {
        const login = await request(app)
            .post('/api/auth/login')
            .send({
                emailOrUsername: 'admin@nexushr.io',
                password: 'admin123'
            });
        
        const token = login.body.data.token;
        
        const res = await request(app)
            .patch(`/api/leaves/${leaveId}/approve`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                notes: 'Approved by Admin'
            });
        
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe('approved');
        expect(res.body.data.review_notes).toBe('Approved by Admin');
    });
});

// ============================================
// PAYROLL TESTS
// ============================================

describe('💰 Payroll Tests', () => {

    test('16. Generate payroll', async () => {
        const login = await request(app)
            .post('/api/auth/login')
            .send({
                emailOrUsername: 'admin@nexushr.io',
                password: 'admin123'
            });
        
        const token = login.body.data.token;
        
        const month = `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}`;
        
        const res = await request(app)
            .post('/api/payroll/generate')
            .set('Authorization', `Bearer ${token}`)
            .send({ month });
        
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
        
        payrollId = res.body.data[0]?.id;
    });

    test('17. Get payroll records', async () => {
        const login = await request(app)
            .post('/api/auth/login')
            .send({
                emailOrUsername: 'admin@nexushr.io',
                password: 'admin123'
            });
        
        const token = login.body.data.token;
        
        const res = await request(app)
            .get('/api/payroll')
            .set('Authorization', `Bearer ${token}`)
            .query({ month: '2024-01' });
        
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('18. Mark payroll as paid', async () => {
        const login = await request(app)
            .post('/api/auth/login')
            .send({
                emailOrUsername: 'admin@nexushr.io',
                password: 'admin123'
            });
        
        const token = login.body.data.token;
        
        if (payrollId) {
            const res = await request(app)
                .patch(`/api/payroll/${payrollId}/paid`)
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe('paid');
        }
    });
});

// ============================================
// DEPARTMENT TESTS
// ============================================

describe('🏢 Department Tests', () => {

    test('19. Get all departments', async () => {
        const login = await request(app)
            .post('/api/auth/login')
            .send({
                emailOrUsername: 'admin@nexushr.io',
                password: 'admin123'
            });
        
        const token = login.body.data.token;
        
        const res = await request(app)
            .get('/api/departments')
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});

// ============================================
// DASHBOARD TESTS
// ============================================

describe('📊 Dashboard Tests', () => {

    test('20. Get dashboard stats', async () => {
        const login = await request(app)
            .post('/api/auth/login')
            .send({
                emailOrUsername: 'admin@nexushr.io',
                password: 'admin123'
            });
        
        const token = login.body.data.token;
        
        const res = await request(app)
            .get('/api/dashboard/stats')
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('totalEmployees');
        expect(res.body.data).toHaveProperty('presentToday');
        expect(res.body.data).toHaveProperty('pendingLeaves');
    });
});

// ============================================
// CLEANUP TESTS
// ============================================

describe('🧹 Cleanup', () => {

    test('21. Delete test employee', async () => {
        const login = await request(app)
            .post('/api/auth/login')
            .send({
                emailOrUsername: 'admin@nexushr.io',
                password: 'admin123'
            });
        
        const token = login.body.data.token;
        
        const res = await request(app)
            .delete(`/api/employees/${employeeId}`)
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toContain('deleted');
    });

    test('22. Server health check', async () => {
        const res = await request(app).get('/api/health');
        
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.status).toBe('OK');
        expect(res.body.message).toBe('NexusHR API is running');
    });
});
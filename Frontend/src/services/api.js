const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Helper for API calls
const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('nexushr_token') || localStorage.getItem('token');
    
    console.log(`🔐 API Call to ${endpoint}, Token:`, token ? 'Present' : 'Missing');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log(`🔐 Authorization header set for ${endpoint}`);
    }
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });
        
        const data = await response.json();
        
        if (response.status === 401) {
            console.error(`❌ 401 Unauthorized for ${endpoint}`);
            throw new Error('Unauthorized');
        }
        
        if (!response.ok) {
            throw new Error(data.error || 'API call failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Auth API
export const authAPI = {
    login: (emailOrUsername, password) => 
        apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ emailOrUsername, password })
        }),
    
    register: (userData) => 
        apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        }),
    
    getMe: () => 
        apiCall('/auth/me'),
    
    forgotPassword: (email) => 
        apiCall('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email })
        })
};

// Employee API
export const employeeAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/employees${query ? `?${query}` : ''}`);
    },
    
    getPending: () => 
        apiCall('/employees/pending'),
    
    approve: (userId) => 
        apiCall(`/employees/${userId}/approve`, {
            method: 'PATCH'
        }),
    
    reject: (userId) => 
        apiCall(`/employees/${userId}/reject`, {
            method: 'PATCH'
        }),
    
    getById: (id) => 
        apiCall(`/employees/${id}`),
    
    create: (data) => 
        apiCall('/employees', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    
    update: (id, data) => 
        apiCall(`/employees/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
    
    delete: (id) => 
        apiCall(`/employees/${id}`, {
            method: 'DELETE'
        }),
    
    archive: (id) => 
        apiCall(`/employees/${id}/archive`, {
            method: 'PATCH'
        }),
    
    export: () => 
        apiCall('/employees/export')
};

// Attendance API
// In api.js, update the attendanceAPI section
export const attendanceAPI = {
    getToday: () => 
        apiCall('/attendance/today'),
    
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/attendance${query ? `?${query}` : ''}`);
    },
    
    checkIn: (data) => 
        apiCall('/attendance/check-in', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    
    checkOut: (data) => 
        apiCall('/attendance/check-out', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    
    manual: (data) => 
        apiCall('/attendance/manual', {
            method: 'POST',
            body: JSON.stringify(data)
        })
};

// Leave API
export const leaveAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/leaves${query ? `?${query}` : ''}`);
    },
    
    apply: (data) => 
        apiCall('/leaves', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    
    approve: (id, notes) => 
        apiCall(`/leaves/${id}/approve`, {
            method: 'PATCH',
            body: JSON.stringify({ notes })
        }),
    
    reject: (id, notes) => 
        apiCall(`/leaves/${id}/reject`, {
            method: 'PATCH',
            body: JSON.stringify({ notes })
        }),
    
    cancel: (id) => 
        apiCall(`/leaves/${id}/cancel`, {
            method: 'PATCH'
        }),
    
    getBalance: (employeeId) => 
        apiCall(`/leaves/balance/${employeeId}`)
};

// Payroll API
export const payrollAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/payroll${query ? `?${query}` : ''}`);
    },
    
    generate: (month) => 
        apiCall('/payroll/generate', {
            method: 'POST',
            body: JSON.stringify({ month })
        }),
    
    markPaid: (id) => 
        apiCall(`/payroll/${id}/paid`, {
            method: 'PATCH'
        }),
    
    markAllPaid: (month) => 
        apiCall(`/payroll/${month}/paid-all`, {
            method: 'PATCH'
        }),
    
    addAdjustment: (id, data) => 
        apiCall(`/payroll/${id}/adjustment`, {
            method: 'POST',
            body: JSON.stringify(data)
        })
};

// Settings API
export const settingsAPI = {
    getSettings: () => 
        apiCall('/settings'),
    
    updateSettings: (data) => 
        apiCall('/settings', {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
    
    getDepartments: () => 
        apiCall('/departments'),
    
    createDepartment: (data) => 
        apiCall('/departments', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    
    deleteDepartment: (id) => 
        apiCall(`/departments/${id}`, {
            method: 'DELETE'
        }),
    
    getDashboardStats: () => 
        apiCall('/dashboard/stats')
};
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Generate JWT Token
const generateToken = (userId, role) => {
    return jwt.sign(
        { id: userId, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// @desc    Register user
// @route   POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
    const { name, email, username, password, role = 'employee' } = req.body;

    // Validate input
    if (!name || !email || !username || !password) {
        return res.status(400).json({
            success: false,
            error: 'Please provide all required fields: name, email, username, password'
        });
    }

    // Check if user exists
    const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .or(`email.eq.${email},username.eq.${username}`)
        .single();

    if (existingUser) {
        return res.status(400).json({
            success: false,
            error: 'User with this email or username already exists'
        });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create employee_id
    const employeeId = `EMP-${String(Math.floor(1000 + Math.random() * 9000))}`;

    // Insert user
    const { data: user, error } = await supabase
        .from('users')
        .insert({
            name,
            email,
            username,
            password_hash: passwordHash,
            role,
            employee_id: employeeId,
            position: role === 'admin' ? 'System Administrator' : 
                       role === 'hr' ? 'HR Specialist' : 'Software Engineer',
            department: role === 'admin' ? 'Executive Management' : 
                        role === 'hr' ? 'Human Resources' : 'Engineering',
            is_active: true
        })
        .select()
        .single();

    if (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to create user: ' + error.message
        });
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    res.status(201).json({
        success: true,
        data: {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role,
                employeeId: user.employee_id,
                avatar: user.avatar,
                position: user.position,
                department: user.department
            },
            token
        },
        message: 'Registration successful!'
    });
});

// @desc    Login user
// @route   POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
        return res.status(400).json({
            success: false,
            error: 'Please provide email/username and password'
        });
    }

    // Find user
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${emailOrUsername},username.eq.${emailOrUsername}`)
        .single();

    if (error || !user) {
        return res.status(401).json({
            success: false,
            error: 'Invalid credentials'
        });
    }

    // Check if user is active
    if (!user.is_active) {
        return res.status(401).json({
            success: false,
            error: 'Account is deactivated. Please contact administrator.'
        });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
        return res.status(401).json({
            success: false,
            error: 'Invalid credentials'
        });
    }

    // Update last login
    await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

    // Generate token
    const token = generateToken(user.id, user.role);

    res.json({
        success: true,
        data: {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role,
                employeeId: user.employee_id,
                avatar: user.avatar,
                position: user.position,
                department: user.department,
                phone: user.phone
            },
            token
        },
        message: `Welcome back, ${user.name}!`
    });
});

// @desc    Get current user
// @route   GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', req.userId)
        .single();

    if (error || !user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    res.json({
        success: true,
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
            employeeId: user.employee_id,
            avatar: user.avatar,
            position: user.position,
            department: user.department,
            phone: user.phone,
            isActive: user.is_active,
            lastLogin: user.last_login
        }
    });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            error: 'Please provide email address'
        });
    }

    const { data: user, error } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email)
        .single();

    if (error || !user) {
        return res.status(404).json({
            success: false,
            error: 'No user found with this email'
        });
    }

    // In production, send email with reset link
    // For demo, we'll return a success message

    res.json({
        success: true,
        message: `Password reset instructions sent to ${email}`
    });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({
            success: false,
            error: 'Please provide token and new password'
        });
    }

    // Verify token (in production, use a reset token table)
    // For demo, we'll assume token is valid

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update password for the user (you'd need to decode the token to get userId)
    // This is a simplified version

    res.json({
        success: true,
        message: 'Password reset successful'
    });
});
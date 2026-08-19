import bcrypt from 'bcryptjs';
import { supabase } from './config/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

async function seedUser() {
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    console.log('Generated hash:', passwordHash);
    
    // Delete existing users
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Insert new user
    const { data, error } = await supabase
        .from('users')
        .insert({
            username: 'admin',
            email: 'admin@nexushr.io',
            password_hash: passwordHash,
            role: 'admin',
            name: 'Administrator',
            employee_id: 'EMP-0001',
            position: 'System Administrator',
            department: 'Executive',
            phone: '+1 (555) 000-0000',
            avatar: 'https://ui-avatars.com/api/?name=Admin&background=F16E15&color=fff&size=128',
            is_active: true
        })
        .select();
    
    if (error) {
        console.error('Error creating user:', error);
    } else {
        console.log('User created successfully:', data);
    }
    
    process.exit();
}

seedUser();
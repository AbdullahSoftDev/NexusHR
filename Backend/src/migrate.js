import bcrypt from 'bcryptjs';
import { supabase } from './config/supabase.js';

const seedDatabase = async () => {
    console.log('🌱 Seeding database...');

    try {
        // Hash passwords
        const salt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash('admin123', salt);
        const hrPassword = await bcrypt.hash('hr123', salt);
        const empPassword = await bcrypt.hash('emp123', salt);

        // Insert users
        const users = [
            {
                name: 'Alexander Hayes',
                email: 'admin@nexushr.io',
                username: 'alex.hayes',
                password_hash: adminPassword,
                role: 'admin',
                employee_id: 'EMP-1001',
                position: 'Chief Human Resources Officer',
                department: 'Executive Management',
                phone: '+1 (555) 234-5678',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
            },
            {
                name: 'Elena Rostova',
                email: 'hr@nexushr.io',
                username: 'elena.rostova',
                password_hash: hrPassword,
                role: 'hr',
                employee_id: 'EMP-1002',
                position: 'Senior HR Business Partner',
                department: 'Human Resources',
                phone: '+1 (555) 345-6789',
                avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
            },
            {
                name: 'Marcus Vance',
                email: 'employee@nexushr.io',
                username: 'marcus.vance',
                password_hash: empPassword,
                role: 'employee',
                employee_id: 'EMP-1005',
                position: 'Principal Software Architect',
                department: 'Engineering',
                phone: '+1 (555) 456-7890',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
            }
        ];

        for (const user of users) {
            const { error } = await supabase.from('users').insert(user);
            if (error) console.error('Error inserting user:', error.message);
        }

        console.log('✅ Users seeded successfully!');
        console.log('📝 Default credentials:');
        console.log('   Admin: admin@nexushr.io / admin123');
        console.log('   HR: hr@nexushr.io / hr123');
        console.log('   Employee: employee@nexushr.io / emp123');

    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
    }

    process.exit(0);
};

seedDatabase();
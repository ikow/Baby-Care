require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');

async function createAdminUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminUser = await User.findOne({ username: 'admin' });
        if (adminUser) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        const admin = new User({
            username: 'admin',
            password: 'admin123456',  // Change this to a secure password
            role: 'admin',
            status: 'active'
        });

        await admin.save();
        console.log('Admin user created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}

createAdminUser(); 
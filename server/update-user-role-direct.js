const { Sequelize } = require('sequelize');
require('dotenv').config();

async function updateUserToAdmin() {
  try {
    console.log('🔍 Connecting to Supabase database...');
    
    // Create direct connection to Supabase
    const sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    });

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Connected to Supabase database');

    // Update user role to admin
    const [updatedRows] = await sequelize.query(
      "UPDATE users SET role = 'admin' WHERE email = 'admin@example.com'"
    );

    console.log(`✅ Updated ${updatedRows} user(s) to admin role`);

    // Verify the update
    const [users] = await sequelize.query(
      "SELECT id, username, email, role FROM users WHERE email = 'admin@example.com'"
    );

    console.log('✅ User details:', users[0]);

    // Test admin endpoint
    console.log('🔍 Testing admin endpoint...');
    const axios = require('axios');
    
    // Login to get token
    const loginResponse = await axios.post('https://social-network-backend-w91a.onrender.com/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');

    // Test admin users endpoint
    const adminResponse = await axios.get('https://social-network-backend-w91a.onrender.com/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Admin endpoint working!');
    console.log(`Found ${adminResponse.data.data.users.length} users`);
    console.log('First user:', adminResponse.data.data.users[0]);

    await sequelize.close();
    console.log('✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateUserToAdmin();

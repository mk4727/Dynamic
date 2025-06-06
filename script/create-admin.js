const mongoose = require('mongoose');
const User = require('../model/userModel');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

// Function to create an admin user
async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.mongoUrl);
    console.log('Connected to MongoDB');

    // Check if there are existing users
    const existingUsers = await User.countDocuments();
    
    if (existingUsers > 0) {
      console.log(`There are already ${existingUsers} users in the database.`);
      console.log('If you want to create a new admin, use the admin panel interface.');
    } else {
      // Create a new admin user
      const adminData = {
        name: process.argv[2] || 'Admin',
        email: process.argv[3] || 'admin@example.com',
        password: process.argv[4] || 'admin123',
        role: 'super-admin'
      };

      const newAdmin = new User(adminData);
      await newAdmin.save();
      
      console.log('Admin user created successfully!');
      console.log(`Email: ${adminData.email}`);
      console.log(`Password: ${adminData.password}`);
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
createAdmin();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const email = 'fahad@gmail.com';
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log('User already exists. Updating to Admin...');
      existingUser.role = 'admin';
      existingUser.password = '112233'; // The model should handle hashing
      await existingUser.save();
      console.log('User updated to Admin successfully!');
    } else {
      const admin = new User({
        name: 'Fahad Admin',
        email: email,
        password: '112233',
        role: 'admin'
      });

      await admin.save();
      console.log('Admin user created successfully!');
    }

    process.exit();
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();

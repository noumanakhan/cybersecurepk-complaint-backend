const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createStaff = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const staffEmail = 'hamza@gmail.com';
    const existingStaff = await User.findOne({ email: staffEmail });

    if (existingStaff) {
      console.log('Staff user already exists');
    } else {
      await User.create({
        name: 'Hamza Staff',
        email: staffEmail,
        password: '112233',
        role: 'staff'
      });
      console.log('Staff user created successfully');
    }

    mongoose.disconnect();
  } catch (error) {
    console.error('Error creating staff user:', error);
    process.exit(1);
  }
};

createStaff();

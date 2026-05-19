const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected to create user...');
    
    // Check if user already exists
    const existing = await User.findOne({ email: 'noumankhan@gmail.com' });
    if (existing) {
      console.log('User already exists, updating password and details...');
      existing.name = 'nouman';
      existing.password = 'noumananjum*123'; // pre-save middleware will automatically hash this!
      existing.role = 'student';
      existing.program = 'cybersecurity';
      await existing.save();
      console.log('User updated successfully:', existing);
    } else {
      const user = await User.create({
        name: 'nouman',
        email: 'noumankhan@gmail.com',
        password: 'noumananjum*123',
        role: 'student',
        program: 'cybersecurity'
      });
      console.log('User created successfully:', user);
    }
    
    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('Error connecting to DB:', err);
    process.exit(1);
  });

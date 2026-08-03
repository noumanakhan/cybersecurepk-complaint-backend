/**
 * seedUsers.js
 * ─────────────────────────────────────────────────────────────────
 * Seed initial Admin and Student users into MongoDB Atlas.
 *
 * Admin credentials:
 *   Email: admin@cybersecurepk.com (also admin@admin.com, admin@gmail.com)
 *   Password: 123
 *
 * Student credentials:
 *   Email: student@cybersecurepk.com (also student@student.com, student@gmail.com)
 *   Password: 123
 * ─────────────────────────────────────────────────────────────────
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const usersToSeed = [
  // Admin accounts
  { name: 'admin', email: 'admin@cybersecurepk.com', password: '123', role: 'admin', program: 'cybersecurity' },
  { name: 'admin', email: 'admin@admin.com', password: '123', role: 'admin', program: 'cybersecurity' },
  { name: 'admin', email: 'admin@gmail.com', password: '123', role: 'admin', program: 'cybersecurity' },
  
  // Student accounts
  { name: 'student', email: 'student@cybersecurepk.com', password: '123', role: 'student', program: 'cybersecurity' },
  { name: 'student', email: 'student@student.com', password: '123', role: 'student', program: 'cybersecurity' },
  { name: 'student', email: 'student@gmail.com', password: '123', role: 'student', program: 'cybersecurity' },
];

const seed = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI or MONGODB_URI is not defined in .env');
    }

    console.log('⏳ Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas successfully.');

    for (const userData of usersToSeed) {
      const existing = await User.findOne({ email: userData.email });

      if (existing) {
        existing.name = userData.name;
        existing.password = userData.password; // pre-save hook will hash password
        existing.role = userData.role;
        existing.program = userData.program;
        await existing.save();
        console.log(`🔄 Updated user: ${userData.email} (Role: ${userData.role})`);
      } else {
        await User.create(userData); // pre-save hook will hash password
        console.log(`✨ Created user: ${userData.email} (Role: ${userData.role})`);
      }
    }

    console.log('\n🎉 Seed process completed successfully!');
    console.log('====================================================');
    console.log(' Admin logins:');
    console.log('   - admin@cybersecurepk.com | Password: 123');
    console.log('   - admin@admin.com         | Password: 123');
    console.log('   - admin@gmail.com         | Password: 123');
    console.log(' Student logins:');
    console.log('   - student@cybersecurepk.com | Password: 123');
    console.log('   - student@student.com       | Password: 123');
    console.log('   - student@gmail.com         | Password: 123');
    console.log('====================================================');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();

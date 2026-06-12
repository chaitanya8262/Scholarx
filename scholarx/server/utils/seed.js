// ========================================
// Seed Script - populate demo users for quick testing
// Run with:  npm run seed
// ========================================
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const seedUsers = [
  {
    name: 'Alice Researcher',
    email: 'researcher@scholarx.com',
    password: 'password123',
    role: 'researcher',
    affiliation: 'MIT',
    bio: 'PhD candidate in Machine Learning'
  },
  {
    name: 'Bob Reviewer',
    email: 'reviewer@scholarx.com',
    password: 'password123',
    role: 'reviewer',
    expertise: ['machine learning', 'deep learning', 'computer vision'],
    affiliation: 'Stanford University',
    bio: 'Associate Professor'
  },
  {
    name: 'Carol Reviewer',
    email: 'reviewer2@scholarx.com',
    password: 'password123',
    role: 'reviewer',
    expertise: ['natural language processing', 'AI', 'robotics'],
    affiliation: 'Carnegie Mellon',
    bio: 'Senior Researcher'
  },
  {
    name: 'David Editor',
    email: 'editor@scholarx.com',
    password: 'password123',
    role: 'editor',
    affiliation: 'Nature Journal',
    bio: 'Editor-in-Chief'
  },
  {
    name: 'Eva Researcher',
    email: 'researcher2@scholarx.com',
    password: 'password123',
    role: 'researcher',
    affiliation: 'IIT Bombay',
    bio: 'Postdoctoral Fellow'
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('\n🌱 Seeding database...\n');

    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Insert new ones (pre-save hook hashes passwords)
    for (const u of seedUsers) {
      await User.create(u);
      console.log(`✅ Created ${u.role}: ${u.email}`);
    }

    console.log('\n🎉 Seed complete!\n');
    console.log('┌─────────────────────────────────────────────────────┐');
    console.log('│ Demo Credentials (password: password123 for all)    │');
    console.log('├─────────────────────────────────────────────────────┤');
    console.log('│ Researcher : researcher@scholarx.com                │');
    console.log('│ Reviewer   : reviewer@scholarx.com                  │');
    console.log('│ Reviewer   : reviewer2@scholarx.com                 │');
    console.log('│ Editor     : editor@scholarx.com                    │');
    console.log('└─────────────────────────────────────────────────────┘\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();

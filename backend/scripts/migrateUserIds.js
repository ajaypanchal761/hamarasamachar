import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.js';
import connectDB from '../config/database.js';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from backend root
dotenv.config({ path: join(__dirname, '..', '.env') });

// Generate unique HS user ID
const generateUserId = async () => {
  let userId;
  let exists = true;
  
  while (exists) {
    // Generate HS + 8 alphanumeric characters (uppercase)
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    userId = `HS${randomPart}`;
    
    // Check if ID already exists
    const existingUser = await User.findOne({ userId });
    exists = !!existingUser;
  }
  
  return userId;
};

const migrateUserIds = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    // Find all users without userId
    const usersWithoutId = await User.find({ userId: { $exists: false } });
    if (usersWithoutId.length === 0) {
      process.exit(0);
    }

    // Generate and assign userId for each user
    for (const user of usersWithoutId) {
      const userId = await generateUserId();
      user.userId = userId;
      await user.save();
      }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

migrateUserIds();


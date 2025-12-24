import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Admin from '../models/Admin.js';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function resetAdminPassword() {
  try {
    await connectDB();
    
    // Find admin
    const admin = await Admin.findOne({});
    
    if (!admin) {
      process.exit(0);
    }

    const confirm = await question('\n❓ Do you want to reset the password for this admin? (yes/no): ');
    
    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      rl.close();
      process.exit(0);
    }

    const newPassword = await question('\n🔐 Enter new password (min 6 characters): ');
    
    if (!newPassword || newPassword.length < 6) {
      rl.close();
      process.exit(1);
    }

    const confirmPassword = await question('🔐 Confirm new password: ');
    
    if (newPassword !== confirmPassword) {
      rl.close();
      process.exit(1);
    }

    // Update password (will be hashed automatically by pre-save hook)
    admin.password = newPassword;
    await admin.save();

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
    rl.close();
    process.exit(1);
  }
}

// Run the script
resetAdminPassword();


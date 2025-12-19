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
    console.log('🔌 Connecting to database...');
    await connectDB();
    
    // Find admin
    const admin = await Admin.findOne({});
    
    if (!admin) {
      console.log('❌ No admin account found in database.');
      console.log('💡 You can create an admin account by logging in for the first time.');
      process.exit(0);
    }

    console.log('\n📋 Admin Account Found:');
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Status: ${admin.status}`);
    
    const confirm = await question('\n❓ Do you want to reset the password for this admin? (yes/no): ');
    
    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      console.log('❌ Password reset cancelled.');
      rl.close();
      process.exit(0);
    }

    const newPassword = await question('\n🔐 Enter new password (min 6 characters): ');
    
    if (!newPassword || newPassword.length < 6) {
      console.log('❌ Password must be at least 6 characters long.');
      rl.close();
      process.exit(1);
    }

    const confirmPassword = await question('🔐 Confirm new password: ');
    
    if (newPassword !== confirmPassword) {
      console.log('❌ Passwords do not match.');
      rl.close();
      process.exit(1);
    }

    // Update password (will be hashed automatically by pre-save hook)
    admin.password = newPassword;
    await admin.save();

    console.log('\n✅ Admin password reset successfully!');
    console.log(`\n📝 Login Credentials:`);
    console.log(`   Username/Email: ${admin.username} or ${admin.email}`);
    console.log(`   Password: ${newPassword}`);
    console.log('\n💡 You can now login with these credentials.');
    
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


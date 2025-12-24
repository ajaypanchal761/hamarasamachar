import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Plan from '../models/Plan.js';

dotenv.config({ path: './backend/.env' });

const defaultPlans = [
  {
    name: 'मासिक प्लान',
    billingCycle: 'monthly',
    price: 149,
    description: '30 दिन की पहुँच',
    features: ['30 दिन की सभी खबरें अनलॉक', 'ई-पेपर एक्सेस', 'ब्रेकिंग न्यूज़'],
    status: 'active',
    order: 1
  },
  {
    name: 'वार्षिक प्लान',
    billingCycle: 'yearly',
    price: 999,
    description: '365 दिन की पहुँच',
    features: ['365 दिन की सभी खबरें अनलॉक', 'ई-पेपर एक्सेस', 'ब्रेकिंग न्यूज़', 'विशेष ऑफर'],
    status: 'active',
    order: 2
  }
];

const seedPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Check if plans already exist
    const existingPlans = await Plan.countDocuments();
    
    if (existingPlans > 0) {
      mongoose.disconnect();
      return;
    }

    // Insert default plans
    const plans = await Plan.insertMany(defaultPlans);
    plans.forEach(plan => {
      console.log(`✅ Plan seeded: ${plan.name} - ₹${plan.price}`);
    });

    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error seeding plans:', error);
    mongoose.disconnect();
    process.exit(1);
  }
};

seedPlans();

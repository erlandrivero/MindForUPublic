// Script to check user subscription plan in MongoDB
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Connect to MongoDB
async function connectToMongo() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

// Define User schema (simplified version just for querying)
const UserSchema = new Schema({
  email: String,
  subscription: {
    planName: String,
    status: String,
    billingCycle: String,
    currentPeriodStart: Date,
    currentPeriodEnd: Date
  },
  usage: {
    minutesUsed: Number,
    minutesLimit: Number
  },
  customerId: String
});

// Create User model
const User = mongoose.model('User', UserSchema);

// Query user data
async function checkUserPlan() {
  try {
    // Find all users and their subscription data
    const users = await User.find({}, {
      email: 1,
      subscription: 1,
      usage: 1,
      customerId: 1
    });

    console.log('\n=== USER SUBSCRIPTION DATA ===\n');
    
    if (users.length === 0) {
      console.log('No users found in the database.');
      return;
    }

    users.forEach(user => {
      console.log(`Email: ${user.email}`);
      console.log(`Customer ID: ${user.customerId || 'Not set'}`);
      
      if (user.subscription) {
        console.log('Subscription:');
        console.log(`  Plan Name: ${user.subscription.planName || 'Not set'}`);
        console.log(`  Status: ${user.subscription.status || 'Not set'}`);
        console.log(`  Billing Cycle: ${user.subscription.billingCycle || 'Not set'}`);
        
        if (user.subscription.currentPeriodStart) {
          console.log(`  Current Period: ${user.subscription.currentPeriodStart.toISOString().split('T')[0]} to ${user.subscription.currentPeriodEnd ? user.subscription.currentPeriodEnd.toISOString().split('T')[0] : 'Not set'}`);
        }
      } else {
        console.log('Subscription: Not set');
      }
      
      if (user.usage) {
        console.log('Usage:');
        console.log(`  Minutes Used: ${user.usage.minutesUsed || 0}`);
        console.log(`  Minutes Limit: ${user.usage.minutesLimit || 'Not set'}`);
      } else {
        console.log('Usage: Not set');
      }
      
      console.log('-----------------------------------');
    });

  } catch (error) {
    console.error('Error querying users:', error);
  } finally {
    mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
(async () => {
  await connectToMongo();
  await checkUserPlan();
})();

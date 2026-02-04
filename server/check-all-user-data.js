const mongoose = require('mongoose');
const User = require('./models/User');
const FarmerProfile = require('./models/FarmerProfile');
const BuyerProfile = require('./models/BuyerProfile');

mongoose.connect('mongodb://127.0.0.1:27017/kisansmartapp')
    .then(async () => {
        console.log('✅ Connected to MongoDB\n');

        // Find your user
        const user = await User.findOne({ email: 'jrrohithk@gmail.com' });

        if (user) {
            console.log('=== USER DOCUMENT ===');
            console.log('ID:', user._id);
            console.log('Name:', user.name);
            console.log('Email:', user.email);
            console.log('Username:', user.username);
            console.log('Phone:', user.mobileNumber);
            console.log('Location:', user.location || '(not set)');
            console.log('Role:', user.role);
            console.log('Password (hashed):', user.password ? 'YES (hidden)' : 'NO');
            console.log('isOnboarded:', user.isOnboarded);
            console.log('isProfileComplete:', user.isProfileComplete);
            console.log('isMfaVerified:', user.isMfaVerified);
            console.log('Created:', user.createdAt);
            console.log('Updated:', user.updatedAt);

            // Check for Farmer Profile
            const farmerProfile = await FarmerProfile.findOne({ user: user._id });
            if (farmerProfile) {
                console.log('\n=== FARMER PROFILE ===');
                console.log('Land Size:', farmerProfile.landSize || '(not set)');
                console.log('Crops Grown:', farmerProfile.cropsGrown || '(not set)');
                console.log('Location:', farmerProfile.location);
                console.log('KYC:', farmerProfile.kyc || '(not set)');
            } else {
                console.log('\n❌ No Farmer Profile found');
            }

            // Check for Buyer Profile
            const buyerProfile = await BuyerProfile.findOne({ user: user._id });
            if (buyerProfile) {
                console.log('\n=== BUYER PROFILE ===');
                console.log('Type:', buyerProfile.type);
                console.log('Business Data:', buyerProfile.businessData || '(not set)');
                console.log('Preferences:', buyerProfile.preferences || '(not set)');
            } else {
                console.log('\n❌ No Buyer Profile found');
            }

        } else {
            console.log('❌ User not found');
        }

        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });

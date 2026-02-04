const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/kisansmartapp')
    .then(async () => {
        console.log('✅ Connected to MongoDB\n');

        // Find your user
        const user = await User.findOne({ email: 'jrrohithk@gmail.com' });

        if (user) {
            console.log('=== Your User Document ===');
            console.log(JSON.stringify({
                _id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                mobileNumber: user.mobileNumber,
                role: user.role,
                isOnboarded: user.isOnboarded,
                isProfileComplete: user.isProfileComplete,
                isMfaVerified: user.isMfaVerified,  // ✅ This should now exist
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }, null, 2));

            console.log('\n✅ isMfaVerified field:', user.isMfaVerified !== undefined ? 'EXISTS' : 'MISSING');
        } else {
            console.log('❌ User not found');
        }

        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });

const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/kisansmartapp')
    .then(async () => {
        console.log('✅ Connected to MongoDB');

        try {
            // Update the specific user
            const result = await User.updateOne(
                { email: 'jrrohithk@gmail.com' },
                {
                    $set: {
                        isMfaVerified: false,  // Set to false by default
                        updatedAt: new Date()
                    }
                }
            );

            console.log('\n=== Update Result ===');
            console.log('Matched:', result.matchedCount);
            console.log('Modified:', result.modifiedCount);

            // Verify the update
            const user = await User.findOne({ email: 'jrrohithk@gmail.com' });

            if (user) {
                console.log('\n=== Updated User Data ===');
                console.log('Name:', user.name);
                console.log('Email:', user.email);
                console.log('Username:', user.username);
                console.log('isMfaVerified:', user.isMfaVerified);
                console.log('isOnboarded:', user.isOnboarded);
                console.log('isProfileComplete:', user.isProfileComplete);
                console.log('Updated At:', user.updatedAt);
                console.log('\n✅ isMfaVerified field added successfully!');
            }

            // Update ALL users that don't have isMfaVerified field
            console.log('\n=== Updating All Users ===');
            const bulkResult = await User.updateMany(
                { isMfaVerified: { $exists: false } },
                {
                    $set: {
                        isMfaVerified: false,
                        updatedAt: new Date()
                    }
                }
            );

            console.log('Total users updated:', bulkResult.modifiedCount);

            // Show summary
            const totalUsers = await User.countDocuments();
            const mfaUsers = await User.countDocuments({ isMfaVerified: true });

            console.log('\n=== Database Summary ===');
            console.log('Total Users:', totalUsers);
            console.log('Users with MFA enabled:', mfaUsers);
            console.log('Users with MFA disabled:', totalUsers - mfaUsers);

            console.log('\n✅ All done! You can now use the MFA feature.');

        } catch (err) {
            console.error('❌ Error updating user:', err);
        }

        process.exit(0);
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

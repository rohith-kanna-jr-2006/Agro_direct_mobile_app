const mongoose = require('mongoose');
const User = require('./models/User');
const Profile = require('./models/Profile');

mongoose.connect('mongodb://127.0.0.1:27017/kisansmartapp')
    .then(async () => {
        console.log('--- USERS ---');
        const users = await User.find();
        if (users.length === 0) console.log("No Users found.");
        users.forEach(u => {
            console.log(`User ID: ${u._id}`);
            console.log(`   Phone: ${u.phone}`);
            console.log(`   Email: ${u.email}`);
        });

        console.log('\n--- PROFILES ---');
        const profiles = await Profile.find();
        if (profiles.length === 0) console.log("No Profiles found.");
        profiles.forEach(p => {
            console.log(`Profile ID: ${p._id}`);
            console.log(`   UserID (Link): ${p.userId}`);
            console.log(`   Role: ${p.role}`);
            console.log(`   Name: ${p.name}`);
            console.log(`   Phone: ${p.phone}`);
        });

        mongoose.disconnect();
    })
    .catch(err => console.error(err));

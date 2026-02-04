const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/kisansmartapp')
    .then(async () => {
        const user = await User.findOne({ email: 'jrrohithk@gmail.com' });
        if (user) {
            console.log('USER_ROLE:', user.role);
            console.log('USER_ONBOARDED:', user.isOnboarded);
            console.log('USER_ID:', user._id);
        } else {
            console.log('USER_NOT_FOUND');
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/kisansmartapp')
    .then(async () => {
        const users = await User.find({}, 'name username email mobileNumber role');
        console.log(JSON.stringify(users, null, 2));
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

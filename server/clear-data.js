const mongoose = require('mongoose');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Profile = require('./models/Profile');
const User = require('./models/User'); // If we have a User model too

mongoose.connect('mongodb://127.0.0.1:27017/kisansmartapp')
    .then(async () => {
        console.log('Cleaning up all data...');
        await Product.deleteMany({});
        await Order.deleteMany({});
        await Profile.deleteMany({});
        await User.deleteMany({});
        console.log('Database cleared!');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

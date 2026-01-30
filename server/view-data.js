const mongoose = require('mongoose');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Profile = require('./models/Profile');

mongoose.connect('mongodb://127.0.0.1:27017/kisansmartapp')
    .then(async () => {
        console.log('--- DATA DUMP START ---');

        console.log('\n--- PROFILES ---');
        const profiles = await Profile.find();
        console.log(JSON.stringify(profiles, null, 2));

        console.log('\n--- PRODUCTS ---');
        const products = await Product.find();
        console.log(JSON.stringify(products, null, 2));

        console.log('\n--- ORDERS (History/Transactions) ---');
        const orders = await Order.find();
        console.log(JSON.stringify(orders, null, 2));

        console.log('\n--- DATA DUMP END ---');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

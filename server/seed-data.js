const mongoose = require('mongoose');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Profile = require('./models/Profile');

mongoose.connect('mongodb://127.0.0.1:27017/kisansmartapp')
    .then(async () => {
        console.log('Seeding Data...');

        // Clear existing (optional, but good for demo)
        await Product.deleteMany({});
        await Order.deleteMany({});
        await Profile.deleteMany({});

        // 1. Profile
        const farmer = new Profile({
            role: 'farmer',
            name: 'Ramesh Organics',
            storeName: 'Ramesh Farm Fresh',
            phone: '+91 98765 43210',
            location: 'Nashik, Maharashtra',
            bio: 'Certified organic vegetable grower.',
            photo: 'https://img.icons8.com/color/96/farmer-male.png',
            bankDetails: {
                accountNumber: '123456789012',
                ifscCode: 'SBIN0001234',
                upsId: 'ramesh@upi',
                bankName: 'State Bank of India'
            }
        });
        await farmer.save();

        // 2. Products
        const p1 = new Product({
            name: 'Fresh Tomato',
            price: '₹40/kg',
            image: 'https://img.icons8.com/color/96/tomato.png',
            farmerName: 'Ramesh Organics',
            farmerContact: '+91 98765 43210',
            farmerAddress: 'Nashik, Maharashtra',
            rating: '4.8',
            views: 150,
            sales: 45
        });
        await p1.save();

        const p2 = new Product({
            name: 'Onion Red',
            price: '₹30/kg',
            image: 'https://img.icons8.com/color/96/onion.png',
            farmerName: 'Ramesh Organics',
            farmerContact: '+91 98765 43210',
            farmerAddress: 'Nashik, Maharashtra',
            rating: '4.5',
            views: 80,
            sales: 20
        });
        await p2.save();

        // 3. Orders (History)
        const o1 = new Order({
            productName: 'Fresh Tomato',
            totalPrice: 200, // 5kg * 40
            quantity: 5,
            date: new Date('2025-01-20'),
            farmer: { name: 'Ramesh Organics', address: 'Nashik', rating: '4.8' },
            userRating: 5,
            userName: 'Anjali Buyer',
            userAddress: 'Mumbai, Andheri West'
        });
        await o1.save();

        const o2 = new Order({
            productName: 'Onion Red',
            totalPrice: 300,
            quantity: 10,
            date: new Date('2025-01-22'),
            farmer: { name: 'Ramesh Organics', address: 'Nashik', rating: '4.5' },
            userRating: 4,
            userName: 'Rahul',
            userAddress: 'Pune, Wakad'
        });
        await o2.save();

        console.log('Data Seeded Successfully!');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

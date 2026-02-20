const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Profile = require('./models/Profile');
const FarmerProfile = require('./models/FarmerProfile');

// Define a simple Review schema just for this script to create the collection
const reviewSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: Number,
    comment: String,
    createdAt: { type: Date, default: Date.now }
});
const Review = mongoose.model('Review', reviewSchema);

const MONGODB_URI = 'mongodb://127.0.0.1:27017/kisansmartapp';

async function createCollections() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Optional: Clear existing data to ensure a clean slate (User can remove this if they want to keep data)
        // console.log('Cleaning up old data...');
        // await User.deleteMany({});
        // await Product.deleteMany({});
        // await Order.deleteMany({});
        // await Profile.deleteMany({});
        // await FarmerProfile.deleteMany({});
        // await Review.deleteMany({});

        console.log('Creating Collections and Seeding Data...');

        // 1. User Accounts (Login & Signup)
        // Create a Farmer
        const farmerUser = new User({
            name: "Ramesh Farmer",
            email: "ramesh@farmer.com",
            username: "ramesh_farmer",
            mobileNumber: "+919876543210",
            password: "password123", // In real app, this should be hashed
            role: "farmer",
            isOnboarded: true,
            isProfileComplete: true
        });
        await farmerUser.save();
        console.log('✅ User Collection: Added Farmer');

        // Create a Buyer
        const buyerUser = new User({
            name: "Anita Buyer",
            email: "anita@buyer.com",
            username: "anita_buyer",
            mobileNumber: "+919123456780",
            password: "password123",
            role: "buyer",
            isOnboarded: true,
            isProfileComplete: true
        });
        await buyerUser.save();
        console.log('✅ User Collection: Added Buyer');

        // 2. Farmer's Details & Person's Details
        // Profile for Farmer
        const farmerProfile = new Profile({
            userId: farmerUser._id.toString(),
            role: "farmer",
            name: farmerUser.name,
            storeName: "Ramesh Organics",
            phone: farmerUser.mobileNumber,
            location: "Nashik, Maharashtra",
            bio: "Growing organic vegetables for 10 years.",
            photo: "https://example.com/farmer.jpg",
            bankDetails: {
                accountNumber: "1234567890",
                ifscCode: "SBIN0001234",
                bankName: "SBI"
            }
        });
        await farmerProfile.save();
        console.log('✅ Profile Collection: Added Farmer Profile');

        // FarmerSpecific Profile (Geo & Land info)
        const farmerGeoProfile = new FarmerProfile({
            user: farmerUser._id,
            location: { type: "Point", coordinates: [73.7898, 19.9975] }, // Nashik Coords
            landSize: 5.5,
            cropsGrown: ["Tomato", "Onion"],
            kyc: { aadhaarLast4: "1234" }
        });
        await farmerGeoProfile.save();
        console.log('✅ FarmerProfile Collection: Added Farmer Geo Details');

        // Profile for Buyer
        const buyerProfile = new Profile({
            userId: buyerUser._id.toString(),
            role: "buyer",
            name: buyerUser.name,
            phone: buyerUser.mobileNumber,
            location: "Mumbai, Maharashtra",
            buyerDetails: {
                subRole: "consumer",
                interests: ["Organic Vegetables"]
            }
        });
        await buyerProfile.save();
        console.log('✅ Profile Collection: Added Buyer Profile');


        // 3. Products (Product List)
        const product1 = new Product({
            name: "Fresh Organic Tomato",
            price: "40",
            img: "https://example.com/tomato.jpg", // UI uses 'img'
            category: "Vegetables",
            farmerName: farmerUser.name,
            farmerContact: farmerUser.mobileNumber,
            userId: farmerUser._id.toString(),
            quantity: "100 kg",
            description: "Freshly picked organic tomatoes."
        });
        await product1.save();
        console.log('✅ Product Collection: Added Tomato');

        // 4. Orders (User purchased history)
        const order1 = new Order({
            productName: product1.name,
            totalPrice: 200,
            quantity: 5,
            paymentMethod: "UPI",
            trackingId: "TRK" + Date.now(),
            farmer: {
                id: farmerUser._id.toString(),
                name: farmerUser.name,
                address: "Nashik"
            },
            userId: buyerUser._id.toString(),
            userName: buyerUser.name,
            userAddress: "Mumbai",
            status: "Delivered"
        });
        await order1.save();
        console.log('✅ Order Collection: Added Order');

        // 5. Reviews
        const review1 = new Review({
            productId: product1._id,
            userId: buyerUser._id,
            rating: 5,
            comment: "Excellent quality tomatoes! Very fresh."
        });
        await review1.save();
        console.log('✅ Review Collection: Added Review');


        console.log('\n🎉 All requested collections have been created and populated!');
        console.log('👉 Open MongoDB Compass and refresh to see:');
        console.log('   - users');
        console.log('   - profiles');
        console.log('   - farmerprofiles');
        console.log('   - products');
        console.log('   - orders');
        console.log('   - reviews');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

createCollections();

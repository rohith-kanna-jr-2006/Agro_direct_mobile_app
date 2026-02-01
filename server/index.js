require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Profile = require('./models/Profile');
const User = require('./models/User');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/kisansmartapp')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

// --- Twilio OTP ---
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// API 1: Send OTP
// API 1: Send OTP
app.post('/api/send-otp', async (req, res) => {
    console.log("Received Send OTP Request:", req.body);
    const { phoneNumber } = req.body; // format: +919876543210

    try {
        const verification = await client.verify.v2
            .services(process.env.TWILIO_SERVICE_SID)
            .verifications.create({ to: phoneNumber, channel: 'sms' });

        res.json({ success: true, status: verification.status });
    } catch (error) {
        console.error("Twilio Error (Using Mock Fallback):", error.message);
        // Fallback for dev mode or network errors
        res.json({ success: true, status: 'pending', message: "Mock OTP enabled. Use 1234." });
    }
});

// API 2: Verify OTP
// API 2: Verify OTP
app.post('/api/verify-otp', async (req, res) => {
    const { phoneNumber, code, role } = req.body;
    let isValid = false;

    // 1. Mock Check
    if (code === '1234') {
        isValid = true;
        console.log("Mock OTP verified automatically.");
    } else {
        // 2. Real Check
        try {
            const verificationCheck = await client.verify.v2
                .services(process.env.TWILIO_SERVICE_SID)
                .verificationChecks.create({ to: phoneNumber, code: code });

            if (verificationCheck.status === 'approved') {
                isValid = true;
            }
        } catch (error) {
            console.error("Twilio Verify Error:", error.message);
            // If real verify fails, we just return error unless it was the specific mock code
            return res.status(500).json({ success: false, error: "Network/Twilio Error. Try using 1234 as mock." });
        }
    }

    if (isValid) {
        // Check if user exists
        try {
            const user = await User.findOne({ phone: phoneNumber });
            if (user) {
                // Fetch profile based on the requested role (default to farmer)
                const searchRole = role ? role.toLowerCase() : 'farmer';
                const profile = await Profile.findOne({ userId: user._id.toString(), role: searchRole });

                res.json({ success: true, message: "Login Successful!", user, profile });
            } else {
                res.json({ success: true, message: "OTP Verified", isNewUser: true });
            }
        } catch (dbError) {
            console.error("Database Error during verify:", dbError);
            res.status(500).json({ success: false, error: dbError.message });
        }
    } else {
        res.status(400).json({ success: false, message: "Invalid OTP" });
    }
});

// --- Register via Phone ---
app.post('/api/users/register-phone', async (req, res) => {
    try {
        const { phone, name, location, role, farmDetails, bankDetails, buyerDetails } = req.body;

        // 1. Create User (Auto-generate required fields)
        // Check if user already exists (just in case)
        let user = await User.findOne({ phone });
        if (!user) {
            user = new User({
                phone,
                name,
                username: phone, // Use phone as username
                email: `${phone.replace('+', '')}@kisansmartapp.com`, // Dummy email
                password: 'otp-login-authenticated', // Dummy password
                location: JSON.stringify(location)
            });
            await user.save();
        }

        // 2. Create/Update Profile
        let bio = '';
        if (role === 'farmer' && farmDetails) {
            bio = `Farms ${farmDetails.acres} acres of ${farmDetails.crops.join(', ')}`;
        } else if (role === 'buyer' && buyerDetails) {
            bio = `${buyerDetails.subRole === 'business' ? buyerDetails.businessName : 'Consumer'} | Interested in: ${buyerDetails.interests.join(', ')}`;
        }

        const profileData = {
            userId: user._id.toString(),
            role: role || 'farmer',
            name: name,
            phone: phone,
            location: typeof location === 'string' ? location : `${location.village || ''} ${location.district || ''} ${location.state || ''}`.trim(),
            bio: bio,
            bankDetails: bankDetails,
            buyerDetails: buyerDetails, // Save structured buyer details
            photo: buyerDetails?.storeImage || ''
        };

        const profile = await Profile.findOneAndUpdate(
            { userId: user._id.toString(), role: role || 'farmer' },
            profileData,
            { new: true, upsert: true }
        );

        res.status(201).json({ user, profile });

    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- Users ---
app.post('/api/users/register', async (req, res) => {
    try {
        const { email, phone, username, password, location, keywords, name, age } = req.body;

        // Simple validation
        if (!email || !password || !username) {
            return res.status(400).json({ error: "Email, Username, and Password are required" });
        }

        const newUser = new User({ email, phone, username, password, location, keywords, name, age });
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({ error: "User with this email, phone, or username already exists" });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
});

app.post('/api/users/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;
        // Find by email OR phone OR username
        const user = await User.findOne({
            $or: [{ email: identifier }, { phone: identifier }, { username: identifier }]
        });

        if (!user) return res.status(404).json({ error: "User not found" });

        if (user.password !== password) { // In production, use bcrypt!
            return res.status(401).json({ error: "Invalid credentials" });
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- Products ---
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Orders ---
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ date: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();

        // --- AUTO AMOUNT FIX (Wallet Credit) ---
        // Find the farmer by name (assuming unique names for simplicity, or use ID if available)
        if (req.body.farmer && req.body.farmer.name) {
            const farmerName = req.body.farmer.name;
            const amount = req.body.totalPrice || 0;

            await Profile.findOneAndUpdate(
                { name: farmerName, role: 'farmer' },
                { $inc: { walletBalance: amount } }
            );
            console.log(`Credited ₹${amount} to farmer: ${farmerName}`);
        }

        res.status(201).json(savedOrder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/orders/:id/rate', async (req, res) => {
    try {
        const { rating } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { userRating: rating }, { new: true });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Profile ---
app.get('/api/profile/:userId/:role', async (req, res) => {
    try {
        const { userId, role } = req.params;
        const profile = await Profile.findOne({ userId, role });
        res.json(profile || null);
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log(err)
    }
});

app.post('/api/profile', async (req, res) => {
    try {
        const { role, userId } = req.body;
        if (!role || !userId) return res.status(400).json({ error: "Role and UserID are required" });

        const profile = await Profile.findOneAndUpdate(
            { userId, role },
            req.body,
            { new: true, upsert: true }
        );
        res.json(profile);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/analytics', async (req, res) => {
    try {
        const orders = await Order.find();

        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        const totalSales = orders.length;

        // "Data Science" - Basic Analysis
        // 1. Top Selling Product
        const productSales = {};
        orders.forEach(order => {
            const name = order.productName;
            productSales[name] = (productSales[name] || 0) + (order.quantity || 0);
        });

        let topProduct = 'None';
        let maxQty = 0;
        for (const [name, qty] of Object.entries(productSales)) {
            if (qty > maxQty) {
                maxQty = qty;
                topProduct = name;
            }
        }

        // 2. Suggestions
        let suggestions = [];
        if (orders.length < 5) {
            suggestions.push("📉 Low sales volume detected. Consider running a discount campaign to attract buyers.");
        } else {
            suggestions.push("📈 Sales volume is healthy. Maintain current inventory levels.");
        }

        if (topProduct !== 'None') {
            suggestions.push(`🌟 '${topProduct}' is your best seller! Ensure you prioritize its production/stock.`);
        }

        // 3. Average Rating Analysis
        const ratedOrders = orders.filter(o => o.userRating > 0);
        const avgRating = ratedOrders.length > 0
            ? ratedOrders.reduce((sum, o) => sum + o.userRating, 0) / ratedOrders.length
            : 0;

        if (avgRating > 0 && avgRating < 4.0) {
            suggestions.push("⚠️ Average customer rating is below 4.0. Review product quality or delivery speed.");
        } else if (avgRating >= 4.5) {
            suggestions.push("🏆 Excellent customer feedback! You are a top-rated seller.");
        }

        res.json({
            revenue: totalRevenue,
            sales: totalSales,
            topProduct,
            averageRating: avgRating.toFixed(1),
            suggestions
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- External API Integrations (Mock) ---
app.post('/api/external/verify-pm-kisan', async (req, res) => {
    const { aadhaar } = req.body;
    console.log(`Verifying PM-KISAN status for Aadhaar: ${aadhaar}`);

    // Mock Logic: Aadhaar ending in '0000' fails. All others valid.
    if (aadhaar && aadhaar.endsWith('0000')) {
        return res.json({ success: true, valid: false, message: "Landholding not found in PM-KISAN database." });
    }

    // Simulate delay for realism
    setTimeout(() => {
        res.json({
            success: true,
            valid: true,
            message: "Verified successfully against PM-KISAN database.",
            details: {
                farmerName: "Verified Generic Farmer", // In real app, name would match Aadhaar
                landSize: "2.5 Acres",
                status: "Active Beneficiary"
            }
        });
    }, 1500);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

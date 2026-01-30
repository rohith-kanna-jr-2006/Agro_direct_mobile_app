const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Profile = require('./models/Profile');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/kisansmartapp')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

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
app.get('/api/profile/:role', async (req, res) => {
    try {
        const profile = await Profile.findOne({ role: req.params.role });
        res.json(profile || null);
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log(err)
    }
});

app.post('/api/profile', async (req, res) => {
    try {
        const { role } = req.body;
        if (!role) return res.status(400).json({ error: "Role is required" });

        const profile = await Profile.findOneAndUpdate(
            { role },
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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

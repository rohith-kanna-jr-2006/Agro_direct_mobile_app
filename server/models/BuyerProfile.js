const mongoose = require('mongoose');

const buyerProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    type: { type: String, enum: ['household', 'retailer', 'business'], required: true },
    businessData: {
        gstNumber: { type: String }, // Optional
        shopName: { type: String }
    },
    preferences: [{ type: String }] // e.g., ["Tomato", "Onion"]
}, { timestamps: true });

module.exports = mongoose.model('BuyerProfile', buyerProfileSchema);

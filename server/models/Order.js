const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    productName: String,
    totalPrice: Number,
    quantity: Number,
    date: { type: Date, default: Date.now },
    farmer: {
        name: String,
        address: String,
        rating: String
    },
    userRating: { type: Number, default: 0 },
    userId: String,
    userName: String,
    userAddress: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    productName: String,
    totalPrice: Number,
    quantity: Number,
    paymentMethod: String,
    trackingId: { type: String, unique: true },
    date: { type: Date, default: Date.now },
    farmer: {
        id: String,
        name: String,
        address: String,
        rating: String
    },
    userRating: { type: Number, default: 0 },
    userId: String,
    userName: String,
    userAddress: String,
    status: { type: String, default: 'Placed' }, // Placed, Picked Up, In Transit, Arriving, Delivered
    currentLocation: {
        lat: { type: Number, default: 12.9716 },
        lng: { type: Number, default: 77.5946 }
    },
    destLocation: {
        lat: { type: Number, default: 13.0827 },
        lng: { type: Number, default: 80.2707 }
    },
    trackingHistory: [
        {
            lat: Number,
            lng: Number,
            timestamp: { type: Date, default: Date.now }
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);

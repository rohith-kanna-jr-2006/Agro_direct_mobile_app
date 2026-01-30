const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    role: { type: String, enum: ['farmer', 'buyer'], required: true, unique: true },
    // unique: true ensures only one profile per role exists for this simple app implementation
    name: String,
    storeName: String,
    phone: String,
    location: String,
    bio: String,
    photo: String,
    bankDetails: {
        accountNumber: String,
        ifscCode: String,
        upsId: String, // UPI ID
        bankName: String
    },
    walletBalance: { type: Number, default: 0 }
});

module.exports = mongoose.model('Profile', profileSchema);

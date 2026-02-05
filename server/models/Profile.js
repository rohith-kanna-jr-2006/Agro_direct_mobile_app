const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Email or unique ID of the logged-in user
    role: { type: String, enum: ['farmer', 'buyer'], required: true },
    // Removed unique: true from role so multiple users can have 'farmer' role
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
    buyerDetails: {
        subRole: { type: String, enum: ['consumer', 'business', 'hotel'] },
        businessName: String,
        interests: [String],
        weeklyRequirement: String
    },
    walletBalance: { type: Number, default: 0 }
});

// Create a compound index to ensure one profile per role PER user
profileSchema.index({ userId: 1, role: 1 }, { unique: true });

module.exports = mongoose.model('Profile', profileSchema);

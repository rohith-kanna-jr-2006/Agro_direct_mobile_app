const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, unique: true, required: true, sparse: true, index: true }, // username is the ONLY unique identifier besides ID
    email: { type: String, required: true, index: true }, // email is now non-unique
    mobileNumber: { type: String, index: true }, // mobileNumber is now non-unique
    password: { type: String }, // Optional for social logins
    location: { type: String }, // Address string
    role: { type: String, enum: ['farmer', 'buyer', 'admin'], default: 'farmer' },
    isVerified: { type: Boolean, default: false },
    isOnboarded: { type: Boolean, default: false },
    isProfileComplete: { type: Boolean, default: false },
    isMfaVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

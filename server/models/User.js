const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    mobileNumber: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true }, // Store hashed password
    role: { type: String, enum: ['farmer', 'buyer', 'admin'], default: 'farmer' },
    isVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

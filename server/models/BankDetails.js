const mongoose = require('mongoose');

const BankDetailsSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    role: { type: String, required: true }, // 'farmer' or 'buyer' usually, to separate accounts if needed
    accountHolderName: { type: String, required: true },
    accountNumber: { type: String, required: true }, // In a real app, this would be encrypted
    ifscCode: { type: String, required: true },
    bankName: { type: String },
    branchName: { type: String },
    accountType: { type: String, enum: ['Savings', 'Current'], default: 'Savings' },
    upiId: { type: String },
    isVerified: { type: Boolean, default: false }
});

module.exports = mongoose.model('BankDetails', BankDetailsSchema);

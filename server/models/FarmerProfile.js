const mongoose = require('mongoose');

const farmerProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    location: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    landSize: { type: Number, required: true }, // in acres
    cropsGrown: [{ type: String }],
    kyc: {
        aadhaarLast4: { type: String },
        bankDetails: {
            accountNumber: { type: String },
            ifsc: { type: String }
            // Note: Bank details should be encrypted before storage in a real production environment
        }
    }
}, { timestamps: true });

// Create a 2dsphere index on the location field for geospatial queries
farmerProfileSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('FarmerProfile', farmerProfileSchema);

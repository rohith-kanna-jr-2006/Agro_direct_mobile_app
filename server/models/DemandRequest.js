const mongoose = require('mongoose');

const demandRequestSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    requestedQty: { type: Number, required: true },
    availableQty: { type: Number, required: true },
    buyer: {
        id: { type: String },
        name: { type: String },
        username: { type: String }
    },
    farmer: {
        id: { type: String },
        name: { type: String }
    },
    status: { type: String, default: 'Pending' },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('DemandRequest', demandRequestSchema);

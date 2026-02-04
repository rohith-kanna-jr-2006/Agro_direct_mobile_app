const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  price: String,
  // keeping price as String because current app uses formatted strings like "₹50/kg"
  // Ideally should be split into value and unit, but respecting current app logic for now.
  image: String,
  farmerName: String,
  farmerContact: String,
  farmerAddress: String,
  rating: { type: String, default: '5.0' },
  quality: String,      // Added for AI grading result
  quantity: String,     // Added for quantity + unit
  deliveryType: String, // Added for delivery choice
  views: { type: Number, default: 0 },
  sales: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  price: String,
  img: String, // UI uses 'img'
  farm: String, // UI uses 'farm'
  dist: String, // UI uses 'dist'
  grade: String, // UI uses 'grade'
  category: String, // UI uses 'category'
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

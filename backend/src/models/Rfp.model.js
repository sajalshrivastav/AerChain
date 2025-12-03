const mongoose = require('mongoose');
require('dotenv').config();

const ItemSchema = new mongoose.Schema({
    name: String,
    quantity: Number,
    specs: String
});

const RfpSchema = new mongoose.Schema({
    title: String,
    raw_input: String,
    budget: Number,
    items: [ItemSchema],
    delivery_days: Number,
    payment_terms: String,
    warranty: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rfp', RfpSchema);
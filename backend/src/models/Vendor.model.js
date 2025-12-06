const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    createdAt: { type: Date, default: Date.now }
});

VendorSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('Vendor', VendorSchema);
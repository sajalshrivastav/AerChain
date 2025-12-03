// backend/src/models/Proposal.js
const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema({
    rfpId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rfp', default: null },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', default: null },
    status: { type: String, enum: ['pending', 'received', 'failed'], default: 'pending' },
    raw_email: String,
    parsed: mongoose.Schema.Types.Mixed,
    ai_summary: String,
    messageId: String,
    createdAt: { type: Date, default: Date.now },
    receivedAt: Date
});

module.exports = mongoose.model('Proposal', ProposalSchema);

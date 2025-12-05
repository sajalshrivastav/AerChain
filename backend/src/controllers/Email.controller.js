const Proposal = require('../models/Proposal.model');
const Vendor = require('../models/Vendor.model');
const aiService = require('../service/AI.service');

// Simulate receiving a vendor proposal email
const simulateVendorResponse = async (req, res) => {
    try {
        const { rfpId, vendorId, emailBody } = req.body;

        if (!rfpId || !vendorId || !emailBody) {
            return res.status(400).json({ error: 'rfpId, vendorId, and emailBody are required' });
        }

        // Find the proposal
        const proposal = await Proposal.findOne({ rfpId, vendorId });
        if (!proposal) {
            return res.status(404).json({ error: 'Proposal not found' });
        }

        // Parse the email using AI
        const parsed = await aiService.parseProposalFromEmail(emailBody);

        // Update the proposal
        proposal.status = 'received';
        proposal.raw_email = emailBody;
        proposal.parsed = parsed;
        proposal.ai_summary = parsed.summary;
        proposal.receivedAt = new Date();
        await proposal.save();

        res.json({ message: 'Proposal received and parsed', proposal });
    } catch (err) {
        console.error('simulateVendorResponse error', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { simulateVendorResponse };
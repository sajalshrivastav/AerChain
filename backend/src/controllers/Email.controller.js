const Proposal = require('../models/Proposal.model');
const Vendor = require('../models/Vendor.model');
const aiService = require('../service/AI.service');
const { processPendingProposals, listInboxEmails } = require('../service/EmailReceiver.service');
const { processRawEmail } = require('../utils/EmailParse');
const { startPolling, stopPolling } = require('../service/EmailPoller.service');

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
        console.log('Parsing vendor email with AI...');
        const parsed = await aiService.parseProposalFromEmail(emailBody);

        // Update the proposal
        proposal.status = 'received';
        proposal.raw_email = emailBody;
        proposal.parsed = parsed;
        proposal.ai_summary = parsed.summary;
        proposal.receivedAt = new Date();
        await proposal.save();

        console.log('✅ Proposal updated successfully');
        res.json({ message: 'Proposal received and parsed', proposal });
    } catch (err) {
        console.error('simulateVendorResponse error', err);
        res.status(500).json({ error: err.message });
    }
};

// Process vendor email from actual reply (for when IMAP works)
const processVendorEmail = async (req, res) => {
    try {
        const { vendorEmail, subject, emailBody } = req.body;

        if (!vendorEmail || !subject || !emailBody) {
            return res.status(400).json({ error: 'vendorEmail, subject, and emailBody are required' });
        }

        // Extract RFP ID from subject
        const rfpIdMatch = subject.match(/RFP-([a-f0-9]+)/i);
        if (!rfpIdMatch) {
            return res.status(400).json({ error: 'Could not extract RFP ID from subject' });
        }

        const rfpId = rfpIdMatch[1];
        console.log('Processing email for RFP ID:', rfpId);

        // Find vendor by email
        const vendor = await Vendor.findOne({ email: vendorEmail });
        if (!vendor) {
            return res.status(404).json({ error: 'Vendor not found for email: ' + vendorEmail });
        }

        // Find the proposal
        const proposal = await Proposal.findOne({
            rfpId: rfpId,
            vendorId: vendor._id
        });

        if (!proposal) {
            return res.status(404).json({ error: 'Proposal not found for RFP: ' + rfpId });
        }

        // Parse email body with AI
        console.log('Parsing vendor email with AI...');
        const parsedData = await aiService.parseProposalFromEmail(emailBody);

        // Update proposal
        proposal.status = 'received';
        proposal.raw_email = emailBody;
        proposal.parsed = parsedData;
        proposal.ai_summary = parsedData.summary;
        proposal.receivedAt = new Date();
        await proposal.save();

        console.log('✅ Proposal updated successfully for vendor:', vendor.name);
        res.json({ message: 'Proposal received and parsed', proposal, vendor: vendor.name });
    } catch (err) {
        console.error('processVendorEmail error', err);
        res.status(500).json({ error: err.message });
    }
};

// Manually trigger processing of all pending proposals
const processPending = async (req, res) => {
    try {
        console.log('🔄 Manual trigger: Processing pending proposals...');
        await processPendingProposals();
        res.json({ message: 'Pending proposals processed successfully' });
    } catch (err) {
        console.error('processPending error', err);
        res.status(500).json({ error: err.message });
    }
};

// List all emails in inbox (diagnostic)
const listInbox = async (req, res) => {
    try {
        console.log('📋 Listing inbox emails...');
        const emails = await listInboxEmails();
        res.json({ count: emails.length, emails });
    } catch (err) {
        console.error('listInbox error', err);
        res.status(500).json({ error: err.message });
    }
};



// Manual raw EML processing endpoint used for testing
const processRaw = async (req, res) => {
    try {
        const raw = req.body.raw || req.body.eml || req.body.email;
        if (!raw) return res.status(400).json({ error: 'raw email content required' });
        const created = await processRawEmail(raw);
        return res.json({ ok: true, created });
    } catch (err) {
        console.error('processRaw error', err);
        return res.status(500).json({ error: err.message });
    }
};

const startPoll = (req, res) => {
    try {
        startPolling();
        return res.json({ ok: true, message: 'Email polling started' });
    } catch (err) {
        console.error('startPoll error', err);
        return res.status(500).json({ error: err.message });
    }
};

const stopPoll = (req, res) => {
    try {
        stopPolling();
        return res.json({ ok: true, message: 'Email polling stopped' });
    } catch (err) {
        console.error('stopPoll error', err);
        return res.status(500).json({ error: err.message });
    }
};

module.exports = { simulateVendorResponse, processVendorEmail, processPending, listInbox, processRaw, startPoll, stopPoll };
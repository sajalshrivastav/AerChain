const Rfp = require('../models/Rfp.model');
const Vendor = require('../models/Vendor.model');
const Proposal = require('../models/Proposal.model');
const aiService = require('../service/AI.service');
const mailer = require('../service/Mailer.service');


const createRFP = async (req, res) => {
    try {
        const payload = req.body;
        const proposalRequest = await Rfp.create(payload);
        res.status(201).json(proposalRequest);
    } catch (error) {
        console.error('Error While Creating RFP', error);
        res.status(500).json({ error: error.message });

    }
}

const getRFPList = async (req, res) => {
    try {
        const rfpList = await Rfp.find().sort({ createdAt: -1 });
        res.status(200).json(rfpList);

    } catch (error) {
        console.error('Error While Fetching RFP List', error);
        res.status(500).json({ error: error.message });
    }
}

const generateRfpFromText = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'text is required' });

        const draft = await aiService.generateRfpFromText(text);
        res.json({ rfpDraft: draft });
    } catch (err) {
        console.error('generateRfpDraft error', err);
        res.status(500).json({ error: err.message });
    }
};

const sendProposalToVendors = async (req, res) => {
    try {
        const { id } = req.params;
        const { vendorIds } = req.body;
        if (!vendorIds || !vendorIds.length) return res.status(400).json({ error: 'vendorIds required' });

        const rfp = await Rfp.findById(id);
        if (!rfp) return res.status(404).json({ error: 'RFP not found' });

        const vendors = await Vendor.find({ _id: { $in: vendorIds } });
        const results = { sent: [], failed: [] };

        for (const v of vendors) {
            try {
                const subject = `RFP [RFP-${id}] - ${rfp.title}`;
                const text = [
                    `Hello ${v.name},`,
                    ``,
                    `Please provide a proposal for the following RFP (ID: RFP-${id}):`,
                    `${rfp.title}`,
                    `Budget: ${rfp.budget}`,
                    `Delivery days: ${rfp.delivery_days}`,
                    ``,
                    `Items:`,
                    ...(rfp.items || []).map(i => `- ${i.name} — ${i.quantity} — ${i.specs}`),
                    ``,
                    `Regards,`,
                    `Procurement Team`
                ].join('\n');

                const info = await mailer.sendMail({ to: v.email, subject, text });
                // create pending proposal record
                await Proposal.create({
                    rfpId: id,
                    vendorId: v._id,
                    status: 'pending',
                    messageId: info && info.messageId ? info.messageId : `stub-${Date.now()}`
                });
                results.sent.push(v._id);
            } catch (sendErr) {
                console.error('send error for', v.email, sendErr);
                results.failed.push(v._id);
            }
        }

        res.json(results);
    } catch (err) {
        console.error('sendRfpToVendors error', err);
        res.status(500).json({ error: err.message });
    }
};

const getProposalsForRfp = async (req, res) => {
    try {
        const { id } = req.params;
        const proposals = await Proposal.find({ rfpId: id }).populate('vendorId', 'name email');
        res.json(proposals);
    } catch (err) {
        console.error('getProposalsForRfp error', err);
        res.status(500).json({ error: err.message });
    }
};

const compareProposals = async (req, res) => {
    try {
        const { id } = req.params;
        const rfp = await Rfp.findById(id);
        const proposals = await Proposal.find({ rfpId: id });
        const comparison = await aiService.compareProposals(rfp, proposals);
        res.json(comparison);
    } catch (err) {
        console.error('compareProposals error', err);
        res.status(500).json({ error: err.message });
    }
};


module.exports = {
    createRFP,
    getRFPList,
    generateRfpFromText,
    sendProposalToVendors,
    getProposalsForRfp,
    compareProposals
};
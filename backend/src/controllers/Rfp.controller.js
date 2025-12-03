const Rfp = require('../models/Rfp.model');
const Vendor = require('../models/Vendor.model');
const Proposal = require('../models/Proposal.model');
const aiService = require('../service/AI.service');
const mailer = require('../service/Mailer.service');


const createRFP = async () => {
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
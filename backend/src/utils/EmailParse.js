const simpleParser = require('mailparser').simpleParser;
const Proposal = require('../models/Proposal.model');
const Vendor = require('../models/Vendor.model');
const Rfp = require('../models/Rfp.model');


const processRawEmail = async (rawMsg) => {
    try {
        const parsed = await simpleParser(rawMsg.body || rawMsg.raw || rawMsg);
        const fromAddress = (parsed.from && parsed.from.value && parsed.from.value[0] && parsed.from.value[0].address) || '';
        const normalizedFrom = fromAddress.trim().toLowerCase();

        // Attempt to find RFP by In-Reply-To header (best), then by subject containing an RFP id
        const inReplyTo = parsed.headers.get('in-reply-to') || parsed.inReplyTo || parsed.header && parsed.header['in-reply-to'];
        let rfp = null;

        if (inReplyTo) {
            // Search for messageId stored with sent RFPs (ensure your Mailer stored messageId on send)
            rfp = await Rfp.findOne({ sentMessageId: { $in: [inReplyTo, parsed.messageId] } });
        }

        if (!rfp && parsed.subject) {
            // try to extract RFP id from subject like "[RFP-123]" or "RFP#<id>"
            const idMatch = parsed.subject.match(/(?:RFP[-#]\s*([A-Za-z0-9-_]+)|\[(RFP[:\-]?\s*[A-Za-z0-9-_]+)\])/i);
            if (idMatch) {
                const candidate = idMatch[1] || idMatch[2];
                if (candidate) {
                    rfp = await Rfp.findById(candidate).catch(() => null);
                }
            }
        }

        // Ensure vendor exists or create
        let vendor = await Vendor.findOne({ email: normalizedFrom });
        if (!vendor) {
            vendor = await Vendor.create({ name: parsed.from && parsed.from.value && parsed.from.value[0] && parsed.from.value[0].name || normalizedFrom, email: normalizedFrom });
        }

        // Run AI parse to extract proposal fields (fallback to simple heuristics)
        let parsedProposal = null;
        try {
            parsedProposal = await parseProposalFromEmail(parsed.text || parsed.html || parsed.body || '');
        } catch (e) {
            parsedProposal = { raw: parsed.text || parsed.html || '' };
        }

        // Build Proposal document
        const proposalDoc = {
            vendorId: vendor._id,
            vendorEmail: normalizedFrom,
            rfpId: rfp ? rfp._id : null,
            subject: parsed.subject || '',
            inReplyTo: inReplyTo || parsed.messageId || '',
            messageId: parsed.messageId || '',
            rawBody: parsed.text || parsed.html || '',
            parsed: parsedProposal,
            receivedAt: parsed.date || new Date()
        };

        const created = await Proposal.create(proposalDoc);
        return created;
    } catch (err) {
        console.error('processRawEmail error:', err);
        throw err;
    }
};

module.exports = { processRawEmail };
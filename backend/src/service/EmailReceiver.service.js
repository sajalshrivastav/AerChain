const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');
const Proposal = require('../models/Proposal.model');
const Vendor = require('../models/Vendor.model');
const aiService = require('./AI.service');

const config = {
    imap: {
        user: process.env.IMAP_USER,
        password: process.env.IMAP_PASS,
        host: process.env.IMAP_HOST || 'imap.gmail.com',
        port: process.env.IMAP_PORT ? Number(process.env.IMAP_PORT) : 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
        authTimeout: 30000,  // 30 seconds for auth
        connTimeout: 30000   // 30 seconds for connection
    }
};

// Helpers
const normalizeEmail = (email) => (email || '').toString().trim().toLowerCase();
const normalizeMessageId = (id) => {
    if (!id) return '';
    return id.toString().trim().replace(/^</, '').replace(/>$/, '');
};

async function checkInbox() {
    let connection = null;
    try {
        console.log('Checking inbox for new vendor responses...');
        console.log('Connecting to IMAP server:', config.imap.host);

        // 1. Connect to IMAP
        connection = await imaps.connect(config);
        console.log('Connected to IMAP successfully');
        console.log('Opening INBOX...');

        // 2. Open inbox
        await connection.openBox('INBOX');

        // 3. Search for unread emails
        const messages = await connection.search(['UNSEEN'], {
            bodies: ['HEADER', 'TEXT', ''],
            markSeen: false  // Don't mark as seen yet, only after successful processing
        });
        console.log(`Found ${messages.length} unread emails`);
        for (let msg of messages) {
            try {
                const all = msg.parts.find(part => part.which === '');
                const emailBuffer = all && all.body ? all.body : '';
                if (!emailBuffer) {
                    console.log('No body found for message, skipping');
                    continue;
                }

                const parsed = await simpleParser(emailBuffer);

                console.log('Email from:', parsed.from && parsed.from.text ? parsed.from.text : parsed.from);
                console.log('Subject:', parsed.subject);

                const rawMessageId = (parsed.headers && parsed.headers.get ? parsed.headers.get('message-id') : parsed.messageId) || parsed.messageId || '';
                const rawInReplyTo = (parsed.headers && parsed.headers.get ? parsed.headers.get('in-reply-to') : parsed.inReplyTo) || '';
                const messageIdHeader = normalizeMessageId(rawMessageId);
                const inReplyToHeader = normalizeMessageId(rawInReplyTo);
                console.log('Message-ID header:', messageIdHeader, 'In-Reply-To header:', inReplyToHeader);

                if (parsed.subject && parsed.subject.includes('RFP-')) {
                    const rfpIdMatch = parsed.subject.match(/RFP-([a-f0-9]+)/i);
                    if (!rfpIdMatch) {
                        console.log('Could not extract RFP ID from subject');
                        continue;
                    }

                    const rfpId = rfpIdMatch[1];
                    console.log('Found RFP response for RFP ID:', rfpId);
                    const vendorEmailRaw = parsed.from && parsed.from.value && parsed.from.value[0] && parsed.from.value[0].address;
                    const vendorEmail = normalizeEmail(vendorEmailRaw);
                    let vendor = await Vendor.findOne({ email: vendorEmail });

                    let fallbackProposal = null;
                    if (!vendor && inReplyToHeader) {
                        fallbackProposal = await Proposal.findOne({ messageId: inReplyToHeader });
                        if (fallbackProposal) {
                            vendor = await Vendor.findById(fallbackProposal.vendorId);
                            console.log('Fallback matched proposal by In-Reply-To. Using vendor from proposal:', vendor && vendor.email);
                        }
                    }

                    if (!vendor) {
                        console.log('Vendor not found for email:', vendorEmail);
                        continue;
                    }

                    let proposal = await Proposal.findOne({
                        rfpId: rfpId,
                        vendorId: vendor._id
                    });

                    if (!proposal && inReplyToHeader) {
                        proposal = await Proposal.findOne({ messageId: inReplyToHeader });
                        if (proposal) console.log('Fallback: matched proposal by In-Reply-To header (messageId)');
                    }

                    if (!proposal) {
                        console.log('Proposal not found for RFP:', rfpId, 'Vendor:', vendor.name);
                        continue;
                    }

                    // 8. Parse email body with AI
                    const emailBody = parsed.text || parsed.html || '';
                    console.log('Parsing email with AI...');
                    const parsedData = await aiService.parseProposalFromEmail(emailBody);

                    // 9. Update proposal
                    proposal.status = 'received';
                    proposal.raw_email = emailBody;
                    proposal.parsed = parsedData;
                    proposal.ai_summary = parsedData.summary;
                    proposal.receivedAt = new Date();
                    await proposal.save();

                    console.log('Proposal updated successfully for vendor:', vendor.name);

                    // 10. Mark email as seen
                    try {
                        await connection.addFlags(msg.attributes.uid, ['\\Seen']);
                    } catch (flagErr) {
                        try { await connection.addFlags(msg.attributes.uid, '\\Seen'); } catch (e) { }
                    }
                } else {
                    console.log('Email is not an RFP response, skipping');
                }
            } catch (msgError) {
                console.error('Error processing individual email:', msgError && msgError.message ? msgError.message : msgError);

            }
        }

        if (connection) {
            connection.end();
        }
        console.log('Inbox check completed');
    } catch (error) {
        console.error('Error checking inbox:', error && error.message ? error.message : error);
        if (connection) {
            try {
                connection.end();
            } catch (endError) {

            }
        }
        if (error && error.message && (error.message.includes('Timed out') || error.message.includes('timeout'))) {
            console.log('IMAP connection timeout. Please check');
        }
    }
}

async function processPendingProposals() {
    let connection = null;
    try {
        console.log('Checking for pending proposals to process...');

        // Find all pending proposals
        const pendingProposals = await Proposal.find({ status: 'pending' }).populate('vendorId');

        if (pendingProposals.length === 0) {
            console.log('No pending proposals found');
            return;
        }

        console.log(`Found ${pendingProposals.length} pending proposals to process`);
        console.log('Pending proposal IDs:', pendingProposals.map(p => p._id.toString()));

        // Connect to IMAP to fetch emails
        console.log('Connecting to IMAP...');
        connection = await imaps.connect(config);
        console.log('IMAP connected');

        console.log('Opening INBOX...');
        const box = await connection.openBox('INBOX');
        console.log(`INBOX opened (${box.messages.total} total messages)`);

        console.log('Searching for emails...');

        let messages = [];
        try {
            const totalMessages = box.messages.total;
            const startSeq = Math.max(1, totalMessages - 50);

            console.log(`Fetching last 50 emails (${startSeq}:${totalMessages})...`);

            messages = await connection.search([`${startSeq}:*`], {
                bodies: ['HEADER', 'TEXT', ''],
                markSeen: false
            });

            console.log(`Found ${messages.length} recent emails`);
        } catch (searchError) {
            console.log('Sequence search failed, trying ALL...');
            console.error('Search error:', searchError.message);

            // Fallback to ALL (slower but more reliable)
            messages = await connection.search(['ALL'], {
                bodies: ['HEADER'],
                markSeen: false
            });
            console.log(`Found ${messages.length} emails (fallback)`);
        }

        // Extract all message IDs from inbox for debugging
        const inboxMessageIds = [];
        for (let msg of messages) {
            const headerPart = msg.parts.find(part => part.which === 'HEADER');
            if (headerPart && headerPart.body && headerPart.body['message-id']) {
                const rawMsgId = headerPart.body['message-id'][0];
                const normalized = normalizeMessageId(rawMsgId);
                inboxMessageIds.push({ raw: rawMsgId, normalized });
            }
        }
        console.log(`\n Inbox message IDs (showing first 10 of ${inboxMessageIds.length}):`);
        inboxMessageIds.slice(0, 10).forEach((id, idx) => {
            console.log(`   ${idx + 1}. ${id.normalized}`);
        });

        // Process each pending proposal
        for (let proposal of pendingProposals) {
            try {
                console.log(`\n${'='.repeat(60)}`);
                console.log(` Processing pending proposal ${proposal._id}`);
                console.log(`   Vendor: ${proposal.vendorId.name} (${proposal.vendorId.email})`);
                console.log(`   RFP ID: ${proposal.rfpId}`);
                const proposalMsgId = normalizeMessageId(proposal.messageId);
                console.log(`   Looking for messageId:`);
                console.log(`      Raw: ${proposal.messageId}`);
                console.log(`      Normalized: ${proposalMsgId}`);

                // Find the email with matching messageId (normalize both sides)
                let matchingMsg = null;
                let matchedBy = null;

                for (let msg of messages) {
                    const headerPart = msg.parts.find(part => part.which === 'HEADER');
                    if (headerPart && headerPart.body && headerPart.body['message-id']) {
                        const emailMsgId = normalizeMessageId(headerPart.body['message-id'][0]);
                        if (emailMsgId === proposalMsgId) {
                            matchingMsg = msg;
                            matchedBy = 'message-id';
                            break;
                        }
                    }

                    // Also try matching by In-Reply-To header
                    if (headerPart && headerPart.body && headerPart.body['in-reply-to']) {
                        const inReplyTo = normalizeMessageId(headerPart.body['in-reply-to'][0]);
                        if (inReplyTo === proposalMsgId) {
                            matchingMsg = msg;
                            matchedBy = 'in-reply-to';
                            break;
                        }
                    }
                }

                if (!matchingMsg) {
                    console.log(`    Email NOT FOUND in inbox`);
                    console.log(`   Searched ${messages.length} emails but no match for: ${proposalMsgId}`);
                    console.log(`   Possible reasons:`);
                    console.log(`      1. Email was deleted from inbox`);
                    console.log(`      2. MessageId mismatch (check if email was actually sent)`);
                    console.log(`      3. Email is in a different folder (Spam, Trash, etc.)`);
                    continue;
                }

                console.log(`Found matching email (matched by: ${matchedBy})`);

                // Get the email body
                const all = matchingMsg.parts.find(part => part.which === '');
                if (!all || !all.body) {
                    console.log(`    Email body not found in message`);
                    continue;
                }
                const emailBuffer = all.body;

                // Parse email
                console.log(`    Parsing email...`);
                const parsed = await simpleParser(emailBuffer);
                const emailBody = parsed.text || parsed.html || '';

                console.log(`    Email details:`);
                console.log(`      From: ${parsed.from?.text || 'N/A'}`);
                console.log(`      Subject: ${parsed.subject || 'N/A'}`);
                console.log(`      Body length: ${emailBody.length} characters`);
                console.log(`      Body preview: ${emailBody.substring(0, 100)}...`);

                if (!emailBody || emailBody.length < 10) {
                    console.log(`Email body is too short or empty`);
                    continue;
                }

                console.log(`Sending to AI for parsing...`);
                const parsedData = await aiService.parseProposalFromEmail(emailBody);
                console.log(`AI parsing complete`);
                console.log(`   Parsed data:`, JSON.stringify(parsedData, null, 2));

                // Update proposal
                console.log(`Updating proposal in database...`);
                proposal.status = 'received';
                proposal.raw_email = emailBody;
                proposal.parsed = parsedData;
                proposal.ai_summary = parsedData.summary;
                proposal.receivedAt = new Date();
                await proposal.save();

                console.log(`Proposal ${proposal._id} SUCCESSFULLY PROCESSED!`);
                console.log(`Summary: ${parsedData.summary}`);

            } catch (proposalError) {
                console.error(`Error processing proposal ${proposal._id}:`, proposalError.message);
                console.error(proposalError.stack);
            }
        }

        if (connection) {
            connection.end();
        }
        console.log('\n Finished processing pending proposals');

    } catch (error) {
        console.error('\n ERROR processing pending proposals:');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        if (error.source) {
            console.error('Error source:', error.source);
        }
        if (connection) {
            try {
                connection.end();
            } catch (e) {
                // Ignore
            }
        }
    }
}

// Diagnostic function to list all emails in inbox
async function listInboxEmails() {
    let connection = null;
    try {
        console.log(' Listing all emails in inbox...');

        connection = await imaps.connect(config);
        await connection.openBox('INBOX');

        const messages = await connection.search(['ALL'], {
            bodies: ['HEADER'],
            markSeen: false
        });

        console.log(`Found ${messages.length} total emails in inbox`);

        const emailList = [];
        for (let msg of messages) {
            const headerPart = msg.parts.find(part => part.which === 'HEADER');
            if (headerPart && headerPart.body) {
                const headers = headerPart.body;
                emailList.push({
                    messageId: headers['message-id'] ? headers['message-id'][0] : 'N/A',
                    from: headers.from ? headers.from[0] : 'N/A',
                    subject: headers.subject ? headers.subject[0] : 'N/A',
                    date: headers.date ? headers.date[0] : 'N/A'
                });
            }
        }

        if (connection) {
            connection.end();
        }

        return emailList;
    } catch (error) {
        console.error('Error listing inbox emails:', error.message);
        if (connection) {
            try {
                connection.end();
            } catch (e) {
                // Ignore
            }
        }
        throw error;
    }
}

module.exports = { checkInbox, processPendingProposals, listInboxEmails };
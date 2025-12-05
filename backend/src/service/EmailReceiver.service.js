const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');
const Proposal = require('../models/Proposal.model');
const Vendor = require('../models/Vendor.model');
const aiService = require('./AI.service');

const config = {
    imap: {
        user: process.env.IMAP_USER,
        password: process.env.IMAP_PASS,
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
        authTimeout: 30000,  // 30 seconds for auth
        connTimeout: 30000   // 30 seconds for connection
    }
};

async function checkInbox() {
    let connection = null;
    try {
        console.log('Checking inbox for new vendor responses...');
        console.log('Connecting to IMAP server:', config.imap.host);
        
        // 1. Connect to IMAP
        connection = await imaps.connect(config);
        console.log('✅ Connected to IMAP successfully');

        // 2. Open inbox
        await connection.openBox('INBOX');

        // 3. Search for unread emails
        const messages = await connection.search(['UNSEEN'], {
            bodies: ['HEADER', 'TEXT', ''],  // ✅ Fixed: 'TEXT' in quotes
            markSeen: false  // Don't mark as seen yet, only after successful processing
        });

        console.log(`Found ${messages.length} unread emails`);

        // 4. Process each email
        for (let msg of messages) {  // ✅ Fixed: using 'msg' variable
            try {
                // Get the email body
                const all = msg.parts.find(part => part.which === '');
                const emailBuffer = all.body;
                
                // Parse email
                const parsed = await simpleParser(emailBuffer);  // ✅ Fixed: using msg, not messages
                
                console.log('Email from:', parsed.from.text);
                console.log('Subject:', parsed.subject);

                // 5. Check if it's an RFP response
                if (parsed.subject && parsed.subject.includes('RFP-')) {
                    // Extract RFP ID from subject using regex
                    const rfpIdMatch = parsed.subject.match(/RFP-([a-f0-9]+)/i);
                    if (!rfpIdMatch) {
                        console.log('Could not extract RFP ID from subject');
                        continue;
                    }
                    
                    const rfpId = rfpIdMatch[1];
                    console.log('Found RFP response for RFP ID:', rfpId);

                    // 6. Find vendor by email
                    const vendorEmail = parsed.from.value[0].address;
                    const vendor = await Vendor.findOne({ email: vendorEmail });
                    
                    if (!vendor) {
                        console.log('Vendor not found for email:', vendorEmail);
                        continue;
                    }

                    // 7. Find the proposal
                    const proposal = await Proposal.findOne({ 
                        rfpId: rfpId, 
                        vendorId: vendor._id 
                    });

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

                    console.log('✅ Proposal updated successfully for vendor:', vendor.name);

                    // 10. Mark email as seen
                    await connection.addFlags(msg.attributes.uid, ['\\Seen']);
                } else {
                    console.log('Email is not an RFP response, skipping');
                }
            } catch (msgError) {
                console.error('Error processing individual email:', msgError.message);
                // Continue with next email even if one fails
            }
        }

        if (connection) {
            connection.end();
        }
        console.log('Inbox check completed');
    } catch (error) {
        console.error('Error checking inbox:', error.message);
        if (connection) {
            try {
                connection.end();
            } catch (endError) {
                // Ignore errors when closing connection
            }
        }
        
        // Don't throw error, just log it so polling continues
        if (error.message.includes('Timed out') || error.message.includes('timeout')) {
            console.log('⚠️  IMAP connection timeout. Please check:');
            console.log('   1. IMAP is enabled in Gmail settings');
            console.log('   2. App password is correct');
            console.log('   3. No firewall blocking port 993');
        }
    }
}

// Process all pending proposals (for proposals that were created but not processed)
async function processPendingProposals() {
    let connection = null;
    try {
        console.log('🔄 Checking for pending proposals to process...');
        
        // Find all pending proposals
        const pendingProposals = await Proposal.find({ status: 'pending' }).populate('vendorId');
        
        if (pendingProposals.length === 0) {
            console.log('No pending proposals found');
            return;
        }
        
        console.log(`Found ${pendingProposals.length} pending proposals to process`);
        console.log('Pending proposal IDs:', pendingProposals.map(p => p._id.toString()));
        
        // Connect to IMAP to fetch emails
        connection = await imaps.connect(config);
        await connection.openBox('INBOX');
        
        // Search for all emails (not just unseen)
        const messages = await connection.search(['ALL'], {
            bodies: ['HEADER', 'TEXT', ''],
            markSeen: false
        });
        
        console.log(`Found ${messages.length} total emails in inbox`);
        
        // Extract all message IDs from inbox for debugging
        const inboxMessageIds = [];
        for (let msg of messages) {
            const headerPart = msg.parts.find(part => part.which === 'HEADER');
            if (headerPart && headerPart.body && headerPart.body['message-id']) {
                inboxMessageIds.push(headerPart.body['message-id'][0]);
            }
        }
        console.log(`Inbox message IDs (${inboxMessageIds.length}):`, inboxMessageIds.slice(0, 10));
        
        // Process each pending proposal
        for (let proposal of pendingProposals) {
            try {
                console.log(`\n📋 Processing pending proposal ${proposal._id}`);
                console.log(`   Vendor: ${proposal.vendorId.name} (${proposal.vendorId.email})`);
                console.log(`   Looking for messageId: ${proposal.messageId}`);
                
                // Find the email with matching messageId
                const matchingMsg = messages.find(msg => {
                    const headerPart = msg.parts.find(part => part.which === 'HEADER');
                    if (headerPart && headerPart.body && headerPart.body['message-id']) {
                        const emailMsgId = headerPart.body['message-id'][0];
                        return emailMsgId === proposal.messageId;
                    }
                    return false;
                });
                
                if (!matchingMsg) {
                    console.log(`   ❌ Email not found in inbox for messageId: ${proposal.messageId}`);
                    console.log(`   This email may have been deleted or the messageId is incorrect`);
                    continue;
                }
                
                console.log(`   ✅ Found matching email in inbox`);
                
                // Get the email body
                const all = matchingMsg.parts.find(part => part.which === '');
                const emailBuffer = all.body;
                
                // Parse email
                const parsed = await simpleParser(emailBuffer);
                const emailBody = parsed.text || parsed.html || '';
                
                console.log(`   📧 Email body length: ${emailBody.length} characters`);
                console.log(`   🤖 Parsing email with AI...`);
                
                const parsedData = await aiService.parseProposalFromEmail(emailBody);
                
                // Update proposal
                proposal.status = 'received';
                proposal.raw_email = emailBody;
                proposal.parsed = parsedData;
                proposal.ai_summary = parsedData.summary;
                proposal.receivedAt = new Date();
                await proposal.save();
                
                console.log(`   ✅ Proposal ${proposal._id} processed successfully`);
                console.log(`   Summary: ${parsedData.summary}`);
                
            } catch (proposalError) {
                console.error(`   ❌ Error processing proposal ${proposal._id}:`, proposalError.message);
                console.error(proposalError.stack);
            }
        }
        
        if (connection) {
            connection.end();
        }
        console.log('\n✅ Finished processing pending proposals');
        
    } catch (error) {
        console.error('Error processing pending proposals:', error.message);
        console.error(error.stack);
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
        console.log('📋 Listing all emails in inbox...');
        
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
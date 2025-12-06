const express = require('express');
const router = express.Router();
const { simulateVendorResponse, processVendorEmail, processPending, listInbox, processRaw, startPoll, stopPoll } = require('../controllers/Email.controller');

// Simulate receiving a vendor proposal email (for testing)
router.post('/simulate', simulateVendorResponse);

// Process actual vendor email reply (alternative to IMAP)
router.post('/process', processVendorEmail);

// Process raw EML payload (manual testing)
router.post('/process-raw', processRaw);

// Manually trigger processing of all pending proposals
router.post('/process-pending', processPending);

// Start/stop polling (manual control)
router.post('/poll/start', startPoll);
router.post('/poll/stop', stopPoll);

// List all emails in inbox (diagnostic)
router.get('/list-inbox', listInbox);

module.exports = router;
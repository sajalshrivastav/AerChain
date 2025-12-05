const express = require('express');
const router = express.Router();
const { simulateVendorResponse, processVendorEmail, processPending, listInbox } = require('../controllers/Email.controller');

// Simulate receiving a vendor proposal email (for testing)
router.post('/simulate', simulateVendorResponse);

// Process actual vendor email reply (alternative to IMAP)
router.post('/process', processVendorEmail);

// Manually trigger processing of all pending proposals
router.post('/process-pending', processPending);

// List all emails in inbox (diagnostic)
router.get('/list-inbox', listInbox);

module.exports = router;
const express = require('express');
const router = express.Router();
const { simulateVendorResponse } = require('../controllers/Email.controller');

// Simulate receiving a vendor proposal email
router.post('/simulate', simulateVendorResponse);

module.exports = router;
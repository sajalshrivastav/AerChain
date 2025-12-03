const express = require('express');
const router = express.Router();
const { createRFP, getRFPList, generateRfpFromText, sendProposalToVendors, getProposalsForRfp, compareProposals } = require('../controllers/Rfp.controller');

// Generate RFP draft (AI)
router.post('/generate', generateRfpFromText);

// Create RFP
router.post('/', createRFP);

// List RFPs
router.get('/', getRFPList);

// Send RFP to selected vendors
router.post('/:id/send', sendProposalToVendors);

// Get proposals for an RFP
router.get('/:id/proposals', getProposalsForRfp);

// Compare proposals (AI)
router.get('/:id/comparison', compareProposals);

module.exports = router;
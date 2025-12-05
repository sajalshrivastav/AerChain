const express = require('express');
const router = express.Router();
const { createVendor, getListVendor } = require('../controllers/Vendor.controller');

// Create vendor
router.post('/', createVendor);

// List vendors
router.get('/', getListVendor);

//delete Vendor

//update Vendor

module.exports = router;
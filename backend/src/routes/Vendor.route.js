const express = require('express');
const router = express.Router();
const { createVendor, getListVendor, updateVendor, deleteVendor } = require('../controllers/Vendor.controller');

// Create vendor
router.post('/', createVendor);

// List vendors
router.get('/', getListVendor);

//delete Vendor

router.delete('/:id', deleteVendor);

//update Vendor
router.put('/:id', updateVendor);

module.exports = router;
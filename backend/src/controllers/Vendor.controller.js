const { create } = require('../models/Proposal.model');
const Vendor = require('../models/Vendor.model');

const createVendor = async (req, res, next) => {

    try {
        const { name, email } = req.body;
        if (!name || !email) return res.status(400).json({ error: 'name and email required' });

        const vendor = await Vendor.create({ name, email });
        res.status(201).json(vendor);

    } catch (error) {
        console.error('createVendor error', err);
        res.status(500).json({ error: err.message });
    }

}
const getListVendor = async (req, res, next) => {
    try {
        const vendors = await Vendor.find().sort({ name: 1 });
        res.status(200).json(vendors);
    }
    catch (error) {
        console.log('Error while fetching List', err);
        res.status(500).json({ error: err.message });
    }
}


module.exports = { createVendor, getListVendor };
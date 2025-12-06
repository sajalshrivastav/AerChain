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

const updateVendor = async (req, res) => {
    try {
        const { id } = req.params
        const { name, email } = req.body

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email required' })
        }

        // Check if email is already used by another vendor
        const existing = await Vendor.findOne({ email, _id: { $ne: id } })
        if (existing) {
            return res.status(409).json({ error: 'Vendor with this email already exists' })
        }

        const vendor = await Vendor.findByIdAndUpdate(
            id,
            { name, email },
            { new: true, runValidators: true }
        )

        if (!vendor) {
            return res.status(404).json({ error: 'Vendor not found' })
        }

        res.json(vendor)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to update vendor' })
    }
}

const deleteVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const vendor = await Vendor.findByIdAndDelete(id);
        if (!vendor) {
            return res.status(404).json({ error: 'Vendor not found' });
        }
        res.status(200).json({ message: 'Vendor deleted successfully' });
    } catch (err) {
        console.error('deleteVendor error', err);
        res.status(500).json({ error: err.message });
    }
}


module.exports = { createVendor, getListVendor, updateVendor, deleteVendor };
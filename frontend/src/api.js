import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE || '/api';

const client = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": 'application/json' }
});

export default {
    //Vendor APIS
    listVendors: () => client.get('/vendors').then(r => r.data),
    createVendor: (payload) => client.post('/vendors', payload).then(r => r.data),
    updateVendor: (id, payload) => client.put(`/vendors/${id}`, payload).then((r) => r.data),
    deleteVendor: (id) => client.delete(`/vendors/${id}`).then((r) => r.data),

    //Create and Generate RFP APIS
    generateRfpDraft: (text) => client.post('/rfps/generate', { text }).then(r => r.data),
    createRfp: (payload) => client.post('/rfps', payload).then(r => r.data),
    listRfps: () => client.get('/rfps').then(r => r.data),
    sendRfp: (id, vendorIds) => client.post(`/rfps/${id}/send`, { vendorIds }).then(r => r.data),

    //Proposal APIS
    getProposals: (rfpId) => client.get(`/rfps/${rfpId}/proposals`).then(r => r.data),
    compareProposals: (rfpId) => client.get(`/rfps/${rfpId}/comparison`).then(r => r.data),

    //Simulate Email Inbound API
    simulateInbound: (payload) => client.post('/email/simulate', payload).then(r => r.data),
    
    //Email Processing APIs
    processPendingProposals: () => client.post('/email/process-pending').then(r => r.data),
    listInboxEmails: () => client.get('/email/list-inbox').then(r => r.data),
};
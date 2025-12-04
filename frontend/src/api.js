import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE || '/api';

const client = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": 'application/json' }
});

export default {
    listVendors: () => client.get('/vendors').then(r => r.data),
    createVendor: (payload) => client.post('/vendors', payload).then(r => r.data),

    generateRfpDraft: (text) => client.post('/rfps/generate', { text }).then(r => r.data),
    createRfp: (payload) => client.post('/rfps', payload).then(r => r.data),
    listRfps: () => client.get('/rfps').then(r => r.data),
    sendRfp: (id, vendorIds) => client.post(`/rfps/${id}/send`, { vendorIds }).then(r => r.data),

    getProposals: (rfpId) => client.get(`/rfps/${rfpId}/proposals`).then(r => r.data),
    compareProposals: (rfpId) => client.get(`/rfps/${rfpId}/comparison`).then(r => r.data),

    simulateInbound: (payload) => client.post('/email/simulate', payload).then(r => r.data),
};
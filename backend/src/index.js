require('dotenv').config();
const express = require('express');
const app = express();
const connectDB = require('./config/ConnectDB');
const cors = require('cors');
const { startPolling, stopPolling } = require('./service/EmailPoller.service')


app.use(cors());
app.use(express.json());


//Routes
const RFPs = require('./routes/Rfp.route')
const Vendors = require('./routes/Vendor.route');
const Email = require('./routes/Email.route');

const PORT = process.env.PORT || 5000;

app.use('/api/rfps', RFPs);
app.use('/api/vendors', Vendors);
app.use('/api/email', Email);

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        // Enable automatic IMAP polling to detect vendor replies
        startPolling();
        console.log(`Server running on port ${PORT}`)
        // console.log('📧 Email polling started - monitoring for vendor replies');
    });
};
startServer();



process.on('SIGINT', () => {
    console.log('Shutting down...');
    stopPolling();
    process.exit(0);
});
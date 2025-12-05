const nodeMailer = require('nodemailer');
// require('dotenv').config();

//Created a Transported to send email
const Transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Function To Send Email To Vendor
exports.sendMail = async ({ to, subject, text }) => {
    try {
        const info = await Transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject,
            text
        });
        console.log('Email sent successfully to:', to);
        return info;
    } catch (error) {
        console.error('Error While Saving message:', error.message);
        throw error;
    }
};

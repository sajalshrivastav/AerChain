// backend/src/services/mailer.js
// ---------------------------------------------------------------------
// STUB VERSION — works without SMTP setup.
// Logs email to console instead of sending.
// ---------------------------------------------------------------------

exports.sendMail = async ({ to, subject, text }) => {
    console.log("===== MAIL SEND (STUB) =====");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Body:", text);
    console.log("============================");

    // Return fake nodemailer-like info
    return { messageId: `stub-${Date.now()}` };
};

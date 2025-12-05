const { checkInbox, processPendingProposals } = require('./EmailReceiver.service');

let pollingInterval = null;

//Check and Process The Email for Pending Proposal 
async function checkAndProcess() {
    try {
        await checkInbox();
        await processPendingProposals();
    } catch (err) {
        console.error('Email check/process error:', err.message);
    }
}

//Start Polling and Check Email Every 1 Minute
function startPolling() {
    console.log('Email polling started.');
    checkAndProcess();
    pollingInterval = setInterval(() => {
        checkAndProcess();
    }, 60000);
}

// Stop polling
function stopPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        console.log('Email polling stopped');
    }
}

module.exports = { startPolling, stopPolling };

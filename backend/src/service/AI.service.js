// backend/src/services/aiService.js
// ---------------------------------------------------------------------
// STUB VERSION — Works without AI Key.
// Replace with real OpenRouter integration later.
// ---------------------------------------------------------------------

// 1) Generate RFP from natural text (simple stub)
const generateRfpFromText = async (text) => {
    return {
        title: "Auto-generated RFP",
        raw_input: text,
        budget: 50000,
        items: [
            { name: "Laptop", quantity: 20, specs: "16GB RAM" },
            { name: "Monitor", quantity: 15, specs: "27-inch" }
        ],
        delivery_days: 30,
        payment_terms: "Net 30",
        warranty: "1 year"
    };
};

// 2) Parse vendor email (stub)
const parseProposalFromEmail = async (emailBody) => {
    return {
        total_price: 35000,
        delivery_days: 20,
        warranty: "1 year",
        line_items: [],
        summary: "Stub parsed proposal"
    };
};

// 3) Compare proposals (stub)
const compareProposals = async (rfp, proposals) => {
    let best = null;

    proposals.forEach((p) => {
        if (!best || (p.parsed?.total_price < best.parsed?.total_price)) {
            best = p;
        }
    });

    return {
        summary: "Temporary comparison logic",
        recommendation: best
            ? {
                vendorId: best.vendorId,
                reason: "Lowest price (stub)"
            }
            : null,
        scores: proposals.map((p) => ({ vendorId: p.vendorId, score: 50 }))
    };
};

module.exports = { generateRfpFromText, parseProposalFromEmail, compareProposals };

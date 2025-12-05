// AI Prompts Configuration
// All AI prompts are centralized here for easy maintenance and updates

const generateRfpPrompt = (text) => ({
    system: 'You are a helpful assistant that generates structured RFP data. Always respond with valid JSON only.',
    user: `You are an RFP (Request for Proposal) generator. Convert the following natural language description into a structured RFP.

User Input: "${text}"

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
    "title": "Brief descriptive title",
    "raw_input": "${text}",
    "budget": <number>,
    "items": [
        {"name": "item name", "quantity": <number>, "specs": "specifications"}
    ],
    "delivery_days": <number>,
    "payment_terms": "payment terms description",
    "warranty": "warranty description"
}`
});

const parseProposalPrompt = (emailBody) => ({
    system: 'You are a helpful assistant that parses vendor proposals. Always respond with valid JSON only.',
    user: `You are a proposal parser. Extract structured information from this vendor proposal email.

Email Content:
${emailBody}

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
    "total_price": <number>,
    "delivery_days": <number>,
    "warranty": "warranty description",
    "line_items": [
        {"item": "item name", "price": <number>, "quantity": <number>}
    ],
    "summary": "brief summary of the proposal"
}`
});

const compareProposalsPrompt = (rfp, proposalData) => ({
    system: 'You are a procurement analyst. Always respond with valid JSON only.',
    user: `You are a procurement analyst. Compare these vendor proposals for the following RFP and provide a recommendation.

RFP Details:
- Title: ${rfp.title}
- Budget: ${rfp.budget}
- Required Delivery Days: ${rfp.delivery_days}
- Items: ${JSON.stringify(rfp.items)}

Proposals:
${JSON.stringify(proposalData, null, 2)}

Analyze based on: price, delivery time, warranty, and overall value. Return ONLY a valid JSON object (no markdown, no extra text):
{
    "summary": "detailed comparison summary",
    "recommendation": {
        "vendorId": "best vendor ID",
        "reason": "why this vendor is recommended"
    },
    "scores": [
        {"vendorId": "vendor ID", "score": <number 0-100>, "strengths": "key strengths", "weaknesses": "key weaknesses"}
    ]
}`
});

module.exports = {
    generateRfpPrompt,
    parseProposalPrompt,
    compareProposalsPrompt
};

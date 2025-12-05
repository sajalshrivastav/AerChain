const axios = require('axios');
const { generateRfpPrompt, parseProposalPrompt, compareProposalsPrompt } = require('../config/AI.prompts');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const AI_MODEL = process.env.AI_MODEL || 'openai/gpt-4o';
const AI_MODEL_MINI = process.env.AI_MODEL_MINI || 'openai/gpt-4o-mini';

// Validate API key on startup
if (!OPENROUTER_API_KEY) {
    console.error('WARNING: OPENROUTER_API_KEY is not set in .env file');
}

const callOpenRouter = async (messages, model = AI_MODEL, maxTokens = 2000) => {
    try {
        console.log('Calling OpenRouter with model:', model);
        console.log('Max tokens:', maxTokens);
        
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model,
                messages,
                max_tokens: maxTokens
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'http://localhost:3000',
                    'X-Title': 'RFP Management System'
                },
                timeout: 30000
            }
        );
        
        console.log('OpenRouter response received successfully');
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('OpenRouter API Error Details:');
        console.error('Error type:', error.code);
        console.error('Status:', error.response?.status);
        console.error('Data:', JSON.stringify(error.response?.data, null, 2));
        console.error('Message:', error.message);
        console.error('Full error:', error);
        
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            throw new Error('Cannot connect to OpenRouter API. Check your internet connection.');
        }
        
        throw new Error(`AI service unavailable: ${error.response?.data?.error?.message || error.message}`);
    }
};

// 1) Generate RFP from natural text
const generateRfpFromText = async (text) => {
    const prompt = generateRfpPrompt(text);

    const content = await callOpenRouter([
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user }
    ], AI_MODEL_MINI, 1500);

    try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
        return parsed;
    } catch (err) {
        console.error('Failed to parse AI response:', content);
        throw new Error('Invalid AI response format');
    }
};

// 2) Parse vendor email
const parseProposalFromEmail = async (emailBody) => {
    const prompt = parseProposalPrompt(emailBody);

    const content = await callOpenRouter([
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user }
    ], AI_MODEL_MINI, 1000);

    try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
        return parsed;
    } catch (err) {
        console.error('Failed to parse AI response:', content);
        throw new Error('Invalid AI response format');
    }
};

// 3) Compare proposals
const compareProposals = async (rfp, proposals) => {
    if (!proposals || proposals.length === 0) {
        return {
            summary: "No proposals to compare",
            recommendation: null,
            scores: []
        };
    }

    const proposalData = proposals.map(p => ({
        vendorId: p.vendorId,
        status: p.status,
        parsed: p.parsed,
        ai_summary: p.ai_summary
    }));

    const prompt = compareProposalsPrompt(rfp, proposalData);

    const content = await callOpenRouter([
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user }
    ], AI_MODEL_MINI, 2000);

    try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
        return parsed;
    } catch (err) {
        console.error('Failed to parse AI response:', content);
        throw new Error('Invalid AI response format');
    }
};

module.exports = { generateRfpFromText, parseProposalFromEmail, compareProposals };

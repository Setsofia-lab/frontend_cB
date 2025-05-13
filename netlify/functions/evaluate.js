// netlify/functions/evaluate.js

// Import the Google Generative AI SDK
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Import the Anthropic SDK
import Anthropic from '@anthropic-ai/sdk';

// --- Configuration for Gemini ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const geminiModel = genAI ? genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-04-17' }) : null;

// --- Configuration for Anthropic ---
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;
const ANTHROPIC_MODEL_NAME = "claude-3-opus-20240229"; // Or your preferred model

// Generation configuration for Gemini
const geminiGenerationConfig = {
    temperature: 0.7,
    topK: 1,
    topP: 1,
    maxOutputTokens: 8192,
};

// Safety settings for Gemini
const geminiSafetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

/**
 * Constructs the detailed system instructions prompt.
 * @param {object} selectedAssignment - The assignment details.
 * @param {Array<object>} studentCodeFiles - Array of student code files.
 * @returns {string} The formatted system instruction string.
 */
function getSystemInstructions(selectedAssignment, studentCodeFiles) {
    const assignmentName = selectedAssignment?.name || (typeof selectedAssignment === 'string' ? selectedAssignment : 'N/A');
    const combinedCodeContent = studentCodeFiles.map(file => `File: ${file.name}\n\`\`\`\n${file.content}\n\`\`\``).join('\n\n');

    return `Your Role: You are an AI Code Evaluation Assistant and Tutor. Your primary goal is to interact conversationally with a student about the code they have submitted for a specific assignment. You will evaluate both the submitted code and the student's understanding of their own work and development process. Your ultimate aim is to provide constructive feedback, ensure the student understands why they are receiving a particular evaluation, identify areas for improvement, and reach a point where the student agrees with the final assessment before it is submitted to the instructor. Maintain a supportive, encouraging, and collaborative tone throughout.

            Context Provided to You:
            Assignment Details: ${assignmentName}
            Student's Submitted Code:
            ${combinedCodeContent}

            Your Interaction Process with the Student:
            This is a turn-by-turn conversation. Each time you receive a message, provide a single response appropriate for the current stage in the evaluation process.

            Your interaction should be a free-flowing, natural conversation, moving through the evaluation step by step:

            1. Begin by acknowledging the student's submission for the specific assignment. Confirm you have received everything needed to start the evaluation.

            2. Provide initial code analysis & feedback based on the assignment criteria. Focus on 1-2 key observations initially, referring to specific parts of the code (use line numbers or quote snippets).

            3. Throughout the conversation, ask open-ended questions to probe the student's understanding and development process:
               - "Could you walk me through your thought process for [specific function/section]?"
               - "What was the most challenging part of this assignment for you?"
               - "Why did you choose [specific approach] here instead of an alternative?"
               - "What steps did you take to test your code?"

            4. Identify and praise good techniques you observe in their code.
            
            5. After sufficient discussion, provide a summary of the evaluation based on assignment criteria and points discussed.
            
            6. Ask for the student's agreement on your assessment summary before finalizing.
            
            7. If the student disagrees or has questions, continue the dialogue until mutual understanding is reached.
            
            8. Once the student confirms agreement, finalize the evaluation.

            Output Requirements:
            - Use Markdown for formatting: **bold** for emphasis on key terms or action items, and *italics* for highlighting specific code snippets or student quotes.
            - Keep track of where you are in the evaluation process and progress naturally based on the student's responses.
            - Maintain a supportive, encouraging tone throughout.
            `;
}

/**
 * Helper function to standardize conversation history formatting
 * @param {Array} history - The conversation history
 * @param {string} currentMessage - The current user message (if any)
 * @returns {Array} Standardized history array
 */
function standardizeConversationHistory(history, currentMessage) {
    // Ensure history is an array
    const standardHistory = Array.isArray(history) ? [...history] : [];
    
    // If we have a current message and it's not empty, add it to the history
    if (currentMessage && typeof currentMessage === 'string' && currentMessage.trim() !== '') {
        standardHistory.push({
            role: 'user',
            content: currentMessage.trim()
        });
    }
    
    return standardHistory;
}

// --- Netlify Function Handler ---
export const handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    // Validate request method
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed.' }) };
    }

    // Parse request body
    let requestBody;
    try {
        requestBody = JSON.parse(event.body);
    } catch (error) {
        console.error("Error parsing request body:", error);
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Bad Request: Could not parse JSON body.' }) };
    }

    // Extract request data
    const {
        studentCodeFiles,
        selectedAssignment,
        currentMessage,         // Added this field for clarity - the latest student message
        conversationHistory,
        llmChoice,
    } = requestBody;

    // Validate required fields
    if (!studentCodeFiles || !selectedAssignment || !llmChoice) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Bad Request: Missing required fields.' }) };
    }

    // Construct the system instructions
    const systemInstructions = getSystemInstructions(selectedAssignment, studentCodeFiles);

    // Standardize conversation history
    const standardHistory = standardizeConversationHistory(conversationHistory, currentMessage);

    console.log("Processing request with LLM:", llmChoice);
    console.log("Conversation history entries:", standardHistory.length);

    try {
        let llmResponseObject = {}; // To hold text and any metadata like 'blocked' or 'truncated'

        if (llmChoice.toLowerCase() === 'gemini') {
            if (!geminiModel) {
                console.error("Gemini API key or model not configured.");
                return { statusCode: 500, headers, body: JSON.stringify({ error: 'Gemini API not configured.' }) };
            }

            console.log("Using Gemini model");
            
            // Convert history to Gemini format
            const geminiHistory = standardHistory.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content || "" }]
            }));

            try {
                // Start a chat session with proper history
                const chat = geminiModel.startChat({
                    generationConfig: geminiGenerationConfig,
                    safetySettings: geminiSafetySettings,
                });
                
                // Send system instructions as initial context, then get response based on conversation
                const result = await chat.sendMessage(systemInstructions + "\n\nPlease respond to the student based on your current evaluation stage.");
                
                console.log("Gemini response received");
                
                if (result && result.response) {
                    const response = result.response;
                    llmResponseObject.text = response.text();
                    
                    if (response.candidates && response.candidates[0]) {
                        const candidate = response.candidates[0];
                        if (candidate.finishReason === "SAFETY") {
                            console.warn("Gemini response blocked due to safety settings.");
                            llmResponseObject.blocked = true;
                            llmResponseObject.text = "The response was blocked due to safety concerns. Please revise your input.";
                            llmResponseObject.safetyRatings = candidate.safetyRatings;
                        } else if (candidate.finishReason === "MAX_TOKENS") {
                            console.warn("Gemini response truncated due to max tokens.");
                            llmResponseObject.truncated = true;
                        }
                    }
                } else {
                    console.error("No content in Gemini response");
                    throw new Error('Gemini API returned no content or unexpected response structure.');
                }
            } catch (geminiError) {
                console.error("Gemini API Error:", geminiError);
                throw new Error(`Gemini API error: ${geminiError.message}`);
            }

        } else if (llmChoice.toLowerCase() === 'anthropic') {
            if (!anthropic) {
                console.error("Anthropic API key not configured.");
                return { statusCode: 500, headers, body: JSON.stringify({ error: 'Anthropic API not configured.' }) };
            }

            console.log("Using Anthropic model:", ANTHROPIC_MODEL_NAME);
            
            // For Anthropic, we can use standardHistory directly
            const messagesForAnthropic = standardHistory;
            
            try {
                const response = await anthropic.messages.create({
                    model: ANTHROPIC_MODEL_NAME,
                    max_tokens: 4096,
                    system: systemInstructions,
                    messages: messagesForAnthropic
                });
                
                console.log("Anthropic response received");
                
                if (response && response.content && response.content.length > 0) {
                    llmResponseObject.text = response.content.map(block => block.text).join("");
                    if (response.stop_reason === "max_tokens") {
                        console.warn("Anthropic response truncated due to max tokens.");
                        llmResponseObject.truncated = true;
                    }
                } else {
                    console.error("No content in Anthropic response");
                    throw new Error('Anthropic API returned no content.');
                }
            } catch (anthropicError) {
                console.error("Anthropic API Error:", anthropicError);
                throw new Error(`Anthropic API error: ${anthropicError.message}`);
            }

        } else {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: `Unsupported LLM: ${llmChoice}` }),
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ response: llmResponseObject }),
        };

    } catch (error) {
        console.error(`Error processing ${llmChoice} request:`, error);
        let errorMessage = 'An internal server error occurred.';
        if (error.response && error.response.data) {
            errorMessage = JSON.stringify(error.response.data);
        } else if (error.message) {
            errorMessage = error.message;
        }
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: errorMessage, details: error.toString() }),
        };
    }
};
// netlify/functions/evaluate.js

// Import the Google Generative AI SDK
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Import the Anthropic SDK
import Anthropic from '@anthropic-ai/sdk';

// --- Configuration for Gemini ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const geminiModel = genAI ? genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' }) : null;

// --- Configuration for Anthropic ---
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;
const ANTHROPIC_MODEL_NAME = "claude-3-opus-20240229"; // Or your preferred model like claude-3-haiku-20240307

// Generation configuration for Gemini
const geminiGenerationConfig = {
    temperature: 0.7,
    topK: 1,
    topP: 1,
    maxOutputTokens: 8192, // Increased max tokens for potentially longer conversational logs
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
You will be given the following information by the user:
Assignment Details: ${assignmentName}
Student's Submitted Code:
${combinedCodeContent}
Assignment Grading Criteria: (This would ideally be passed from the frontend/database. For now, assume it's part of the assignment details or a general understanding is expected based on the assignment name for '${assignmentName}'.)

Your Interaction Process with the Student:
Your interaction should be a free-flowing, natural conversation, moving through the evaluation step by step. It is crucial to pause and ensure the student is comfortable, understands the feedback, and is ready to proceed before moving to a new topic or phase of the evaluation. Think of this as a review session where you and the student are exploring their work together.
Acknowledge Submission: Begin by acknowledging the student's submission for the specific assignment once they have provided the necessary context (assignment details and code). Confirm that you have received everything needed to start the evaluation. You may ask if they have any initial thoughts or anything else they'd like to add before you begin reviewing the code.

Initial Code Analysis & Feedback: Once the student is ready, you will begin analyzing their submitted code. Base your analysis strictly on the provided assignment criteria (e.g., functionality, correctness, coding style, efficiency, adherence to specific requirements). As you review, provide initial feedback conversationally. Do not list this as a formal "step 1" or "step 2" in your response to the student. Just naturally transition into discussing the code. Focus on 1-2 key observations initially, which could be positive aspects or areas that warrant discussion. Crucially, refer to specific parts of the code when giving feedback. Use line numbers or quote short snippets to illustrate your points (e.g., "Looking at lines 15-20, could you tell me more about how you approached the logic for handling edge cases there?" or "That use of a dictionary in the process_data function around line 45 is quite efficient; that's a good approach.").

Probe Student Understanding & Process: Following the initial code observations, shift the conversation to understand the student's thinking and development process. This is a key part of assessing their understanding. Ask open-ended questions designed to encourage them to explain how they arrived at their solution and their confidence in it. Some examples include:

"Could you walk me through your thought process for writing the [specific function/section name]?"
"What was the most challenging part of this assignment for you, and how did you try to solve it?"
"Why did you choose to use [specific variable/structure/algorithm] here instead of a different approach?"
"Looking back at your code for [specific part], how confident are you that it covers all the requirements mentioned in the assignment?"
"What steps did you take to test your code?"
"Are there any parts of the code you submitted that you're feeling unsure about?"
Encourage the student to respond in a way that feels comfortable to them, whether brief or detailed. Allow them to think aloud and explain their reasoning freely. Remember, it's okay for students to make mistakes or have misunderstandings; this is a learning opportunity. Your role is to help them understand, not penalize them. If they express a misunderstanding or describe an incorrect approach, gently guide them towards the correct concept or a better understanding of the code's behavior, framing it as a way to deepen their knowledge.

Identify and Praise Good Techniques: Throughout the conversation, actively look for and acknowledge positive aspects of their code, good coding practices, or clever solutions they implemented. Point these out specifically, referencing the relevant code, to reinforce good habits and boost their confidence (e.g., "I noticed you implemented error handling on line X; that's really good practice!").

Iterative Dialogue & Refinement: Continue the conversation based on the student's responses to your questions and their reactions to your feedback. Provide further feedback or ask clarifying questions as needed. If the discussion starts to drift away from the evaluation of the assignment code, gently bring it back on track by reminding the student that our current focus is reviewing their submission against the assignment requirements. Maintain the supportive, encouraging, and collaborative tone. Frame feedback as opportunities for learning and improvement.

Summarize and Propose Assessment: Once you feel the core aspects of the code and the student's understanding have been thoroughly discussed, provide a summary of the evaluation. Structure this summary based on the assignment criteria and the points discussed. Phrase it collaboratively: "Okay, based on our discussion about your code, including [mention specific parts we focused on], and your explanations about [mention key points from their responses], here is a summary of the evaluation against the assignment criteria: [Provide a concise summary covering strengths and areas for improvement, directly linked to the criteria]." Clearly explain the reasoning behind the assessment points, linking back to specific code examples, the assignment criteria, and the student's own explanations.

Seek Student Agreement: This is a mandatory step. You must explicitly ask for the student's agreement on the assessment summary you've provided. Phrase it in a way that invites their honest feedback and ensures they feel heard:

"Does this summary and assessment feel fair and accurate to you based on your work and everything we've talked about?"
"Do you feel this evaluation reflects your understanding of the assignment and the effort you put in?"
"Are there any points in this summary that you'd like to discuss more or clarify before we finalize it?"
You cannot conclude the evaluation process until the student explicitly states they agree with the summary.

Handle Disagreement/Questions: If the student disagrees with any part of the summary, asks for clarification, or raises concerns, return to Step 5 (Iterative Dialogue). Discuss their points respectfully, re-evaluate aspects if necessary based on their input or further review, and adjust the explanation or summary until mutual understanding and agreement are reached.

Finalization: Once the student explicitly confirms their agreement (e.g., "Yes, that makes sense," "I agree with that assessment," "That seems fair"), confirm that the evaluation is now finalized and will be recorded or submitted.

Output Requirements:
You must log the entire conversation flow from acknowledging the submission through to the final agreement. This log should include:
The initial student code submission.
Your analysis points and questions asked.
All of the student's responses.
The final agreed-upon assessment summary.
This complete log is crucial for instructor review and understanding the evaluation process.
Use Markdown for formatting: **bold** for emphasis on key terms or action items, and *italics* for highlighting specific code snippets or student quotes.
`;
}

// --- Netlify Function Handler ---
export const handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed.' }) };
    }

    let requestBody;
    try {
        requestBody = JSON.parse(event.body);
    } catch (error) {
        console.error("Error parsing request body:", error);
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Bad Request: Could not parse JSON body.' }) };
    }

    const {
        studentCodeFiles,
        selectedAssignment,
        focusedCriteria, // This might be used to populate "Assignment Grading Criteria" in the system prompt
        conversationHistory,
        llmChoice,
    } = requestBody;

    if (!studentCodeFiles || !selectedAssignment || !llmChoice) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Bad Request: Missing required fields.' }) };
    }

    // Construct the detailed system instructions
    const systemInstructions = getSystemInstructions(selectedAssignment, studentCodeFiles, focusedCriteria);

    try {
        let llmResponseText;
        let llmResponseObject = {}; // To hold text and any other metadata like 'blocked' or 'truncated'

        if (llmChoice.toLowerCase() === 'gemini') {
            if (!geminiModel) {
                console.error("Gemini API key or model not configured.");
                return { statusCode: 500, headers, body: JSON.stringify({ error: 'Gemini API not configured.' }) };
            }

            // Add better debug logging
            console.log("Gemini API Key configured:", !!GEMINI_API_KEY);
            console.log("Gemini model initialized:", !!geminiModel);

            // Convert conversation history to Gemini format
            const chatHistoryForGemini = (conversationHistory || []).map(msg => {
                return {
                    role: msg.role === 'assistant' ? 'model' : 'user', 
                    parts: [{ text: msg.content || (msg.parts && msg.parts.map(p => p.text || p).join("\n")) || "" }]
                };
            });

            const contents = [
                // First "user" turn includes the system instructions and initial context
                { role: "user", parts: [{ text: systemInstructions }] },
                // Then, the existing conversation history
                ...chatHistoryForGemini
            ];

            console.log("Sending to Gemini. Number of content blocks:", contents.length);
            
            try {
                const result = await geminiModel.generateContent({
                    contents: contents,
                    generationConfig: geminiGenerationConfig,
                    safetySettings: geminiSafetySettings,
                });
                
                console.log("Gemini raw response:", JSON.stringify(result, null, 2));
                
                const response = result.response;
                if (response && response.candidates && response.candidates.length > 0) {
                    const candidate = response.candidates[0];
                    llmResponseText = candidate.content.parts.map(part => part.text).join("");
                    llmResponseObject.text = llmResponseText;

                    if (candidate.finishReason === "SAFETY") {
                        console.warn("Gemini response blocked due to safety settings.");
                        llmResponseObject.blocked = true;
                        llmResponseObject.text = "The response was blocked due to safety concerns. Please revise your input or adjust safety settings if appropriate.";
                        llmResponseObject.safetyRatings = candidate.safetyRatings;
                    } else if (candidate.finishReason === "MAX_TOKENS") {
                        console.warn("Gemini response truncated due to max tokens.");
                        llmResponseObject.truncated = true;
                    }
                } else if (response && response.promptFeedback) {
                    console.warn("Gemini prompt feedback:", response.promptFeedback);
                    llmResponseObject.text = "The prompt was blocked by Gemini. Please revise your input.";
                    llmResponseObject.blocked = true;
                    llmResponseObject.promptFeedback = response.promptFeedback;
                } else {
                    console.error("No content in Gemini response:", result);
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

            // Add better debug logging
            console.log("Anthropic API Key configured:", !!ANTHROPIC_API_KEY);
            console.log("Anthropic client initialized:", !!anthropic);

            // Convert conversation history to Anthropic format
            const messagesForAnthropic = (conversationHistory || []).map(msg => {
                return {
                    role: msg.role,
                    content: msg.content || (msg.parts && msg.parts.map(p => p.text || p).join("\n")) || ""
                };
            });

            if (messagesForAnthropic.length === 0) {
                messagesForAnthropic.push({ role: "user", content: "Please begin the evaluation based on the system instructions and provided context." });
            }

            console.log("Sending to Anthropic. Messages count:", messagesForAnthropic.length);
            
            try {
                const response = await anthropic.messages.create({
                    model: ANTHROPIC_MODEL_NAME,
                    max_tokens: 4096,
                    system: systemInstructions,
                    messages: messagesForAnthropic
                });
                
                console.log("Anthropic raw response:", JSON.stringify(response, null, 2));

                if (response && response.content && response.content.length > 0) {
                    llmResponseText = response.content.map(block => block.text).join("");
                    llmResponseObject.text = llmResponseText;
                    if (response.stop_reason === "max_tokens") {
                        console.warn("Anthropic response truncated due to max tokens.");
                        llmResponseObject.truncated = true;
                    }
                } else {
                    console.error("No content in Anthropic response:", response);
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
        // Check for more specific error messages from SDKs
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
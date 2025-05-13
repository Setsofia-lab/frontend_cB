// src/ragHandler.js

// API keys are now managed by the Python backend.
// This file will be responsible for calling our Python backend.

const BACKEND_API_URL = '/.netlify/functions/evaluate'; // Updated to live Elastic Beanstalk URL

/**
 * Reads file content as a base64 string to send in JSON.
 * Alternatively, could use FormData for multipart/form-data uploads if backend supports it.
 */
const readFileAsBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      // event.target.result is a data URL like "data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=="
      // We only want the base64 part after the comma.
      const base64String = event.target.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file); // Read as data URL to get base64
  });
};

/**
 * Reads file content as plain text.
 */
const readFileContent = (file) => { // This can still be used if backend expects raw text
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};


/**
 * Generates an evaluation by calling the Python backend.
 * @param {Array<File>} studentCodeFiles - Array of student code files.
 * @param {Object} selectedAssignment - The selected assignment object.
 * @param {string} focusedCriteria - Specific criteria text from the student (current student message).
 * @param {Array<Object>} conversationHistory - Array of previous messages.
 * @param {string} llmChoice - 'gemini' or 'anthropic'.
 * @returns {Promise<string>} - The LLM's evaluation from the backend.
 */
export const getLlmEvaluation = async (studentCodeFiles, selectedAssignment, focusedCriteria, conversationHistory, llmChoice = 'gemini') => {
  try {
    const filesData = await Promise.all(
      studentCodeFiles.map(async (file) => {
        const content = await readFileContent(file); // Or readFileAsBase64 if backend expects that
        return { name: file.name, content: content };
      })
    );

    const payload = {
      studentCodeFiles: filesData,
      selectedAssignment: selectedAssignment, 
      focusedCriteria: focusedCriteria, // This is the current student message
      conversationHistory: conversationHistory, // Send the chat history
      llmChoice: llmChoice,
    };

    console.log("Sending to backend:", BACKEND_API_URL, "with payload:", payload);

    const response = await fetch(`${BACKEND_API_URL}/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log("Backend response status:", response.status, response.statusText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error("Backend error response (JSON):", errorData);
      } catch (e) {
        // If response is not JSON, try to get text
        const errorText = await response.text();
        console.error("Backend error response (Text):", errorText);
        errorData = { error: errorText || "Unknown error from backend, non-JSON response." };
      }
      throw new Error(`Backend error: ${response.status} ${response.statusText} - ${errorData.error || 'Failed to get evaluation.'}`);
    }

    const data = await response.json();
    console.log("Data from backend:", data);
    console.log("Checking data.response:", data.response);
    console.log("Checking data.response.text:", data.response ? data.response.text : 'data.response is null or undefined');


    // FIXED: Extract text from the actual response structure
    if (data.response && data.response.text) {
      return data.response.text;
    } else {
      console.error("Unexpected response format:", data);
      return "Error: Unexpected response format from the backend.";
    }

  } catch (error) {
    // This catch block handles network errors or errors thrown from the !response.ok block
    console.error("Error in getLlmEvaluation (fetch or processing backend error):", error);
    return `Error: Could not connect to backend or process request. ${error.message}`;
  }
};

// LLM choice can now be a parameter sent to the backend, or backend can have its own logic.
// For simplicity, we'll let the frontend suggest it, and backend can override or use it.
export const chooseLlm = () => {
  // This function can still exist to provide a default or suggestion to the backend.
  // The actual API key check will happen on the backend.
  // For now, let's assume we default to Gemini if not specified or let backend decide.
  return 'gemini'; 
};

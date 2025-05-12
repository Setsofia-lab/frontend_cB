from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.generativeai as genai
from anthropic import Anthropic
import json # For logging
import datetime # For timestamps

# Load environment variables using python-dotenv if available, otherwise os.environ
try:
    from dotenv import load_dotenv
    load_dotenv() 
except ImportError:
    print("python-dotenv not found, ensure environment variables are set manually if not using a .env file in backend.")

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")

app = Flask(__name__)
CORS(app)

# Initialize LLM clients
gemini_model = None
if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel('gemini-2.0-pro-exp-02-05') # Trying another common model
        print("Gemini client initialized successfully")
    except Exception as e:
        print(f"Error initializing Gemini client: {e}")
else:
    print("GEMINI_API_KEY not found. Gemini features will be disabled.")

anthropic_client = None
if ANTHROPIC_API_KEY:
    try:
        anthropic_client = Anthropic(api_key=ANTHROPIC_API_KEY)
        print("Anthropic client initialized successfully.")
    except Exception as e:
        print(f"Error initializing Anthropic client: {e}")
else:
    print("ANTHROPIC_API_KEY not found. Anthropic features will be disabled.")


@app.route('/')
def home():
    return "Python Backend for Code Buddy is running!"

@app.route('/api/evaluate', methods=['POST'])
def evaluate_code():
    data = request.json
    student_code_files_data = data.get('studentCodeFiles', []) 
    selected_assignment = data.get('selectedAssignment', {}) 
    focused_criteria = data.get('focusedCriteria', '') # This is the current student message
    conversation_history_frontend = data.get('conversationHistory', []) # Get history from frontend
    llm_choice = data.get('llmChoice', 'gemini') 

    # focused_criteria (current student message) is essential for subsequent turns.
    # For the very first turn (student clicks "Start Evaluation" with empty input), 
    # focused_criteria will be "Initial submission, ready for analysis." as sent by frontend.
    if not student_code_files_data or not selected_assignment:
        return jsonify({"error": "Missing required data: student code or assignment details."}), 400
    if not focused_criteria: # Should not happen if frontend sends default for initial turn
        return jsonify({"error": "Missing student message/focused criteria."}), 400


    combined_code_content = ""
    for file_data in student_code_files_data:
        combined_code_content += f"\n\n--- File: {file_data.get('name', 'Unknown File')} ---\n{file_data.get('content', '')}"

    # Constructing the detailed prompt based on your instructions
    # The 'focused_criteria' from the student will be the initial conversational message.
    # The assignment details and grading criteria would ideally be more structured.
    # For now, selected_assignment.name acts as "Assignment Details"
    # and focused_criteria from student acts as the initial conversational turn.
    
    system_instructions = f"""Your Role: You are an AI Code Evaluation Assistant and Tutor. Your primary goal is to interact conversationally with a student about the code they have submitted for a specific assignment. You will evaluate both the submitted code and the student's understanding of their own work and development process. Your ultimate aim is to provide constructive feedback, ensure the student understands why they are receiving a particular evaluation, identify areas for improvement, and reach a point where the student agrees with the final assessment before it is submitted to the instructor. Maintain a supportive, encouraging, and collaborative tone throughout.
                    Context Provided to You:
                    You will be given the following information by the user:
                    Assignment Details: {selected_assignment.get('name', 'N/A')}
                    Student's Submitted Code: {combined_code_content}
                    Assignment Grading Criteria: (This would ideally be passed from the frontend/database. For now, assume it's part of the assignment details or a general understanding is expected based on the assignment name for '{selected_assignment.get('name', 'N/A')}'.)
                    
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
    """
    
    # The 'focused_criteria' from the student is their first message in this interaction.
    # For subsequent turns, the conversation history is received but we will simplify how it's used in the prompt.
    # The LLM will rely on the detailed system prompt and the current student message.
    
    current_student_message = focused_criteria 

    # The LLM is expected to manage conversational context based on the system prompt's guidance.
    
    # Prepare conversation history for LLM
    # For Gemini, history is a list of {'role': 'user'/'model', 'parts': [{'text': ...}]}
    # For Anthropic, history is a list of {'role': 'user'/'assistant', 'content': ...}
    
    llm_history = []
    for msg in conversation_history_frontend:
        if msg.get('sender') == 'user':
            llm_history.append({'role': 'user', 'parts': [{'text': msg.get('text')}]})
        elif msg.get('sender') == 'bot': # Assuming 'bot' maps to 'model' for Gemini
            llm_history.append({'role': 'model', 'parts': [{'text': msg.get('text')}]})

    # Add the current student message to the history for the LLM
    llm_history.append({'role': 'user', 'parts': [{'text': current_student_message}]})
    
    # The system_instructions will be given to Gemini as a special initial part of the history,
    # or as a system prompt for Anthropic if the SDK/model supports it directly.
    # For Gemini, we can prepend system instructions as a 'user' message then a 'model' ack.
    # Or, more simply, include it as part of the first user message in the history if the history is empty.

    # For Anthropic, the system prompt is a top-level parameter.
    anthropic_messages_for_llm = []
    for msg in conversation_history_frontend: # Convert to Anthropic format
        anthropic_messages_for_llm.append({
            "role": "user" if msg.get('sender') == 'user' else "assistant",
            "content": msg.get('text')
        })
    anthropic_messages_for_llm.append({"role": "user", "content": current_student_message})


    print(f"Received evaluation request for assignment: {selected_assignment.get('name')}")
    print(f"LLM choice: {llm_choice}")

    llm_response_text = "Error: LLM not available or an issue occurred."
    # Log entry setup (moved slightly down to ensure all parts are ready)
    log_entry = {
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "student_id": "student123", 
        "assignment_id": selected_assignment.get('id'),
        "assignment_name": selected_assignment.get('name'),
        "student_code_files": [f.get('name') for f in student_code_files_data],
        "conversation_turns_logged": len(conversation_history_frontend) + 1, # current turn included
        "llm_used": llm_choice,
        "llm_response": None, 
        "evaluation_summary": None 
    }
    # Full conversation for logging (includes current exchange)
    full_conversation_for_log = conversation_history_frontend + \
                               [{"role": "user", "content": current_student_message}] 
                               # LLM response will be added to this before saving the log

    if llm_choice == 'gemini' and gemini_model:
        try:
            # For Gemini, pass the system instructions and then the history.
            # The generate_content method can take a list of alternating user/model messages.
            # We'll construct the full conversation including the system prompt.
            # A common pattern is: [system_prompt (as user), model_ack, user_turn1, model_turn1, ...]
            
            # Simplified: Send system instructions as part of the first user message if history is empty,
            # or rely on the model to pick up system instructions from the main text if history is present.
            # A more robust way for Gemini is to use `system_instruction` parameter if available with the model object,
            # or structure the history carefully.
            # For now, we'll prepend system instructions to the history for Gemini.
            
            gemini_prompt_parts = [
                {'role': 'user', 'parts': [{'text': system_instructions }]}, # System prompt as first user turn
                {'role': 'model', 'parts': [{'text': "Okay, I understand my role and the context. I'm ready to assist the student."}]} # Model's acknowledgment
            ]
            gemini_prompt_parts.extend(llm_history) # Add the actual conversation history including current student message

            response = gemini_model.generate_content(gemini_prompt_parts)
            llm_response_text = response.text
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            llm_response_text = f"Error from Gemini: {str(e)}"
            log_entry["llm_response"] = llm_response_text
            append_log(log_entry)
            return jsonify({"error": llm_response_text}), 500

    elif llm_choice == 'anthropic' and anthropic_client:
        try:
            response = anthropic_client.messages.create(
                model="claude-3-opus-20240229", 
                max_tokens=1500,
                messages=[{"role": "user", "content": prompt_for_llm}] 
            )
            llm_response_text = response.content[0].text
        except Exception as e:
            print(f"Error calling Anthropic API: {e}")
            llm_response_text = f"Error from Anthropic: {str(e)}"
            log_entry["llm_response"] = llm_response_text # Log error
            # full_conversation_for_log.append({"role": "assistant", "content": llm_response_text}) # Log error as assistant response
            # append_log({**log_entry, "conversation": full_conversation_for_log})
            return jsonify({"error": llm_response_text}), 500
    else:
        error_message = "No LLM API keys configured on the backend."
        if llm_choice == 'gemini' and not GEMINI_API_KEY:
             error_message = "Gemini API key not configured on the backend."
        elif llm_choice == 'anthropic' and not ANTHROPIC_API_KEY:
             error_message = "Anthropic API key not configured on the backend."
        elif llm_choice not in ['gemini', 'anthropic']:
            error_message = f"Invalid LLM choice: {llm_choice}."
        else: 
            error_message = f"Selected LLM ({llm_choice}) client failed to initialize on the backend."
        
        llm_response_text = error_message
        log_entry["llm_response"] = llm_response_text
        full_conversation_for_log.append({"role": "assistant", "content": llm_response_text})
        append_log({**log_entry, "conversation": full_conversation_for_log})
        return jsonify({"evaluation": llm_response_text }) 

    log_entry["llm_response"] = llm_response_text
    full_conversation_for_log.append({"role": "assistant", "content": llm_response_text})
    append_log({**log_entry, "conversation": full_conversation_for_log})

    return jsonify({"evaluation": llm_response_text})

LOG_FILE = 'conversation_logs.json'

def append_log(log_entry):
    try:
        with open(LOG_FILE, 'r+') as f:
            try:
                logs = json.load(f)
            except json.JSONDecodeError:
                logs = [] # Initialize if file is empty or corrupt
            logs.append(log_entry)
            f.seek(0)
            json.dump(logs, f, indent=4)
            f.truncate()
    except FileNotFoundError:
        with open(LOG_FILE, 'w') as f:
            json.dump([log_entry], f, indent=4)
    except Exception as e:
        print(f"Error writing to log file: {e}")


@app.route('/api/logs', methods=['GET'])
def get_logs():
    try:
        with open(LOG_FILE, 'r') as f:
            logs = json.load(f)
        return jsonify(logs)
    except FileNotFoundError:
        return jsonify([])
    except Exception as e:
        print(f"Error reading log file: {e}")
        return jsonify({"error": "Could not retrieve logs."}), 500

if __name__ == '__main__':
    # The port is now set by the CMD in Dockerfile or FLASK_RUN_PORT env var
    # For local running without Docker, you might want to specify port here:
    # app.run(debug=True, port=os.environ.get('FLASK_RUN_PORT', 5001))
    # However, when run via `flask run` (as in Docker CMD), it respects FLASK_RUN_PORT or defaults.
    # The CMD ["flask", "run", "--port=5001"] in Dockerfile explicitly sets it.
    app.run(debug=True) # Flask will use its default or what's set by CMD/env

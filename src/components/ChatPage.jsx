// components/ChatPage.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown
import remarkGfm from 'remark-gfm'; // Import remark-gfm for GitHub Flavored Markdown
import styles from './ChatPage.module.css';
import Sidebar from './Sidebar';
import { getLlmEvaluation, chooseLlm } from '../ragHandler';

// Updated placeholder for assignment criteria
const availableAssignments = [
  { id: 'assign1', name: 'Assignment 1: Basic Python Functions', type: 'python', icon: '🐍' },
  { id: 'assign2', name: 'Assignment 2: Data Structures in Python', type: 'python', icon: '🐍' },
  { id: 'assign3', name: 'Assignment 3: Object-Oriented Programming', type: 'python', icon: '🐍' },
  { id: 'project1', name: 'Project 1: Web Scraper', type: 'python', icon: '🐍' },
  { id: 'htmlcss1', name: 'Lab 1: HTML & CSS Basics', type: 'html', icon: '🌐' },
  { id: 'golang1', name: 'GoLang Concurrency Task', type: 'go', icon: '🐹' }, // Go Gopher
  { id: 'matlab1', name: 'Matlab Signal Processing', type: 'matlab', icon: '📈' },
  { id: 'textanalysis1', name: 'Text Analysis Report', type: 'text', icon: '📄' },
];

const getAssignmentTypeIcon = (type) => {
  const assignment = availableAssignments.find(a => a.type === type);
  if (assignment && assignment.icon) return assignment.icon;

  // Fallback text icons if emoji not found or for other types
  switch (type) {
    case 'python': return '[PY]';
    case 'html': return '[HTML]';
    case 'go': return '[GO]';
    case 'matlab': return '[M]';
    case 'text': return '[TXT]';
    default: return '[?]';
  }
};


function ChatPage() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Welcome to Code Buddy! Upload your code file(s) and select an assignment. Then, tell me what you'd like to focus on.", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [studentCodeFiles, setStudentCodeFiles] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false); 

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const MAX_FILES = 6; 

  const onDropStudentCode = useCallback(acceptedFiles => {
    if (studentCodeFiles.length >= MAX_FILES) {
      setMessages(prevMessages => [
        ...prevMessages,
        { id: Date.now(), text: `You can upload a maximum of ${MAX_FILES} code files.`, sender: 'bot' }
      ]);
      return;
    }

    const filesToAdd = acceptedFiles.slice(0, MAX_FILES - studentCodeFiles.length); 

    const newFiles = filesToAdd.filter(file => 
      (file.name.endsWith('.py') || file.name.endsWith('.txt') || file.name.endsWith('.ipynb'))
    );

    if (newFiles.length > 0) {
      setStudentCodeFiles(prevFiles => [...prevFiles, ...newFiles]); 
      const fileNames = newFiles.map(f => f.name).join(', ');
      setMessages(prevMessages => [
        ...prevMessages,
        { id: Date.now(), text: `Student code file(s) uploaded: ${fileNames}`, sender: 'user' },
      ]);
    } else if (acceptedFiles.length > 0) { 
        setMessages(prevMessages => [
            ...prevMessages,
            { id: Date.now(), text: "Invalid student code file type(s). Please upload .py, .txt, or .ipynb files.", sender: 'bot' }
        ]);
    }
  }, [studentCodeFiles.length]);

  const { getRootProps: getStudentCodeRootProps, getInputProps: getStudentCodeInputProps, isDragActive: isStudentCodeDragActive } = useDropzone({
    onDrop: onDropStudentCode,
    accept: {
      'text/python': ['.py'],
      'text/plain': ['.txt'],
      'application/x-ipynb+json': ['.ipynb']
    },
    multiple: true, 
  });

  const handleSendMessage = async () => {
    if (!canSendMessage || isEvaluating) {
      console.log("handleSendMessage returned early. canSendMessage:", canSendMessage, "isEvaluating:", isEvaluating);
      return;
    }

    const studentMessageText = inputText;
    setInputText('');

    const currentConversation = [...messages]; // Capture history before adding new user message for this turn
    
    const userMessagePayload = { id: Date.now(), text: studentMessageText, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessagePayload]);
    
    setIsEvaluating(true);

    const thinkingMessage = { id: Date.now() + 1, text: "Code Buddy is thinking...", sender: 'bot', type: 'loading' };
    setMessages(prevMessages => [...prevMessages, thinkingMessage]);

    const assignmentObject = availableAssignments.find(a => a.id === selectedAssignment);
    const llm = chooseLlm(); 

    if (!llm) {
      const errorMessage = { id: Date.now() + 2, text: "Error: No LLM is available or configured. Please check API keys.", sender: 'bot' };
      setMessages(prevMessages => prevMessages.filter(m => m.id !== thinkingMessage.id).concat(errorMessage));
      setIsEvaluating(false);
      return;
    }
    
    try {
      const evaluation = await getLlmEvaluation(
        studentCodeFiles, 
        assignmentObject, 
        studentMessageText || "Initial submission, ready for analysis.", // Student's current message
        currentConversation, // Pass the history up to this point
        llm
      );
      const botResponse = { id: Date.now() + 2, text: evaluation, sender: 'bot' };
      setMessages(prevMessages => prevMessages.filter(m => m.id !== thinkingMessage.id).concat(botResponse));
    } catch (error) {
      console.error("Evaluation error:", error);
      const errorMessage = { id: Date.now() + 2, text: `Sorry, I encountered an error: ${error.message}`, sender: 'bot' };
      setMessages(prevMessages => prevMessages.filter(m => m.id !== thinkingMessage.id).concat(errorMessage));
    } finally {
      setIsEvaluating(false); 
    }
  };
  
  const handleRemoveStudentCode = (fileNameToRemove, e) => {
    e.stopPropagation(); 
    setStudentCodeFiles(prevFiles => prevFiles.filter(file => file.name !== fileNameToRemove));
    setMessages(prev => [...prev, {id: Date.now(), text: `File removed: ${fileNameToRemove}`, sender: 'system'}]);
  }

  const handleAssignmentChange = (e) => {
    const assignmentId = e.target.value;
    setSelectedAssignment(assignmentId);
    if (assignmentId) {
        const assignment = availableAssignments.find(a => a.id === assignmentId);
        setMessages(prev => [...prev, {id: Date.now(), text: `Selected assignment: ${getAssignmentTypeIcon(assignment.type)} ${assignment.name}`, sender: 'user'}]);
    }
  };

  const canSendMessage = studentCodeFiles.length > 0 && selectedAssignment;
  const isFirstUserMessageInSession = messages.filter(m => m.sender === 'user').length === 0;


  return (
    <div className={styles.chatPageLayout}> {/* Outermost container */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      {/* Main content area that will shift based on sidebar state */}
      <div className={`${styles.mainContent} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        {/* chatContainer is now the direct child of mainContent and represents the central chat column */}
        <div className={styles.chatContainer}> 
          <div className={styles.chatHeader}>
            {!isSidebarOpen && (
              <button onClick={toggleSidebar} className={styles.sidebarToggle}>
                &#9776; 
              </button>
            )}
            <h2>🤖 Code Buddy Evaluation</h2>
          </div>
          <div className={styles.messageList}>
            {messages.map(msg => (
              <div key={msg.id} className={`${styles.message} ${styles[msg.sender]} ${msg.sender === 'system' ? styles.systemMessage : ''} ${msg.type === 'loading' ? styles.loading : ''}`}>
                {msg.sender === 'bot' && msg.type !== 'loading' ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            ))}
          </div>

          <div className={styles.controlsArea}>
            <div className={styles.fileUploadSection}>
              <h4>📄 1. Upload Your Code (1-{MAX_FILES} files)</h4>
              <div className={styles.fileUploadArea} {...getStudentCodeRootProps()}>
                <input {...getStudentCodeInputProps()} />
                {isStudentCodeDragActive ? (
                  <p>Drop your code files here...</p>
                ) : studentCodeFiles.length < MAX_FILES ? (
                  <p>Drag & drop .py, .txt, .ipynb, or click (up to {MAX_FILES - studentCodeFiles.length} more)</p>
                ) : (
                  <p>Maximum {MAX_FILES} files uploaded.</p>
                )}
              </div>
              {studentCodeFiles.length > 0 && (
                <div className={styles.fileList}>
                  {studentCodeFiles.map(file => (
                    <div key={file.name} className={styles.filePreview}>
                      <span>{getAssignmentTypeIcon(file.name.split('.').pop())} {file.name}</span>
                      <button onClick={(e) => handleRemoveStudentCode(file.name, e)} className={styles.removeFileButton}>&times;</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.assignmentSelectionSection}>
              <h4>📚 2. Select Assignment</h4>
              <select 
                value={selectedAssignment} 
                onChange={handleAssignmentChange} 
                className={styles.assignmentDropdown}
                disabled={studentCodeFiles.length === 0}
              >
                <option value="" disabled>-- Choose an Assignment --</option>
                {availableAssignments.map(assign => (
                  <option key={assign.id} value={assign.id}>
                    {assign.icon} {assign.name}
                  </option>
                ))}
              </select>
            </div>
          </div> {/* End of controlsArea */}

          <div className={styles.chatInput}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={canSendMessage ? "Type your message or press button to begin..." : "Upload code & select assignment first..."}
              disabled={!canSendMessage || isEvaluating}
            />
            <button 
              onClick={handleSendMessage} 
              disabled={!canSendMessage || isEvaluating} 
              className={styles.evaluateButton}
            >
              {isEvaluating ? "Processing..." : (isFirstUserMessageInSession && canSendMessage ? "Start Evaluation" : "Send")}
            </button>
          </div>
        </div> {/* End of chatContainer */}
      </div> {/* End of mainContent */}
    </div> /* End of chatPageLayout */
  );
}

export default ChatPage;

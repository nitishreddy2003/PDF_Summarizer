import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [files, setFiles] = useState([]);
  const [length, setLength] = useState("Medium");
  const [summary, setSummary] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Simulated API calls (replace with your actual axios calls)
  const handleSummarize = async () => {
    setLoading(true);
    const formData = new FormData();
    [...files].forEach(file => formData.append("files", file));
    formData.append("length", length);

    try {
      const res = await axios.post("http://localhost:8000/summarize/", formData);
      setSummary(res.data.summary);
    } catch (error) {
      alert("Error while summarizing");
    } finally {
      setLoading(false);
    }
  };

  const handleQuestion = async () => {
    setLoading(true);
    const formData = new FormData();
    [...files].forEach(file => formData.append("files", file));
    formData.append("question", question);

    try {
      const res = await axios.post("http://localhost:8000/question/", formData);
      setAnswer(res.data.answer);
    } catch (error) {
      alert("Error while fetching answer");
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFiles(e.dataTransfer.files);
    }
  };

  return (
    <div style={styles.container}>
      {/* Animated background elements */}
      <div style={styles.backgroundElements}>
        <div style={{...styles.bgElement, ...styles.bgElement1}}></div>
        <div style={{...styles.bgElement, ...styles.bgElement2}}></div>
        <div style={{...styles.bgElement, ...styles.bgElement3}}></div>
      </div>

      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <svg style={styles.headerIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 style={styles.title}>
            SmartPDF: Summarization and Question-Answering System
          </h1>
          <p style={styles.subtitle}>
            Transform your PDFs into insights with powerful AI summarization and intelligent Q&A
          </p>
        </div>

        {/* File Upload Section */}
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <div style={{...styles.sectionIcon, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)'}}>
              <svg style={styles.sectionIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h2 style={styles.sectionTitle}>Upload Documents</h2>
          </div>

          <div 
            style={{
              ...styles.dropZone,
              ...(dragActive ? styles.dropZoneActive : {})
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <svg style={styles.dropZoneIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p style={styles.dropZoneText}>
              Drag & drop your PDFs here, or click to browse
            </p>
            <input 
              type="file" 
              accept=".pdf" 
              multiple 
              onChange={e => setFiles(e.target.files)} 
              style={styles.hiddenInput}
              id="file-upload"
            />
            <label 
              htmlFor="file-upload" 
              style={styles.uploadButton}
            >
              <svg style={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Choose Files
            </label>
            
            {files.length > 0 && (
              <div style={styles.filesSelected}>
                <svg style={styles.checkIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{files.length} file{files.length > 1 ? 's' : ''} selected</span>
              </div>
            )}
          </div>

          <div style={styles.controlsRow}>
            <div style={styles.selectContainer}>
              <label style={styles.label}>Summary Length</label>
              <select 
                value={length} 
                onChange={e => setLength(e.target.value)} 
                style={styles.select}
              >
                <option value="Short">Short & Concise</option>
                <option value="Medium">Medium Detail</option>
                <option value="Long">Comprehensive</option>
              </select>
            </div>
            
            <button 
              onClick={handleSummarize} 
              disabled={loading || files.length === 0} 
              style={{
                ...styles.primaryButton,
                ...(loading || files.length === 0 ? styles.buttonDisabled : {})
              }}
            >
              {loading ? (
                <>
                  <div style={styles.spinner}></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg style={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Summarize
                </>
              )}
            </button>
          </div>
        </div>

        {/* Summary Results */}
        {summary && (
          <div style={{...styles.card, ...styles.resultCard, borderColor: '#3b82f6'}}>
            <div style={styles.sectionHeader}>
              <div style={{...styles.sectionIcon, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)'}}>
                <svg style={styles.sectionIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 style={styles.sectionTitle}>Document Summary</h3>
            </div>
            <div style={styles.resultContent}>
              <p style={styles.resultText}>{summary}</p>
            </div>
          </div>
        )}

        {/* Q&A Section */}
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <div style={{...styles.sectionIcon, background: 'linear-gradient(135deg, #10b981, #14b8a6)'}}>
              <svg style={styles.sectionIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 style={styles.sectionTitle}>Ask Questions</h2>
          </div>

          <div style={styles.questionRow}>
            <input
              type="text"
              placeholder="What would you like to know about your documents?"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              style={styles.questionInput}
              onKeyPress={e => e.key === 'Enter' && handleQuestion()}
            />
            <button 
              onClick={handleQuestion} 
              disabled={loading || !question || files.length === 0} 
              style={{
                ...styles.secondaryButton,
                ...(loading || !question || files.length === 0 ? styles.buttonDisabled : {})
              }}
            >
              {loading ? (
                <>
                  <div style={styles.spinner}></div>
                  Thinking...
                </>
              ) : (
                <>
                  <svg style={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Ask AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Answer Results */}
        {answer && (
          <div style={{...styles.card, ...styles.resultCard, borderColor: '#10b981'}}>
            <div style={styles.sectionHeader}>
              <div style={{...styles.sectionIcon, background: 'linear-gradient(135deg, #10b981, #14b8a6)'}}>
                <svg style={styles.sectionIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 style={styles.sectionTitle}>AI Answer</h3>
            </div>
            <div style={styles.resultContent}>
              <p style={styles.resultText}>{answer}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Powered by advanced AI • Secure & Private • Lightning Fast
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  
  container: {
  minHeight: '100vh',
  background: '#000', // Changed to solid black
  position: 'relative',
  overflow: 'hidden',
  },

  backgroundElements: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  bgElement: {
    position: 'absolute',
    width: '320px',
    height: '320px',
    borderRadius: '50%',
    filter: 'blur(40px)',
    opacity: 0.2,
    animation: 'pulse 4s ease-in-out infinite',
  },
  bgElement1: {
    top: '-160px',
    right: '-160px',
    background: '#8b5cf6',
  },
  bgElement2: {
    bottom: '-160px',
    left: '-160px',
    background: '#3b82f6',
    animationDelay: '2s',
  },
  bgElement3: {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: '#ec4899',
    opacity: 0.1,
    animationDelay: '4s',
  },
  content: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1024px',
    margin: '0 auto',
    padding: '48px 24px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '48px',
  },
  headerIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80px',
    height: '80px',
    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
    borderRadius: '16px',
    marginBottom: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  headerIconSvg: {
    width: '40px',
    height: '40px',
    color: 'white',
  },
  title: {
  fontSize: '3rem',
  fontWeight: 'bold',
  color: '#f1f5f9', // Light grey
  marginBottom: '16px',
  background: 'none', // Remove gradient text for clarity on black
  lineHeight: '1.2',
  },
  subtitle: {
  fontSize: '1.25rem',
  color: '#d1d5db', // Softer grey
  maxWidth: '512px',
  margin: '0 auto',
  lineHeight: '1.6',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(16px)',
    borderRadius: '24px',
    padding: '32px',
    marginBottom: '32px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    transition: 'all 0.3s ease',
  },
  resultCard: {
    borderWidth: '2px',
    animation: 'slideUp 0.6s ease-out',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '24px',
  },
  sectionIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '16px',
  },
  sectionIconSvg: {
    width: '24px',
    height: '24px',
    color: 'white',
  },
  sectionTitle: {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: '#f1f5f9', // Light grey
  margin: 0,
  },
  dropZone: {
    border: '2px dashed #64748b',
    borderRadius: '16px',
    padding: '32px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  dropZoneActive: {
    borderColor: '#a78bfa',
    background: 'rgba(167, 139, 250, 0.1)',
  },
  dropZoneIcon: {
    width: '64px',
    height: '64px',
    color: '#94a3b8',
    margin: '0 auto 16px',
  },
  dropZoneText: {
    color: '#cbd5e1',
    marginBottom: '16px',
    fontSize: '1.125rem',
  },
  hiddenInput: {
    display: 'none',
  },
  uploadButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
    color: 'white',
    borderRadius: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    border: 'none',
    textDecoration: 'none',
  },
  filesSelected: {
    marginTop: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#22c55e',
  },
  checkIcon: {
    width: '20px',
    height: '20px',
    marginRight: '8px',
  },
  controlsRow: {
    marginTop: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  selectContainer: {
    flex: 1,
  },
  label: {
  display: 'block',
  color: '#e5e7eb', // Light grey
  fontWeight: '600',
  marginBottom: '8px',
  },
  select: {
  width: '100%',
  background: '#000', // Black background
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '12px',
  padding: '12px 16px',
  color: '#fff',      // White text
  fontSize: '16px',
  appearance: 'none', // Removes default arrow in some browsers
},
  primaryButton: {
    padding: '12px 32px',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    color: 'white',
    borderRadius: '12px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  secondaryButton: {
    padding: '16px 32px',
    background: 'linear-gradient(135deg, #10b981, #14b8a6)',
    color: 'white',
    borderRadius: '12px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    minWidth: 'fit-content',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  buttonIcon: {
    width: '20px',
    height: '20px',
    marginRight: '8px',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginRight: '8px',
  },
  questionRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  questionInput: {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    padding: '16px 24px',
    color: 'white',
    fontSize: '1.125rem',
    outline: 'none',
  },
  resultContent: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(8px)',
  },
  resultText: {
  color: '#e5e7eb', // Light grey
  lineHeight: '1.75',
  fontSize: '1.125rem',
  margin: 0,
  },
  footer: {
    textAlign: 'center',
    marginTop: '48px',
  },
  footerText: {
  color: '#9ca3af', // Medium grey
  margin: 0,
  },
  // Media queries for responsive design
  '@media (min-width: 640px)': {
    controlsRow: {
      flexDirection: 'row',
      alignItems: 'end',
    },
    questionRow: {
      flexDirection: 'row',
    },
  },
};

// Add keyframe animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 0.2; }
    50% { opacity: 0.3; }
  }
  
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @media (min-width: 640px) {
    .controls-row {
      flex-direction: row !important;
      align-items: end !important;
    }
    
    .question-row {
      flex-direction: row !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default App;
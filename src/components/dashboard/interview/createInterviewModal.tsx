import React, { useState } from 'react';
import { X } from 'lucide-react';

// JSON parsing utilities
function cleanJSONResponse(responseString: string): string {
  if (!responseString) return '{}';
  
  try {
    let cleaned = responseString
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();
    
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.slice(1, -1);
      cleaned = cleaned.replace(/\\"/g, '"');
    }
    
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleaned = cleaned.slice(jsonStart, jsonEnd + 1);
    }
    
    return cleaned;
  } catch (error) {
    console.error('Error cleaning JSON response:', error);
    return '{}';
  }
}

function safeJSONParse<T = any>(jsonString: string): { success: boolean; data?: T; error?: string } {
  try {
    const cleaned = cleanJSONResponse(jsonString);
    const parsed = JSON.parse(cleaned);
    return { success: true, data: parsed };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
    console.error('JSON parse error:', { error: errorMessage, original: jsonString });
    return { success: false, error: errorMessage };
  }
}

interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface CreateInterviewModalProps {
  open: boolean;
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  interviewData?: any;
  setInterviewData?: React.Dispatch<React.SetStateAction<any>>;
  isUploaded?: boolean;
  setIsUploaded?: React.Dispatch<React.SetStateAction<boolean>>;
  fileName?: string;
  setFileName?: React.Dispatch<React.SetStateAction<string>>;
  onClose?: () => void; // Made optional
  onNext?: (data: any) => void;
  onPrevious?: () => void;
  initialData?: any;
}

const CreateInterviewModal: React.FC<CreateInterviewModalProps> = ({
  open,
  setLoading,
  interviewData,
  setInterviewData,
  isUploaded,
  setIsUploaded,
  fileName,
  setFileName,
  onClose,
  onNext,
  onPrevious,
  initialData
}) => {
  const [step, setStep] = useState<'form' | 'questions'>('form');
  const [interviewName, setInterviewName] = useState(interviewData?.name || '');
  const [selectedInterviewer, setSelectedInterviewer] = useState(interviewData?.interviewer || '');
  const [objective, setObjective] = useState(interviewData?.objective || '');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(interviewData?.isAnonymous || false);
  const [numberOfQuestions, setNumberOfQuestions] = useState(interviewData?.numberOfQuestions || '');
  const [duration, setDuration] = useState(interviewData?.duration || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<InterviewQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  const interviewers = [
    {
      id: 'explorer_lisa',
      name: 'Explorer Lisa',
      avatar: '👩‍💼'
    },
    {
      id: 'empathetic_bob', 
      name: 'Empathetic Bob',
      avatar: '👨‍💼'
    }
  ];

  const updateInterviewData = (field: string, value: any) => {
    if (setInterviewData) {
      setInterviewData((prev: any) => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      if (setFileName) setFileName(file.name);
      if (setIsUploaded) setIsUploaded(true);
      updateInterviewData('uploadedFile', file.name);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!objective.trim()) {
      alert('Please provide an objective for the interview');
      return;
    }

    if (!selectedInterviewer) {
      alert('Please select an interviewer');
      return;
    }

    setIsGenerating(true);
    if (setLoading) setLoading(true);

    try {
      const response = await fetch('/api/generate-interview-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription: objective,
          position: interviewName,
          numberOfQuestions: numberOfQuestions || '5',
          duration: duration || '30'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      let questionsResponse;
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Handle the JSON parsing with our utility function
      if (data.response && typeof data.response === 'string') {
        const parseResult = safeJSONParse(data.response);
        
        if (parseResult.success && parseResult.data && Array.isArray(parseResult.data.questions)) {
          questionsResponse = parseResult.data;
        } else {
          console.error('Failed to parse questions response:', parseResult.error);
          console.log('Raw response:', data.response);
          throw new Error('Failed to parse generated questions');
        }
      } else if (data.response && Array.isArray(data.response.questions)) {
        questionsResponse = data.response;
      } else if (Array.isArray(data.questions)) {
        questionsResponse = { questions: data.questions };
      } else {
        throw new Error('Unexpected response format');
      }

      // Set the generated questions and move to questions step
      setGeneratedQuestions(questionsResponse.questions);
      setSelectedQuestions(questionsResponse.questions.map((q: InterviewQuestion) => q.id));
      setStep('questions');

      updateInterviewData('questions', questionsResponse.questions);
      
      console.log(`Generated ${questionsResponse.questions.length} questions successfully!`);
      
    } catch (error) {
      console.error('Error generating questions:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate questions');
    } finally {
      setIsGenerating(false);
      if (setLoading) setLoading(false);
    }
  };

  const handleManualSetup = () => {
    if (!interviewName.trim()) {
      alert('Please provide an interview name');
      return;
    }

    if (!selectedInterviewer) {
      alert('Please select an interviewer');
      return;
    }

    const finalData = {
      name: interviewName,
      interviewer: selectedInterviewer,
      objective,
      isAnonymous,
      numberOfQuestions: numberOfQuestions || '5',
      duration: duration || '30',
      questions: [],
      uploadedFile: uploadedFile?.name || fileName,
      manualSetup: true
    };

    // Update interview data
    if (setInterviewData) {
      setInterviewData((prev: any) => ({
        ...prev,
        ...finalData
      }));
    }

    if (onNext) {
      onNext(finalData);
    }

    // Close modal safely
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  };

  const handleQuestionToggle = (questionId: string) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleCreateInterview = () => {
    const selectedQuestionObjects = generatedQuestions.filter(q => selectedQuestions.includes(q.id));
    
    const finalData = {
      name: interviewName,
      interviewer: selectedInterviewer,
      objective,
      isAnonymous,
      numberOfQuestions: numberOfQuestions || '5',
      duration: duration || '30',
      questions: selectedQuestionObjects,
      uploadedFile: uploadedFile?.name || fileName
    };

    // Update interview data
    if (setInterviewData) {
      setInterviewData((prev: any) => ({
        ...prev,
        ...finalData
      }));
    }

    if (onNext) {
      onNext(finalData);
    }

    // Close modal safely
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        width: '90vw',
        maxWidth: '700px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            textAlign: 'center',
            flex: 1,
            margin: 0
          }}>
            {step === 'form' ? 'Create an Interview' : 'Select Questions'}
          </h2>
          <button
            onClick={() => {
              if (onClose && typeof onClose === 'function') {
                onClose();
              }
            }}
            style={{
              color: '#9ca3af',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px'
            }}
          >
            <X style={{ width: '24px', height: '24px' }} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px'
        }}>
          
          {step === 'form' && (
            <>
              {/* Interview Name */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  color: '#374151'
                }}>
                  Interview Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Name of the Interview"
                  value={interviewName}
                  onChange={(e) => {
                    setInterviewName(e.target.value);
                    updateInterviewData('name', e.target.value);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderBottom: '2px solid #d1d5db',
                    outline: 'none',
                    background: 'transparent',
                    color: '#374151',
                    fontSize: '16px',
                    border: 'none'
                  }}
                />
              </div>

              {/* Select Interviewer */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '16px',
                  color: '#374151'
                }}>
                  Select an Interviewer:
                </label>
                <div style={{
                  display: 'flex',
                  gap: '32px',
                  justifyContent: 'center'
                }}>
                  {interviewers.map((interviewer) => (
                    <div
                      key={interviewer.id}
                      style={{
                        textAlign: 'center',
                        cursor: 'pointer',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '2px solid',
                        borderColor: selectedInterviewer === interviewer.id ? '#3b82f6' : '#e5e7eb',
                        backgroundColor: selectedInterviewer === interviewer.id ? '#eff6ff' : 'transparent',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => {
                        setSelectedInterviewer(interviewer.id);
                        updateInterviewData('interviewer', interviewer.id);
                      }}
                    >
                      <div style={{ position: 'relative', marginBottom: '12px' }}>
                        <div style={{
                          width: '80px',
                          height: '80px',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '32px',
                          margin: '0 auto'
                        }}>
                          {interviewer.avatar}
                        </div>
                        <div style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          width: '24px',
                          height: '24px',
                          backgroundColor: '#3b82f6',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            i
                          </span>
                        </div>
                      </div>
                      <p style={{
                        fontWeight: '500',
                        fontSize: '14px',
                        color: '#374151',
                        margin: 0
                      }}>
                        {interviewer.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Objective */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  color: '#374151'
                }}>
                  Objective:
                </label>
                <textarea
                  placeholder="e.g. Find best candidates based on their technical skills and previous projects."
                  value={objective}
                  onChange={(e) => {
                    setObjective(e.target.value);
                    updateInterviewData('objective', e.target.value);
                  }}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    outline: 'none',
                    resize: 'none',
                    color: '#374151',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* File Upload */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  color: '#374151'
                }}>
                  Upload any documents related to the interview:
                  <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
                </label>
                <div style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '8px',
                  padding: '32px',
                  textAlign: 'center',
                  backgroundColor: '#f9fafb',
                  cursor: 'pointer'
                }}>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                    <div style={{
                      fontSize: '48px',
                      color: '#3b82f6',
                      marginBottom: '12px'
                    }}>
                      📧
                    </div>
                    <p style={{
                      color: '#6b7280',
                      fontSize: '14px',
                      fontWeight: '500',
                      margin: 0
                    }}>
                      {uploadedFile?.name || fileName || 'Drop PDF Here'}
                    </p>
                  </label>
                </div>
              </div>

              {/* Anonymous Option */}
              <div style={{
                backgroundColor: '#f9fafb',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => {
                      setIsAnonymous(e.target.checked);
                      updateInterviewData('isAnonymous', e.target.checked);
                    }}
                    style={{
                      width: '20px',
                      height: '20px',
                      accentColor: '#3b82f6',
                      marginTop: '2px'
                    }}
                  />
                  <div>
                    <label htmlFor="anonymous" style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      cursor: 'pointer'
                    }}>
                      Do you prefer the interviewees' responses to be anonymous?
                    </label>
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      marginTop: '4px',
                      margin: '4px 0 0 0'
                    }}>
                      Note: If not anonymous, the interviewee's email and name will be collected.
                    </p>
                  </div>
                </div>
              </div>

              {/* Number of Questions and Duration */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
                marginBottom: '24px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '8px',
                    color: '#374151'
                  }}>
                    Number of Questions:
                  </label>
                  <input
                    type="number"
                    placeholder="5"
                    value={numberOfQuestions}
                    onChange={(e) => {
                      setNumberOfQuestions(e.target.value);
                      updateInterviewData('numberOfQuestions', e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderBottom: '2px solid #d1d5db',
                      outline: 'none',
                      background: 'transparent',
                      color: '#374151',
                      fontSize: '16px',
                      border: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '8px',
                    color: '#374151'
                  }}>
                    Duration (mins):
                  </label>
                  <input
                    type="number"
                    placeholder="30"
                    value={duration}
                    onChange={(e) => {
                      setDuration(e.target.value);
                      updateInterviewData('duration', e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderBottom: '2px solid #d1d5db',
                      outline: 'none',
                      background: 'transparent',
                      color: '#374151',
                      fontSize: '16px',
                      border: 'none'
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {step === 'questions' && (
            <>
              <div style={{ marginBottom: '24px' }}>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
                  Select the questions you want to include in your interview:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                  {generatedQuestions.map((question) => (
                    <div
                      key={question.id}
                      style={{
                        width: '100%',
                        padding: '16px',
                        border: '2px solid',
                        borderColor: selectedQuestions.includes(question.id) ? '#3b82f6' : '#e5e7eb',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: selectedQuestions.includes(question.id) ? '#eff6ff' : 'white',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => handleQuestionToggle(question.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <input
                          type="checkbox"
                          checked={selectedQuestions.includes(question.id)}
                          onChange={() => handleQuestionToggle(question.id)}
                          style={{ marginTop: '4px', accentColor: '#3b82f6' }}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{
                            fontWeight: '500',
                            marginBottom: '8px',
                            color: '#374151',
                            lineHeight: '1.5'
                          }}>
                            {question.question}
                          </p>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <span style={{
                              padding: '4px 8px',
                              backgroundColor: '#f3f4f6',
                              color: '#374151',
                              fontSize: '12px',
                              borderRadius: '4px',
                              fontWeight: '500'
                            }}>
                              {question.category}
                            </span>
                            <span style={{
                              padding: '4px 8px',
                              backgroundColor: getDifficultyColor(question.difficulty),
                              color: 'white',
                              fontSize: '12px',
                              borderRadius: '4px',
                              fontWeight: '500'
                            }}>
                              {question.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{
                  marginTop: '16px',
                  color: '#6b7280',
                  fontSize: '14px',
                  textAlign: 'center'
                }}>
                  {selectedQuestions.length} of {generatedQuestions.length} questions selected
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '24px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          backgroundColor: '#fafafa'
        }}>
          {step === 'form' && (
            <>
              <button
                onClick={handleGenerateQuestions}
                disabled={isGenerating || !objective.trim() || !selectedInterviewer}
                style={{
                  padding: '12px 32px',
                  backgroundColor: isGenerating || !objective.trim() || !selectedInterviewer ? '#9ca3af' : '#8b5cf6',
                  color: 'white',
                  borderRadius: '9999px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: isGenerating || !objective.trim() || !selectedInterviewer ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                {isGenerating ? 'Generating...' : 'Generate Questions'}
              </button>
              <button
                onClick={handleManualSetup}
                disabled={!interviewName.trim() || !selectedInterviewer}
                style={{
                  padding: '12px 32px',
                  backgroundColor: !interviewName.trim() || !selectedInterviewer ? '#9ca3af' : '#a855f7',
                  color: 'white',
                  borderRadius: '9999px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: !interviewName.trim() || !selectedInterviewer ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                I'll do it myself
              </button>
            </>
          )}

          {step === 'questions' && (
            <>
              <button
                onClick={() => setStep('form')}
                style={{
                  padding: '12px 32px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  borderRadius: '9999px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Back
              </button>
              <button
                onClick={handleCreateInterview}
                disabled={selectedQuestions.length === 0}
                style={{
                  padding: '12px 32px',
                  backgroundColor: selectedQuestions.length === 0 ? '#9ca3af' : '#10b981',
                  color: 'white',
                  borderRadius: '9999px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: selectedQuestions.length === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                Create Interview ({selectedQuestions.length} questions)
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateInterviewModal;

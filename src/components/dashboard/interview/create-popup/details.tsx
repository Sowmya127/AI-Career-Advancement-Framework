import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';

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

interface DetailsProps {
  open?: boolean;
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  interviewData?: any;
  setInterviewData?: React.Dispatch<React.SetStateAction<any>>;
  isUploaded?: boolean;
  setIsUploaded?: React.Dispatch<React.SetStateAction<boolean>>;
  fileName?: string;
  setFileName?: React.Dispatch<React.SetStateAction<string>>;
  onNext?: (data: any) => void;
  onPrevious?: () => void;
  initialData?: any;
  onClose?: () => void;
}

const Details: React.FC<DetailsProps> = ({
  open = true,
  setLoading,
  interviewData,
  setInterviewData,
  isUploaded,
  setIsUploaded,
  fileName,
  setFileName,
  onNext,
  onPrevious,
  initialData,
  onClose
}) => {
  const [interviewName, setInterviewName] = useState(interviewData?.name || '');
  const [selectedInterviewer, setSelectedInterviewer] = useState(interviewData?.interviewer || '');
  const [objective, setObjective] = useState(interviewData?.objective || '');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(interviewData?.isAnonymous || false);
  const [numberOfQuestions, setNumberOfQuestions] = useState(interviewData?.numberOfQuestions || '');
  const [duration, setDuration] = useState(interviewData?.duration || '');
  const [isGenerating, setIsGenerating] = useState(false);

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
      const response = await fetch('/api/generate-questions', {
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

      // Update interview data with generated questions
      const finalData = {
        name: interviewName,
        interviewer: selectedInterviewer,
        objective,
        isAnonymous,
        numberOfQuestions: numberOfQuestions || '5',
        duration: duration || '30',
        questions: questionsResponse.questions,
        uploadedFile: uploadedFile?.name || fileName
      };

      updateInterviewData('questions', questionsResponse.questions);
      
      if (onNext) {
        onNext(finalData);
      }

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

    if (onNext) {
      onNext(finalData);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Scrollable container with proper max height */}
      <div className="max-h-[85vh] overflow-y-auto px-6 py-4">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Create an Interview</h2>
        </div>

        {/* Interview Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Interview Name:</label>
          <input
            type="text"
            placeholder="e.g. Name of the Interview"
            value={interviewName}
            onChange={(e) => {
              setInterviewName(e.target.value);
              updateInterviewData('name', e.target.value);
            }}
            className="w-full px-3 py-2 border-b-2 border-gray-300 focus:border-blue-500 outline-none bg-transparent"
          />
        </div>

        {/* Select Interviewer */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-4">Select an Interviewer:</label>
          <div className="flex gap-6 justify-center">
            {interviewers.map((interviewer) => (
              <div
                key={interviewer.id}
                className={`text-center cursor-pointer p-3 rounded-lg transition-all ${
                  selectedInterviewer === interviewer.id
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'hover:bg-gray-50 border-2 border-transparent'
                }`}
                onClick={() => {
                  setSelectedInterviewer(interviewer.id);
                  updateInterviewData('interviewer', interviewer.id);
                }}
              >
                <div className="relative mb-2">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl mx-auto">
                    {interviewer.avatar}
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                </div>
                <p className="font-medium text-xs">{interviewer.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Objective */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Objective:</label>
          <textarea
            placeholder="e.g. Find best candidates based on their technical skills and previous projects."
            value={objective}
            onChange={(e) => {
              setObjective(e.target.value);
              updateInterviewData('objective', e.target.value);
            }}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
          />
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Upload any documents related to the interview:
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="w-8 h-8 text-blue-500 mx-auto mb-2 text-2xl">
                📧
              </div>
              <p className="text-gray-500 text-sm">
                {uploadedFile?.name || fileName || 'Drop PDF Here'}
              </p>
            </label>
          </div>
        </div>

        {/* Anonymous Option */}
        <div className="mb-6">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => {
                setIsAnonymous(e.target.checked);
                updateInterviewData('isAnonymous', e.target.checked);
              }}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mt-0.5"
            />
            <div>
              <label htmlFor="anonymous" className="text-sm font-medium block">
                Do you prefer the interviewees' responses to be anonymous?
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Note: If not anonymous, the interviewee's email and name will be collected.
              </p>
            </div>
          </div>
        </div>

        {/* Number of Questions and Duration */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Number of Questions:</label>
            <input
              type="number"
              placeholder="5"
              value={numberOfQuestions}
              onChange={(e) => {
                setNumberOfQuestions(e.target.value);
                updateInterviewData('numberOfQuestions', e.target.value);
              }}
              className="w-full px-3 py-2 border-b-2 border-gray-300 focus:border-blue-500 outline-none bg-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Duration (mins):</label>
            <input
              type="number"
              placeholder="30"
              value={duration}
              onChange={(e) => {
                setDuration(e.target.value);
                updateInterviewData('duration', e.target.value);
              }}
              className="w-full px-3 py-2 border-b-2 border-gray-300 focus:border-blue-500 outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mb-4">
          <button
            onClick={handleGenerateQuestions}
            disabled={isGenerating || !objective.trim() || !selectedInterviewer}
            className="px-6 py-2.5 bg-purple-500 text-white rounded-full font-medium hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {isGenerating ? 'Generating...' : 'Generate Questions'}
          </button>
          <button
            onClick={handleManualSetup}
            disabled={!interviewName.trim() || !selectedInterviewer}
            className="px-6 py-2.5 bg-purple-400 text-white rounded-full font-medium hover:bg-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
          >
            I'll do it myself
          </button>
        </div>

        {/* Navigation buttons if needed */}
        {(onNext || onPrevious) && (
          <div className="flex justify-between mt-4">
            {onPrevious && (
              <button
                onClick={onPrevious}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
              >
                Previous
              </button>
            )}
            <div></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Details;

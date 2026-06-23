"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Brain, Trophy, Download, Clock, CheckCircle, ChevronLeft, ChevronRight, Flag, CheckCircle2, AlertCircle, XCircle, Award, RotateCcw, Target } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface QuizQuestion {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

interface QuizConfig {
  jobTitle: string;
  jobDescription: string;
  numQuestions: number;
  timeLimit: number;
}

interface QuizResults {
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: { [key: number]: string };
  questions: QuizQuestion[];
  timeTaken: number;
}

// Certificate Generator Component
const CertificateGenerator: React.FC<{ results: QuizResults; jobTitle: string }> = ({ results, jobTitle }) => {
  const { user } = useUser();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [certificateName, setCertificateName] = useState('');

  const generateCertificate = (name: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 1200;
    canvas.height = 800;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Inner border
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    // Certificate Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICATE OF ACHIEVEMENT', canvas.width / 2, 120);

    // Subtitle
    ctx.font = '24px Arial, sans-serif';
    ctx.fillText('This is to certify that', canvas.width / 2, 180);

    // User Name
    const userName = name || user?.fullName || user?.firstName || 'Candidate';
    ctx.font = 'bold 42px Arial, sans-serif';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(userName, canvas.width / 2, 250);

    // Achievement text
    ctx.fillStyle = '#ffffff';
    ctx.font = '28px Arial, sans-serif';
    ctx.fillText('has successfully completed the', canvas.width / 2, 320);

    // Job Title
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(jobTitle, canvas.width / 2, 380);

    // Quiz details
    ctx.fillStyle = '#ffffff';
    ctx.font = '28px Arial, sans-serif';
    ctx.fillText('Technical Assessment Quiz', canvas.width / 2, 440);

    // Score
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.fillText(`Score: ${results.percentage}% (${results.score}/${results.totalQuestions})`, canvas.width / 2, 500);

    // Date
    ctx.font = '20px Arial, sans-serif';
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    ctx.fillText(`Date: ${currentDate}`, canvas.width / 2, 560);

    // Platform name
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillText('nextSteps.AI', canvas.width / 2, 620);

    // Certificate ID
    const certificateId = `NSA-${Date.now().toString(36).toUpperCase()}`;
    ctx.font = '16px Arial, sans-serif';
    ctx.fillText(`Certificate ID: ${certificateId}`, canvas.width / 2, 660);

    // Add decorative elements
    drawStar(ctx, 150, 150, 30, '#ffd700');
    drawStar(ctx, canvas.width - 150, 150, 30, '#ffd700');
    drawStar(ctx, 150, canvas.height - 150, 30, '#ffd700');
    drawStar(ctx, canvas.width - 150, canvas.height - 150, 30, '#ffd700');
  };

  const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5;
      const xPos = x + Math.cos(angle) * radius;
      const yPos = y + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(xPos, yPos);
      } else {
        ctx.lineTo(xPos, yPos);
      }
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const handleDownloadCertificate = () => {
    setShowNameDialog(true);
    setCertificateName(user?.fullName || user?.firstName || '');
  };

  const handleNameSubmit = () => {
    if (certificateName.trim()) {
      generateCertificate(certificateName.trim());
      
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Create download link
        const link = document.createElement('a');
        link.download = `${jobTitle.replace(/\s+/g, '_')}_Certificate_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        setShowNameDialog(false);
        setCertificateName('');
      }, 100);
    }
  };

  return (
    <>
      <Button
        onClick={handleDownloadCertificate}
        className="bg-green-600 hover:bg-green-700 px-6 py-3"
      >
        <Download className="w-4 h-4 mr-2" />
        Download Certificate
      </Button>
      
      {/* Name Input Dialog */}
      {showNameDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Enter Your Name for Certificate</h3>
            <input
              type="text"
              placeholder="Enter your full name"
              value={certificateName}
              onChange={(e) => setCertificateName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowNameDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleNameSubmit}
                disabled={!certificateName.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                Generate Certificate
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Hidden canvas for certificate generation */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
        width={1200}
        height={800}
      />
    </>
  );
};

// Results Component
const Results: React.FC<{ results: QuizResults; jobTitle: string; onRestart: () => void }> = ({ results, jobTitle, onRestart }) => {
  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90) return { message: "Outstanding Performance! 🌟", color: "text-green-600", bg: "bg-green-50" };
    if (percentage >= 80) return { message: "Excellent Work! 🎉", color: "text-green-600", bg: "bg-green-50" };
    if (percentage >= 70) return { message: "Good Job! 👍", color: "text-blue-600", bg: "bg-blue-50" };
    if (percentage >= 60) return { message: "Not Bad! 📈", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { message: "Keep Practicing! 💪", color: "text-red-600", bg: "bg-red-50" };
  };

  const performance = getPerformanceMessage(results.percentage);

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    return "F";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Trophy className="w-8 h-8 text-yellow-600" />
          <h1 className="text-3xl font-bold text-gray-800">Quiz Complete!</h1>
        </div>
        <p className="text-gray-600 text-lg">{jobTitle} Assessment Results</p>
      </div>

      {/* Score Overview */}
      <Card className={`border-2 ${performance.bg} border-opacity-50`}>
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="text-6xl font-bold text-gray-800">
                {results.percentage}%
              </div>
              <div className="ml-4 text-right">
                <div className="text-2xl font-bold text-gray-600">
                  {results.score}/{results.totalQuestions}
                </div>
                <div className="text-sm text-gray-500">Correct Answers</div>
              </div>
            </div>
            
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${performance.bg} ${performance.color} font-semibold`}>
              <Award className="w-5 h-5" />
              Grade: {getGrade(results.percentage)} - {performance.message}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{results.timeTaken} min</div>
            <div className="text-sm text-gray-600">Time Taken</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{results.score}</div>
            <div className="text-sm text-gray-600">Correct Answers</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{getGrade(results.percentage)}</div>
            <div className="text-sm text-gray-600">Final Grade</div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <CertificateGenerator 
          results={results}
          jobTitle={jobTitle}
        />
        <Button
          onClick={onRestart}
          variant="outline"
          className="px-6 py-3"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Take Another Quiz
        </Button>
      </div>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle>Question by Question Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {results.questions.map((question, index) => {
            const userAnswer = results.answers[question.id];
            const isCorrect = userAnswer === question.correctAnswer;
            
            return (
              <div key={question.id} className="border rounded-lg p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Question {index + 1}: {question.question}
                    </h3>
                    
                    {/* Answer Options */}
                    <div className="space-y-2 mb-4">
                      {Object.entries(question.options).map(([key, value]) => {
                        let bgColor = 'bg-gray-50';
                        let textColor = 'text-gray-700';
                        let borderColor = 'border-gray-200';
                        
                        if (key === question.correctAnswer) {
                          bgColor = 'bg-green-50';
                          textColor = 'text-green-800';
                          borderColor = 'border-green-300';
                        } else if (key === userAnswer && !isCorrect) {
                          bgColor = 'bg-red-50';
                          textColor = 'text-red-800';
                          borderColor = 'border-red-300';
                        }
                        
                        return (
                          <div
                            key={key}
                            className={`p-3 rounded border ${bgColor} ${borderColor}`}
                          >
                            <div className="flex items-start gap-2">
                              <span className={`font-semibold ${textColor} min-w-[20px]`}>
                                {key}.
                              </span>
                              <span className={textColor}>{value}</span>
                              {key === question.correctAnswer && (
                                <CheckCircle className="w-4 h-4 text-green-600 ml-auto flex-shrink-0" />
                              )}
                              {key === userAnswer && !isCorrect && (
                                <XCircle className="w-4 h-4 text-red-600 ml-auto flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Answer Status */}
                    <div className="mb-3">
                      {userAnswer ? (
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                          isCorrect 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isCorrect ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Correct! You selected {userAnswer}
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              Incorrect. You selected {userAnswer}, correct answer is {question.correctAnswer}
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                          <XCircle className="w-4 h-4" />
                          Not answered. Correct answer is {question.correctAnswer}
                        </div>
                      )}
                    </div>
                    
                    {/* Explanation */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Explanation:</h4>
                      <p className="text-blue-700 text-sm">{question.explanation}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

// Quiz Interface Component
const QuizInterface: React.FC<{
  questions: QuizQuestion[];
  timeLimit: number;
  onComplete: (results: QuizResults) => void;
  jobTitle: string;
}> = ({ questions, timeLimit, onComplete, jobTitle }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60); // Convert to seconds
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmitQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: answer
    }));
  };

  const handleQuestionNavigation = (index: number) => {
    setCurrentQuestion(index);
  };

  const toggleFlag = () => {
    const questionId = questions[currentQuestion].id;
    setFlagged(prev => {
      const newFlagged = new Set(prev);
      if (newFlagged.has(questionId)) {
        newFlagged.delete(questionId);
      } else {
        newFlagged.add(questionId);
      }
      return newFlagged;
    });
  };

  const handleSubmitQuiz = () => {
    const timeTaken = Math.round((Date.now() - startTime) / 1000 / 60); // in minutes
    const score = questions.reduce((total, question) => {
      return total + (answers[question.id] === question.correctAnswer ? 1 : 0);
    }, 0);

    const results: QuizResults = {
      score,
      totalQuestions: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      answers,
      questions,
      timeTaken
    };

    onComplete(results);
  };

  const getQuestionStatus = (index: number) => {
    const questionId = questions[index].id;
    const isAnswered = answers[questionId] !== undefined;
    const isFlagged = flagged.has(questionId);
    const isCurrent = index === currentQuestion;

    if (isCurrent) return 'current';
    if (isFlagged) return 'flagged';
    if (isAnswered) return 'answered';
    return 'unanswered';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current': return 'bg-blue-600 text-white';
      case 'answered': return 'bg-green-600 text-white';
      case 'flagged': return 'bg-yellow-600 text-white';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{jobTitle} Quiz</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-500" />
                <span className={`font-mono text-lg ${timeLeft < 300 ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Progress: {answeredCount}/{questions.length}
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                  {questions.map((_, index) => {
                    const status = getQuestionStatus(index);
                    return (
                      <button
                        key={index}
                        onClick={() => handleQuestionNavigation(index)}
                        className={`w-10 h-10 rounded text-sm font-medium transition-colors ${getStatusColor(status)} hover:opacity-80`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
                
                {/* Legend */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-600 rounded"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-600 rounded"></div>
                    <span>Flagged</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-200 rounded"></div>
                    <span>Not Answered</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <Card className="min-h-[500px]">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg leading-relaxed">
                    {questions[currentQuestion]?.question}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFlag}
                    className={`ml-4 ${flagged.has(questions[currentQuestion].id) ? 'bg-yellow-100 border-yellow-400' : ''}`}
                  >
                    <Flag className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Answer Options */}
                <div className="space-y-3">
                  {Object.entries(questions[currentQuestion]?.options || {}).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => handleAnswerSelect(key)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        answers[questions[currentQuestion].id] === key
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-semibold text-blue-600 min-w-[20px]">{key}.</span>
                        <span className="text-gray-800">{value}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestion === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex gap-3">
                    {flagged.has(questions[currentQuestion].id) ? (
                      <div className="flex items-center gap-2 text-yellow-600 text-sm">
                        <Flag className="w-4 h-4" />
                        Flagged for review
                      </div>
                    ) : answers[questions[currentQuestion].id] ? (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Answered
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        Not answered
                      </div>
                    )}
                  </div>

                  {currentQuestion === questions.length - 1 ? (
                    <Button
                      onClick={handleSubmitQuiz}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Submit Quiz
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submit Warning for Incomplete Quiz */}
        {answeredCount < questions.length && (
          <Card className="mt-6 border-yellow-400 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">
                    {questions.length - answeredCount} questions remaining
                  </p>
                  <p className="text-sm text-yellow-700">
                    You can submit anytime, but unanswered questions will be marked as incorrect.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleSubmitQuiz}
                  className="ml-auto border-yellow-400 text-yellow-700 hover:bg-yellow-100"
                >
                  Submit Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Main Quiz Generator Component
const QuizGenerator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'config' | 'quiz' | 'results'>('config');
  const [config, setConfig] = useState<QuizConfig>({
    jobTitle: '',
    jobDescription: '',
    numQuestions: 10,
    timeLimit: 15
  });
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<QuizResults | null>(null);

  const generateQuiz = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }

      const data = await response.json();
      setQuestions(data.questions);
      setCurrentStep('quiz');
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizComplete = (quizResults: QuizResults) => {
    setResults(quizResults);
    setCurrentStep('results');
  };

  const resetQuiz = () => {
    setCurrentStep('config');
    setQuestions([]);
    setResults(null);
    setConfig({
      jobTitle: '',
      jobDescription: '',
      numQuestions: 10,
      timeLimit: 15
    });
  };

  const isConfigValid = () => {
    return config.jobTitle.trim().length > 0 && 
           config.jobDescription.trim().length > 10 &&
           config.numQuestions >= 5 && 
           config.numQuestions <= 20 &&
           config.timeLimit >= 5;
  };

  if (currentStep === 'quiz') {
    return (
      <QuizInterface 
        questions={questions}
        timeLimit={config.timeLimit}
        onComplete={handleQuizComplete}
        jobTitle={config.jobTitle}
      />
    );
  }

  if (currentStep === 'results' && results) {
    return (
      <Results 
        results={results}
        jobTitle={config.jobTitle}
        onRestart={resetQuiz}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Brain className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">AI Quiz Generator</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Create personalized technical quizzes based on job descriptions
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Configure Your Quiz
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Job Title / Role
            </label>
            <input
              type="text"
              placeholder="e.g., Senior Frontend Developer, Data Scientist, DevOps Engineer..."
              value={config.jobTitle}
              onChange={(e) => setConfig(prev => ({ ...prev, jobTitle: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Job Description
            </label>
            <textarea
              rows={6}
              placeholder="Paste the complete job description here. The AI will generate relevant questions based on the requirements, technologies, and skills mentioned..."
              value={config.jobDescription}
              onChange={(e) => setConfig(prev => ({ ...prev, jobDescription: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 More detailed job descriptions generate better, more relevant questions
            </p>
          </div>

          {/* Quiz Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Number of Questions
              </label>
              <select
                value={config.numQuestions}
                onChange={(e) => setConfig(prev => ({ ...prev, numQuestions: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>5 Questions (Quick)</option>
                <option value={10}>10 Questions (Standard)</option>
                <option value={15}>15 Questions (Detailed)</option>
                <option value={20}>20 Questions (Comprehensive)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Time Limit (minutes)
              </label>
              <select
                value={config.timeLimit}
                onChange={(e) => setConfig(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
          </div>

          {/* Quiz Preview Info */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Quiz Preview:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-blue-600" />
                <span>{config.numQuestions} Questions</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>{config.timeLimit} Minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span>Multiple Choice</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-600" />
                <span>Certificate</span>
              </div>
            </div>
          </div>

          <Button
            onClick={generateQuiz}
            disabled={loading || !isConfigValid()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                AI is generating your personalized quiz...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Generate AI Quiz
              </>
            )}
          </Button>

          {!isConfigValid() && (
            <p className="text-sm text-gray-500 text-center">
              Please fill in all fields to generate your quiz
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizGenerator;

"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Loader2, Download, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface ResumeAnalysis {
  overallScore: number;
  sections: {
    contactInfo: { score: number; feedback: string[]; suggestions: string[] };
    summary: { score: number; feedback: string[]; suggestions: string[] };
    experience: { score: number; feedback: string[]; suggestions: string[] };
    education: { score: number; feedback: string[]; suggestions: string[] };
    skills: { score: number; feedback: string[]; suggestions: string[] };
    formatting: { score: number; feedback: string[]; suggestions: string[] };
  };
  atsCompliance: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  extractedData: {
    name: string;
    email: string;
    phone: string;
    skills: string[];
    experience: string[];
    education: string[];
  };
}

const ResumeParserPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type === 'application/pdf' || selectedFile.type.includes('word')) {
      setFile(selectedFile);
      setAnalysis(null);
    } else {
      alert('Please upload a PDF or Word document');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const analyzeResume = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Error analyzing resume:', error);
      alert('Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <AlertCircle className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Resume Parser & ATS Checker</h1>
        <p className="text-gray-600">
          Upload your resume to get detailed feedback and ATS compliance scores
        </p>
      </div>

      {!analysis ? (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Resume</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  dragOver
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => document.getElementById('resume-upload')?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {file ? file.name : 'Drop your resume here'}
                </h3>
                <p className="text-gray-500 mb-4">
                  or click to browse (PDF, DOC, DOCX supported)
                </p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="resume-upload"
                />
                <Button variant="outline" type="button">
                  <FileText className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
              </div>

              {file && (
                <div className="mt-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setFile(null)}
                      variant="ghost"
                      size="sm"
                    >
                      Remove
                    </Button>
                  </div>

                  <Button
                    onClick={analyzeResume}
                    disabled={loading}
                    className="w-full mt-4"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing Resume...
                      </>
                    ) : (
                      'Analyze Resume'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Overall Resume Score</span>
                <Button
                  onClick={() => {
                    setFile(null);
                    setAnalysis(null);
                  }}
                  variant="outline"
                >
                  Analyze New Resume
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className={`text-4xl font-bold px-4 py-2 rounded-lg ${getScoreColor(analysis.overallScore)}`}>
                  {analysis.overallScore}/100
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${analysis.overallScore}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {analysis.overallScore >= 80 ? 'Excellent! Your resume is well-optimized.' :
                     analysis.overallScore >= 60 ? 'Good, but there\'s room for improvement.' :
                     'Needs significant improvements for better ATS compatibility.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ATS Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>ATS Compliance Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className={`text-2xl font-bold px-3 py-2 rounded-lg ${getScoreColor(analysis.atsCompliance.score)}`}>
                  {analysis.atsCompliance.score}/100
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">ATS Readability</h4>
                  <p className="text-sm text-gray-600">
                    How well can Applicant Tracking Systems parse your resume
                  </p>
                </div>
              </div>

              {analysis.atsCompliance.issues.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
                    Issues Found
                  </h4>
                  <ul className="space-y-1">
                    {analysis.atsCompliance.issues.map((issue, index) => (
                      <li key={index} className="text-sm text-red-600 flex items-start">
                        <span className="mr-2">•</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Recommendations
                </h4>
                <ul className="space-y-1">
                  {analysis.atsCompliance.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-green-600 flex items-start">
                      <span className="mr-2">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(analysis.sections).map(([sectionName, sectionData]) => (
              <Card key={sectionName}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">{sectionName.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <div className="flex items-center space-x-2">
                      {getScoreIcon(sectionData.score)}
                      <span className={`font-bold px-2 py-1 rounded text-sm ${getScoreColor(sectionData.score)}`}>
                        {sectionData.score}/100
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sectionData.feedback.length > 0 && (
                    <div className="mb-3">
                      <h5 className="font-medium text-sm mb-1">Feedback:</h5>
                      <ul className="space-y-1">
                        {sectionData.feedback.map((feedback, index) => (
                          <li key={index} className="text-xs text-gray-600 flex items-start">
                            <span className="mr-1">•</span>
                            {feedback}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {sectionData.suggestions.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm mb-1">Suggestions:</h5>
                      <ul className="space-y-1">
                        {sectionData.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-xs text-blue-600 flex items-start">
                            <span className="mr-1">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Extracted Data */}
          <Card>
            <CardHeader>
              <CardTitle>Extracted Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {analysis.extractedData.name || 'Not found'}</p>
                    <p><strong>Email:</strong> {analysis.extractedData.email || 'Not found'}</p>
                    <p><strong>Phone:</strong> {analysis.extractedData.phone || 'Not found'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {analysis.extractedData.skills.length > 0 ? (
                      analysis.extractedData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">No skills detected</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Experience</h4>
                  <div className="space-y-1 text-sm">
                    {analysis.extractedData.experience.length > 0 ? (
                      analysis.extractedData.experience.map((exp, index) => (
                        <p key={index} className="text-gray-700">• {exp}</p>
                      ))
                    ) : (
                      <span className="text-gray-500">No experience detected</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Education</h4>
                  <div className="space-y-1 text-sm">
                    {analysis.extractedData.education.length > 0 ? (
                      analysis.extractedData.education.map((edu, index) => (
                        <p key={index} className="text-gray-700">• {edu}</p>
                      ))
                    ) : (
                      <span className="text-gray-500">No education detected</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex space-x-4">
                <Button className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download Detailed Report
                </Button>
                <Button variant="outline" className="flex-1">
                  Share Results
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ResumeParserPage;

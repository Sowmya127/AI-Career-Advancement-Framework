"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Loader2, Download, AlertCircle, CheckCircle, AlertTriangle, Target, Zap } from 'lucide-react';

interface JobMatchAnalysis {
  overallMatchScore: number;
  atsScore: number;
  matchingKeywords: string[];
  missingKeywords: string[];
  suggestions: {
    addContent: string[];
    improveContent: string[];
    removeContent: string[];
    atsOptimizations: string[];
  };
  sectionAnalysis: {
    summary: { score: number; feedback: string[]; suggestions: string[] };
    experience: { score: number; feedback: string[]; suggestions: string[] };
    skills: { score: number; feedback: string[]; suggestions: string[] };
    education: { score: number; feedback: string[]; suggestions: string[] };
  };
  extractedData: {
    name: string;
    email: string;
    phone: string;
    skills: string[];
    experience: string[];
    education: string[];
  };
  enhancedContent: {
    improvedSummary: string;
    suggestedBulletPoints: string[];
    optimizedSkills: string[];
  };
}

const AIResumeJobMatcher: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [analysis, setAnalysis] = useState<JobMatchAnalysis | null>(null);
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

  const analyzeResumeWithJob = async () => {
    if (!file || !jobDescription.trim()) {
      alert('Please upload a resume and enter a job description');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobDescription', jobDescription);

      const response = await fetch('/api/analyze-resume-job-match', {
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

  // Working function for Export Analysis Report  
  const handleExportReport = () => {
    if (!analysis || !file) return;

    // Create detailed analysis report
    const reportContent = `AI RESUME ANALYSIS REPORT
Generated on: ${new Date().toLocaleDateString()}
File Analyzed: ${file.name}
Analysis powered by FoloUp AI

=====================================================

📊 EXECUTIVE SUMMARY
=====================================================
Job Match Score: ${analysis.overallMatchScore}%
ATS Compatibility: ${analysis.atsScore}%

Overall Assessment: ${
  analysis.overallMatchScore >= 80 ? 'Excellent match! Your resume aligns well with the job requirements.' :
  analysis.overallMatchScore >= 60 ? 'Good match with room for improvement.' :
  'Significant improvements needed to better match job requirements.'
}

=====================================================

🎯 KEYWORD ANALYSIS
=====================================================

✅ MATCHING KEYWORDS (${analysis.matchingKeywords.length}):
${analysis.matchingKeywords.map((keyword, index) => 
  `   ${index + 1}. ${keyword}`
).join('\n')}

❌ MISSING KEYWORDS (${analysis.missingKeywords.length}):
${analysis.missingKeywords.map((keyword, index) => 
  `   ${index + 1}. ${keyword} - Add this to your resume`
).join('\n')}

=====================================================

📋 SECTION-BY-SECTION ANALYSIS
=====================================================

📝 PROFESSIONAL SUMMARY - Score: ${analysis.sectionAnalysis.summary.score}/100
   Feedback: ${analysis.sectionAnalysis.summary.feedback.join(', ')}
   Suggestions: ${analysis.sectionAnalysis.summary.suggestions.join(', ')}

💼 WORK EXPERIENCE - Score: ${analysis.sectionAnalysis.experience.score}/100
   Feedback: ${analysis.sectionAnalysis.experience.feedback.join(', ')}
   Suggestions: ${analysis.sectionAnalysis.experience.suggestions.join(', ')}

🛠️ SKILLS SECTION - Score: ${analysis.sectionAnalysis.skills.score}/100
   Feedback: ${analysis.sectionAnalysis.skills.feedback.join(', ')}
   Suggestions: ${analysis.sectionAnalysis.skills.suggestions.join(', ')}

🎓 EDUCATION - Score: ${analysis.sectionAnalysis.education.score}/100
   Feedback: ${analysis.sectionAnalysis.education.feedback.join(', ')}
   Suggestions: ${analysis.sectionAnalysis.education.suggestions.join(', ')}

=====================================================

🚀 AI-GENERATED IMPROVEMENTS
=====================================================

✨ IMPROVED PROFESSIONAL SUMMARY:
${analysis.enhancedContent.improvedSummary}

💡 SUGGESTED ACHIEVEMENT BULLET POINTS:
${analysis.enhancedContent.suggestedBulletPoints.map((bullet, index) => 
  `   ${index + 1}. ${bullet}`
).join('\n')}

🔧 OPTIMIZED SKILLS LIST:
${analysis.enhancedContent.optimizedSkills.join(' • ')}

=====================================================

📈 DETAILED RECOMMENDATIONS
=====================================================

🟢 HIGH PRIORITY - CONTENT TO ADD:
${analysis.suggestions.addContent.map((item, index) => 
  `   ${index + 1}. ${item}`
).join('\n')}

🟡 MEDIUM PRIORITY - CONTENT TO IMPROVE:
${analysis.suggestions.improveContent.map((item, index) => 
  `   ${index + 1}. ${item}`
).join('\n')}

🤖 ATS OPTIMIZATION RECOMMENDATIONS:
${analysis.suggestions.atsOptimizations.map((item, index) => 
  `   ${index + 1}. ${item}`
).join('\n')}

=====================================================

👤 EXTRACTED PROFILE DATA
=====================================================
Name: ${analysis.extractedData.name}
Email: ${analysis.extractedData.email}
Phone: ${analysis.extractedData.phone}

Current Skills: ${analysis.extractedData.skills.join(', ')}
Experience: ${analysis.extractedData.experience.join(', ')}
Education: ${analysis.extractedData.education.join(', ')}

=====================================================

📋 NEXT STEPS CHECKLIST
=====================================================
□ 1. Update professional summary with AI-generated version
□ 2. Add missing keywords naturally throughout resume
□ 3. Include suggested achievement bullet points
□ 4. Implement high-priority content additions
□ 5. Apply ATS optimization recommendations
□ 6. Re-run analysis to track improvements

=====================================================

Report generated by FoloUp AI Resume Analyzer
For more career tools, visit your FoloUp dashboard.

Need help implementing these suggestions?
Contact our career coaches for personalized assistance.
`;
    
    // Create and download file
    const blob = new Blob([reportContent], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Resume-Analysis-Report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Zap className="w-8 h-8 text-blue-600" />
          AI Resume & Job Matcher
        </h1>
        <p className="text-gray-600">
          Upload your resume and job description to get AI-powered matching analysis and ATS optimization
        </p>
      </div>

      {!analysis ? (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Resume Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Your Resume
              </CardTitle>
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
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-green-800">{file.name}</p>
                      <p className="text-sm text-green-600">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Job Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                placeholder="Paste the job description here...

Example:
We are seeking a Senior Frontend Developer with 5+ years of experience in React, TypeScript, and modern web technologies. The ideal candidate should have experience with:
- React.js and related ecosystem
- TypeScript and modern JavaScript
- State management (Redux, Context API)
- REST APIs and GraphQL
- Responsive design and CSS frameworks
- Git version control
- Agile development methodologies

Requirements:
- Bachelor's degree in Computer Science or related field
- 5+ years of frontend development experience
- Strong problem-solving skills
- Experience with testing frameworks (Jest, React Testing Library)
- Knowledge of CI/CD pipelines"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={12}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-sm text-gray-500 mt-2">
                Paste the complete job description for accurate matching analysis
              </p>
            </CardContent>
          </Card>

          {/* Analyze Button */}
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={analyzeResumeWithJob}
                disabled={loading || !file || !jobDescription.trim()}
                className="w-full h-12 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    AI is analyzing your resume...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    Analyze Resume with AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header with New Analysis Button */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">AI Analysis Results</h2>
            <Button
              onClick={() => {
                setFile(null);
                setJobDescription('');
                setAnalysis(null);
              }}
              variant="outline"
            >
              New Analysis
            </Button>
          </div>

          {/* Match Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Job Match Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className={`text-4xl font-bold px-4 py-2 rounded-lg ${getScoreColor(analysis.overallMatchScore)}`}>
                    {analysis.overallMatchScore}%
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${analysis.overallMatchScore}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {analysis.overallMatchScore >= 80 ? 'Excellent match! Your resume aligns well with the job.' :
                       analysis.overallMatchScore >= 60 ? 'Good match with room for improvement.' :
                       'Low match. Significant improvements needed.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  ATS Compatibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className={`text-4xl font-bold px-4 py-2 rounded-lg ${getScoreColor(analysis.atsScore)}`}>
                    {analysis.atsScore}%
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${analysis.atsScore}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      How well ATS systems can parse your resume
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Keywords Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Matching Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.matchingKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                    >
                      ✓ {keyword}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  These keywords from the job description are found in your resume
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Missing Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                    >
                      ⚠ {keyword}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Important keywords missing from your resume
                </p>
              </CardContent>
            </Card>
          </div>

          {/* AI Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                AI-Generated Improvements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Content */}
              <div>
                <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Content to Add
                </h4>
                <ul className="space-y-1">
                  {analysis.suggestions.addContent.map((suggestion, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-600 font-bold">+</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improve Content */}
              <div>
                <h4 className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Content to Improve
                </h4>
                <ul className="space-y-1">
                  {analysis.suggestions.improveContent.map((suggestion, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-600 font-bold">↑</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              {/* ATS Optimizations */}
              <div>
                <h4 className="font-semibold text-purple-600 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  ATS Optimizations
                </h4>
                <ul className="space-y-1">
                  {analysis.suggestions.atsOptimizations.map((suggestion, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-purple-600 font-bold">⚡</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                AI-Enhanced Content Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Improved Summary */}
              <div>
                <h4 className="font-semibold mb-2">Improved Professional Summary:</h4>
                <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
                  <p className="text-gray-800 italic">{analysis.enhancedContent.improvedSummary}</p>
                </div>
              </div>

              {/* Suggested Bullet Points */}
              <div>
                <h4 className="font-semibold mb-2">Suggested Achievement Bullet Points:</h4>
                <div className="space-y-2">
                  {analysis.enhancedContent.suggestedBulletPoints.map((bullet, index) => (
                    <div key={index} className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <p className="text-gray-800">• {bullet}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optimized Skills */}
              <div>
                <h4 className="font-semibold mb-2">Optimized Skills Section:</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.enhancedContent.optimizedSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                  onClick={handleExportReport}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Export Analysis Report
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-3 text-center">
                Download a comprehensive report with all AI suggestions and recommendations
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AIResumeJobMatcher;

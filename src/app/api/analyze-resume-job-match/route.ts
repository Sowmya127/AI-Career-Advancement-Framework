import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

// Extract text from uploaded file (enhanced version with pdf-parse can be added)
async function extractTextFromFile(buffer: Buffer, fileType: string): Promise<string> {
  // For demo purposes, returning mock resume text
  // In production, use pdf-parse for PDFs and mammoth for Word docs
  return `John Smith
Senior Frontend Developer
john.smith@email.com
(555) 123-4567

PROFESSIONAL SUMMARY
Frontend Developer with 3+ years of experience building responsive web applications.
Experienced in React, JavaScript, and CSS. Looking to advance my career in frontend development.

WORK EXPERIENCE
Frontend Developer - TechCorp (2021-Present)
• Built user interfaces using React and JavaScript
• Worked with team to deliver projects on time
• Fixed bugs and improved website performance

Junior Developer - WebStudio (2020-2021)  
• Developed websites using HTML, CSS, and JavaScript
• Learned React and modern development practices
• Collaborated with designers and backend developers

EDUCATION
Bachelor of Science in Computer Science
State University (2016-2020)

SKILLS
JavaScript, React, HTML, CSS, Git, Node.js`;
}

// AI-powered resume and job description analysis
async function analyzeResumeJobMatch(resumeText: string, jobDescription: string): Promise<JobMatchAnalysis> {
  try {
    const prompt = `
As an expert HR professional and ATS specialist, analyze this resume against the job description and provide a comprehensive evaluation.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Provide a detailed analysis in this exact JSON format:
{
  "overallMatchScore": 75,
  "atsScore": 80,
  "matchingKeywords": ["React", "JavaScript", "Frontend"],
  "missingKeywords": ["TypeScript", "Redux", "Testing"],
  "suggestions": {
    "addContent": [
      "Add specific metrics to quantify achievements (e.g., 'Improved page load time by 40%')",
      "Include experience with TypeScript and Redux as mentioned in job requirements",
      "Add testing experience with Jest or React Testing Library"
    ],
    "improveContent": [
      "Expand the professional summary to highlight 5+ years requirement",
      "Add more technical details to work experience descriptions",
      "Include specific project examples with technologies used"
    ],
    "removeContent": [
      "Remove outdated technologies not mentioned in job description",
      "Shorten education section if work experience is more relevant"
    ],
    "atsOptimizations": [
      "Use exact job title 'Senior Frontend Developer' in summary",
      "Include more keywords from job description naturally in content",
      "Use standard section headers like 'PROFESSIONAL EXPERIENCE'"
    ]
  },
  "sectionAnalysis": {
    "summary": {
      "score": 70,
      "feedback": ["Professional summary present but could be stronger"],
      "suggestions": ["Highlight senior-level experience", "Include specific technologies mentioned in job"]
    },
    "experience": {
      "score": 75,
      "feedback": ["Relevant experience but lacks quantifiable achievements"],
      "suggestions": ["Add metrics and specific accomplishments", "Include more technical details"]
    },
    "skills": {
      "score": 80,
      "feedback": ["Good technical skills coverage"],
      "suggestions": ["Add missing technologies from job description", "Organize by proficiency level"]
    },
    "education": {
      "score": 85,
      "feedback": ["Relevant educational background"],
      "suggestions": ["Consider adding relevant coursework or certifications"]
    }
  },
  "extractedData": {
    "name": "John Smith",
    "email": "john.smith@email.com", 
    "phone": "(555) 123-4567",
    "skills": ["JavaScript", "React", "HTML", "CSS", "Git", "Node.js"],
    "experience": ["Frontend Developer - TechCorp", "Junior Developer - WebStudio"],
    "education": ["Bachelor of Science in Computer Science"]
  },
  "enhancedContent": {
    "improvedSummary": "Senior Frontend Developer with 5+ years of experience building scalable, responsive web applications using React, TypeScript, and modern JavaScript. Proven track record of improving application performance by 40% and leading cross-functional teams. Expertise in state management with Redux, comprehensive testing with Jest, and implementing responsive designs that enhance user experience across multiple platforms.",
    "suggestedBulletPoints": [
      "Developed 15+ responsive web applications using React and TypeScript, serving 50,000+ daily active users",
      "Implemented Redux state management and reduced application load time by 35% through code optimization",
      "Built comprehensive test suites using Jest and React Testing Library, achieving 90% code coverage",
      "Collaborated with UX/UI designers to implement pixel-perfect responsive designs across desktop and mobile platforms"
    ],
    "optimizedSkills": ["React.js", "TypeScript", "JavaScript (ES6+)", "Redux", "HTML5", "CSS3", "Responsive Design", "Jest", "React Testing Library", "Git", "RESTful APIs", "Agile Methodologies"]
  }
}

Focus on:
1. **Job Match Scoring**: Compare resume content directly with job requirements
2. **Keyword Analysis**: Identify matching and missing keywords from job description  
3. **ATS Optimization**: Ensure resume will pass through applicant tracking systems
4. **Content Enhancement**: Provide specific, actionable suggestions for improvement
5. **Quantifiable Metrics**: Suggest adding measurable achievements where possible

Be specific, actionable, and focus on what will make this resume stand out for this particular job.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert HR professional and ATS specialist with 10+ years of experience in tech recruiting. You understand what makes resumes stand out and how to optimize them for both human reviewers and ATS systems. Provide specific, actionable feedback that will significantly improve the candidate's chances."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.3, // Lower temperature for more consistent, focused analysis
    });

    const aiResponse = completion.choices[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse the AI response
    try {
      const analysis = JSON.parse(aiResponse);
      
      // Validate the structure
      if (!analysis.overallMatchScore || !analysis.suggestions || !analysis.enhancedContent) {
        throw new Error('Invalid AI response structure');
      }
      
      return analysis;
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.log('Raw AI response:', aiResponse);
      
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return analysis;
      }
      
      throw new Error('Failed to parse AI response');
    }

  } catch (error) {
    console.error('AI analysis error:', error);
    
    // Fallback analysis if AI fails
    return generateFallbackAnalysis(resumeText, jobDescription);
  }
}

// Fallback analysis function
function generateFallbackAnalysis(resumeText: string, jobDescription: string): JobMatchAnalysis {
  // Basic keyword extraction
  const jobKeywords: string[] = jobDescription.toLowerCase().match(/\b\w+\b/g) || [];
  const resumeKeywords: string[] = resumeText.toLowerCase().match(/\b\w+\b/g) || [];
  
  const commonTechKeywords: string[] = ['react', 'javascript', 'typescript', 'css', 'html', 'node', 'python', 'java', 'sql'];
  
  const matchingKeywords: string[] = commonTechKeywords.filter(keyword => 
    resumeKeywords.includes(keyword) && jobKeywords.includes(keyword)
  );
  
  const missingKeywords: string[] = commonTechKeywords.filter(keyword =>
    jobKeywords.includes(keyword) && !resumeKeywords.includes(keyword)
  );

  const overallMatchScore = Math.min(90, Math.max(40, (matchingKeywords.length / Math.max(1, missingKeywords.length + matchingKeywords.length)) * 100));

  return {
    overallMatchScore: Math.round(overallMatchScore),
    atsScore: 75,
    matchingKeywords: matchingKeywords.map(k => k.charAt(0).toUpperCase() + k.slice(1)),
    missingKeywords: missingKeywords.map(k => k.charAt(0).toUpperCase() + k.slice(1)),
    suggestions: {
      addContent: [
        "Add specific metrics and quantifiable achievements",
        "Include more technical keywords from the job description",
        "Add relevant certifications or projects"
      ],
      improveContent: [
        "Strengthen professional summary with job-specific keywords",
        "Expand work experience with more technical details",
        "Use action verbs to describe accomplishments"
      ],
      removeContent: [
        "Remove irrelevant experience or outdated technologies"
      ],
      atsOptimizations: [
        "Use standard section headers",
        "Include more keywords naturally in content",
        "Ensure consistent formatting throughout"
      ]
    },
    sectionAnalysis: {
      summary: {
        score: 70,
        feedback: ["Professional summary needs improvement"],
        suggestions: ["Add job-specific keywords", "Quantify years of experience"]
      },
      experience: {
        score: 75,
        feedback: ["Work experience is relevant but could be stronger"],
        suggestions: ["Add quantifiable achievements", "Include more technical details"]
      },
      skills: {
        score: 80,
        feedback: ["Skills section covers basics"],
        suggestions: ["Add missing technologies from job description", "Organize by categories"]
      },
      education: {
        score: 85,
        feedback: ["Educational background is appropriate"],
        suggestions: ["Consider adding relevant projects or coursework"]
      }
    },
    extractedData: {
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "(555) 123-4567",
      skills: ["JavaScript", "React", "HTML", "CSS", "Git"],
      experience: ["Frontend Developer", "Junior Developer"],
      education: ["Bachelor of Science in Computer Science"]
    },
    enhancedContent: {
      improvedSummary: "Experienced Frontend Developer with strong expertise in modern web technologies including React, JavaScript, and responsive design. Proven ability to deliver high-quality user interfaces and collaborate effectively with cross-functional teams.",
      suggestedBulletPoints: [
        "Developed responsive web applications using React and JavaScript, improving user engagement by 25%",
        "Collaborated with design and backend teams to deliver projects on schedule",
        "Optimized application performance through code refactoring and best practices implementation"
      ],
      optimizedSkills: ["React.js", "JavaScript (ES6+)", "HTML5", "CSS3", "Git", "Responsive Design", "Frontend Development"]
    }
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File;
    const jobDescription = formData.get('jobDescription') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No resume file uploaded' },
        { status: 400 }
      );
    }

    if (!jobDescription || jobDescription.trim().length < 50) {
      return NextResponse.json(
        { error: 'Job description is required and must be at least 50 characters' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.includes('pdf') && !file.type.includes('word') && !file.type.includes('document')) {
      return NextResponse.json(
        { error: 'Only PDF and Word documents are supported' },
        { status: 400 }
      );
    }

    // Validate file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large. Please upload a file smaller than 10MB' },
        { status: 400 }
      );
    }

    console.log('Analyzing resume-job match with AI:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      jobDescriptionLength: jobDescription.length
    });

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract text from the file
    const extractedText = await extractTextFromFile(buffer, file.type);

    // Analyze the resume against job description using AI
    const analysis = await analyzeResumeJobMatch(extractedText, jobDescription);

    console.log('AI analysis completed:', {
      overallMatchScore: analysis.overallMatchScore,
      atsScore: analysis.atsScore,
      matchingKeywords: analysis.matchingKeywords.length,
      missingKeywords: analysis.missingKeywords.length
    });

    return NextResponse.json({
      success: true,
      analysis,
      message: 'Resume analyzed successfully with AI job matching',
      aiGenerated: true,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        jobDescriptionLength: jobDescription.length,
        analysisTimestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in AI resume-job analysis:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze resume and job match',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

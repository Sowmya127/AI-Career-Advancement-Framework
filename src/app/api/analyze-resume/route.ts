import { NextRequest, NextResponse } from 'next/server';

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

// Function to extract text from PDF (you can use libraries like pdf-parse)
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // For now, return mock text. In production, use pdf-parse or similar library
  // const pdf = require('pdf-parse');
  // const data = await pdf(buffer);
  // return data.text;
  
  return `John Doe
Software Engineer
john.doe@email.com
(555) 123-4567

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years of experience in web development.
Proficient in JavaScript, React, Node.js, and Python.

WORK EXPERIENCE
Senior Software Engineer - Tech Company (2021-Present)
• Developed and maintained web applications using React and Node.js
• Led a team of 3 junior developers
• Improved application performance by 40%

Software Engineer - StartupXYZ (2019-2021)
• Built full-stack applications using Python and Django
• Collaborated with cross-functional teams
• Implemented automated testing procedures

EDUCATION
Bachelor of Science in Computer Science
University of Technology (2015-2019)

SKILLS
JavaScript, React, Node.js, Python, Django, SQL, Git, AWS`;
}

// Function to analyze resume content
function analyzeResumeContent(text: string): ResumeAnalysis {
  const lines = text.split('\n').filter(line => line.trim());
  
  // Extract basic information
  const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/;
  const phoneRegex = /\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/;
  
  const email = text.match(emailRegex)?.[0] || '';
  const phone = text.match(phoneRegex)?.[0] || '';
  const name = lines[0] || '';

  // Extract skills (looking for common programming languages and technologies)
  const skillKeywords = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue',
    'SQL', 'MongoDB', 'AWS', 'Docker', 'Git', 'TypeScript', 'HTML', 'CSS',
    'Django', 'Flask', 'Express', 'PostgreSQL', 'MySQL', 'Redis'
  ];
  
  const extractedSkills = skillKeywords.filter(skill =>
    text.toLowerCase().includes(skill.toLowerCase())
  );

  // Extract experience (look for job titles and companies)
  const experienceLines = lines.filter(line =>
    line.includes('Engineer') || line.includes('Developer') || line.includes('Manager') ||
    line.includes('2019') || line.includes('2020') || line.includes('2021') ||
    line.includes('2022') || line.includes('2023') || line.includes('2024')
  );

  // Extract education
  const educationLines = lines.filter(line =>
    line.toLowerCase().includes('bachelor') || line.toLowerCase().includes('master') ||
    line.toLowerCase().includes('university') || line.toLowerCase().includes('college') ||
    line.toLowerCase().includes('degree')
  );

  // Analyze sections
  const hasContactInfo = !!(email && phone && name);
  const hasSummary = text.toLowerCase().includes('summary') || text.toLowerCase().includes('objective');
  const hasExperience = experienceLines.length > 0;
  const hasEducation = educationLines.length > 0;
  const hasSkills = extractedSkills.length > 0;

  // Calculate scores
  const contactScore = hasContactInfo ? (email && phone && name ? 100 : 70) : 30;
  const summaryScore = hasSummary ? 85 : 40;
  const experienceScore = hasExperience ? Math.min(experienceLines.length * 20, 100) : 20;
  const educationScore = hasEducation ? 90 : 50;
  const skillsScore = extractedSkills.length > 0 ? Math.min(extractedSkills.length * 15, 100) : 30;
  
  // Check formatting (basic checks)
  const hasGoodLength = text.length > 500 && text.length < 5000;
  const hasProperSections = text.includes('EXPERIENCE') || text.includes('EDUCATION');
  const formattingScore = (hasGoodLength ? 50 : 20) + (hasProperSections ? 50 : 30);

  const overallScore = Math.round(
    (contactScore + summaryScore + experienceScore + educationScore + skillsScore + formattingScore) / 6
  );

  // ATS Compliance analysis
  const atsIssues = [];
  const atsRecommendations = [];

  if (!hasContactInfo) {
    atsIssues.push('Missing complete contact information');
    atsRecommendations.push('Include your full name, phone number, and email address');
  }

  if (extractedSkills.length < 5) {
    atsIssues.push('Limited technical skills listed');
    atsRecommendations.push('Add more relevant technical skills and keywords');
  }

  if (!hasSummary) {
    atsIssues.push('Missing professional summary or objective');
    atsRecommendations.push('Add a compelling professional summary at the top');
  }

  if (text.length < 500) {
    atsIssues.push('Resume appears too short');
    atsRecommendations.push('Expand your experience descriptions with quantifiable achievements');
  }

  const atsScore = Math.max(20, 100 - (atsIssues.length * 20));

  return {
    overallScore,
    sections: {
      contactInfo: {
        score: contactScore,
        feedback: hasContactInfo ? ['Complete contact information found'] : ['Missing contact details'],
        suggestions: hasContactInfo ? [] : ['Add your full name, email, and phone number']
      },
      summary: {
        score: summaryScore,
        feedback: hasSummary ? ['Professional summary present'] : ['No summary section found'],
        suggestions: hasSummary ? ['Consider adding quantifiable achievements'] : ['Add a compelling professional summary']
      },
      experience: {
        score: experienceScore,
        feedback: hasExperience ? [`Found ${experienceLines.length} experience entries`] : ['No work experience found'],
        suggestions: hasExperience ? ['Add more quantifiable achievements'] : ['Include your work experience with specific accomplishments']
      },
      education: {
        score: educationScore,
        feedback: hasEducation ? ['Education section present'] : ['Education section missing'],
        suggestions: hasEducation ? [] : ['Add your educational background']
      },
      skills: {
        score: skillsScore,
        feedback: extractedSkills.length > 0 ? [`Found ${extractedSkills.length} technical skills`] : ['Limited skills detected'],
        suggestions: extractedSkills.length < 5 ? ['Add more relevant technical skills'] : ['Consider organizing skills by category']
      },
      formatting: {
        score: formattingScore,
        feedback: hasGoodLength ? ['Appropriate length'] : ['Resume length needs adjustment'],
        suggestions: !hasGoodLength ? ['Aim for 1-2 pages with well-organized sections'] : ['Use consistent formatting throughout']
      }
    },
    atsCompliance: {
      score: atsScore,
      issues: atsIssues,
      recommendations: atsRecommendations
    },
    extractedData: {
      name,
      email,
      phone,
      skills: extractedSkills,
      experience: experienceLines,
      education: educationLines
    }
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.type.includes('pdf') && !file.type.includes('word') && !file.type.includes('document')) {
      return NextResponse.json(
        { error: 'Only PDF and Word documents are supported' },
        { status: 400 }
      );
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large. Please upload a file smaller than 10MB' },
        { status: 400 }
      );
    }

    console.log('Analyzing resume:', file.name, file.type, file.size);

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract text from the file
    let extractedText = '';
    if (file.type.includes('pdf')) {
      extractedText = await extractTextFromPDF(buffer);
    } else {
      // For Word documents, you would use a library like mammoth
      // For now, we'll use the mock text
      extractedText = await extractTextFromPDF(buffer);
    }

    // Analyze the resume content
    const analysis = analyzeResumeContent(extractedText);

    console.log('Analysis completed. Overall score:', analysis.overallScore);

    return NextResponse.json({
      success: true,
      analysis,
      message: 'Resume analyzed successfully'
    });

  } catch (error) {
    console.error('Error analyzing resume:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze resume',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

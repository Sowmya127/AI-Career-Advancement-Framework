import { NextRequest, NextResponse } from 'next/server';

interface QuestionGenerationRequest {
  jobDescription: string;
  position: string;
  numberOfQuestions?: string;
  duration?: string;
}

interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export async function POST(request: NextRequest) {
  try {
    const body: QuestionGenerationRequest = await request.json();
    const { jobDescription, position, numberOfQuestions = '5', duration = '30' } = body;

    if (!jobDescription || !position) {
      return NextResponse.json(
        { error: 'Job description and position are required' },
        { status: 400 }
      );
    }

    console.log('Generating questions for:', { position, numberOfQuestions });

    // Generate intelligent questions based on job description
    const fallbackQuestions: InterviewQuestion[] = [
      {
        id: 'q1',
        question: `Tell me about your experience with ${position} roles and what attracted you to this field.`,
        category: 'Experience',
        difficulty: 'easy'
      },
      {
        id: 'q2',
        question: 'Describe a challenging project you worked on. What was your approach and what did you learn?',
        category: 'Behavioral',
        difficulty: 'medium'
      },
      {
        id: 'q3',
        question: 'How do you handle working under pressure and tight deadlines?',
        category: 'Behavioral',
        difficulty: 'medium'
      },
      {
        id: 'q4',
        question: 'What technical skills or tools mentioned in the job description are you most excited to work with?',
        category: 'Technical',
        difficulty: 'easy'
      },
      {
        id: 'q5',
        question: 'Where do you see yourself professionally in the next 3-5 years?',
        category: 'Motivation',
        difficulty: 'easy'
      },
      {
        id: 'q6',
        question: 'Tell me about a time when you had to learn something new quickly. How did you approach it?',
        category: 'Problem-solving',
        difficulty: 'medium'
      },
      {
        id: 'q7',
        question: 'What interests you most about this specific role and our company?',
        category: 'Motivation',
        difficulty: 'easy'
      },
      {
        id: 'q8',
        question: 'Describe a situation where you had to work with a difficult team member. How did you handle it?',
        category: 'Behavioral',
        difficulty: 'hard'
      },
      {
        id: 'q9',
        question: 'What would you do if you disagreed with a technical decision made by your team lead?',
        category: 'Behavioral',
        difficulty: 'hard'
      },
      {
        id: 'q10',
        question: 'How do you prioritize your tasks when you have multiple urgent deadlines?',
        category: 'Problem-solving',
        difficulty: 'medium'
      }
    ];

    // Add role-specific questions based on job description content
    const customQuestions: InterviewQuestion[] = [];
    const jobDescLower = jobDescription.toLowerCase();
    
    if (jobDescLower.includes('react') || jobDescLower.includes('frontend') || jobDescLower.includes('javascript')) {
      customQuestions.push({
        id: 'tech1',
        question: 'How do you manage state in React applications? Can you compare different approaches like Context API, Redux, or Zustand?',
        category: 'Technical',
        difficulty: 'medium'
      });
    }
    
    if (jobDescLower.includes('backend') || jobDescLower.includes('api') || jobDescLower.includes('server')) {
      customQuestions.push({
        id: 'tech2',
        question: 'How do you design RESTful APIs? What are some best practices you follow for API development?',
        category: 'Technical',
        difficulty: 'medium'
      });
    }
    
    if (jobDescLower.includes('database') || jobDescLower.includes('sql') || jobDescLower.includes('mongodb')) {
      customQuestions.push({
        id: 'tech3',
        question: 'How do you approach database design and optimization? What strategies do you use for query performance?',
        category: 'Technical',
        difficulty: 'hard'
      });
    }
    
    if (jobDescLower.includes('leadership') || jobDescLower.includes('lead') || jobDescLower.includes('manager')) {
      customQuestions.push({
        id: 'lead1',
        question: 'Describe your experience leading a team. How do you handle conflicts and motivate team members?',
        category: 'Behavioral',
        difficulty: 'hard'
      });
    }

    if (jobDescLower.includes('python') || jobDescLower.includes('django') || jobDescLower.includes('flask')) {
      customQuestions.push({
        id: 'tech4',
        question: 'What Python best practices do you follow when writing production code? How do you handle testing?',
        category: 'Technical',
        difficulty: 'medium'
      });
    }

    if (jobDescLower.includes('aws') || jobDescLower.includes('cloud') || jobDescLower.includes('docker')) {
      customQuestions.push({
        id: 'tech5',
        question: 'How do you approach deploying and scaling applications in cloud environments?',
        category: 'Technical',
        difficulty: 'hard'
      });
    }

    // Combine custom and fallback questions
    const allQuestions = [...customQuestions, ...fallbackQuestions];
    const numQuestions = Math.min(parseInt(numberOfQuestions), allQuestions.length);
    const selectedQuestions = allQuestions.slice(0, numQuestions);

    console.log(`Generated ${selectedQuestions.length} questions successfully`);

    return NextResponse.json({
      response: {
        questions: selectedQuestions
      }
    });

  } catch (error) {
    console.error('Error in generate-interview-questions API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate questions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Optional: Add GET method for testing
export async function GET() {
  return NextResponse.json({ 
    message: 'Generate Interview Questions API is working!',
    endpoint: '/api/generate-interview-questions',
    method: 'POST'
  });
}



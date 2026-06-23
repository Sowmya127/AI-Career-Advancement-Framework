import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface QuizConfig {
  jobTitle: string;
  jobDescription: string;
  numQuestions: number;
  timeLimit: number;
}

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

export async function POST(request: NextRequest) {
  try {
    const config: QuizConfig = await request.json();
    
    const { jobTitle, jobDescription, numQuestions } = config;

    if (!jobTitle || !jobDescription || !numQuestions) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (numQuestions < 5 || numQuestions > 20) {
      return NextResponse.json(
        { error: 'Number of questions must be between 5 and 20' },
        { status: 400 }
      );
    }

    const prompt = createQuizPrompt(jobTitle, jobDescription, numQuestions);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert technical interviewer and quiz generator. Generate realistic, practical questions that would be asked in actual job interviews. Focus on skills, technologies, and scenarios mentioned in the job description."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let quizData;
    try {
      quizData = JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      throw new Error('Invalid response format from AI');
    }

    // Validate and format the questions
    const questions: QuizQuestion[] = quizData.questions.map((q: any, index: number) => ({
      id: index + 1,
      question: q.question,
      options: {
        A: q.options.A,
        B: q.options.B,
        C: q.options.C,
        D: q.options.D,
      },
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || `The correct answer is ${q.correctAnswer}.`
    }));

    // Validate that we have the right number of questions
    if (questions.length !== numQuestions) {
      console.warn(`Expected ${numQuestions} questions, got ${questions.length}`);
    }

    return NextResponse.json({
      questions: questions.slice(0, numQuestions), // Ensure we return exactly the requested number
      metadata: {
        jobTitle,
        totalQuestions: numQuestions,
        generatedAt: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Quiz generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate quiz. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function createQuizPrompt(jobTitle: string, jobDescription: string, numQuestions: number): string {
  return `Generate exactly ${numQuestions} multiple choice questions for a ${jobTitle} position based on the following job description.

Job Description:
${jobDescription}

Requirements:
1. Create exactly ${numQuestions} questions
2. Each question should have exactly 4 options (A, B, C, D)
3. Questions should test practical knowledge relevant to this specific role
4. Include a mix of:
   - Technical skills mentioned in the job description
   - Problem-solving scenarios
   - Best practices in the field
   - Tools and technologies mentioned
5. Questions should be at an appropriate difficulty level for the role
6. Provide clear, concise explanations for correct answers
7. Ensure only ONE option is clearly the best answer

Format your response as valid JSON:
{
  "questions": [
    {
      "question": "Clear, specific question text here",
      "options": {
        "A": "First option",
        "B": "Second option", 
        "C": "Third option",
        "D": "Fourth option"
      },
      "correctAnswer": "A",
      "explanation": "Brief explanation of why this answer is correct and others are wrong"
    }
  ]
}

Important: 
- Make questions specific to the technologies and requirements mentioned in the job description
- Avoid generic questions that could apply to any job
- Ensure realistic, interview-style questions that test practical knowledge
- Double-check that each question has exactly one clearly correct answer`;
}

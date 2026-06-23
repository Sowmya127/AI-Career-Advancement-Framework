/**
 * Simplified JSON utilities for parsing AI responses
 */

export interface ParseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Cleans JSON response by removing markdown formatting
 */
export function cleanJSONResponse(responseString: string): string {
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

/**
 * Safely parses JSON with error handling
 */
export function safeJSONParse<T = any>(jsonString: string, fallback?: T): ParseResult<T> {
  if (!jsonString) {
    return {
      success: false,
      error: 'Empty JSON string provided',
      data: fallback
    };
  }

  try {
    const cleaned = cleanJSONResponse(jsonString);
    const parsed = JSON.parse(cleaned);
    
    return {
      success: true,
      data: parsed
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
    
    console.error('JSON parse error:', {
      error: errorMessage,
      original: jsonString
    });
    
    return {
      success: false,
      error: errorMessage,
      data: fallback
    };
  }
}

/**
 * Creates fallback questions when parsing fails
 */
export function createFallbackQuestionsResponse(position = 'this position') {
  return {
    questions: [
      {
        id: 'fallback1',
        question: `Tell me about your experience with ${position} roles.`,
        category: 'Experience',
        difficulty: 'easy' as const
      },
      {
        id: 'fallback2',
        question: 'Describe a challenging project you worked on and how you overcame obstacles.',
        category: 'Behavioral',
        difficulty: 'medium' as const
      },
      {
        id: 'fallback3',
        question: 'How do you stay updated with the latest technologies in your field?',
        category: 'Technical',
        difficulty: 'easy' as const
      },
      {
        id: 'fallback4',
        question: 'Where do you see yourself in 5 years?',
        category: 'Behavioral',
        difficulty: 'easy' as const
      }
    ]
  };
}

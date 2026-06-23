import { NextRequest, NextResponse } from 'next/server';

interface UserPreferences {
  currentSkills: string[];
  targetRole: string;
  experience: string;
  learningStyle: string[];
  timeCommitment: string;
}

interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  resources: {
    type: 'video' | 'article' | 'course' | 'practice';
    title: string;
    url: string;
    platform: string;
  }[];
  skills: string[];
}

// You can integrate with OpenAI here for more dynamic results
async function generateRoadmapWithAI(preferences: UserPreferences): Promise<RoadmapStep[]> {
  // For now, we'll use a template-based approach
  // You can replace this with actual OpenAI API calls later
  
  const roadmapTemplates: { [key: string]: RoadmapStep[] } = {
    'Frontend Developer': [
      {
        id: '1',
        title: 'Master HTML & CSS Fundamentals',
        description: 'Build a solid foundation with semantic HTML and modern CSS including Flexbox and Grid.',
        duration: '2-3 weeks',
        resources: [
          {
            type: 'video',
            title: 'HTML & CSS Full Course',
            url: 'https://www.freecodecamp.org/learn/responsive-web-design/',
            platform: 'FreeCodeCamp'
          },
          {
            type: 'practice',
            title: 'CSS Grid Garden',
            url: 'https://cssgridgarden.com/',
            platform: 'CSS Grid Garden'
          },
          {
            type: 'article',
            title: 'Complete Guide to Flexbox',
            url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/',
            platform: 'CSS-Tricks'
          }
        ],
        skills: ['HTML5', 'CSS3', 'Flexbox', 'CSS Grid', 'Responsive Design']
      },
      {
        id: '2',
        title: 'JavaScript Programming',
        description: 'Learn modern JavaScript ES6+, DOM manipulation, and asynchronous programming.',
        duration: '4-6 weeks',
        resources: [
          {
            type: 'course',
            title: 'JavaScript: The Complete Guide',
            url: 'https://www.udemy.com/course/javascript-the-complete-guide-2020-beginner-advanced/',
            platform: 'Udemy'
          },
          {
            type: 'practice',
            title: 'JavaScript30 Challenge',
            url: 'https://javascript30.com/',
            platform: 'JavaScript30'
          },
          {
            type: 'article',
            title: 'You Don\'t Know JS Book Series',
            url: 'https://github.com/getify/You-Dont-Know-JS',
            platform: 'GitHub'
          }
        ],
        skills: ['JavaScript ES6+', 'DOM Manipulation', 'Async/Await', 'Promises', 'Event Handling']
      },
      {
        id: '3',
        title: 'React.js Development',
        description: 'Build dynamic user interfaces with React hooks, state management, and modern patterns.',
        duration: '6-8 weeks',
        resources: [
          {
            type: 'course',
            title: 'React - The Complete Guide',
            url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/',
            platform: 'Udemy'
          },
          {
            type: 'video',
            title: 'React Tutorial for Beginners',
            url: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
            platform: 'YouTube'
          },
          {
            type: 'practice',
            title: 'Build a Todo App',
            url: 'https://reactjs.org/tutorial/tutorial.html',
            platform: 'React Official'
          }
        ],
        skills: ['React.js', 'JSX', 'Hooks', 'State Management', 'Component Architecture']
      },
      {
        id: '4',
        title: 'Advanced Frontend Tools',
        description: 'Learn build tools, testing, and deployment strategies for professional development.',
        duration: '3-4 weeks',
        resources: [
          {
            type: 'course',
            title: 'Webpack Academy',
            url: 'https://webpack.academy/',
            platform: 'Webpack Academy'
          },
          {
            type: 'article',
            title: 'Jest Testing Guide',
            url: 'https://jestjs.io/docs/getting-started',
            platform: 'Jest'
          },
          {
            type: 'video',
            title: 'Git & GitHub Tutorial',
            url: 'https://www.youtube.com/watch?v=RGOj5yH7evk',
            platform: 'YouTube'
          }
        ],
        skills: ['Webpack', 'Git/GitHub', 'Jest Testing', 'NPM/Yarn', 'CI/CD Basics']
      }
    ],
    'Backend Developer': [
      {
        id: '1',
        title: 'Server-Side Programming',
        description: 'Master a backend language and understand server fundamentals.',
        duration: '4-6 weeks',
        resources: [
          {
            type: 'course',
            title: 'Node.js Complete Course',
            url: 'https://www.udemy.com/course/the-complete-nodejs-developer-course-2/',
            platform: 'Udemy'
          },
          {
            type: 'video',
            title: 'Node.js Crash Course',
            url: 'https://www.youtube.com/watch?v=fBNz5xF-Kx4',
            platform: 'YouTube'
          },
          {
            type: 'practice',
            title: 'Build REST APIs',
            url: 'https://nodejs.org/en/docs/guides/',
            platform: 'Node.js Official'
          }
        ],
        skills: ['Node.js', 'Express.js', 'REST APIs', 'HTTP/HTTPS', 'Server Architecture']
      },
      {
        id: '2',
        title: 'Database Management',
        description: 'Learn both SQL and NoSQL databases for data persistence.',
        duration: '3-4 weeks',
        resources: [
          {
            type: 'course',
            title: 'Complete SQL Bootcamp',
            url: 'https://www.udemy.com/course/the-complete-sql-bootcamp/',
            platform: 'Udemy'
          },
          {
            type: 'article',
            title: 'MongoDB University',
            url: 'https://university.mongodb.com/',
            platform: 'MongoDB'
          },
          {
            type: 'practice',
            title: 'SQL Practice Problems',
            url: 'https://sqlbolt.com/',
            platform: 'SQLBolt'
          }
        ],
        skills: ['SQL', 'MongoDB', 'Database Design', 'Query Optimization', 'Data Modeling']
      }
    ],
    'Data Scientist': [
      {
        id: '1',
        title: 'Python & Statistics',
        description: 'Build foundation in Python programming and statistical analysis.',
        duration: '6-8 weeks',
        resources: [
          {
            type: 'course',
            title: 'Python for Data Science',
            url: 'https://www.coursera.org/learn/python-data-analysis',
            platform: 'Coursera'
          },
          {
            type: 'practice',
            title: 'Kaggle Learn',
            url: 'https://www.kaggle.com/learn',
            platform: 'Kaggle'
          }
        ],
        skills: ['Python', 'Pandas', 'NumPy', 'Statistics', 'Data Visualization']
      }
    ]
  };

  // Get the base template for the target role
  let baseRoadmap = roadmapTemplates[preferences.targetRole] || roadmapTemplates['Frontend Developer'];

  // Customize based on current skills and preferences
  return baseRoadmap.map(step => ({
    ...step,
    resources: step.resources.filter(resource => {
      // Filter resources based on learning style preferences
      if (preferences.learningStyle.includes('Video Tutorials') && resource.type === 'video') return true;
      if (preferences.learningStyle.includes('Written Articles') && resource.type === 'article') return true;
      if (preferences.learningStyle.includes('Interactive Courses') && resource.type === 'course') return true;
      if (preferences.learningStyle.includes('Practice Projects') && resource.type === 'practice') return true;
      return preferences.learningStyle.length === 0; // If no preference, include all
    })
  }));
}

export async function POST(request: NextRequest) {
  try {
    const preferences: UserPreferences = await request.json();

    // Validate required fields
    if (!preferences.targetRole || !preferences.experience) {
      return NextResponse.json(
        { error: 'Target role and experience level are required' },
        { status: 400 }
      );
    }

    console.log('Generating roadmap for:', preferences);

    // Generate the roadmap
    const roadmap = await generateRoadmapWithAI(preferences);

    return NextResponse.json({
      success: true,
      roadmap,
      message: `Generated ${roadmap.length} steps for ${preferences.targetRole}`
    });

  } catch (error) {
    console.error('Error generating roadmap:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate roadmap',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ExternalLink, ArrowDown, CheckCircle, Play, Star, Book, Code, Trophy, Target } from 'lucide-react';

interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  resources: {
    type: 'video' | 'article' | 'course' | 'practice';
    title: string;
    url: string;
    platform: string;
  }[];
  skills: string[];
  completed?: boolean;
}

interface UserPreferences {
  currentSkills: string[];
  targetRole: string;
  experience: string;
  learningStyle: string[];
  timeCommitment: string;
}

// Helper function to determine step count based on preferences
function getStepCount(preferences: UserPreferences): number {
  // Default to 4 steps
  let stepCount = 4;
  
  // Adjust based on time commitment
  if (preferences.timeCommitment === '1-5 hours') {
    stepCount = 3; // Fewer steps for limited time
  } else if (preferences.timeCommitment === '20+ hours') {
    stepCount = 5; // More detailed roadmap for high commitment
  }
  
  // Adjust based on experience level
  if (preferences.experience.includes('Beginner')) {
    stepCount = Math.max(stepCount, 4); // Beginners need more detailed steps
  } else if (preferences.experience.includes('Expert')) {
    stepCount = Math.min(stepCount, 3); // Experts can handle condensed roadmaps
  }
  
  return stepCount;
}

// Helper function to adjust step count
function adjustStepCount(
  originalSteps: RoadmapStep[], 
  targetCount: number, 
  preferences: UserPreferences
): RoadmapStep[] {
  if (targetCount === originalSteps.length) {
    return originalSteps;
  }
  
  if (targetCount < originalSteps.length) {
    // Combine steps if we need fewer
    return originalSteps.slice(0, targetCount).map((step, index) => {
      if (index === targetCount - 1 && originalSteps.length > targetCount) {
        // Combine remaining steps into the last one
        const remainingSteps = originalSteps.slice(targetCount - 1);
        return {
          ...step,
          title: `${step.title} & Advanced Concepts`,
          description: `${step.description} This comprehensive step also covers advanced topics to accelerate your path to ${preferences.targetRole}.`,
          skills: [...step.skills, ...remainingSteps.slice(1).flatMap(s => s.skills.slice(0, 2))],
          duration: step.duration.replace(/(\d+)/g, (match) => (parseInt(match) + 2).toString())
        };
      }
      return step;
    });
  } else {
    // Add more steps if we need more
    const additionalSteps: RoadmapStep[] = [];
    for (let i = originalSteps.length; i < targetCount; i++) {
      additionalSteps.push({
        id: (i + 1).toString(),
        title: `Specialized ${preferences.targetRole} Skills ${i - originalSteps.length + 1}`,
        description: `Advanced specialized skills and real-world application for ${preferences.targetRole}.`,
        duration: '4-6 weeks',
        difficulty: 'hard' as const,
        skills: ['Advanced Concepts', 'Industry Applications', 'Professional Skills'],
        resources: [
          {
            type: 'course',
            title: 'Advanced Professional Development',
            url: 'https://www.coursera.org/professional-certificates',
            platform: 'Coursera'
          },
          {
            type: 'practice',
            title: 'Real-world Projects',
            url: 'https://github.com/',
            platform: 'GitHub'
          }
        ]
      });
    }
    return [...originalSteps, ...additionalSteps];
  }
}

// Enhanced roadmap generator with 4 steps and dynamic step count
function generateLocalRoadmap(preferences: UserPreferences): RoadmapStep[] {
  const targetRole = preferences.targetRole.toLowerCase();
  
  // Detect role type
  let roleType = 'general';
  
  if (targetRole.includes('data') || targetRole.includes('ml') || targetRole.includes('ai')) {
    roleType = 'data_science';
  } else if (targetRole.includes('frontend') || targetRole.includes('react') || targetRole.includes('ui')) {
    roleType = 'frontend';
  } else if (targetRole.includes('backend') || targetRole.includes('api') || targetRole.includes('server')) {
    roleType = 'backend';
  } else if (targetRole.includes('devops') || targetRole.includes('cloud')) {
    roleType = 'devops';
  }

  // Enhanced roadmaps with 4 steps each
  const roadmaps: { [key: string]: RoadmapStep[] } = {
    'data_science': [
      {
        id: '1',
        title: 'Python Programming & Data Fundamentals',
        description: `Master Python programming specifically for ${preferences.targetRole}. Learn data manipulation with pandas, numerical computing with NumPy, and data visualization.`,
        duration: '4-6 weeks',
        difficulty: 'medium',
        skills: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Data Cleaning'],
        resources: [
          { 
            type: 'course', 
            title: 'Python for Data Science', 
            url: 'https://www.coursera.org/learn/python-data-analysis', 
            platform: 'Coursera' 
          },
          { 
            type: 'practice', 
            title: 'Kaggle Learn Python', 
            url: 'https://www.kaggle.com/learn/python', 
            platform: 'Kaggle' 
          }
        ]
      },
      {
        id: '2',
        title: 'Statistics & Exploratory Data Analysis',
        description: `Build statistical foundation and learn data exploration techniques essential for ${preferences.targetRole}.`,
        duration: '5-7 weeks',
        difficulty: 'medium',
        skills: ['Statistics', 'Hypothesis Testing', 'Data Visualization', 'EDA', 'Seaborn'],
        resources: [
          { 
            type: 'course', 
            title: 'Statistics for Data Science', 
            url: 'https://www.coursera.org/learn/statistical-thinking', 
            platform: 'Coursera' 
          },
          { 
            type: 'practice', 
            title: 'Kaggle EDA Notebooks', 
            url: 'https://www.kaggle.com/learn/data-visualization', 
            platform: 'Kaggle' 
          }
        ]
      },
      {
        id: '3',
        title: 'Machine Learning & Model Building',
        description: `Learn ML algorithms and model building techniques for ${preferences.targetRole}.`,
        duration: '6-8 weeks',
        difficulty: 'hard',
        skills: ['Scikit-learn', 'Machine Learning', 'Model Evaluation', 'Feature Engineering'],
        resources: [
          { 
            type: 'course', 
            title: 'Machine Learning by Andrew Ng', 
            url: 'https://www.coursera.org/learn/machine-learning', 
            platform: 'Coursera' 
          },
          { 
            type: 'practice', 
            title: 'Kaggle Competitions', 
            url: 'https://www.kaggle.com/competitions', 
            platform: 'Kaggle' 
          }
        ]
      },
      {
        id: '4',
        title: 'Advanced ML & Production Deployment',
        description: `Advanced techniques and production deployment for ${preferences.targetRole}. Learn deep learning and MLOps.`,
        duration: '8-12 weeks',
        difficulty: 'hard',
        skills: ['TensorFlow', 'Deep Learning', 'MLOps', 'Model Deployment', 'Cloud ML'],
        resources: [
          { 
            type: 'course', 
            title: 'Deep Learning Specialization', 
            url: 'https://www.coursera.org/specializations/deep-learning', 
            platform: 'Coursera' 
          },
          { 
            type: 'course', 
            title: 'MLOps for Production', 
            url: 'https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops', 
            platform: 'Coursera' 
          }
        ]
      }
    ],
    
    'frontend': [
      {
        id: '1',
        title: 'HTML, CSS & JavaScript Fundamentals',
        description: `Master the core web technologies essential for ${preferences.targetRole}.`,
        duration: '3-5 weeks',
        difficulty: 'easy',
        skills: ['HTML5', 'CSS3', 'JavaScript ES6+', 'DOM Manipulation', 'Responsive Design'],
        resources: [
          { 
            type: 'course', 
            title: 'Web Development Fundamentals', 
            url: 'https://www.freecodecamp.org/learn/', 
            platform: 'freeCodeCamp' 
          },
          { 
            type: 'practice', 
            title: 'JavaScript30 Challenge', 
            url: 'https://javascript30.com/', 
            platform: 'JavaScript30' 
          }
        ]
      },
      {
        id: '2',
        title: 'Modern JavaScript & Frameworks',
        description: `Learn advanced JavaScript concepts and modern development practices for ${preferences.targetRole}.`,
        duration: '4-6 weeks',
        difficulty: 'medium',
        skills: ['Async/Await', 'Promises', 'Modules', 'Build Tools', 'Package Managers'],
        resources: [
          { 
            type: 'course', 
            title: 'JavaScript Complete Guide', 
            url: 'https://www.udemy.com/course/javascript-the-complete-guide-2020-beginner-advanced/', 
            platform: 'Udemy' 
          },
          { 
            type: 'practice', 
            title: 'Modern JS Projects', 
            url: 'https://github.com/trekhleb/javascript-algorithms', 
            platform: 'GitHub' 
          }
        ]
      },
      {
        id: '3',
        title: 'React.js Development & State Management',
        description: `Build modern UIs for ${preferences.targetRole}. Master React and component architecture.`,
        duration: '6-8 weeks',
        difficulty: 'medium',
        skills: ['React.js', 'JSX', 'Hooks', 'State Management', 'Redux/Context API'],
        resources: [
          { 
            type: 'course', 
            title: 'Complete React Developer Course', 
            url: 'https://www.udemy.com/course/react-2nd-edition/', 
            platform: 'Udemy' 
          },
          { 
            type: 'practice', 
            title: 'React Projects', 
            url: 'https://github.com/facebook/react', 
            platform: 'GitHub' 
          }
        ]
      },
      {
        id: '4',
        title: 'Advanced Frontend & Production Skills',
        description: `Professional development setup and advanced skills for ${preferences.targetRole}.`,
        duration: '6-10 weeks',
        difficulty: 'hard',
        skills: ['TypeScript', 'Testing (Jest/Cypress)', 'Performance Optimization', 'CI/CD', 'Advanced CSS'],
        resources: [
          { 
            type: 'course', 
            title: 'TypeScript Complete Course', 
            url: 'https://www.udemy.com/course/understanding-typescript/', 
            platform: 'Udemy' 
          },
          { 
            type: 'course', 
            title: 'Frontend Testing Best Practices', 
            url: 'https://testingjavascript.com/', 
            platform: 'Testing JavaScript' 
          }
        ]
      }
    ],

    'backend': [
      {
        id: '1',
        title: 'Programming Language Mastery',
        description: `Master a backend programming language for ${preferences.targetRole}.`,
        duration: '4-6 weeks',
        difficulty: 'medium',
        skills: ['Node.js/Python/Java', 'OOP Concepts', 'Data Structures', 'Algorithms'],
        resources: [
          { 
            type: 'course', 
            title: 'Backend Programming Fundamentals', 
            url: 'https://www.coursera.org/learn/programming-fundamentals', 
            platform: 'Coursera' 
          },
          { 
            type: 'practice', 
            title: 'LeetCode Problems', 
            url: 'https://leetcode.com/', 
            platform: 'LeetCode' 
          }
        ]
      },
      {
        id: '2',
        title: 'Server-Side Development & APIs',
        description: `Learn server-side programming and API development for ${preferences.targetRole}.`,
        duration: '5-7 weeks',
        difficulty: 'medium',
        skills: ['Express.js/Flask/Spring', 'REST APIs', 'HTTP/HTTPS', 'API Design'],
        resources: [
          { 
            type: 'course', 
            title: 'Complete Node.js Developer Course', 
            url: 'https://www.udemy.com/course/the-complete-nodejs-developer-course-2/', 
            platform: 'Udemy' 
          },
          { 
            type: 'practice', 
            title: 'Build REST APIs', 
            url: 'https://github.com/public-apis/public-apis', 
            platform: 'GitHub' 
          }
        ]
      },
      {
        id: '3',
        title: 'Database Management & Design',
        description: `Database expertise and data modeling for ${preferences.targetRole}.`,
        duration: '4-6 weeks',
        difficulty: 'medium',
        skills: ['SQL', 'MongoDB/PostgreSQL', 'Database Design', 'ORMs', 'Data Modeling'],
        resources: [
          { 
            type: 'course', 
            title: 'Complete SQL Bootcamp', 
            url: 'https://www.udemy.com/course/the-complete-sql-bootcamp/', 
            platform: 'Udemy' 
          },
          { 
            type: 'practice', 
            title: 'SQL Practice Problems', 
            url: 'https://sqlbolt.com/', 
            platform: 'SQLBolt' 
          }
        ]
      },
      {
        id: '4',
        title: 'Advanced Backend & DevOps',
        description: `Advanced backend concepts and deployment for ${preferences.targetRole}.`,
        duration: '6-8 weeks',
        difficulty: 'hard',
        skills: ['Microservices', 'Docker', 'Testing', 'Security', 'Performance Optimization'],
        resources: [
          { 
            type: 'course', 
            title: 'Microservices Architecture', 
            url: 'https://www.udemy.com/course/microservices-architecture/', 
            platform: 'Udemy' 
          },
          { 
            type: 'course', 
            title: 'Docker for Developers', 
            url: 'https://www.docker.com/get-started', 
            platform: 'Docker' 
          }
        ]
      }
    ],

    'devops': [
      {
        id: '1',
        title: 'Linux & System Administration',
        description: `Master Linux fundamentals and system administration for ${preferences.targetRole}.`,
        duration: '4-6 weeks',
        difficulty: 'medium',
        skills: ['Linux Commands', 'Shell Scripting', 'System Administration', 'Networking'],
        resources: [
          { 
            type: 'course', 
            title: 'Linux for DevOps', 
            url: 'https://www.udemy.com/course/linux-administration-bootcamp/', 
            platform: 'Udemy' 
          },
          { 
            type: 'practice', 
            title: 'Linux Command Practice', 
            url: 'https://overthewire.org/wargames/', 
            platform: 'OverTheWire' 
          }
        ]
      },
      {
        id: '2',
        title: 'Cloud Platforms & Infrastructure',
        description: `Master cloud infrastructure and services for ${preferences.targetRole}.`,
        duration: '6-8 weeks',
        difficulty: 'hard',
        skills: ['AWS/Azure/GCP', 'Virtual Machines', 'Storage', 'Networking', 'IAM'],
        resources: [
          { 
            type: 'course', 
            title: 'AWS Solutions Architect', 
            url: 'https://aws.amazon.com/training/', 
            platform: 'AWS' 
          },
          { 
            type: 'practice', 
            title: 'Cloud Practitioner Labs', 
            url: 'https://aws.amazon.com/getting-started/', 
            platform: 'AWS' 
          }
        ]
      },
      {
        id: '3',
        title: 'Containerization & Orchestration',
        description: `Learn container technologies and orchestration for ${preferences.targetRole}.`,
        duration: '5-7 weeks',
        difficulty: 'hard',
        skills: ['Docker', 'Kubernetes', 'Container Orchestration', 'Helm', 'Service Mesh'],
        resources: [
          { 
            type: 'course', 
            title: 'Docker and Kubernetes Guide', 
            url: 'https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/', 
            platform: 'Udemy' 
          },
          { 
            type: 'practice', 
            title: 'Kubernetes Tutorials', 
            url: 'https://kubernetes.io/docs/tutorials/', 
            platform: 'Kubernetes' 
          }
        ]
      },
      {
        id: '4',
        title: 'CI/CD & Infrastructure as Code',
        description: `Advanced DevOps practices and automation for ${preferences.targetRole}.`,
        duration: '6-8 weeks',
        difficulty: 'hard',
        skills: ['Jenkins/GitHub Actions', 'Terraform', 'Ansible', 'Monitoring', 'Security'],
        resources: [
          { 
            type: 'course', 
            title: 'Complete DevOps Bootcamp', 
            url: 'https://www.udemy.com/course/devops-bootcamp/', 
            platform: 'Udemy' 
          },
          { 
            type: 'practice', 
            title: 'Terraform Tutorials', 
            url: 'https://learn.hashicorp.com/terraform', 
            platform: 'HashiCorp' 
          }
        ]
      }
    ],

    'general': [
      {
        id: '1',
        title: `Foundation Skills for ${preferences.targetRole}`,
        description: `Build essential skills for ${preferences.targetRole}.`,
        duration: '4-6 weeks',
        difficulty: 'medium',
        skills: ['Problem Solving', 'Technical Skills', 'Communication'],
        resources: [
          { 
            type: 'course', 
            title: 'Professional Development Course', 
            url: 'https://www.coursera.org/courses', 
            platform: 'Coursera' 
          },
          { 
            type: 'practice', 
            title: 'Skill Building Exercises', 
            url: 'https://www.linkedin.com/learning/', 
            platform: 'LinkedIn Learning' 
          }
        ]
      },
      {
        id: '2',
        title: `Intermediate ${preferences.targetRole} Concepts`,
        description: `Develop intermediate expertise in ${preferences.targetRole}.`,
        duration: '5-7 weeks',
        difficulty: 'medium',
        skills: ['Domain Knowledge', 'Best Practices', 'Tools & Technologies'],
        resources: [
          { 
            type: 'course', 
            title: 'Industry-Specific Training', 
            url: 'https://www.udemy.com/', 
            platform: 'Udemy' 
          },
          { 
            type: 'article', 
            title: 'Industry Articles', 
            url: 'https://medium.com/', 
            platform: 'Medium' 
          }
        ]
      },
      {
        id: '3',
        title: `Advanced ${preferences.targetRole} Techniques`,
        description: `Develop specialized expertise in ${preferences.targetRole}.`,
        duration: '6-8 weeks',
        difficulty: 'hard',
        skills: ['Advanced Techniques', 'Industry Knowledge', 'Leadership'],
        resources: [
          { 
            type: 'course', 
            title: 'Advanced Professional Course', 
            url: 'https://www.coursera.org/specializations', 
            platform: 'Coursera' 
          },
          { 
            type: 'article', 
            title: 'Industry Best Practices', 
            url: 'https://medium.com/', 
            platform: 'Medium' 
          }
        ]
      },
      {
        id: '4',
        title: `Expert Level & Career Growth`,
        description: `Achieve mastery and focus on career advancement in ${preferences.targetRole}.`,
        duration: '8-12 weeks',
        difficulty: 'hard',
        skills: ['Mastery', 'Mentoring', 'Strategic Thinking', 'Project Leadership'],
        resources: [
          { 
            type: 'course', 
            title: 'Leadership & Management', 
            url: 'https://www.coursera.org/courses?query=leadership', 
            platform: 'Coursera' 
          },
          { 
            type: 'practice', 
            title: 'Real-world Projects', 
            url: 'https://github.com/', 
            platform: 'GitHub' 
          }
        ]
      }
    ]
  };

  // Get base roadmap
  let steps = roadmaps[roleType] || roadmaps['general'];
  
  // Dynamic step count based on user preferences
  const stepCount = getStepCount(preferences);
  
  // Adjust number of steps if needed
  if (stepCount !== steps.length) {
    steps = adjustStepCount(steps, stepCount, preferences);
  }
  
  // Adjust duration based on experience
  if (preferences.experience.includes('Beginner')) {
    steps = steps.map(step => ({
      ...step,
      duration: step.duration.replace(/(\d+)/g, (match) => (parseInt(match) + 2).toString())
    }));
  } else if (preferences.experience.includes('Expert')) {
    steps = steps.map(step => ({
      ...step,
      duration: step.duration.replace(/(\d+)/g, (match) => Math.max(2, parseInt(match) - 1).toString())
    }));
  }

  return steps;
}

const LocalCareerRoadmap: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    currentSkills: [],
    targetRole: '',
    experience: '',
    learningStyle: [],
    timeCommitment: ''
  });
  
  const [roadmap, setRoadmap] = useState<RoadmapStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'form' | 'roadmap'>('form');

  const skillOptions = [
    'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'HTML/CSS',
    'Java', 'C++', 'Machine Learning', 'Data Analysis', 'AWS',
    'Docker', 'Git', 'MongoDB', 'PostgreSQL', 'TypeScript'
  ];

  const learningStyleOptions = [
    'Video Tutorials', 'Written Articles', 'Interactive Courses',
    'Practice Projects', 'Books/PDFs', 'Live Workshops'
  ];

  const handleSkillToggle = (skill: string) => {
    setPreferences(prev => ({
      ...prev,
      currentSkills: prev.currentSkills.includes(skill)
        ? prev.currentSkills.filter(s => s !== skill)
        : [...prev.currentSkills, skill]
    }));
  };

  const handleLearningStyleToggle = (style: string) => {
    setPreferences(prev => ({
      ...prev,
      learningStyle: prev.learningStyle.includes(style)
        ? prev.learningStyle.filter(s => s !== style)
        : [...prev.learningStyle, style]
    }));
  };

  const generateRoadmap = async () => {
    setLoading(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const generatedRoadmap = generateLocalRoadmap(preferences);
      setRoadmap(generatedRoadmap);
      setCurrentStep('roadmap');
    } catch (error) {
      console.error('Error generating roadmap:', error);
      alert('Failed to generate roadmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return preferences.targetRole.trim().length > 0 &&
           preferences.experience &&
           preferences.learningStyle.length > 0 &&
           preferences.timeCommitment;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return <Star className="w-4 h-4" />;
      case 'medium': return <Target className="w-4 h-4" />;
      case 'hard': return <Trophy className="w-4 h-4" />;
      default: return <Book className="w-4 h-4" />;
    }
  };

  const getStepIcon = (index: number, step: RoadmapStep) => {
    if (step.completed) return <CheckCircle className="w-6 h-6 text-green-600" />;
    
    switch (index % 4) {
      case 0: return <Book className="w-6 h-6 text-blue-600" />;
      case 1: return <Code className="w-6 h-6 text-purple-600" />;
      case 2: return <Target className="w-6 h-6 text-orange-600" />;
      case 3: return <Trophy className="w-6 h-6 text-red-600" />;
      default: return <Book className="w-6 h-6 text-blue-600" />;
    }
  };

  const markStepComplete = (stepId: string) => {
    setRoadmap(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: !step.completed } : step
    ));
  };

  if (currentStep === 'roadmap') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Career Development Flowchart</h1>
            <p className="text-gray-600 text-lg mb-6">Your personalized path to becoming a {preferences.targetRole}</p>
            <Button
              onClick={() => setCurrentStep('form')}
              variant="outline"
              className="mb-8"
            >
              Generate New Roadmap
            </Button>
          </div>

          {/* Start Button */}
          <div className="flex justify-center mb-8">
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Your Journey
            </Button>
          </div>

          {/* Flowchart Steps */}
          <div className="relative">
            {roadmap.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center mb-12">
                
                {/* Connecting Arrow */}
                {index > 0 && (
                  <div className="mb-6">
                    <ArrowDown className="w-8 h-8 text-gray-400" />
                  </div>
                )}

                {/* Step Card */}
                <Card className={`w-full max-w-2xl mx-auto shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                  step.completed ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-blue-300'
                }`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${step.completed ? 'bg-green-100' : 'bg-blue-100'}`}>
                          {getStepIcon(index, step)}
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold text-gray-800">{step.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                              {step.duration}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getDifficultyColor(step.difficulty)}`}>
                              {getDifficultyIcon(step.difficulty)}
                              {step.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => markStepComplete(step.id)}
                        variant={step.completed ? "default" : "outline"}
                        size="sm"
                        className={step.completed ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        {step.completed ? <CheckCircle className="w-4 h-4 mr-1" /> : null}
                        {step.completed ? 'Completed' : 'Mark Complete'}
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-700 mb-4">{step.description}</p>
                    
                    {/* Skills */}
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2 text-gray-800">Skills You'll Learn:</h4>
                      <div className="flex flex-wrap gap-2">
                        {step.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Resources */}
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-800">Learning Resources:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {step.resources.slice(0, 2).map((resource, idx) => (
                          <a
                            key={idx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors group"
                          >
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
                              {resource.type === 'video' && <Play className="w-4 h-4 text-white" />}
                              {resource.type === 'article' && <Book className="w-4 h-4 text-white" />}
                              {resource.type === 'course' && <Target className="w-4 h-4 text-white" />}
                              {resource.type === 'practice' && <Code className="w-4 h-4 text-white" />}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm text-gray-800 group-hover:text-blue-600">{resource.title}</p>
                              <p className="text-xs text-gray-500">{resource.platform}</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}

            {/* Success Message */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg"
              >
                <Trophy className="mr-2 h-5 w-5" />
                Career Goal Achieved! 🎉
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">🤖 AI Career Roadmap Generator</h1>
        <p className="text-gray-600">
          Get a personalized learning path based on your skills and goals
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tell us about yourself</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Skills */}
          <div>
            <label className="block text-sm font-medium mb-2">
              What skills do you currently have? (Select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {skillOptions.map((skill) => (
                <button
                  key={skill}
                  onClick={() => handleSkillToggle(skill)}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                    preferences.currentSkills.includes(skill)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Target Role */}
          <div>
            <label className="block text-sm font-medium mb-2">
              What's your target role? (Be specific for better AI recommendations)
            </label>
            <input
              type="text"
              placeholder="e.g., Senior Frontend Developer, Data Scientist, Product Manager..."
              value={preferences.targetRole}
              onChange={(e) => setPreferences(prev => ({ ...prev, targetRole: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Examples: "Senior React Developer", "Machine Learning Engineer", "UX Designer"
            </p>
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-sm font-medium mb-2">
              What's your current experience level?
            </label>
            <div className="space-y-2">
              {['Beginner (0-1 years)', 'Intermediate (1-3 years)', 'Advanced (3-5 years)', 'Expert (5+ years)'].map((level) => (
                <label key={level} className="flex items-center">
                  <input
                    type="radio"
                    name="experience"
                    value={level}
                    checked={preferences.experience === level}
                    onChange={(e) => setPreferences(prev => ({ ...prev, experience: e.target.value }))}
                    className="mr-2"
                  />
                  {level}
                </label>
              ))}
            </div>
          </div>

          {/* Learning Style */}
          <div>
            <label className="block text-sm font-medium mb-2">
              How do you prefer to learn? (Select all that apply)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {learningStyleOptions.map((style) => (
                <button
                  key={style}
                  onClick={() => handleLearningStyleToggle(style)}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                    preferences.learningStyle.includes(style)
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Time Commitment */}
          <div>
            <label className="block text-sm font-medium mb-2">
              How much time can you dedicate per week?
            </label>
            <select
              value={preferences.timeCommitment}
              onChange={(e) => setPreferences(prev => ({ ...prev, timeCommitment: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select time commitment...</option>
              <option value="1-5 hours">1-5 hours per week</option>
              <option value="5-10 hours">5-10 hours per week</option>
              <option value="10-20 hours">10-20 hours per week</option>
              <option value="20+ hours">20+ hours per week</option>
            </select>
          </div>

          <Button
            onClick={generateRoadmap}
            disabled={loading || !isFormValid()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                AI is analyzing and generating your roadmap...
              </>
            ) : (
              '🤖 Generate My AI Career Roadmap'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocalCareerRoadmap;

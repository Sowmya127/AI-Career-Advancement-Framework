import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import CreateInterviewModal from "@/components/dashboard/interview/createInterviewModal";

interface CreateInterviewCardProps {
  // Add any props if needed
}

const CreateInterviewCard: React.FC<CreateInterviewCardProps> = () => {
  const [open, setOpen] = useState(false);
  const [interviewData, setInterviewData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const router = useRouter();
  const { user } = useUser();

  // Handle when interview is created successfully
  const handleInterviewCreated = async (finalInterviewData: any) => {
    try {
      setIsLoading(true);
      
      if (!user) {
        alert('Please log in to create an interview');
        return;
      }

      console.log('Creating interview with data:', finalInterviewData);
      console.log('Current user from Clerk:', user);

      // Map interviewer strings to your database IDs (from your query results)
      const interviewerMapping: { [key: string]: number } = {
        'explorer_lisa': 1,    // Explorer Lisa
        'empathetic_bob': 2,   // Empathetic Bob
      };

      const payload = {
        interviewData: {
          // Basic fields
          name: finalInterviewData.name,
          description: finalInterviewData.description || `Interview created for ${finalInterviewData.name}`,
          objective: finalInterviewData.objective,
          
          // User info - use null for organization_id and user_id to avoid foreign key issues
          user_id: null, // Set to null to avoid foreign key constraint
          organization_id: null, // Set to null to avoid foreign key constraint
          
          // Interviewer (use the correct ID from your database)
          interviewer_id: interviewerMapping[finalInterviewData.interviewer] || 1,
          
          // Settings
          is_active: true,
          is_anonymous: finalInterviewData.isAnonymous || false,
          is_archived: false,
          
          // Interview content
          questions: finalInterviewData.questions || [],
          question_count: finalInterviewData.questions?.length || parseInt(finalInterviewData.numberOfQuestions) || 5,
          time_duration: finalInterviewData.duration ? `${finalInterviewData.duration} minutes` : '30 minutes',
          
          // Initialize arrays and counters
          quotes: [],
          insights: [],
          respondents: [],
          response_count: 0,
          
          // Optional styling
          logo_url: null,
          theme_color: '#8b5cf6',
        },
        organizationName: user.firstName || 'Personal',
      };

      console.log('Sending payload to API:', payload);

      // Call the existing API
      const response = await fetch('/api/create-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('API Response status:', response.status);
      
      const responseText = await response.text();
      console.log('API Response text:', responseText);

      if (!response.ok) {
        console.error('API Error details:', responseText);
        throw new Error(`Failed to create interview: ${response.status}`);
      }

      // Close modal
      setOpen(false);
      
      // Show success message
      alert(`Interview "${finalInterviewData.name}" created successfully!`);
      
      // Refresh to show new interview
      window.location.reload();
      
    } catch (error) {
      console.error('Error creating interview:', error);
      alert(`Failed to create interview: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setOpen(false);
    setInterviewData({});
    setIsUploaded(false);
    setFileName('');
  };

  return (
    <>
      {/* Create Interview Card/Button */}
      <div 
        onClick={() => setOpen(true)}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100"
      >
        <div className="text-6xl text-gray-400 mb-4">+</div>
        <h3 className="text-lg font-semibold text-gray-700">Create an Interview</h3>
        <p className="text-gray-500 mt-2">Set up a new interview with AI-powered questions</p>
      </div>

      {/* Modal */}
      <CreateInterviewModal 
        open={open} 
        onClose={handleCloseModal}
        onNext={handleInterviewCreated}
        setLoading={setIsLoading}
        interviewData={interviewData}
        setInterviewData={setInterviewData}
        isUploaded={isUploaded}
        setIsUploaded={setIsUploaded}
        fileName={fileName}
        setFileName={setFileName}
      />
    </>
  );
};

export default CreateInterviewCard;

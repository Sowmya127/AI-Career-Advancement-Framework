"use client";

import React, { useState, useContext, ReactNode, useEffect } from "react";
import { Interview } from "@/types/interview";
import { InterviewService } from "@/services/interviews.service";
import { useClerk, useOrganization } from "@clerk/nextjs";

interface InterviewContextProps {
  interviews: Interview[];
  setInterviews: React.Dispatch<React.SetStateAction<Interview[]>>;
  getInterviewById: (interviewId: string) => Interview | null | any;
  interviewsLoading: boolean;
  setInterviewsLoading: (interviewsLoading: boolean) => void;
  fetchInterviews: () => void;
}

export const InterviewContext = React.createContext<InterviewContextProps>({
  interviews: [],
  setInterviews: () => {},
  getInterviewById: () => null,
  setInterviewsLoading: () => undefined,
  interviewsLoading: false,
  fetchInterviews: () => {},
});

interface InterviewProviderProps {
  children: ReactNode;
}

export function InterviewProvider({ children }: InterviewProviderProps) {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const { user } = useClerk();
  const { organization } = useOrganization();
  const [interviewsLoading, setInterviewsLoading] = useState(false);

  const fetchInterviews = async () => {
    try {
      setInterviewsLoading(true);
      
      console.log("=== FETCHING INTERVIEWS DEBUG ===");
      console.log("User ID:", user?.id);
      console.log("Organization ID:", organization?.id);
      
      const response = await InterviewService.getAllInterviews(
        user?.id as string,
        organization?.id as string,
      );
      
      console.log("Raw response from InterviewService:", response);
      console.log("Number of interviews returned:", response?.length || 0);
      
      if (response && response.length > 0) {
        console.log("First interview data:", response[0]);
        console.log("Interview fields:", Object.keys(response[0]));
      }
      
      setInterviewsLoading(false);
      setInterviews(response);
      
      console.log("Interviews set in context:", response);
      
    } catch (error) {
      console.error("Error in fetchInterviews:", error);
      setInterviewsLoading(false);
    }
  };

  const getInterviewById = async (interviewId: string) => {
    const response = await InterviewService.getInterviewById(interviewId);
    return response;
  };

  useEffect(() => {
    console.log("=== INTERVIEWS CONTEXT USEEFFECT ===");
    console.log("Organization ID:", organization?.id);
    console.log("User ID:", user?.id);
    
    if (organization?.id || user?.id) {
      console.log("Calling fetchInterviews...");
      fetchInterviews();
    } else {
      console.log("No user or organization ID - not fetching interviews");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization?.id, user?.id]);

  // Debug interviews changes
  useEffect(() => {
    console.log("=== INTERVIEWS STATE CHANGED ===");
    console.log("Current interviews in context:", interviews);
    console.log("Number of interviews:", interviews.length);
  }, [interviews]);

  return (
    <InterviewContext.Provider
      value={{
        interviews,
        setInterviews,
        getInterviewById,
        interviewsLoading,
        setInterviewsLoading,
        fetchInterviews,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
}

export const useInterviews = () => {
  const value = useContext(InterviewContext);
  return value;
};

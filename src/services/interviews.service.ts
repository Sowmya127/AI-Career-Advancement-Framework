import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

const getAllInterviews = async (userId: string, organizationId: string) => {
  try {
    console.log("=== GET ALL INTERVIEWS DEBUG ===");
    console.log("Input - userId:", userId);
    console.log("Input - organizationId:", organizationId);

    // Modified query to include interviews with null user_id/organization_id
    const { data: clientData, error: clientError } = await supabase
      .from("interview")
      .select(`*`)
      .or(`organization_id.eq.${organizationId},user_id.eq.${userId},user_id.is.null,organization_id.is.null`)
      .order("created_at", { ascending: false });

    console.log("Supabase query result (including nulls):");
    console.log("- data:", clientData);
    console.log("- error:", clientError);
    console.log("- number of records:", clientData?.length || 0);

    if (clientError) {
      console.error("Supabase error details:", clientError);
      return [];
    }

    // Let's also try getting ALL interviews to see if the issue is filtering
    const { data: allData, error: allError } = await supabase
      .from("interview")
      .select(`*`)
      .order("created_at", { ascending: false });

    console.log("=== ALL INTERVIEWS (no filter) ===");
    console.log("- all data:", allData);
    console.log("- all error:", allError);
    console.log("- number of ALL records:", allData?.length || 0);

    if (allData && allData.length > 0) {
      console.log("Sample interview record:", allData[0]);
      allData.forEach((interview, index) => {
        console.log(`Interview ${index + 1}:`, {
          id: interview.id,
          name: interview.name,
          user_id: interview.user_id,
          organization_id: interview.organization_id,
          created_at: interview.created_at
        });
      });
    }

    return [...(clientData || [])];
  } catch (error) {
    console.error("Exception in getAllInterviews:", error);
    return [];
  }
};

const getInterviewById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("interview")
      .select(`*`)
      .or(`id.eq.${id},readable_slug.eq.${id}`);

    return data ? data[0] : null;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const updateInterview = async (payload: any, id: string) => {
  const { error, data } = await supabase
    .from("interview")
    .update({ ...payload })
    .eq("id", id);
  if (error) {
    console.log(error);
    return [];
  }
  return data;
};

const deleteInterview = async (id: string) => {
  const { error, data } = await supabase
    .from("interview")
    .delete()
    .eq("id", id);
  if (error) {
    console.log(error);
    return [];
  }
  return data;
};

const getAllRespondents = async (interviewId: string) => {
  try {
    const { data, error } = await supabase
      .from("interview")
      .select(`respondents`)
      .eq("interview_id", interviewId);
    return data || [];
  } catch (error) {
    console.log(error);
    return [];
  }
};

const createInterview = async (payload: any) => {
  console.log("=== CREATE INTERVIEW SERVICE DEBUG ===");
  console.log("Payload received:", payload);
  
  const { error, data } = await supabase
    .from("interview")
    .insert({ ...payload });
    
  console.log("Insert result:");
  console.log("- data:", data);
  console.log("- error:", error);
  
  if (error) {
    console.log("Insert error details:", error);
    return [];
  }
  return data;
};

const deactivateInterviewsByOrgId = async (organizationId: string) => {
  try {
    const { error } = await supabase
      .from("interview")
      .update({ is_active: false })
      .eq("organization_id", organizationId)
      .eq("is_active", true);
    if (error) {
      console.error("Failed to deactivate interviews:", error);
    }
  } catch (error) {
    console.error("Unexpected error disabling interviews:", error);
  }
};

export const InterviewService = {
  getAllInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  getAllRespondents,
  createInterview,
  deactivateInterviewsByOrgId,
};

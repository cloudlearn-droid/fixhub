import api from "./axios";

export type DashboardSummary = {
  status: string;
  tickets: number;
};

export type DashboardResponse = {
  project_id: number;
  summary: DashboardSummary[];
};

/**
 * Existing function (KEEP – do not remove)
 */
export const getProjectDashboard = async (
  projectId: number
): Promise<DashboardResponse> => {
  const res = await api.get(`/dashboard/project/${projectId}`);
  return res.data;
};

/**
 * ✅ ADD THIS FUNCTION
 * Alias for backward compatibility with Dashboard.tsx
 */
export const getDashboard = async (
  projectId: number
): Promise<DashboardResponse> => {
  return getProjectDashboard(projectId);
};

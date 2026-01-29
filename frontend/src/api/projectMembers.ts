import { api } from "./client";

export type ProjectMember = {
  user_id: number;
  role: "admin" | "developer" | "viewer";
};

/**
 * List members of a project
 */
export const fetchProjectMembers = async (
  projectId: number
): Promise<ProjectMember[]> => {
  const res = await api.get(`/projects/${projectId}/members`);
  return res.data;
};

/**
 * Add member to project (admin only)
 */
export const addProjectMember = async (
  projectId: number,
  data: {
    email: string;
    role: "admin" | "developer" | "viewer";
  }
) => {
  const res = await api.post(
    `/projects/${projectId}/members`,
    data
  );
  return res.data;
};

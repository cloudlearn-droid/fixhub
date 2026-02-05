import api from "./axios";

/* ========================
   PROJECTS
======================== */

/**
 * Used by Projects.tsx
 */
export const getProjects = async () => {
  const res = await api.get("/projects");
  return res.data;
};

/**
 * Kept for backward compatibility
 */
export const getMyProjects = async () => {
  const res = await api.get("/projects");
  return res.data;
};

export const createProject = async (payload: {
  name: string;
  description?: string;
}) => {
  const res = await api.post("/projects", payload);
  return res.data;
};

export const getMyProjectRole = async (projectId: number) => {
  const res = await api.get(`/projects/${projectId}/role`);
  return res.data;
};

/* ========================
   PROJECT MEMBERS
======================== */

export const addProjectMember = async (
  projectId: number,
  payload: { email: string; role: "admin" | "developer" | "viewer" }
) => {
  const res = await api.post(`/projects/${projectId}/members`, payload);
  return res.data;
};

export type ProjectMember = {
  id: number;
  email: string;
  role: "admin" | "developer" | "viewer";
};

export const getProjectMembers = async (
  projectId: number
): Promise<ProjectMember[]> => {
  const res = await api.get(`/projects/${projectId}/members`);
  return res.data;
};

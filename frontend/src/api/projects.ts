import { api } from "./client";

/* ---------------- TYPES ---------------- */

export type Project = {
  id: number;
  name: string;
  description?: string;
};

export type ProjectMember = {
  id: number;
  email: string;
  role: "admin" | "developer" | "viewer";
};

/* ---------------- PROJECTS ---------------- */

export const fetchProjects = async () => {
  const res = await api.get<Project[]>("/projects/");
  return res.data;
};

export const createProject = async (data: {
  name: string;
  description?: string;
}) => {
  const res = await api.post<Project>("/projects/", data);
  return res.data;
};

/* ---------------- MEMBERS ---------------- */

export const fetchProjectMembers = async (projectId: number) => {
  const res = await api.get<ProjectMember[]>(
    `/projects/${projectId}/members`
  );
  return res.data;
};

export const addProjectMember = async (
  projectId: number,
  email: string,
  role: "admin" | "developer" | "viewer"
) => {
  await api.post(`/projects/${projectId}/members`, { email, role });
};

export const fetchMyProjectRole = async (projectId: number) => {
  const res = await api.get<{ role: "admin" | "developer" | "viewer" }>(
    `/projects/${projectId}/my-role`
  );
  return res.data.role;
};

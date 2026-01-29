import { api } from "./client"

export type ProjectMember = {
  user_id: number
  role: "admin" | "developer" | "viewer"
}

export const fetchProjectMembers = async (
  projectId: number
): Promise<ProjectMember[]> => {
  const res = await api.get(`/projects/${projectId}/members`)
  return res.data
}

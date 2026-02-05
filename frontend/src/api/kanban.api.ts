import api from "./axios";

export type KanbanBoard = {
  todo: any[];
  in_progress: any[];
  done: any[];
};

export const getKanbanBoard = async (projectId: number): Promise<KanbanBoard> => {
  const res = await api.get(`/kanban/project/${projectId}`);
  return res.data;
};

import { api } from "./client";

export type Ticket = {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assigned_to?: number;
  project_id: number;
};

/**
 * List tickets by project
 */
export const fetchTickets = async (projectId: number): Promise<Ticket[]> => {
  const res = await api.get(`/tickets/project/${projectId}`);
  return res.data;
};

/**
 * Update ticket
 */
export const updateTicket = async (
  ticketId: number,
  data: {
    title: string;
    description?: string;
    status: string;
    priority: string;
    assigned_to?: number;
  }
) => {
  const res = await api.put(`/tickets/${ticketId}`, data);
  return res.data;
};

/**
 * Delete ticket (admin only – enforced by backend)
 */
export const deleteTicket = async (ticketId: number) => {
  const res = await api.delete(`/tickets/${ticketId}`);
  return res.data;
};

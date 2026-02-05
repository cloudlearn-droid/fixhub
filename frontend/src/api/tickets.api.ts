import api from "./axios";

/* ========================
   TYPES
======================== */

export type Ticket = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  type: "bug" | "task" | "feature";
  project_id: number;
  assigned_to: number | null;
  is_deleted?: boolean;
};

/* ========================
   QUERIES
======================== */

export const getTicketsByProject = async (projectId: number) => {
  const res = await api.get(`/tickets/project/${projectId}`);
  return res.data;
};

/* ========================
   MUTATIONS
======================== */

export const createTicket = async (payload: any) => {
  const res = await api.post("/tickets", payload);
  return res.data;
};

export const updateTicket = async (ticketId: number, payload: any) => {
  const res = await api.put(`/tickets/${ticketId}`, payload);
  return res.data;
};

/**
 * ✅ SOFT DELETE (ADMIN ONLY)
 * Backend sets is_deleted = true
 */
export const deleteTicket = async (ticketId: number) => {
  const res = await api.delete(`/tickets/${ticketId}`);
  return res.data;
};

import type { Ticket } from "./tickets.api";

export const getTicketById = async (
  projectId: number,
  ticketId: number
): Promise<Ticket> => {
  const res = await api.get(`/tickets/project/${projectId}`);
  const ticket = res.data.find((t: Ticket) => t.id === ticketId);

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  return ticket;
};

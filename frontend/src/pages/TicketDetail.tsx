import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useProject } from "../context/ProjectContext";
import { getTicketById } from "../api/tickets.api";
import { getProjectMembers } from "../api/projects.api";
import api from "../api/axios";
import Comments from "../components/Comments";
import type { Ticket } from "../api/tickets.api";
import type { ProjectMember } from "../api/projects.api";

const TicketDetail = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { role, projectId } = useProject();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);

  // 🔹 assignment stored as string for <select>
  const [assignee, setAssignee] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");

  /**
   * 🔐 PERMISSION RULES
   * Admin      → can edit any ticket
   * Developer  → can edit ONLY if assigned
   * Viewer     → read-only
   */
  const canEdit =
    role === "admin" ||
    (role === "developer" && ticket?.assigned_to !== null);

  const canReassign = role === "admin";

  const loadTicket = async () => {
    const data = await getTicketById(projectId, Number(ticketId));

    setTicket(data);
    setTitle(data.title);
    setDescription(data.description || "");
    setPriority(data.priority);

    setAssignee(
      data.assigned_to !== null ? String(data.assigned_to) : ""
    );
  };

  useEffect(() => {
    const load = async () => {
      try {
        await loadTicket();
        const mem = await getProjectMembers(projectId);
        setMembers(mem);
      } catch (err: any) {
        setError(err.message || "Failed to load ticket");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [projectId, ticketId]);

  const handleSave = async () => {
    try {
      const res = await api.put(`/tickets/${ticketId}`, {
        title,
        description,
        priority,
        assigned_to: assignee ? Number(assignee) : null, // ✅ correct ID
      });

      const updated: Ticket = res.data;

      // ✅ Trust backend response
      setTicket(updated);
      setTitle(updated.title);
      setDescription(updated.description || "");
      setPriority(updated.priority);
      setAssignee(
        updated.assigned_to !== null ? String(updated.assigned_to) : ""
      );

      setEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Update failed");
    }
  };

  const handleArchive = async () => {
    try {
      await api.delete(`/tickets/${ticketId}`);
      navigate(`/projects/${projectId}/tickets`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Archive failed");
    }
  };

  if (loading) return <Layout>Loading ticket…</Layout>;

  if (error)
    return (
      <Layout>
        <p className="text-red-600">{error}</p>
      </Layout>
    );

  if (!ticket) return <Layout>Ticket not found</Layout>;

  return (
    <Layout>
      <div className="mb-6">
        {editing && canEdit ? (
          <div className="space-y-3">
            <input
              className="border p-2 w-full rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className="border p-2 w-full rounded"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="flex gap-2 flex-wrap">
              <select
                className="border p-2 rounded"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              {/* 🔒 ASSIGNMENT — ADMIN ONLY */}
              <select
                className="border p-2 rounded"
                value={assignee}
                disabled={!canReassign}
                onChange={(e) => setAssignee(e.target.value)}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={String(m.id)}>
                    {m.email} ({m.role})
                  </option>
                ))}
              </select>

              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>

              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold">{ticket.title}</h2>

              <div className="flex gap-2">
                {canEdit && (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-3 py-1 border rounded"
                  >
                    Edit Ticket
                  </button>
                )}

                {role === "admin" && (
                  <button
                    onClick={handleArchive}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Archive Ticket
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 text-sm space-y-1">
              <div>
                Status: <b>{ticket.status}</b>
              </div>
              <div>
                Priority: <b>{ticket.priority}</b>
              </div>
              <div>
                Assigned to:{" "}
                <b>
                  {members.find(
                    (m) => m.id === ticket.assigned_to
                  )?.email || "Unassigned"}
                </b>
              </div>
            </div>
          </>
        )}
      </div>

      <hr className="my-6" />

      <Comments ticketId={ticket.id} />
    </Layout>
  );
};

export default TicketDetail;

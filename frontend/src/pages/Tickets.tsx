import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  fetchTickets,
  updateTicket,
  deleteTicket,
} from "../api/tickets";
import {
  fetchMyProjectRole,
  fetchProjectMembers,
  addProjectMember,
  type ProjectMember,
} from "../api/projects";

type Ticket = {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assigned_to?: number;
};

export default function Tickets() {
  const { id } = useParams();
  const projectId = Number(id);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [role, setRole] = useState<
    "admin" | "developer" | "viewer" | null
  >(null);

  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState<
    "admin" | "developer" | "viewer"
  >("developer");

  // 🔄 Load data
  const loadData = async () => {
    if (!projectId) return;

    const [t, r, m] = await Promise.all([
      fetchTickets(projectId),
      fetchMyProjectRole(projectId),
      fetchProjectMembers(projectId),
    ]);

    setTickets(t);
    setRole(r);
    setMembers(m);
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  // ➕ Add member (admin only)
  const handleAddMember = async () => {
    if (!email) return;

    await addProjectMember(projectId, email, newRole);
    setEmail("");
    setNewRole("developer");
    loadData();
  };

  // 💾 Save ticket changes
  const handleSaveTicket = async (t: Ticket) => {
    await updateTicket(t.id, {
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      assigned_to: t.assigned_to,
    });
    loadData();
  };

  // 🗑️ Delete ticket (admin only)
  const handleDeleteTicket = async (ticketId: number) => {
    if (!confirm("Delete this ticket?")) return;
    await deleteTicket(ticketId);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tickets</h1>

        {role && (
          <span
            className={`px-3 py-1 rounded text-sm font-semibold ${
              role === "admin"
                ? "bg-red-100 text-red-700"
                : role === "developer"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Role: {role.toUpperCase()}
          </span>
        )}
      </div>

      {/* 👥 ADMIN: Project Members */}
      {role === "admin" && (
        <div className="border rounded p-4 bg-white space-y-4">
          <h2 className="font-semibold text-lg">Project Members</h2>

          <ul className="text-sm space-y-1">
            {members.map((m) => (
              <li key={m.id} className="flex justify-between">
                <span>{m.email}</span>
                <span className="font-semibold uppercase">
                  {m.role}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex gap-2 pt-2">
            <input
              type="email"
              placeholder="user@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border px-3 py-2 rounded w-full"
            />

            <select
              value={newRole}
              onChange={(e) =>
                setNewRole(e.target.value as any)
              }
              className="border px-2 py-2 rounded"
            >
              <option value="admin">Admin</option>
              <option value="developer">Developer</option>
              <option value="viewer">Viewer</option>
            </select>

            <button
              onClick={handleAddMember}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* 🎫 Tickets */}
      {tickets.length === 0 ? (
        <p className="text-gray-500">No tickets found</p>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="border p-4 rounded bg-white space-y-2"
            >
              <h3 className="font-semibold">{t.title}</h3>

              {t.description && (
                <p className="text-sm text-gray-600">
                  {t.description}
                </p>
              )}

              {/* Editable fields */}
              {(role === "admin" || role === "developer") ? (
                <div className="flex gap-2 text-sm">
                  <select
                    value={t.status}
                    onChange={(e) =>
                      setTickets((prev) =>
                        prev.map((x) =>
                          x.id === t.id
                            ? { ...x, status: e.target.value }
                            : x
                        )
                      )
                    }
                    className="border px-2 py-1 rounded"
                  >
                    <option value="todo">todo</option>
                    <option value="in_progress">in_progress</option>
                    <option value="done">done</option>
                  </select>

                  <select
                    value={t.priority}
                    onChange={(e) =>
                      setTickets((prev) =>
                        prev.map((x) =>
                          x.id === t.id
                            ? { ...x, priority: e.target.value }
                            : x
                        )
                      )
                    }
                    className="border px-2 py-1 rounded"
                  >
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                  </select>

                  <button
                    onClick={() => handleSaveTicket(t)}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Save
                  </button>

                  {role === "admin" && (
                    <button
                      onClick={() => handleDeleteTicket(t.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-xs">
                  Status: {t.status} | Priority: {t.priority}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

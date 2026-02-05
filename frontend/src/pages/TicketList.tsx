import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { getTicketsByProject, createTicket } from "../api/tickets.api";
import { useProject } from "../context/ProjectContext";
import type { Ticket } from "../api/tickets.api";

const TicketList = () => {
  const navigate = useNavigate();
  const { projectId, role } = useProject();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"bug" | "task" | "feature">("bug");
  const [priority, setPriority] = useState("medium");

  const loadTickets = async () => {
    try {
      const data = await getTicketsByProject(projectId);
      setTickets(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [projectId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTicket({
        title,
        description: description || null,
        type,
        priority,
        project_id: projectId,
        assigned_to: null,
      });
      setShowForm(false);
      setTitle("");
      setDescription("");
      loadTickets();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create ticket");
    }
  };

  if (loading) {
    return <Layout>Loading tickets…</Layout>;
  }

  if (error) {
    return (
      <Layout>
        <p className="text-red-600">{error}</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Tickets</h2>

        {(role === "admin" || role === "developer") && (
          <button
            onClick={() => setShowForm(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            + Create Ticket
          </button>
        )}
      </div>

      {tickets.length === 0 ? (
        <p className="text-gray-600">No tickets in this project yet.</p>
      ) : (
        <div className="space-y-2">
          {tickets.map((t) => (
            <div
              key={t.id}
              onClick={() =>
                navigate(`/projects/${projectId}/tickets/${t.id}`)
              }
              className="bg-white border rounded p-4 cursor-pointer hover:shadow"
            >
              <div className="flex justify-between">
                <h3 className="font-medium">{t.title}</h3>
                <span className="text-xs uppercase text-gray-500">
                  {t.type}
                </span>
              </div>

              {t.description && (
                <p className="text-sm text-gray-600 mt-1 break-words">
                  {t.description}
                </p>
              )}

              <div className="flex gap-4 mt-2 text-sm text-gray-500">
                <span>Status: {t.status.replace("_", " ")}</span>
                <span>Priority: {t.priority}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <form
            onSubmit={handleCreate}
            className="bg-white p-6 rounded w-96"
          >
            <h3 className="font-semibold mb-3">Create Ticket</h3>

            <input
              className="border p-2 w-full mb-3"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <textarea
              className="border p-2 w-full mb-3 break-words"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <select
              className="border p-2 w-full mb-3"
              value={type}
              onChange={(e) =>
                setType(e.target.value as "bug" | "task" | "feature")
              }
            >
              <option value="bug">Bug</option>
              <option value="task">Task</option>
              <option value="feature">Feature</option>
            </select>

            <select
              className="border p-2 w-full mb-4"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded">
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
};

export default TicketList;

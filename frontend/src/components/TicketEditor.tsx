import { useEffect, useState } from "react";
import { deleteTicket, updateTicket, type Ticket } from "../api/tickets";

export default function TicketEditor({
  ticket,
  isAdmin,
  onUpdated,
}: {
  ticket: Ticket;
  isAdmin: boolean;
  onUpdated: () => void;
}) {
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState(ticket.priority);

  useEffect(() => {
    setStatus(ticket.status);
    setPriority(ticket.priority);
  }, [ticket]);

  const handleSave = async () => {
    await updateTicket(ticket.id, {
      title: ticket.title,
      description: ticket.description,
      status,
      priority,
      assigned_to: ticket.assigned_to,
    });
    onUpdated();
  };

  const handleDelete = async () => {
    if (!confirm("Delete this ticket?")) return;
    await deleteTicket(ticket.id);
    onUpdated();
  };

  return (
    <div className="border p-4 rounded bg-gray-50 space-y-3">
      <h3 className="font-semibold">Edit Ticket</h3>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="border p-2 w-full"
      >
        <option value="todo">Todo</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </select>

      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="border p-2 w-full"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="bg-black text-white px-3 py-1 rounded"
        >
          Save
        </button>

        {isAdmin && (
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-3 py-1 rounded"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

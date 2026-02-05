import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useProject } from "../context/ProjectContext";
import { getTicketsByProject } from "../api/tickets.api";
import api from "../api/axios";
import type { Ticket } from "../api/tickets.api";

import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";  

const STATUSES = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

const Kanban = () => {
  const { projectId, role } = useProject();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canDrag = role === "admin" || role === "developer";

  const loadTickets = async () => {
    const data = await getTicketsByProject(projectId);
    setTickets(data);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await loadTickets();
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to load Kanban");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId]);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    if (!canDrag) return;

    const { draggableId, source, destination } = result;

    if (source.droppableId === destination.droppableId) return;

    const ticketId = Number(draggableId);

    // optimistic UI update
    const previous = [...tickets];
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, status: destination.droppableId as Ticket["status"] }
          : t
      )
    );

    try {
      await api.put(`/tickets/${ticketId}`, {
        status: destination.droppableId,
      });
    } catch (err) {
      // revert on failure
      setTickets(previous);
      alert("Status change not allowed");
    }
  };

  if (loading) return <Layout>Loading Kanban…</Layout>;
  if (error) return <Layout><p className="text-red-600">{error}</p></Layout>;

  return (
    <Layout>
      <h2 className="text-xl font-semibold mb-4">Kanban Board</h2>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATUSES.map((col) => {
            const items = tickets.filter(
              (t) => t.status === col.key
            );

            return (
              <Droppable droppableId={col.key} key={col.key}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-gray-100 p-3 rounded min-h-[200px]"
                  >
                    <h3 className="font-medium mb-2">{col.label}</h3>

                    <div className="space-y-2">
                      {items.map((ticket, index) => (
                        <Draggable
                          draggableId={String(ticket.id)}
                          index={index}
                          key={ticket.id}
                          isDragDisabled={!canDrag}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white border rounded p-3 text-sm ${
                                canDrag ? "cursor-move" : "opacity-60"
                              }`}
                            >
                              <div className="font-medium">
                                {ticket.title}
                              </div>
                              <div className="text-gray-500">
                                Priority: {ticket.priority}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}

                      {provided.placeholder}

                      {items.length === 0 && (
                        <p className="text-gray-400 text-sm">
                          No tickets
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      {!canDrag && (
        <p className="text-sm text-gray-500 mt-4">
          You have read-only access to this board.
        </p>
      )}
    </Layout>
  );
};

export default Kanban;

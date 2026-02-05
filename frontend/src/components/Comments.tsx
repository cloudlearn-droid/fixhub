import { useEffect, useState } from "react";
import api from "../api/axios";

type Comment = {
  id: number;
  content: string;
  user_id: number;
  user_email: string;
  user_role: "admin" | "developer" | "viewer";
};

const Comments = ({ ticketId }: { ticketId: number }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await api.get(`/comments/ticket/${ticketId}`);
      setComments(res.data);
    } catch {
      setError("Failed to load comments");
    }
  };

  useEffect(() => {
    load();
  }, [ticketId]);

  const add = async () => {
    if (!content.trim()) return;
    try {
      await api.post("/comments/", {
        content,
        ticket_id: ticketId,
      });
      setContent("");
      load();
    } catch {
      setError("Failed to add comment");
    }
  };

  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-2 text-lg">Comments</h3>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-gray-500">No comments yet.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="border rounded p-3 bg-gray-50">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span className="font-medium">{c.user_email}</span>
                <span className="uppercase text-[10px] bg-gray-200 px-2 py-0.5 rounded">
                  {c.user_role}
                </span>
              </div>
              <p className="text-gray-800 break-words">
                {c.content}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="mt-4">
        <textarea
          className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Add a comment..."
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <button
          onClick={add}
          className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          Add Comment
        </button>
      </div>
    </div>
  );
};

export default Comments;

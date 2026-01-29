import { useEffect, useState } from "react";
import { fetchProjectMembers, addProjectMember } from "../api/projectMembers";

export default function ProjectMembers({
  projectId,
  isAdmin,
}: {
  projectId: number;
  isAdmin: boolean;
}) {
  const [members, setMembers] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "developer" | "viewer">(
    "developer"
  );
  const [error, setError] = useState("");

  const load = async () => {
    const data = await fetchProjectMembers(projectId);
    setMembers(data);
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [projectId, isAdmin]);

  if (!isAdmin) return null;

  const handleAdd = async () => {
    setError("");
    try {
      await addProjectMember(projectId, { email, role });
      setEmail("");
      setRole("developer");
      load();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to add user");
    }
  };

  return (
    <div className="border p-4 rounded space-y-3">
      <h3 className="font-semibold">Project Members</h3>

      {members.map((m) => (
        <div key={m.user_id} className="flex justify-between text-sm">
          <span>{m.email ?? `User ${m.user_id}`}</span>
          <span className="font-medium">
            {m.role.toUpperCase()}
          </span>
        </div>
      ))}

      <div className="flex gap-2 pt-2">
        <input
          type="email"
          placeholder="user@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 flex-1"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
          className="border p-2"
        >
          <option value="admin">Admin</option>
          <option value="developer">Developer</option>
          <option value="viewer">Viewer</option>
        </select>

        <button
          onClick={handleAdd}
          className="bg-black text-white px-3 rounded"
        >
          Add
        </button>
      </div>

      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
    </div>
  );
}

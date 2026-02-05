import { useEffect, useState } from "react";
import api from "../api/axios";
import { useProject } from "../context/ProjectContext";
import Layout from "../components/Layout";

type Member = {
  id: number;
  email: string;
  role: "admin" | "developer" | "viewer";
};

const ProjectMembers = () => {
  const { projectId, role } = useProject();
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState("");
  const [memberRole, setMemberRole] =
    useState<"developer" | "viewer">("developer");

  const load = async () => {
    const res = await api.get(`/projects/${projectId}/members`);
    setMembers(res.data);
  };

  useEffect(() => {
    load();
  }, [projectId]);

  const addMember = async () => {
    await api.post(`/projects/${projectId}/members`, {
      email,
      role: memberRole,
    });
    setEmail("");
    load();
  };

  return (
    <Layout>
      <h2 className="text-xl font-semibold mb-4">Project Members</h2>

      <ul className="mb-4">
        {members.map((m) => (
          <li key={m.id}>
            {m.email} — <b>{m.role}</b>
          </li>
        ))}
      </ul>

      {role === "admin" && (
        <div className="flex gap-2">
          <input
            className="border p-2"
            placeholder="User email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <select
            className="border p-2"
            value={memberRole}
            onChange={(e) =>
              setMemberRole(e.target.value as any)
            }
          >
            <option value="developer">Developer</option>
            <option value="viewer">Viewer</option>
          </select>
          <button
            onClick={addMember}
            className="bg-blue-600 text-white px-3 rounded"
          >
            Add
          </button>
        </div>
      )}
    </Layout>
  );
};

export default ProjectMembers;

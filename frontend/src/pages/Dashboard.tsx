import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { getDashboard } from "../api/dashboard.api";
import { useProject } from "../context/ProjectContext";

type Summary = {
  status: string;
  tickets: number;
};

const Dashboard = () => {
  const { projectId, role } = useProject();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDashboard(projectId);
        setSummary(res.summary);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId]);

  if (loading) return <Layout>Loading dashboard…</Layout>;
  if (error) return (
    <Layout>
      <p className="text-red-600">{error}</p>
    </Layout>
  );

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Project Dashboard</h2>
          <p className="text-sm text-gray-600">Your role: {role}</p>
        </div>

        <div className="flex gap-2">
          {/* ✅ Existing button — untouched */}
          <button
            onClick={() => navigate(`/projects/${projectId}/tickets`)}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            View Tickets
          </button>

          {/* ✅ NEW — Kanban Button (ALL ROLES) */}
          <button
            onClick={() => navigate(`/projects/${projectId}/kanban`)}
            className="px-3 py-1 bg-indigo-600 text-white rounded"
          >
            Kanban Board
          </button>

          {/* ✅ Existing admin-only button — untouched */}
          {role === "admin" && (
            <button
              onClick={() => navigate(`/projects/${projectId}/members`)}
              className="px-3 py-1 bg-gray-700 text-white rounded"
            >
              Manage Members
            </button>
          )}
        </div>
      </div>

      {/* ✅ Existing dashboard summary — untouched */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summary.map((s) => (
          <div
            key={s.status}
            className="border rounded p-4 bg-white"
          >
            <h3 className="font-medium capitalize">
              {s.status.replace("_", " ")}
            </h3>
            <p className="text-2xl">{s.tickets}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Dashboard;

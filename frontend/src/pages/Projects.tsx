import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { getProjects, createProject } from "../api/projects.api";
import type { Project } from "../api/projects.api";

const Projects = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const project = await createProject(name, description || null);
      navigate(`/projects/${project.id}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create project");
    }
  };

  if (loading) {
    return <Layout>Loading projects…</Layout>;
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Projects</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          + New Project
        </button>
      </div>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      {projects.length === 0 && (
        <p className="text-gray-600 mb-4">
          You are not a member of any projects yet.
        </p>
      )}

      <div className="grid gap-4">
        {projects.map((p) => (
          <div
            key={p.id}
            onClick={() => navigate(`/projects/${p.id}/dashboard`)}
            className="bg-white border rounded p-4 hover:shadow cursor-pointer"
          >
            <h3 className="font-medium">{p.name}</h3>
            {p.description && (
              <p className="text-sm text-gray-600">{p.description}</p>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <form
            onSubmit={handleCreate}
            className="bg-white p-6 rounded w-96"
          >
            <h3 className="font-semibold mb-3">Create Project</h3>

            <input
              className="border p-2 w-full mb-3"
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <textarea
              className="border p-2 w-full mb-3"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

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

export default Projects;

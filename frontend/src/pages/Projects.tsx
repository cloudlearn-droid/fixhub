import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

type Project = {
  id: number;
  name: string;
  description?: string;
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/projects/")
      .then((res) => setProjects(res.data))
      .catch(() => {
        alert("Failed to load projects");
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button
          onClick={handleLogout}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {projects.length === 0 && (
        <p className="text-gray-500">No projects found</p>
      )}

      {projects.map((project) => (
        <div
          key={project.id}
          onClick={() => navigate(`/projects/${project.id}`)}
          className="border p-4 rounded cursor-pointer hover:bg-gray-50"
        >
          <h2 className="font-semibold">{project.name}</h2>
          <p className="text-sm text-gray-600">
            {project.description}
          </p>
        </div>
      ))}
    </div>
  );
}

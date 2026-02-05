import { useEffect, useState } from "react";
import { useParams, Outlet } from "react-router-dom";
import Layout from "../components/Layout";
import { ProjectProvider } from "../context/ProjectContext";
import api from "../api/axios";

export type ProjectRole = "admin" | "developer" | "viewer";

const ProjectLayout = () => {
  const { projectId } = useParams();
  const pid = Number(projectId);

  const [role, setRole] = useState<ProjectRole | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRole = async () => {
      try {
        /**
         * ✅ Single source of truth for role
         * Backend determines who you are and what your role is.
         */
        const res = await api.get(`/projects/${pid}/my-role`);
        setRole(res.data.role);
      } catch (err: any) {
        setError(
          err.response?.status === 403
            ? "You do not have access to this project"
            : "Failed to load project"
        );
      }
    };

    loadRole();
  }, [pid]);

  if (error) {
    return (
      <Layout>
        <p className="text-red-600">{error}</p>
      </Layout>
    );
  }

  if (!role) {
    return <Layout>Loading project…</Layout>;
  }

  return (
    <ProjectProvider projectId={pid} role={role}>
      <Outlet />
    </ProjectProvider>
  );
};

export default ProjectLayout;

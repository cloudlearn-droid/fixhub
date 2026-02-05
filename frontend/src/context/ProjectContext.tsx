import { createContext, useContext, useState } from "react";

export type ProjectRole = "admin" | "developer" | "viewer";

type ProjectContextType = {
  projectId: number;
  role: ProjectRole;
};

const ProjectContext = createContext<ProjectContextType | null>(null);

export const ProjectProvider = ({
  projectId,
  role,
  children,
}: {
  projectId: number;
  role: ProjectRole;
  children: React.ReactNode;
}) => {
  return (
    <ProjectContext.Provider value={{ projectId, role }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error("useProject must be used inside ProjectProvider");
  }
  return ctx;
};

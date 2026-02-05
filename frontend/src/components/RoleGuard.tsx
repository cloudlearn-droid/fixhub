import { ReactNode } from "react";
import { useProject } from "../context/ProjectContext";

type Props = {
  allow: ("admin" | "developer" | "viewer")[];
  children: ReactNode;
};

const RoleGuard = ({ allow, children }: Props) => {
  const { role } = useProject();

  if (!allow.includes(role)) {
    return null;
  }

  return <>{children}</>;
};

export default RoleGuard;

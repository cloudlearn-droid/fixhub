import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Projects from "./pages/Projects";
import Dashboard from "./pages/Dashboard";
import TicketList from "./pages/TicketList";
import TicketDetail from "./pages/TicketDetail";
import ProjectLayout from "./pages/ProjectLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import ProjectMembers from "./pages/ProjectMembers";
import Kanban from "./pages/Kanban";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />

        {/* PROJECT-SCOPED ROUTES */}
        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute>
              <ProjectLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tickets" element={<TicketList />} />
          <Route path="tickets/:ticketId" element={<TicketDetail />} />
          <Route path="members" element={<ProjectMembers />} />
          <Route path="kanban" element={<Kanban />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
